'use client';

import { formatInrCompact, formatInrExact } from '@varnarc/validation';
import { SimpleLineChart } from '@/components/shared/simple-chart';

export function DepreciationChart({ points }: { points: Array<{ label: string; value: number }> }) {
  const data = points.map((point) => ({ label: point.label, value: point.value }));
  return (
    <div>
      <SimpleLineChart
        data={data}
        xKey="label"
        series={[{ key: 'value', color: '#0b1f3a', name: 'Estimated value' }]}
        height={260}
        showDots
        connectNulls
        formatY={formatInrCompact}
      />
      <table className="sr-only">
        <caption>Illustrative depreciation forecast values</caption>
        <thead>
          <tr>
            <th>Period</th>
            <th>Estimated value</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.label}>
              <td>{point.label}</td>
              <td>{formatInrExact(point.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
