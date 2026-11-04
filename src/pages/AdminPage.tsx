import { Accordion, Alert, Container, Group, Stack, Text, Title } from '@mantine/core';

import { LoginButton } from '@/components/LoginButton';
import { OpenSpaceConnection } from '@/components/OpenSpaceConnection';
import { RequestAdminRightsForm } from '@/components/RequestAdminRightsForm';
import { RequestNewSessionForm } from '@/components/RequestNewSessionForm';
import { SessionHistoryList } from '@/components/SessionHistoryList';
import { SessionStatusList } from '@/components/SessionStatusList';
import { AccessDeniedIcon, AdminIcon, CreateSessionIcon } from '@/icons/icons';
import { useAppSelector } from '@/redux/hooks';

export function AdminPage() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user?.isAdmin) {
    return (
      <Container>
        <Alert
          color={'red'}
          title={'Access denied'}
          icon={<AccessDeniedIcon />}
          mt={'md'}
        >
          <Stack align="flex-start" gap={'xs'}>
            <Text>You do not have permission to view this page.</Text>
            <LoginButton />
          </Stack>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <OpenSpaceConnection />
      <Accordion mt={'sm'}>
        <Accordion.Item value={'create-session'}>
          <Accordion.Control>
            <Group gap={'xs'}>
              <CreateSessionIcon />
              Create New Session
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <RequestNewSessionForm />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value={'grant-admin-rights'}>
          <Accordion.Control>
            <Group gap={'xs'}>
              <AdminIcon />
              Grant Admin Rights
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <RequestAdminRightsForm />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Title order={2} mt={'md'}>
        Session Status
      </Title>
      <SessionStatusList />
      <Title order={2} mt={'md'}>
        Removed by User
      </Title>
      <SessionHistoryList removed />
      <Title order={2} mt={'md'}>
        History
      </Title>
      <SessionHistoryList />
    </Container>
  );
}
