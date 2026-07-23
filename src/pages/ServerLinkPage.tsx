import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { Button, Container, Group, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { skipToken } from '@reduxjs/toolkit/query';

import { useOpenSpaceApi } from '@/api/hooks';
import { JoinSessionModal } from '@/components/JoinSessionModal';
import { OpenSpaceConnection } from '@/components/OpenSpaceConnection';
import { useGetHostPassword } from '@/hooks/useGetHostPassword';
import { useJoinSession } from '@/hooks/useJoinSession';
import { useGetSessionByIdQuery } from '@/redux/api/databaseApiSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setConnectedSessionId } from '@/redux/local/localSlice';

export function ServerLinkPage() {
  const { id } = useParams();
  const { data: session, isLoading } = useGetSessionByIdQuery(id ?? skipToken);
  const { user } = useAppSelector((state) => state.auth);
  const [opened, { open, close }] = useDisclosure();
  const { isOwner, hostPassword } = useGetHostPassword(session);
  const joinSession = useJoinSession(session, hostPassword, user?.displayName ?? 'Guest');
  const luaApi = useOpenSpaceApi();

  const isConnectedToSession = useAppSelector(
    (state) => state.local.connectedSessionId === id
  );
  const dispatch = useAppDispatch();

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
      <OpenSpaceConnection />
      <Title order={2}>Join Session</Title>

      <Text>
        Session is currently {session.active ? 'active' : 'inactive'}{' '}
        {session.active && session.currentHost
          ? `and hosted by ${session.currentHost}.`
          : ', no host has joined.'}
      </Text>
      <Text>
        If you don't see the session, click{' '}
        <Text span fw={700}>
          Join Session
        </Text>{' '}
        below.
      </Text>
      <Group>
        <Button onClick={open}>Join Session</Button>
        <Button onClick={disconnect} disabled={!isConnectedToSession}>
          Leave Session
        </Button>
      </Group>
    </Container>
  );
}
