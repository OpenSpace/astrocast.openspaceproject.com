import { Avatar, Button, Group } from '@mantine/core';
import { signOut } from 'firebase/auth';

import { auth } from '@/firebase/config';
import { useAppSelector } from '@/redux/hooks';

import { LoginButton } from './LoginButton';

export function Profile() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <>
      {user ? (
        <Group>
          <Avatar
            src={user?.photoURL}
            name={user.displayName || ''}
            color={'initials'}
            alt={`Profile picture of ${user.displayName || 'user'}`}
            size={'lg'}
          />
          <Button onClick={async () => await signOut(auth)}>Sign out</Button>
        </Group>
      ) : (
        <LoginButton />
      )}
    </>
  );
}
