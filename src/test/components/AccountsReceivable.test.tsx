import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';

vi.mock('../../infrastructure/api/saleService', () => ({
  saleService: {
    getSales: vi.fn(),
  },
}));

import { saleService } from '../../infrastructure/api/saleService';
import { AccountsReceivable } from '../../pages/Contabilidad/AccountsReceivable/AccountsReceivable';
import type { PagedResult, SaleDto } from '../../domain/types';

const sale = (overrides: Partial<SaleDto> = {}): SaleDto => ({
  id: 's1',
  code: 'VEN-001',
  companyId: 'c1',
  clienteId: 'cl1',
  clienteName: 'Acme SRL',
  status: 'Pending',
  total: 1000,
  notes: null,
  createdAt: '2026-11-10T12:00:00Z',
  updatedAt: null,
  items: [],
  ...overrides,
});

const ACME_OLD = sale({ id: 's1', code: 'VEN-001', total: 1000 });
const ACME_LATEST = sale({ id: 's2', code: 'VEN-002', total: 500, createdAt: '2026-11-12T12:00:00Z' });
const GLOBEX_LATEST = sale({
  id: 's3',
  code: 'VEN-003',
  clienteId: 'cl2',
  clienteName: 'Globex SRL',
  total: 300,
  createdAt: '2026-11-11T12:00:00Z',
});
const GLOBEX_OLD = sale({
  id: 's5',
  code: 'VEN-005',
  clienteId: 'cl2',
  clienteName: 'Globex SRL',
  total: 250,
  createdAt: '2026-11-08T12:00:00Z',
});
const COMPLETED = sale({
  id: 's4',
  code: 'VEN-004',
  clienteId: 'cl3',
  clienteName: 'Initech SA',
  status: 'Completed',
  total: 999,
  createdAt: '2026-11-13T12:00:00Z',
});

const paged = (items: SaleDto[]): PagedResult<SaleDto> => ({
  rowCount: items.length,
  pageNumber: 1,
  pageSize: 100,
  pageCount: 1,
  items,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <AccountsReceivable />
    </MemoryRouter>,
  );

const dateOf = (iso: string) => new Date(iso).toLocaleDateString('es-DO');

const rowOf = (clientName: string): HTMLElement => {
  const row = within(screen.getByRole('table'))
    .getAllByRole('row')
    .find((candidate) => within(candidate).queryByText(clientName));

  if (!row) throw new Error(`No row for ${clientName}`);
  return row;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AccountsReceivable', () => {
  it('asks for a whole page of sales so the balances cover every pending sale it can reach', async () => {
    vi.mocked(saleService.getSales).mockResolvedValue(paged([]));

    renderPage();

    expect(await screen.findByTestId('accounts-receivable-empty')).toBeInTheDocument();
    expect(saleService.getSales).toHaveBeenCalledWith(1, 100);
  });

  it('groups the pending sales of a client into a single balance', async () => {
    vi.mocked(saleService.getSales).mockResolvedValue(
      paged([ACME_OLD, ACME_LATEST, GLOBEX_LATEST, GLOBEX_OLD]),
    );

    renderPage();

    expect(await screen.findByText('Acme SRL')).toBeInTheDocument();
    expect(within(rowOf('Acme SRL')).getByText('RD$ 1,500.00')).toBeInTheDocument();
    expect(within(rowOf('Acme SRL')).getByText('RD$ 500.00')).toBeInTheDocument();
    expect(within(rowOf('Globex SRL')).getByText('RD$ 550.00')).toBeInTheDocument();
    expect(within(rowOf('Globex SRL')).getByText('RD$ 300.00')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);
  });

  it('leaves out the sales that are not pending', async () => {
    vi.mocked(saleService.getSales).mockResolvedValue(paged([ACME_OLD, COMPLETED]));

    renderPage();

    expect(await screen.findByText('Acme SRL')).toBeInTheDocument();
    expect(screen.queryByText('Initech SA')).toBeNull();
    expect(screen.queryByText('RD$ 999.00')).toBeNull();
  });

  it('shows how many pending sales the client has with the amount and date of the latest one', async () => {
    vi.mocked(saleService.getSales).mockResolvedValue(paged([ACME_OLD, ACME_LATEST]));

    renderPage();

    await screen.findByText('Acme SRL');
    const row = rowOf('Acme SRL');

    expect(within(row).getByText('2')).toBeInTheDocument();
    expect(within(row).getByText('RD$ 500.00')).toBeInTheDocument();
    expect(within(row).getByText(dateOf('2026-11-12T12:00:00Z'))).toBeInTheDocument();
    expect(screen.queryByText(dateOf('2026-11-10T12:00:00Z'))).toBeNull();
  });

  it('shows the empty state when no sale is pending', async () => {
    vi.mocked(saleService.getSales).mockResolvedValue(paged([COMPLETED]));

    renderPage();

    expect(await screen.findByTestId('accounts-receivable-empty')).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('shows the error and no rows when the sales cannot be loaded', async () => {
    vi.mocked(saleService.getSales).mockRejectedValue(new Error('An error occurred'));

    renderPage();

    expect(await screen.findByTestId('accounts-receivable-error')).toHaveTextContent(
      'An error occurred',
    );
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('keeps only the clients that match the search term', async () => {
    vi.mocked(saleService.getSales).mockResolvedValue(paged([ACME_OLD, GLOBEX_LATEST]));

    renderPage();
    await screen.findByText('Acme SRL');

    await userEvent.type(screen.getByRole('textbox'), 'globex');

    expect(screen.queryByText('Acme SRL')).toBeNull();
    expect(screen.getByText('Globex SRL')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2);
  });

  it('paginates the clients in pages of ten', async () => {
    const many = Array.from({ length: 11 }, (_, index) =>
      sale({
        id: `s${index}`,
        code: `VEN-${index}`,
        clienteId: `cl${index}`,
        clienteName: `Cliente ${index}`,
        total: 100,
      }),
    );
    vi.mocked(saleService.getSales).mockResolvedValue(paged(many));

    renderPage();
    await screen.findByText('Cliente 0');

    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(11);

    await userEvent.click(screen.getByRole('button', { name: '2' }));

    expect(screen.getByText('Cliente 10')).toBeInTheDocument();
    expect(screen.queryByText('Cliente 0')).toBeNull();
  });
});
