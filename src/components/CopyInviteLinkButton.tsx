import { ActionIcon, CopyButton, Tooltip } from '@mantine/core';

import { CopyIcon } from '@/icons/icons';

interface Props {
  sessionId: string;
}

export function CopyInviteLinkButton({ sessionId }: Props) {
  return (
    <CopyButton value={`${window.location.origin}/join-server/${sessionId}`}>
      {({ copied, copy }) => (
        <Tooltip label={'Copy invite link'}>
          <ActionIcon onClick={copy} color={copied ? 'teal' : 'gray'} variant={'outline'}>
            <CopyIcon />
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  );
}
