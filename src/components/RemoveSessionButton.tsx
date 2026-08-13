import { Button, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { useRemoveSessionMutation } from '@/redux/api/wormholeApiSlice';

interface Props {
  sessionId: string;
  roomName: string;
}

export function RemoveSessionButton({ sessionId, roomName }: Props) {
  const [removeSession] = useRemoveSessionMutation();

  async function handleRemove() {
    try {
      const result = await removeSession(sessionId).unwrap();
      notifications.show({
        title: 'Session Removed',
        message: result.message,
        color: 'green'
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const code = error?.status || '';
      const codeMessage = code ? `Error ${code} - ` : '';
      notifications.show({
        title: `${codeMessage}Failed to remove session`,
        message: error.data?.error,
        color: 'red'
      });
    }
  }

  function removeSessionModal() {
    modals.openConfirmModal({
      title: 'Remove Session',
      children: (
        <Text>
          {`Are you sure you want to remove the session '${roomName}'? This action
          cannot be undone.`}
        </Text>
      ),
      labels: {
        confirm: 'Remove',
        cancel: 'Cancel'
      },
      confirmProps: { color: 'red', variant: 'outline' },
      onConfirm: handleRemove
    });
  }

  return (
    <Button color={'red'} variant={'outline'} onClick={removeSessionModal}>
      Remove
    </Button>
  );
}
