import { useState } from 'react';
import {
  Alert,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';

import { ClampedText } from '@/components/ClampedText';
import { DownloadSessionButton } from '@/components/DownloadSessionButton';
import { LoginButton } from '@/components/LoginButton';
import { RemoveSessionHistoryButton } from '@/components/RemoveSessionHistoryButton';
import { SessionCard } from '@/components/SessionCard';
import { AccessDeniedIcon, SearchIcon } from '@/icons/icons';
import {
  useGetSessionsHistoryQuery,
  useGetSessionsQuery
} from '@/redux/api/databaseApiSlice';
import { useAppSelector } from '@/redux/hooks';
import { IconSize } from '@/types/enums';
import type { SessionHistoryData } from '@/types/types';
import { formatDateTime, formatDuration } from '@/utils/format';

export function MySessionsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { data: activeSessions, isLoading: isActiveLoading } = useGetSessionsQuery();
  const { data: historySessions, isLoading: isHistoryLoading } =
    useGetSessionsHistoryQuery();
  const [search, setSearch] = useState('');

  if (!user) {
    return (
      <Container>
        <Alert
          color={'red'}
          title={'Sign in required'}
          icon={<AccessDeniedIcon />}
          mt={'md'}
        >
          <Stack align="flex-start" gap={'xs'}>
            <Text>You need to sign in to view your sessions.</Text>
            <LoginButton />
          </Stack>
        </Alert>
      </Container>
    );
  }

  const active = [...(activeSessions ?? [])]
    .filter((session) => session.owner === user.uid)
    .sort((a, b) => b.created - a.created);
  const history = [...(historySessions ?? [])]
    .filter((session) => session.owner === user.uid && !session.removedByUser)
    .sort((a, b) => b.created - a.created);

  const query = search.trim().toLowerCase();
  const matches = (session: { roomName: string; description?: string }) =>
    !query ||
    session.roomName.toLowerCase().includes(query) ||
    (session.description ?? '').toLowerCase().includes(query);
  const filteredActive = active.filter(matches);
  const filteredHistory = history.filter(matches);

  const isLoading = isActiveLoading || isHistoryLoading;

  return (
    <Container>
      <Title order={2} mt={'lg'}>
        My Sessions
      </Title>
      <TextInput
        mt={'md'}
        mb={'md'}
        placeholder="Search by title or description"
        leftSection={<SearchIcon size={IconSize.sm} />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />
      {isLoading ? (
        <Text>Loading sessions...</Text>
      ) : (
        <>
          <Title order={3} mt={'md'}>
            Active Sessions
          </Title>
          {filteredActive.length === 0 ? (
            <Text>
              {query ? 'No active sessions match your search' : 'No active sessions'}
            </Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={'md'}>
              {filteredActive.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </SimpleGrid>
          )}
          <Title order={3} mt={'lg'}>
            Historic Sessions
          </Title>
          {filteredHistory.length === 0 ? (
            <Text>
              {query ? 'No history sessions match your search' : 'No history sessions'}
            </Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={'md'}>
              {filteredHistory.map((session) => (
                <MySessionEntry key={session.id} session={session} />
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </Container>
  );
}

function MySessionEntry({ session }: { session: SessionHistoryData }) {
  const description = session.description?.trim() ?? '';

  return (
    <Card withBorder>
      <Card.Section p={'xs'} flex={1}>
        <Stack gap={'xs'}>
          <Text fw={700} size={'lg'} lineClamp={2}>
            {session.roomName}
          </Text>
          {description && (
            <ClampedText size={'sm'} c={'dark.1'} lineClamp={3}>
              {description}
            </ClampedText>
          )}
          <Text size={'sm'} c={'dark.1'}>
            Created: {formatDateTime(session.created)}
          </Text>
          <Text size={'sm'} c={'dark.1'}>
            Last used: {formatDateTime(session.inactiveTimestamp)}
          </Text>
          <Text size={'sm'} c={'dark.1'}>
            Uptime: {formatDuration(session.uptime)}
          </Text>
          <Text size={'sm'} c={'dark.1'}>
            Total usage: {session.usage}
          </Text>
        </Stack>
      </Card.Section>
      <Card.Section p={'xs'}>
        <Group justify="flex-end" gap={'xs'}>
          <DownloadSessionButton sessionId={session.id} />
          <RemoveSessionHistoryButton
            sessionId={session.id}
            roomName={session.roomName}
          />
        </Group>
      </Card.Section>
    </Card>
  );
}
