import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';

vi.mock('../../infrastructure/api/purchaseService', () => ({
  purchaseService: {
    getPurchases: vi.fn(),
  },
}));

vi.mock('../../infrastructure/api/supplierService', () => ({
  supplierService: {
    getSuppliers: vi.fn(),
  },
}));

import { purchaseService } from '../../infrastructure/api/purchaseService';
import { supplierService } from '../../infrastructure/api/supplierService';
import { useProveedorStore } from '../../stores/proveedorStore';
import { useAuthStore } from '../../stores/authStore';
import { AccountsPayable } from '../../pages/Contabilidad/AccountsPayable/AccountsPayable';
import type { PagedResult, PurchaseDto, SupplierDto } from '../../domain/types';

const PROVIDER: SupplierDto = {
  id: 'su1',
  code: 'SUP-001',
  name: 'Distribuidora Aurora',
  email: 'compras@aurora.do',
  phone: '809-555-1201',
  address: 'Calle 1',
  category: 'Distribuidora',
  contactPerson: 'Ana Perez',
  imageUrl: 'https://cdn.volterp.do/aurora.png',
  isActive: true,
  createdAt: null,
  updatedAt: null,
};

const purchase = (overrides: Partial<PurchaseDto> = {}): PurchaseDto => ({
  id: 'p1',
  code: 'COM-001',
  supplierId: 'su1',
  supplierName: 'Distribuidora Aurora',
  status: 'Pending',
  total: 1000,
  notes: null,
  createdAt: '2026-11-10T12:00:00Z',
  updatedAt: null,
  items: [],
  ...overrides,
});

const AURORA_OLD = purchase({ id: 'p1', code: 'COM-001', total: 1000 });
const AURORA_LATEST = purchase({ id: 'p2', code: 'COM-002', total: 500, createdAt: '2026-11-12T12:00:00Z' });
const LACTEOS_LATEST = purchase({
  id: 'p3',
  code: 'COM-003',
  supplierId: 'su2',
  supplierName: 'Lácteos del Norte',
  total: 300,
  createdAt: '2026-11-11T12:00:00Z',
});
const LACTEOS_OLD = purchase({
  id: 'p5',
  code: 'COM-005',
  supplierId: 'su2',
  supplierName: 'Lácteos del Norte',
  total: 250,
  createdAt: '2026-11-08T12:00:00Z',
});
const COMPLETED = purchase({
  id: 'p4',
  code: 'COM-004',
  supplierId: 'su3',
  supplierName: 'Papelera Vieja',
  status: 'Completed',
  total: 999,
  createdAt: '2026-11-13T12:00:00Z',
});

