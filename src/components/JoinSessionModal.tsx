import { useState } from 'react';
import { Button, Checkbox, Group, Modal, Stack, TextInput } from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setConnectedSessionId } from '@/redux/local/localSlice';
import type { SessionData } from '@/types/types';

interface Props {
  session: SessionData;
  opened: boolean;
  close: () => void;
  isOwner: boolean;
  hostPassword: string | undefined;
}
export function JoinSessionModal({
  session,
  opened,
  close,
  isOwner,
  hostPassword: hostPw
}: Props) {
  const { user } = useAppSelector((state) => state.auth);
  const [hostPassword, setHostPassword] = useState(hostPw ?? '');
  const [username, setUsername] = useState(user?.displayName || 'Guest');
  const [takeOwnership, setTakeOwnership] = useState(isOwner);
  const luaApi = useOpenSpaceApi();
  const dispatch = useAppDispatch();

  function joinSession() {
    luaApi?.parallel.joinServer(
      import.meta.env.VITE_WORMHOLE_PORT,
      import.meta.env.VITE_WORMHOLE_ADDRESS,
      session.roomName,
      session.password ?? '',
      takeOwnership ? hostPassword.trim() : '',
      username.trim() ?? 'Guest'
    );
    dispatch(setConnectedSessionId(session.id));
    close();
  }

  return (
    <Modal.Root opened={opened} onClose={close}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Join Session: {session.roomName}</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <Stack gap={'xs'}>
            <TextInput
              label={'Host Password'}
              value={hostPassword}
              onChange={(event) => setHostPassword(event.currentTarget.value)}
              placeholder={'Enter host password'}
              description={'Optional host password of this session'}
            />
            <Checkbox
              label={'Take Hostship'}
              description={
                'Check if you want to take hostship, other connected users will follow you'
              }
              checked={takeOwnership}
              onChange={(event) => setTakeOwnership(event.currentTarget.checked)}
            />
            <TextInput
              label={'Username'}
              value={username}
              onChange={(event) => setUsername(event.currentTarget.value)}
              placeholder={'Enter username'}
              description={'Optional username shown in OpenSpace'}
            />
          </Stack>
          <Group justify="flex-end" mt={'xs'} gap={'xs'}>
            <Button onClick={close} variant="outline" color="gray">
              Cancel
            </Button>
            <Button onClick={joinSession}>Join Session</Button>
          </Group>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
