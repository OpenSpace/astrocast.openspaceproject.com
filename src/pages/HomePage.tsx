import { Container, Title } from '@mantine/core';

import { OpenSpaceConnection } from '@/components/OpenSpaceConnection';
import { RequestNewSessionForm } from '@/components/RequestNewSessionForm';
import { Sessions } from '@/components/Sessions';
import { useAppSelector } from '@/redux/hooks';

export function HomePage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Container>
      <OpenSpaceConnection />
      <Title order={2} mt={'lg'}>
        Sessions
      </Title>
      <Sessions />
      {user ? (
        <RequestNewSessionForm />
      ) : (
        <Title order={3} mt={'md'}>
          Login to create a new session
        </Title>
      )}
    </Container>
  );
}
