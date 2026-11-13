import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { Button, Container, Group, Paper, Text, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { skipToken } from '@reduxjs/toolkit/query';

import { useOpenSpaceApi } from '@/api/hooks';
import { JoinSessionModal } from '@/components/JoinSessionModal';
import { OpenSpaceConnection } from '@/components/OpenSpaceConnection';
import { TruncatedText } from '@/components/TruncatedText';
import { useGetHostPassword } from '@/hooks/useGetHostPassword';
import { useJoinSession } from '@/hooks/useJoinSession';
import { useIsConnectionStatus } from '@/hooks/util';
import { JoinSessionIcon, LeaveSessionIcon } from '@/icons/icons';
import { useGetSessionByIdQuery } from '@/redux/api/databaseApiSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setConnectedSessionId } from '@/redux/local/localSlice';
import { ConnectionStatus, IconSize } from '@/types/enums';
import { SessionIdPattern } from '@/utils/validate';

export function ServerLinkPage() {
  const { id } = useParams();
  // The id comes from the URL and is user-controlled; only query for it if it
  // looks like a valid session id, so crafted links cannot traverse database
  // paths or API routes.
  const isValidId = id != null && SessionIdPattern.test(id);
  const { data: session, isLoading } = useGetSessionByIdQuery(isValidId ? id : skipToken);
  const { user } = useAppSelector((state) => state.auth);
  const [opened, { open, close }] = useDisclosure();
  const { isOwner, hostPassword } = useGetHostPassword(session);
  const joinSession = useJoinSession(session, hostPassword, user?.displayName ?? 'Guest');
  const luaApi = useOpenSpaceApi();
  const isConnectedToOpenSpace = useIsConnectionStatus(ConnectionStatus.Connected);

  const isConnectedToSession = useAppSelector(
    (state) => state.local.connectedSessionId === id
  );
  const dispatch = useAppDispatch();

  const canJoinSession = isConnectedToOpenSpace && luaApi !== null;

  // Auto-join once per session id. Joining updates the session's live data, which would
  // otherwise change `joinSession`'s identity and re-trigger this effect, causing an
  // endless join/disconnect loop. We only mark a session as auto-joined once the Lua API
  // was actually available to attempt it, so this keeps retrying until the OpenSpace
  // connection comes up.
  const autoJoinedSessionId = useRef<string | null>(null);
  useEffect(() => {
    if (isLoading || !session || !luaApi || autoJoinedSessionId.current === session.id) {
      return;
    }
    autoJoinedSessionId.current = session.id;
    joinSession();
  }, [isLoading, session, luaApi, joinSession]);

  function disconnect() {
    luaApi?.astrocast.disconnect();
    dispatch(setConnectedSessionId(null));
  }

  if (isLoading) {
    return (
      <Container>
        <OpenSpaceConnection />
        <Text>Fetching session...</Text>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container>
        <OpenSpaceConnection />
        <Text>Could not find session</Text>
      </Container>
    );
  }

  return (
    <Container>
      <JoinSessionModal
        opened={opened}
        session={session}
        close={close}
        isOwner={isOwner}
        hostPassword={hostPassword}
      />
      <Title order={2}>Join Session</Title>

      <Paper p={'md'} withBorder>
        <Group align="center" gap={'xs'}>
          {session.active && (
            <Tooltip label={'Session is active'}>
              <span
                style={{
                  display: 'inline-block',
                  width: IconSize.xs,
                  height: IconSize.xs,
                  borderRadius: '50%',
                  backgroundColor: '#5cdd8b'
                }}
              />
            </Tooltip>
          )}
          <Text fw={700} flex={1} size="lg">
            {session.roomName}
          </Text>
        </Group>
        {session.description && <Text>Description: {session.description}</Text>}

        {(session.version || session.profile) && (
          <Group gap={5} align="center" wrap="wrap">
            {session.version && (
              <TruncatedText size="sm" c={'dark.1'}>
                Version: {session.version}
              </TruncatedText>
            )}
            {session.profile && <Text size={'sm'}>Profile: {session.profile}</Text>}
          </Group>
        )}
        <Text>
          Session is currently {session.active ? 'active' : 'inactive'}{' '}
          {session.active && session.currentHost
            ? `and hosted by ${session.currentHost}.`
            : ', no host has joined.'}
        </Text>
      </Paper>
      <Text>
        If you did not auto connect to the session, click{' '}
        <Text span fw={700}>
          Join Session
        </Text>{' '}
        below.
      </Text>
      <Group>
        <Tooltip
          label={
            canJoinSession
              ? 'Join this session'
              : 'Cannot join session; Astrocast is not connected to OpenSpace'
          }
        >
          <Button
            onClick={open}
            rightSection={<JoinSessionIcon />}
            disabled={!canJoinSession}
          >
            Join Session
          </Button>
        </Tooltip>
        <Button
          onClick={disconnect}
          rightSection={<LeaveSessionIcon />}
          color="red"
          disabled={!isConnectedToSession}
        >
          Leave Session
        </Button>
      </Group>
    </Container>
  );
}
