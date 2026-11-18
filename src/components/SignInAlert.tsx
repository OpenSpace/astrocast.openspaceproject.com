import { Alert, Stack, Text } from '@mantine/core';

import { AccessDeniedIcon } from '@/icons/icons';

import { LoginButton } from './LoginButton';

export function SignInAlert() {
  return (
    <Alert
      color={'red'}
      variant="outline"
      title={'Sign in required'}
      icon={<AccessDeniedIcon />}
      mt={'md'}
    >
      <Stack align="flex-start" gap={'xs'}>
        <Text>You need to sign in to view your sessions.</Text>
        <LoginButton />
      </Stack>
    </Alert>
  );
}
