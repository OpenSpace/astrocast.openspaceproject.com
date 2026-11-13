import { Paper, SimpleGrid, Text } from '@mantine/core';

import { useSessions } from '@/hooks/useSessions';
import { useAppSelector } from '@/redux/hooks';

import { SessionCard } from './SessionCard';

export function Sessions() {
  const { sessions, isLoading } = useSessions();
  const connectedSessionId = useAppSelector((state) => state.local.connectedSessionId);
  // Connected session first, then scheduled sessions (earliest start first); startDate 0 means unscheduled.
  const sortedSessions = Array.from(sessions).sort((a, b) => {
    if ((a.id === connectedSessionId) !== (b.id === connectedSessionId)) {
      return a.id === connectedSessionId ? -1 : 1;
    }
    if (a.startDate && b.startDate && a.startDate !== b.startDate) {
      return a.startDate - b.startDate;
    }
    if (!a.startDate !== !b.startDate) {
      return a.startDate ? -1 : 1;
    }
    return b.created - a.created;
  });

  if (isLoading) {
    return (
      <Paper p={'xl'} withBorder>
        <Text>Loading sessions...</Text>
      </Paper>
    );
  }

  if (sessions.length === 0) {
    return (
      <Paper p={'xl'} withBorder>
        <Text>No sessions available</Text>
      </Paper>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={'md'}>
      {sortedSessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </SimpleGrid>
  );
}
