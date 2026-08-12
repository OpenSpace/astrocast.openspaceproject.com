import { Accordion, Text } from '@mantine/core';

import { useSessions } from '@/hooks/useSessions';

import { SessionEntry } from './SessionEntry';

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
    <Accordion order={3}>
      {sortedSessions.map((session) => (
        <SessionEntry key={session.id} session={session} />
      ))}
    </Accordion>
  );
}
