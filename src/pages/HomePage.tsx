import { Accordion, Container, Group, Title } from '@mantine/core';

import { OpenSpaceConnection } from '@/components/OpenSpaceConnection';
import { RequestNewSessionForm } from '@/components/RequestNewSessionForm';
import { Sessions } from '@/components/Sessions';
import { CreateSessionIcon, SessionsIcon } from '@/icons/icons';
import { useAppSelector } from '@/redux/hooks';

export function HomePage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Container>
      <OpenSpaceConnection />
      <Title order={2} my={'md'}>
        <Group gap={'xs'}>
          <SessionsIcon />
          Sessions
        </Group>
      </Title>
      <Sessions />
      {user ? (
        <Accordion mt={'xs'}>
          <Accordion.Item value={'create-session'}>
            <Accordion.Control pl={0}>
              <Group gap={'xs'}>
                <CreateSessionIcon />
                Create New Session
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <RequestNewSessionForm />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      ) : (
        <Title order={3} mt={'md'}>
          Sign in to create a new session
        </Title>
      )}
    </Container>
  );
}
