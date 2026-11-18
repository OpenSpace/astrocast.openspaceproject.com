import { Button, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { useDeleteSessionHistoryMutation } from '@/redux/api/wormholeApiSlice';
import { showApiErrorNotification } from '@/utils/notifications';

interface Props {
  sessionId: string;
  roomName: string;
}

export function DeleteSessionHistoryButton({ sessionId, roomName }: Props) {
  const [deleteSessionHistory] = useDeleteSessionHistoryMutation();

  async function handleDelete() {
    try {
      const result = await deleteSessionHistory(sessionId).unwrap();
      notifications.show({
        title: 'Session Deleted',
        message: result.message,
        color: 'green'
      });
    } catch (error) {
      showApiErrorNotification('Failed to delete session', error);
    }
  }

  function deleteSessionModal() {
    modals.openConfirmModal({
      title: 'Delete Session',
      children: (
        <Text>
          {`Are you sure you want to permanently delete the session '${roomName}'? The
          session and its recording file will be deleted from the server. This action
          cannot be undone.`}
        </Text>
      ),
      labels: {
        confirm: 'Delete',
        cancel: 'Cancel'
      },
      confirmProps: { color: 'red', variant: 'outline' },
      onConfirm: handleDelete
    });
  }

  return (
    <Button color={'red'} variant={'outline'} onClick={deleteSessionModal}>
      Delete
    </Button>
  );
}
