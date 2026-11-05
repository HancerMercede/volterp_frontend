import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KpiCard } from '../../components/Dashboard/KpiCard';
import type { KpiCard as KpiCardModel } from '../../domain/dashboard/types';

const base: KpiCardModel = {
  id: 'kpi-0',
  label: 'Ventas · Este mes',
  value: 1000,
  formattedValue: 'RD$1,000',
  change: null,
  changeLabel: '—',
  compareLabel: 'vs mes anterior',
  isPositive: false,
  icon: <span />,
  iconBg: '#FEF3C7',
  trend: 'none',
};

describe('KpiCard change rendering', () => {
  it('renders an undefined comparison as "—" and never as a percentage', () => {
    render(<KpiCard kpi={base} />);

    expect(screen.getByText(/—/)).toBeInTheDocument();
    expect(screen.queryByText(/%/)).toBeNull();
  });

  it('renders a real change as a signed percentage with the comparison of the scope', () => {
    render(
      <KpiCard
        kpi={{ ...base, change: 12.5, changeLabel: '+12.5%', isPositive: true, trend: 'up' }}
      />,
    );

    expect(screen.getByText(/\+12\.5%/)).toBeInTheDocument();
    expect(screen.getByText(/vs mes anterior/)).toBeInTheDocument();
    expect(screen.queryByText(/—/)).toBeNull();
  });

  it('follows the scope in the comparison text', () => {
    render(<KpiCard kpi={{ ...base, compareLabel: 'vs hoy anterior' }} />);

    expect(screen.getByText(/vs hoy anterior/)).toBeInTheDocument();
  });
});
