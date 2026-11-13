import { Accordion, Container, Group, Title } from '@mantine/core';

import { RequestNewSessionForm } from '@/components/RequestNewSessionForm';
import { Sessions } from '@/components/Sessions';
import { SignInAlert } from '@/components/SignInAlert';
import { CreateSessionIcon, SessionsIcon } from '@/icons/icons';
import { useAppSelector } from '@/redux/hooks';

export function HomePage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Container>
      <Title order={2} my={'xs'}>
        <Group gap={'xs'}>
          <SessionsIcon />
          Sessions
        </Group>
      </Title>
      <Sessions />
      <Accordion mt={'xs'}>
        <Accordion.Item value={'create-session'}>
          <Accordion.Control pl={0}>
            <Group gap={'xs'}>
              <CreateSessionIcon />
              Create New Session
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            {user ? <RequestNewSessionForm /> : <SignInAlert />}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}