const paged = (items: PurchaseDto[]): PagedResult<PurchaseDto> => ({
  rowCount: items.length,
  pageNumber: 1,
  pageSize: 100,
  pageCount: 1,
  items,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <AccountsPayable />
    </MemoryRouter>,
  );

const dateOf = (iso: string) => new Date(iso).toLocaleDateString('es-DO');

const rowOf = (supplierName: string): HTMLElement => {
  const row = within(screen.getByRole('table'))
    .getAllByRole('row')
    .find((candidate) => within(candidate).queryByText(supplierName));

  if (!row) throw new Error(`No row for ${supplierName}`);
  return row;
};

beforeEach(() => {
  vi.clearAllMocks();
  useProveedorStore.setState({ proveedores: [] });
  useAuthStore.setState({ token: 'test-token' });
});

describe('AccountsPayable', () => {
  it('asks for a whole page of purchases so the balances cover every pending purchase it can reach', async () => {
    vi.mocked(purchaseService.getPurchases).mockResolvedValue(paged([]));

    renderPage();

    expect(await screen.findByTestId('accounts-payable-empty')).toBeInTheDocument();
    expect(purchaseService.getPurchases).toHaveBeenCalledWith(1, 100);
  });

  it('groups the pending purchases of a supplier into a single balance', async () => {
    vi.mocked(purchaseService.getPurchases).mockResolvedValue(
      paged([AURORA_OLD, AURORA_LATEST, LACTEOS_LATEST, LACTEOS_OLD]),
    );

    renderPage();

    expect(await screen.findByText('Distribuidora Aurora')).toBeInTheDocument();
    expect(
      within(rowOf('Distribuidora Aurora')).getByText('RD$ 1,500.00'),
    ).toBeInTheDocument();
    expect(
      within(rowOf('Distribuidora Aurora')).getByText('RD$ 500.00'),
    ).toBeInTheDocument();
    expect(
      within(rowOf('Lácteos del Norte')).getByText('RD$ 550.00'),
    ).toBeInTheDocument();
    expect(
      within(rowOf('Lácteos del Norte')).getByText('RD$ 300.00'),
    ).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);
  });

  it('shows the image of the supplier when it is in the collection', async () => {
    vi.mocked(purchaseService.getPurchases).mockResolvedValue(paged([AURORA_OLD]));
    vi.mocked(supplierService.getSuppliers).mockResolvedValue({
      rowCount: 1,
      pageNumber: 1,
      pageSize: 100,
      pageCount: 1,
      items: [PROVIDER],
    });

    renderPage();

    const image = await screen.findByRole('img');
    expect(image).toHaveAttribute('src', 'https://cdn.volterp.do/aurora.png');
  });

  it('falls back to the name when the supplier is not in the collection', async () => {
    vi.mocked(purchaseService.getPurchases).mockResolvedValue(paged([AURORA_OLD]));
    vi.mocked(supplierService.getSuppliers).mockResolvedValue({
      rowCount: 0,
      pageNumber: 1,
      pageSize: 100,
      pageCount: 0,
      items: [],
    });

    renderPage();

    expect(await screen.findByText('Distribuidora Aurora')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('leaves out the purchases that are not pending', async () => {
    vi.mocked(purchaseService.getPurchases).mockResolvedValue(paged([AURORA_OLD, COMPLETED]));

    renderPage();

    expect(await screen.findByText('Distribuidora Aurora')).toBeInTheDocument();
    expect(screen.queryByText('Papelera Vieja')).toBeNull();
    expect(screen.queryByText('RD$ 999.00')).toBeNull();
  });

  it('shows how many pending purchases the supplier has with the amount and date of the latest one', async () => {
    vi.mocked(purchaseService.getPurchases).mockResolvedValue(paged([AURORA_OLD, AURORA_LATEST]));

    renderPage();

    await screen.findByText('Distribuidora Aurora');
    const row = rowOf('Distribuidora Aurora');

    expect(within(row).getByText('2')).toBeInTheDocument();
    expect(within(row).getByText('RD$ 500.00')).toBeInTheDocument();
    expect(within(row).getByText(dateOf('2026-11-12T12:00:00Z'))).toBeInTheDocument();
    expect(screen.queryByText(dateOf('2026-11-10T12:00:00Z'))).toBeNull();
  });

  it('shows the empty state when no purchase is pending', async () => {
    vi.mocked(purchaseService.getPurchases).mockResolvedValue(paged([COMPLETED]));

    renderPage();

    expect(await screen.findByTestId('accounts-payable-empty')).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('shows the error and no rows when the purchases cannot be loaded', async () => {
    vi.mocked(purchaseService.getPurchases).mockRejectedValue(new Error('An error occurred'));

    renderPage();

    expect(await screen.findByTestId('accounts-payable-error')).toHaveTextContent(
      'An error occurred',
    );
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('keeps only the suppliers that match the search term', async () => {
    vi.mocked(purchaseService.getPurchases).mockResolvedValue(
      paged([AURORA_OLD, LACTEOS_LATEST]),
    );

    renderPage();
    await screen.findByText('Distribuidora Aurora');

    await userEvent.type(screen.getByRole('textbox'), 'lácteos');

    expect(screen.queryByText('Distribuidora Aurora')).toBeNull();
    expect(screen.getByText('Lácteos del Norte')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2);
  });

  it('paginates the suppliers in pages of ten', async () => {
    const many = Array.from({ length: 11 }, (_, index) =>
      purchase({
        id: `p${index}`,
        code: `COM-${index}`,
        supplierId: `su${index}`,
        supplierName: `Proveedor ${index}`,
        total: 100,
      }),
    );
    vi.mocked(purchaseService.getPurchases).mockResolvedValue(paged(many));

    renderPage();
    await screen.findByText('Proveedor 0');

    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(11);

    await userEvent.click(screen.getByRole('button', { name: '2' }));

    expect(screen.getByText('Proveedor 10')).toBeInTheDocument();
    expect(screen.queryByText('Proveedor 0')).toBeNull();
  });
});
