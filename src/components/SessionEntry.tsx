import { Button, CopyButton, DataList, Divider, Group, Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useOpenSpaceApi } from '@/api/hooks';
import { useGetHostPassword } from '@/hooks/useGetHostPassword';
import { useIsConnectionStatus } from '@/hooks/util';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setConnectedSessionId } from '@/redux/local/localSlice';
import { ConnectionStatus } from '@/types/enums';
import type { SessionData } from '@/types/types';

import { JoinSessionModal } from './JoinSessionModal';

interface Props {
  session: SessionData;
}

export function SessionEntry({ session }: Props) {
  const { user } = useAppSelector((state) => state.auth);
  const [opened, { open, close }] = useDisclosure();
  const luaApi = useOpenSpaceApi();
  const isConnectedToOpenSpace = useIsConnectionStatus(ConnectionStatus.Connected);
  const isConnectedToSession = useAppSelector(
    (state) => state.local.connectedSessionId === session.id
  );
  const { isOwner, hostPassword, isLoading } = useGetHostPassword(session);

  const dispatch = useAppDispatch();

  const canJoinSession = isConnectedToOpenSpace && luaApi !== null;
  const data = [
    { label: 'Address', value: import.meta.env.VITE_WORMHOLE_ADDRESS },
    { label: 'Port', value: import.meta.env.VITE_WORMHOLE_PORT },
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
    luaApi?.parallel.disconnect();
    dispatch(setConnectedSessionId(null));
  }

  if (isLoading) {
    return <Loader size={'sm'} type="bars" />;
  }

  return (
    <>
      <JoinSessionModal
        key={`${user?.uid ?? 'anon'}:${isOwner}:${hostPassword ?? ''}`}
        session={session}
        opened={opened}
        close={close}
        isOwner={isOwner}
        hostPassword={hostPassword}
      />
      <DataList withDivider>
        {data.map((item) => (
          <DataList.Item
            key={item.label}
            px={'xs'}
            style={{ justifyContent: 'space-between' }}
          >
            <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
            <DataList.ItemValue>{item.value}</DataList.ItemValue>
          </DataList.Item>
        ))}
      </DataList>
      <Divider my={'xs'} />
      <Group justify={'flex-end'}>
        <CopyButton value={`${window.location.origin}/join-server/${session.id}`}>
          {({ copied, copy }) => (
            <Button onClick={copy} color={copied ? 'teal' : 'gray'} variant={'outline'}>
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
          )}
        </CopyButton>
        {}
        {isConnectedToSession ? (
          <Button onClick={disconnect}>Leave Session</Button>
        ) : (
          <Button onClick={open} disabled={!canJoinSession}>
            Join Session
          </Button>
        )}
      </Group>
    </>
  );
}
