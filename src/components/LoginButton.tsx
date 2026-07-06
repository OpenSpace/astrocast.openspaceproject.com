import { Button, Modal, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import type { ProviderKey } from '@/firebase/types';
import { providerIcon, supportedProviders } from '@/firebase/utils';
import { signInWithProvider } from '@/redux/auth/authMiddleware';
import { useAppDispatch } from '@/redux/hooks';

export function LoginButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const dispatch = useAppDispatch();

  async function handleSignIn(providerKey: ProviderKey) {
    notifications.show({
      title: 'Signing in',
      message: 'Redirecting to provider...'
    });
    try {
      await dispatch(signInWithProvider(providerKey)).unwrap();
    } catch (error) {
      notifications.show({
        title: 'Sign-in error',
        message: (error as Error).message,
        color: 'red',
        autoClose: false
      });
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={close} title="Sign in">
        <Stack>
          {supportedProviders.map((provider) => {
            const name = provider.replace('.com', '');
            const formattedName = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
            return (
              <Button
                key={provider}
                onClick={() => handleSignIn(provider)}
                leftSection={providerIcon(provider)}
              >{`Continue with ${formattedName}`}</Button>
            );
          })}
        </Stack>
      </Modal>
      <Button onClick={open}>Sign in</Button>
    </>
  );
}
