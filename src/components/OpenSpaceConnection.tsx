import { useState } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  NumberInput,
  Text,
  TextInput,
  Tooltip
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useIsConnectionStatus } from '@/hooks/util';
import { SettingsIcon } from '@/icons/icons';
import { closeConnection, reconnect } from '@/redux/connection/connectionMiddleware';
import { startConnection } from '@/redux/connection/connectionSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { ConnectionStatus, IconSize } from '@/types/enums';

export function OpenSpaceConnection() {
  const { connectionStatus, address, port } = useAppSelector((state) => state.connection);
  const isConnected = useIsConnectionStatus(ConnectionStatus.Connected);
  const isConnecting = useIsConnectionStatus(ConnectionStatus.Connecting);
  const [address_, setAddress_] = useState(address);
  const [port_, setPort_] = useState<string | number>(port);
  const [opened, { open, close }] = useDisclosure();

  const dispatch = useAppDispatch();

  const statusColor = isConnected ? 'green' : isConnecting ? 'yellow' : 'red';

  function disconnect() {
    dispatch(closeConnection());
  }

  function connect() {
    dispatch(startConnection());
  }

  function updateIpAddress() {
    if (typeof port_ !== 'number') {
      return;
    }
    if (address_.trim().length === 0) {
      return;
    }

    dispatch(reconnect({ address: address_.trim(), port: port_ }));
    close();
  }

  function openSettings() {
    setAddress_(address);
    setPort_(port);
    open();
  }

  return (
    <>
      <Group
        justify="space-between"
        wrap="nowrap"
        bg={'dark.6'}
        p={'xs'}
        flex={1}
        miw={0}
        maw={700}
        style={{ borderRadius: 'var(--mantine-radius-md)' }}
      >
        <Group gap={'sm'} wrap="nowrap">
          <Text fw={700} visibleFrom="lg">
            OpenSpace:
          </Text>
          <span
            style={{
              display: 'inline-block',
              width: IconSize.xs,
              height: IconSize.xs,
              borderRadius: '50%',
              backgroundColor: `var(--mantine-color-${statusColor}-6)`
            }}
          />
          <Text fw={700} c={statusColor} visibleFrom="md">
            {connectionStatus}
          </Text>
        </Group>
        <Group gap={'xs'} align={'center'} wrap="nowrap">
          <Button
            onClick={() => (isConnected ? disconnect() : connect())}
            variant="outline"
            color={statusColor}
            disabled={isConnecting}
          >
            {isConnected ? 'Disconnect' : isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
          <Tooltip label={'Open connection settings'}>
            <ActionIcon onClick={openSettings} aria-label={'Open connection settings'}>
              <SettingsIcon />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Modal
        opened={opened}
        onClose={close}
        title={'Connection Settings'}
        closeButtonProps={{ 'aria-label': 'Close settings' }}
      >
        <TextInput
          label={'Address'}
          description={
            'The address of the running OpenSpace instance you want to connect to.'
          }
          placeholder={'Set address, for example "localhost"'}
          {...(address_.length === 0 ? { error: 'Invalid address' } : undefined)}
          value={address_}
          onChange={(event) => setAddress_(event.currentTarget.value)}
        />
        <NumberInput
          label={'Port'}
          description={
            'The port of the running OpenSpace instance you want to connect to.'
          }
          placeholder={'Set Port, for example 4682'}
          value={port_}
          onChange={setPort_}
        />
        <Button onClick={updateIpAddress} mt={'xs'}>
          Save
        </Button>
        <Modal.Body></Modal.Body>
      </Modal>
    </>
  );
}
