import { useState } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  NumberInput,
  Text,
  TextInput
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useIsConnectionStatus } from '@/hooks/util';
import { SettingsIcon } from '@/icons/icons';
import { closeConnection, reconnect } from '@/redux/connection/connectionMiddleware';
import { startConnection } from '@/redux/connection/connectionSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { ConnectionStatus } from '@/types/enums';

export function OpenSpaceConnection() {
  const { connectionStatus, address, port } = useAppSelector((state) => state.connection);
  const isConnected = useIsConnectionStatus(ConnectionStatus.Connected);
  const isConnecting = useIsConnectionStatus(ConnectionStatus.Connecting);
  const [address_, setAddress_] = useState(address);
  const [port_, setPort_] = useState<string | number>(port);
  const [opened, { open, close }] = useDisclosure();

  const dispatch = useAppDispatch();

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
      <Text fw={700}>OpenSpace: {connectionStatus}</Text>
      <Group gap={'xs'} align={'center'}>
        <Button
          onClick={() => (isConnected ? disconnect() : connect())}
          variant="outline"
        >
          {isConnected ? 'Disconnect' : isConnecting ? 'Connecting...' : 'Connect'}
        </Button>
        <ActionIcon onClick={openSettings} aria-label={'Open connection settings'}>
          <SettingsIcon />
        </ActionIcon>
      </Group>
      <Modal
        opened={opened}
        onClose={close}
        title={'Connection Settings'}
        closeButtonProps={{ 'aria-label': 'Close settings' }}
      >
        <TextInput
          label={'Address'}
          placeholder={'Set address, for example "localhost"'}
          {...(address_.length === 0 ? { error: 'Invalid address' } : undefined)}
          value={address_}
          onChange={(event) => setAddress_(event.currentTarget.value)}
        />
        <NumberInput
          label={'Port'}
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
