import { Button } from '@mantine/core';

import { DownloadFileIcon } from '@/icons/icons';
import { useLazyDownloadRecordingFileQuery } from '@/redux/api/wormholeApiSlice';
import { IconSize } from '@/types/enums';
import { showApiErrorNotification } from '@/utils/notifications';

interface Props {
  sessionId: string;
  label?: string;
  disabled?: boolean;
}

export function DownloadSessionButton({
  sessionId,
  label = 'Download Recording',
  ...props
}: Props) {
  const [triggerDownload, { isFetching: isDownloading }] =
    useLazyDownloadRecordingFileQuery();

  async function handleDownload() {
    try {
      await triggerDownload(sessionId).unwrap();
    } catch (error) {
      showApiErrorNotification('Failed to download recording file', error);
    }
  }

  return (
    <Button
      {...props}
      onClick={handleDownload}
      loading={isDownloading}
      variant={'outline'}
      leftSection={<DownloadFileIcon size={IconSize.xs} />}
    >
      {label}
    </Button>
  );
}
