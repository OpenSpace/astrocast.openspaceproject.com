import { Button, Container, Title } from '@mantine/core';

import { Foo } from '../somepage';

export function HomePage() {
  return (
    <Container>
      <Button>Hello</Button>
      <Title order={2}>Session</Title>
      <Foo />
    </Container>
  );
}
