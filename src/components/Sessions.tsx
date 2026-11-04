import { SimpleGrid, Text } from '@mantine/core';

import { useSessions } from '@/hooks/useSessions';

import { SessionCard } from './SessionCard';

export function Sessions() {
  const { sessions, isLoading } = useSessions();
  // Scheduled sessions first (earliest start first); startDate 0 means unscheduled.
  const sortedSessions = Array.from(sessions).sort((a, b) => {
    if (a.startDate && b.startDate && a.startDate !== b.startDate) {
      return a.startDate - b.startDate;
    }
    if (!a.startDate !== !b.startDate) {
      return a.startDate ? -1 : 1;
    }
    return b.created - a.created;
  });

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
