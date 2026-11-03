import { useState } from 'react';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useOpenSpaceApi } from '@/api/hooks';
import { useClaimHostMutation } from '@/redux/api/wormholeApiSlice';
import type { SessionData } from '@/types/types';
import { showApiErrorNotification } from '@/utils/notifications';

interface Props {
  session: SessionData;
  opened: boolean;
  close: () => void;
  hostPassword: string;
}

export function ClaimHostModal({ session, opened, close, hostPassword: hostPw }: Props) {
  const [passwordOverride, setPasswordOverride] = useState<string | null>(null);
  const [claimHost, { isLoading }] = useClaimHostMutation();
  const luaApi = useOpenSpaceApi();

  const password = (passwordOverride ?? hostPw ?? '').trim();

  async function handleConfirm() {
    try {
      const result = await claimHost({ sessionId: session.id, password }).unwrap();
      luaApi?.astrocast.requestHostship(password);
      notifications.show({
        title: 'Host Claimed',
        message: result.message,
        color: 'green'
      });
      close();
    } catch (error) {
      showApiErrorNotification('Failed to claim host', error);
      close();
    }
  }

  return (
    <Modal.Root opened={opened} onClose={close}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Claim Host: {session.roomName}</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <Stack gap={'xs'}>
            <TextInput
              label={'Host Password'}
              value={password}
              onChange={(event) => setPasswordOverride(event.currentTarget.value)}
              placeholder={'Enter host password'}
              description={'Host password required to claim host of this session'}
              maxLength={100}
              withAsterisk
            />
          </Stack>
          <Group justify="flex-end" mt={'xs'} gap={'xs'}>
            <Button onClick={close} variant="outline" color="gray">
              Cancel
            </Button>
            <Button onClick={handleConfirm} loading={isLoading}>
              Claim Host
            </Button>
          </Group>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
