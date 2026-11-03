import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Collapse,
  Group,
  Loader,
  type MantineColor,
  Menu,
  SimpleGrid,
  Stack,
  Text,
  Tooltip
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useOpenSpaceApi } from '@/api/hooks';
import { env } from '@/config/env';
import { useGetHostPassword } from '@/hooks/useGetHostPassword';
import { useIsConnectionStatus } from '@/hooks/util';
import {
  ExpandMoreIcon,
  HostIcon,
  JoinSessionIcon,
  VerticalDotsIcon
} from '@/icons/icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setConnectedSessionId } from '@/redux/local/localSlice';
import { ConnectionStatus, IconSize } from '@/types/enums';
import type { DetailItem, SessionData } from '@/types/types';
import { formatDateTime, formatSchedule } from '@/utils/format';

import { ClaimHostModal } from './ClaimHostModal';
import { ClampedText } from './ClampedText';
import { CloseSessionButton } from './CloseSessionButton';
import { CopyInviteLinkButton } from './CopyInviteLinkButton';
import { DownloadSessionButton } from './DownloadSessionButton';
import { JoinSessionModal } from './JoinSessionModal';
import { TruncatedText } from './TruncatedText';

interface Props {
  session: SessionData;
}

export function SessionCard({ session }: Props) {
  const { user } = useAppSelector((state) => state.auth);
  const [joinSessionOpened, { open: openJoinSession, close: closeJoinSession }] =
    useDisclosure();
  const [claimHostOpened, { open: openClaimHost, close: closeClaimHost }] =
    useDisclosure();
  const [detailsOpened, { toggle: toggleDetails }] = useDisclosure();
  const luaApi = useOpenSpaceApi();
  const isConnectedToOpenSpace = useIsConnectionStatus(ConnectionStatus.Connected);
  const isConnectedToSession = useAppSelector(
    (state) => state.local.connectedSessionId === session.id
  );
  const { isOwner, hostPassword, isLoading } = useGetHostPassword(session);

  const dispatch = useAppDispatch();

  const canJoinSession = isConnectedToOpenSpace && luaApi !== null;
  const canClaimHost = isConnectedToSession && user !== null;
  const canCloseSession = isOwner || user?.isAdmin === true;
  const data: DetailItem[] = [
    { label: 'Address', value: env.VITE_WORMHOLE_ADDRESS },
    { label: 'Port', value: env.VITE_WORMHOLE_PORT },
    { label: 'Password', value: session.password || 'N/A' },
    { label: 'In Session', value: session.nPeers },
    {
      label: 'Host',
      value: session.currentHost || 'No host'
    }
  ];
  if (hostPassword) {
    data.push({ label: 'Host Password', value: hostPassword });
  }

  const description = session.description?.trim() ?? '';
  const version = session.version?.trim() ?? '';
  const profile = session.profile?.trim() ?? '';
  const keepAlive = session.keepAlive === true;
  const schedule = formatSchedule(session.startDate, session.endDate);
  const badges: { color: MantineColor; label: string }[] = [
    {
      color: session.active ? 'green' : 'red',
      label: session.active ? 'Active' : 'Inactive'
    },
    {
      color: session.isPrivate ? 'orange' : 'blue',
      label: session.isPrivate ? 'Private' : 'Public'
    }
  ];
  if (keepAlive) {
    badges.push({ color: 'teal', label: 'Kept' });
  }

  function disconnect() {
    luaApi?.astrocast.disconnect();
    dispatch(setConnectedSessionId(null));
  }

  function handleSessionClosed() {
    if (isConnectedToSession) {
      disconnect();
    }
  }

  return (
    <Card withBorder>
      <Card.Section p={'xs'} flex={1} withBorder>
        <Stack gap={'xs'}>
          <Group justify="space-between" align="flex-start" gap={'xs'}>
            <Text fw={700} size={'lg'} lineClamp={2}>
              {session.roomName}
            </Text>
            <Group gap={'xs'}>
              {badges.map((badge) => (
                <Badge key={badge.label} variant="dot" color={badge.color}>
                  {badge.label}
                </Badge>
              ))}
            </Group>
          </Group>
          <Text size={'sm'} c={'dark.1'}>
            Created: {formatDateTime(session.created)}
          </Text>
          {description && (
            <ClampedText size={'sm'} lineClamp={3}>
              {description}
            </ClampedText>
          )}
          {schedule && (
            <Text size={'sm'} c={'dark.1'}>
              {schedule}
            </Text>
          )}
          {(version || profile) && (
            <Group gap={5} align="center" wrap="wrap">
              {version && (
                <TruncatedText size="sm" c={'dark.1'}>
                  Version: {version}
                </TruncatedText>
              )}
              {profile && (
                <Text size={'sm'} c={'dark.1'}>
                  Profile: {profile}
                </Text>
              )}
            </Group>
          )}
          <Button
            variant="subtle"
            size="xs"
            c="dimmed"
            onClick={toggleDetails}
            rightSection={
              <ExpandMoreIcon
                size={IconSize.xs}
                style={{
                  transform: detailsOpened ? 'rotate(180deg)' : undefined,
                  transition: 'transform 0.2s ease'
                }}
              />
            }
          >
            Details
          </Button>
          <Collapse expanded={detailsOpened}>
            {isLoading ? (
              <Loader size={'sm'} type="bars" />
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={'xs'}>
                {data.map((item) => (
                  <Stack key={item.label} gap={0}>
                    <Text size={'xs'} c={'dimmed'}>
                      {item.label}
                    </Text>
                    <Text size={'sm'}>{item.value}</Text>
                  </Stack>
                ))}
              </SimpleGrid>
            )}
          </Collapse>
        </Stack>
      </Card.Section>
      <Card.Section p={'xs'}>
        <Group justify="space-between" gap={'xs'}>
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
          <Group gap={'xs'}>
            <CopyInviteLinkButton sessionId={session.id} />
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
                    <DownloadSessionButton
                      sessionId={session.id}
                      label="Download Session"
                      disabled={user === null}
                    />
                  </Tooltip>
                  {canCloseSession && (
                    <Tooltip label={'Close this session for all users'}>
                      <CloseSessionButton
                        sessionId={session.id}
                        roomName={session.roomName}
                        onClosed={handleSessionClosed}
                      />
                    </Tooltip>
                  )}
                </Stack>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Card.Section>
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
    </Card>
  );
}
