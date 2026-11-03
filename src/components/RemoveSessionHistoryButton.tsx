import { Button, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { useRemoveSessionHistoryMutation } from '@/redux/api/wormholeApiSlice';
import { showApiErrorNotification } from '@/utils/notifications';

interface Props {
  sessionId: string;
  roomName: string;
}

export function RemoveSessionHistoryButton({ sessionId, roomName }: Props) {
  const [removeSessionHistory] = useRemoveSessionHistoryMutation();

  async function handleRemove() {
    try {
      const result = await removeSessionHistory(sessionId).unwrap();
      notifications.show({
        title: 'Session Removed',
        message: result.message,
        color: 'green'
      });
    } catch (error) {
      showApiErrorNotification('Failed to remove session', error);
    }
  }

  function removeSessionModal() {
    modals.openConfirmModal({
      title: 'Remove Session',
      children: (
        <Text>
          {`Are you sure you want to remove the session '${roomName}'? The session
          and its recording file will be deleted from the server. This action cannot
          be undone.`}
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
