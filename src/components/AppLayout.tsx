import { Link, Outlet } from 'react-router';
import { AppShell, Burger, Group, Image, NavLink, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { AdminIcon, HomeIcon } from '@/icons/icons';

import { Profile } from './Profile';

export function AppLayout() {
  const [opened, { toggle }] = useDisclosure();
  return (
    <AppShell
      padding="xs"
      header={{ height: 80 }}
      navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: !opened } }}
    >
      <AppShell.Header>
        <Group h={'100%'} justify={'space-between'} px={'xs'}>
          <Link to={'/'} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group gap={'xs'}>
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size={'sm'} />
              <Image
                src={`images/icon.png`}
                alt={'OpenSpace logo'}
                height={40}
                w={'auto'}
                fit={'contain'}
                display={'inline-block'}
              />
              <Title order={1}>Astrocast</Title>
            </Group>
          </Link>
          <Profile />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <NavLink component={Link} to={'/'} label={'Home'} leftSection={<HomeIcon />} />
        <NavLink
          component={Link}
          to={'/admin'}
          label={'Admin'}
          leftSection={<AdminIcon />}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
