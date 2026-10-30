import {
  Accordion,
  ActionIcon,
  Button,
  CopyButton,
  Divider,
  Group,
  Loader,
  Menu,
  Stack,
  Tooltip
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { useOpenSpaceApi } from '@/api/hooks';
import { env } from '@/config/env';
import { useGetHostPassword } from '@/hooks/useGetHostPassword';
import { useIsConnectionStatus } from '@/hooks/util';
import {
  CopyIcon,
  DownloadFileIcon,
  HostIcon,
  JoinSessionIcon,
  VerticalDotsIcon
} from '@/icons/icons';
import { useLazyDownloadRecordingFileQuery } from '@/redux/api/wormholeApiSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setConnectedSessionId } from '@/redux/local/localSlice';
import { ConnectionStatus, IconSize } from '@/types/enums';
import type { DetailItem, SessionData } from '@/types/types';

import { AccordionHeaderRow } from './AccordionHeaderRow';
import { ClaimHostModal } from './ClaimHostModal';
import { DetailsList } from './DetailsList';
import { JoinSessionModal } from './JoinSessionModal';

interface Props {
  session: SessionData;
}

export function SessionEntry({ session }: Props) {
  const { user } = useAppSelector((state) => state.auth);
  const [joinSessionOpened, { open: openJoinSession, close: closeJoinSession }] =
    useDisclosure();
  const [claimHostOpened, { open: openClaimHost, close: closeClaimHost }] =
    useDisclosure();
  const luaApi = useOpenSpaceApi();
  const isConnectedToOpenSpace = useIsConnectionStatus(ConnectionStatus.Connected);
  const isConnectedToSession = useAppSelector(
    (state) => state.local.connectedSessionId === session.id
  );
  const { isOwner, hostPassword, isLoading } = useGetHostPassword(session);
  const [triggerDownload, { isFetching: isDownloading }] =
    useLazyDownloadRecordingFileQuery();

  const dispatch = useAppDispatch();

  const canJoinSession = isConnectedToOpenSpace && luaApi !== null;
  const canClaimHost = isConnectedToSession && user !== null;
  const data: DetailItem[] = [
    { label: 'Address', value: env.VITE_WORMHOLE_ADDRESS },
    { label: 'Port', value: env.VITE_WORMHOLE_PORT },
    { label: 'Password', value: session.password || 'N/A' },
    { label: 'In Session', value: session.nPeers },
    {
      label: 'Host',
      value: session.currentHost !== '' ? session.currentHost : 'No host'
    }
  ];
  if (hostPassword) {
    data.push({ label: 'Host Password', value: hostPassword });
  }

  function disconnect() {
    luaApi?.astrocast.disconnect();
    dispatch(setConnectedSessionId(null));
  }

  async function downloadRecording() {
    try {
      await triggerDownload(session.id).unwrap();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const code = error?.status || '';
      const codeMessage = code ? `Error ${code} - ` : '';
      notifications.show({
        title: `${codeMessage}Failed to download recording file`,
        message: (error as Error).message,
        color: 'red'
      });
    }
  }

  return (
    <Accordion.Item value={session.id}>
      <Accordion.Control>
        <AccordionHeaderRow
          fields={[
            { label: 'Session Name', value: session.roomName, span: 4 },
            {
              label: 'Created',
              value: new Date(session.created).toLocaleString(),
              span: 2
            },
            { label: 'Profile', value: session.profile, span: 2 },
            { label: 'Status', value: session.active ? 'Active' : 'Inactive', span: 1 },
            { label: 'Access', value: session.isPrivate ? 'Private' : 'Public', span: 1 }
          ]}
        />
      </Accordion.Control>
      <Accordion.Panel>
        {isLoading ? (
          <Loader size={'sm'} type="bars" />
        ) : (
          <>
            <JoinSessionModal
              key={`${user?.uid ?? 'anon'}:${isOwner}:${hostPassword ?? ''}`}
              session={session}
              opened={joinSessionOpened}
              close={closeJoinSession}
              isOwner={isOwner}
              hostPassword={hostPassword}
            />
            <ClaimHostModal
              key={`claim:${user?.uid ?? 'anon'}:${isOwner}:${hostPassword ?? ''}`}
              session={session}
              opened={claimHostOpened}
              close={closeClaimHost}
              hostPassword={hostPassword}
            />
            <DetailsList items={data} />
            <Divider my={'xs'} />
            <Group justify={'flex-end'} gap={'xs'}>
              {isConnectedToSession ? (
                <Button onClick={disconnect}>Leave Session</Button>
              ) : (
                <Tooltip
                  label={
                    canJoinSession
                      ? 'Join this session'
                      : 'Cannot join session; Astrocast is not connected to OpenSpace'
                  }
                >
                  <Button
                    onClick={openJoinSession}
                    disabled={!canJoinSession}
                    rightSection={<JoinSessionIcon size={IconSize.xs} />}
                  >
                    Join Session
                  </Button>
                </Tooltip>
              )}
              <CopyButton value={`${window.location.origin}/join-server/${session.id}`}>
                {({ copied, copy }) => (
                  <Tooltip label={'Copy invite link'}>
                    <ActionIcon
                      onClick={copy}
                      color={copied ? 'teal' : 'gray'}
                      variant={'outline'}
                    >
                      <CopyIcon />
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
              <Menu>
                <Menu.Target>
                  <Tooltip label={'More options'}>
                    <ActionIcon aria-label="Open menu" variant="outline" color="gray">
                      <VerticalDotsIcon />
                    </ActionIcon>
                  </Tooltip>
                </Menu.Target>
                <Menu.Dropdown>
                  <Stack>
                    <Tooltip
                      label={
                        user
                          ? 'You must join this session to claim host'
                          : 'You must sign-in to claim host'
                      }
                      disabled={canClaimHost}
                    >
                      <Menu.Item
                        onClick={openClaimHost}
                        disabled={!canClaimHost}
                        variant={'outline'}
                        leftSection={<HostIcon size={IconSize.xs} />}
                      >
                        Claim Host
                      </Menu.Item>
                    </Tooltip>
                    <Tooltip
                      label={
                        user
                          ? 'Download session file'
                          : 'You must sign-in to download session file'
                      }
                    >
                      <Button
                        onClick={downloadRecording}
                        loading={isDownloading}
                        variant={'outline'}
                        disabled={user === null}
                        leftSection={<DownloadFileIcon size={IconSize.xs} />}
                      >
                        Download Session
                      </Button>
                    </Tooltip>
                  </Stack>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </>
        )}
      </Accordion.Panel>
    </Accordion.Item>
  );
}
