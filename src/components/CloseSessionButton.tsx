import { Button, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { CloseSessionIcon } from '@/icons/icons';
import { useCloseSessionMutation } from '@/redux/api/wormholeApiSlice';
import { IconSize } from '@/types/enums';
import { showApiErrorNotification } from '@/utils/notifications';

interface Props {
  sessionId: string;
  roomName: string;
  /** Called after the session has been closed successfully. */
  onClosed?: () => void;
}

export function CloseSessionButton({ sessionId, roomName, onClosed, ...props }: Props) {
  const [closeSession, { isLoading: isClosingSession }] = useCloseSessionMutation();

  async function handleClose() {
    try {
      const result = await closeSession(sessionId).unwrap();
      onClosed?.();
      notifications.show({
        title: 'Session Closed',
        message: result.message,
        color: 'green'
      });
    } catch (error) {
      showApiErrorNotification('Failed to close session', error);
    }
  }

  function openConfirmModal() {
    modals.openConfirmModal({
      title: 'Close Session',
      children: (
        <Text>
          {`Are you sure you want to close the session '${roomName}'? Closing
          disconnects all connected users and moves the session to history. This
          cannot be undone.`}
        </Text>
      ),
      labels: {
        confirm: 'Close',
        cancel: 'Cancel'
      },
      confirmProps: { color: 'red', variant: 'outline' },
      onConfirm: handleClose
    });
  }

  return (
    <Button
      {...props}
      onClick={openConfirmModal}
      loading={isClosingSession}
      color={'red'}
      variant={'outline'}
      leftSection={<CloseSessionIcon size={IconSize.xs} />}
    >
      Close Session
    </Button>
  );
}
