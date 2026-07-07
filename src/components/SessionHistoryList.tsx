import { Accordion, Text } from '@mantine/core';

import {
  useGetSessionsHistoryQuery,
  useGetStatisticsQuery
} from '@/redux/api/databaseApiSlice';

import { SessionHistoryEntry } from './SessionHistoryEntry';

export function SessionHistoryList() {
  const { data, isLoading, isError } = useGetSessionsHistoryQuery();
  const { data: statistics } = useGetStatisticsQuery();
  const history = [...(data ?? [])].sort((a, b) => b.created - a.created);

  if (isLoading) {
    return <Text>Loading history...</Text>;
  }

  if (isError) {
    return <Text c={'red'}>Failed to load history</Text>;
  }

  if (history.length === 0) {
    return <Text>No history available</Text>;
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
