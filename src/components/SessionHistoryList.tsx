import { Accordion, Text } from '@mantine/core';

import {
  useGetSessionsHistoryQuery,
  useGetStatisticsQuery
} from '@/redux/api/databaseApiSlice';

import { SessionHistoryEntry } from './SessionHistoryEntry';

interface Props {
  // Show only sessions removed by their owner instead of the remaining ones
  removed?: boolean;
}

export function SessionHistoryList({ removed = false }: Props) {
  const { data, isLoading } = useGetSessionsHistoryQuery();
  const { data: statistics } = useGetStatisticsQuery();
  const history = (data ?? [])
    .filter((session) => !!session.removedByUser === removed)
    .sort((a, b) => b.created - a.created);

  if (isLoading) {
    return <Text>Loading history...</Text>;
  }

  if (history.length === 0) {
    return <Text>{removed ? 'No removed sessions' : 'No history available'}</Text>;
  }

  return (
    <Accordion order={3}>
      {history.map((session) => (
        <SessionHistoryEntry
          key={session.id}
          session={session}
          statistics={statistics?.find((stat) => stat.id === session.id)}
        />
      ))}
    </Accordion>
  );
}
