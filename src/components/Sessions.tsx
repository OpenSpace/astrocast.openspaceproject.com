import { SimpleGrid, Text } from '@mantine/core';

import { useSessions } from '@/hooks/useSessions';

import { SessionCard } from './SessionCard';

export function Sessions() {
  const { sessions, isLoading } = useSessions();
  const sortedSessions = Array.from(sessions).sort((a, b) => b.created - a.created);

  if (isLoading) {
    return <Text>Loading sessions...</Text>;
  }

  if (sessions.length === 0) {
    return <Text>No sessions available</Text>;
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={'md'}>
      {sortedSessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </SimpleGrid>
  );
}
