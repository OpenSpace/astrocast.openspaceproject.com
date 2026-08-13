import { useState } from 'react';
import { Button, Checkbox, Group, Modal, Stack, TextInput } from '@mantine/core';

import { useJoinSession } from '@/hooks/useJoinSession';
import { useAppSelector } from '@/redux/hooks';
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
  const [hostPasswordOverride, setHostPasswordOverride] = useState<string | null>(null);
  const [usernameOverride, setUsernameOverride] = useState<string | null>(null);
  const [takeOwnershipOverride, setTakeOwnershipOverride] = useState<boolean | null>(
    null
  );

  const hostPassword = (hostPasswordOverride ?? hostPw ?? '').trim();
  const username = usernameOverride ?? user?.displayName ?? 'Guest';
  const takeOwnership = takeOwnershipOverride ?? isOwner;

  const joinSession = useJoinSession(
    session,
    takeOwnership ? hostPassword : null,
    username
  );

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
              onChange={(event) => setHostPasswordOverride(event.currentTarget.value)}
              placeholder={'Enter host password'}
              description={'Optional host password of this session'}
            />
            <Checkbox
              label={'Take Hostship'}
              description={
                'Check if you want to take hostship, other connected users will follow you'
              }
              checked={takeOwnership}
              onChange={(event) => setTakeOwnershipOverride(event.currentTarget.checked)}
            />
            <TextInput
              label={'Username'}
              value={username}
              onChange={(event) => setUsernameOverride(event.currentTarget.value)}
              placeholder={'Enter username'}
              description={'Optional username shown in OpenSpace'}
            />
          </Stack>
          <Group justify="flex-end" mt={'xs'} gap={'xs'}>
            <Button onClick={close} variant="outline" color="gray">
              Cancel
            </Button>
            <Button
              onClick={() => {
                joinSession();
                close();
              }}
            >
              Join Session
            </Button>
          </Group>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
