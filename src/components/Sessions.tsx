import { Accordion, Box, Grid, Text } from '@mantine/core';

import { HeaderPair } from '@/components/HeaderPair';
import { useSessions } from '@/hooks/useSessions';

import { SessionEntry } from './SessionEntry';

export function Sessions() {
  const { sessions, isLoading, isError } = useSessions();

  if (isLoading) {
    return <Text>Loading sessions...</Text>;
  }

  if (isError) {
    return <Text c={'red'}>Failed to load sessions</Text>;
  }

  const sessionItems = sessions.map((session) => (
    <Accordion.Item key={session.id} value={session.id}>
      <Accordion.Control>
        <Grid grow>
          <Grid.Col span={6}>
            <HeaderPair label={'Session Name'} value={session.roomName} />
          </Grid.Col>
          <Grid.Col span={2}>
            <HeaderPair label={'Profile'} value={session.profile} />
          </Grid.Col>
          <Grid.Col span={1}>
            <HeaderPair label={'Status'} value={session.active ? 'Active' : 'Inactive'} />
          </Grid.Col>
          <Grid.Col span={1}>
            <HeaderPair
              label={'Access'}
              value={session.isPrivate ? 'Private' : 'Public'}
            />
          </Grid.Col>
        </Grid>
      </Accordion.Control>
      <Accordion.Panel>
        <SessionEntry session={session} />
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <>
      {sessions.length > 0 ? (
        <Accordion order={3}>{sessionItems}</Accordion>
      ) : (
        <Box>No sessions available</Box>
      )}
    </>
  );
}
