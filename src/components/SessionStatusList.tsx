import { Accordion, Text } from '@mantine/core';

import { useSessions } from '@/hooks/useSessions';
import { useGetStatisticsQuery } from '@/redux/api/databaseApiSlice';

import { SessionStatusEntry } from './SessionStatusEntry';

export function SessionStatusList() {
  const { sessions, isLoading, isError } = useSessions();
  const { data: statistics } = useGetStatisticsQuery();

  if (isLoading) {
    return <Text>Loading sessions...</Text>;
  }

  if (isError) {
    return <Text c={'red'}>Failed to load sessions</Text>;
  }

  if (sessions.length === 0) {
    return <Text>No sessions available</Text>;
  }

  return (
    <Accordion order={3}>
      {sessions.map((session) => (
        <SessionStatusEntry
          key={session.id}
          session={session}
          statistics={statistics?.find((stat) => stat.id === session.id)}
        />
      ))}
    </Accordion>
  );
}
