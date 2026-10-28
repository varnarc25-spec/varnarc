'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SolarResult } from '@varnarc/validation';

export function SolarCharts({
  result,
  chart,
}: {
  result: SolarResult;
  chart: 'cumulative' | 'bill' | 'energy' | 'cost';
}) {
  if (chart === 'cumulative') {
    const data = [
      { year: 0, cumulative: result.assumptions ? -result.netInstallationCost : 0 },
      ...result.years.map((year) => ({
        year: year.year,
        cumulative: Math.round(year.cumulativeNet),
      })),
    ];
    if (result.years.some((year) => year.financePayment > 0)) data.shift();
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="cumulative"
            name="Cumulative net"
            stroke="#2563eb"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
  if (chart === 'bill') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={[
            {
              name: 'Monthly bill',
              before: Math.round(result.billBefore),
              after: Math.round(result.billAfter),
            },
          ]}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="before" name="Before solar" fill="#94a3b8" />
          <Bar dataKey="after" name="After solar" fill="#f97316" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  if (chart === 'energy') {
    const year = result.years[0];
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={[
            {
              name: 'Year 1',
              generated: Math.round(year?.generationKwh ?? 0),
              used: Math.round(year?.selfConsumedKwh ?? 0),
              exported: Math.round(year?.exportedKwh ?? 0),
              imported: Math.round(year?.importedKwh ?? 0),
            },
          ]}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="generated" fill="#0b1f3a" />
          <Bar dataKey="used" fill="#16a34a" />
          <Bar dataKey="exported" fill="#f97316" />
          <Bar dataKey="imported" fill="#64748b" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  const finance = result.years.reduce((sum, year) => sum + year.financePayment, 0);
  const maintenance = result.years.reduce((sum, year) => sum + year.maintenance, 0);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={[
          {
            name: 'Costs',
            installation: Math.round(result.grossInstallationCost),
            subsidy: Math.round(result.subsidyApplied),
            maintenance: Math.round(maintenance),
            financing: Math.round(finance),
          },
        ]}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="installation" fill="#0b1f3a" />
        <Bar dataKey="subsidy" fill="#16a34a" />
        <Bar dataKey="maintenance" fill="#94a3b8" />
        <Bar dataKey="financing" fill="#f97316" />
      </BarChart>
    </ResponsiveContainer>
  );
}
