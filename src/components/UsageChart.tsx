import { AreaChart } from '@mantine/charts';
import { Button, Group, Stack, Title } from '@mantine/core';

import type { Statistics } from '@/types/types';

interface Props {
  statistics: Statistics;
}

export function UsageChart({ statistics }: Props) {
  const data = statistics.data.map((entry) => ({
    timestamp: entry.timestamp,
    label: new Date(entry.timestamp).toLocaleString(),
    nPeers: entry.nPeers
  }));

  function downloadCsv() {
    const header = 'timestamp,nPeers\n';
    const rows = statistics.data
      .map((entry) => `${entry.timestamp},${entry.nPeers}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${statistics.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Stack gap={'xs'} mt={'md'}>
      <Group justify={'space-between'}>
        <Title order={3}>Session Usage</Title>
        <Button variant={'outline'} onClick={downloadCsv}>
          Download CSV
        </Button>
      </Group>
      <AreaChart
        h={200}
        data={data}
        dataKey={'label'}
        series={[{ name: 'nPeers', label: 'Number of Peers', color: 'teal.6' }]}
        curveType={'monotone'}
        withDots={true}
        connectNulls
      />
    </Stack>
  );
}
