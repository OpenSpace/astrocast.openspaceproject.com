import { useEffect, useState } from 'react';
import { Accordion, Divider, Group, Stack } from '@mantine/core';

import { RemoveSessionButton } from '@/components/RemoveSessionButton';
import { UsageChart } from '@/components/UsageChart';
import { useGetHostPassword } from '@/hooks/useGetHostPassword';
import { useSessionOwnerName } from '@/hooks/useSessionOwnerName';
import type { DetailItem, SessionData, Statistics } from '@/types/types';
import { formatDuration } from '@/utils/format';

import { AccordionHeaderRow } from './AccordionHeaderRow';
import { DetailsList } from './DetailsList';

interface Props {
  session: SessionData;
  statistics?: Statistics;
}

export function SessionStatusEntry({ session, statistics }: Props) {
  const ownerName = useSessionOwnerName(session.owner);
  const { hostPassword } = useGetHostPassword(session);
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, []);

  const details: DetailItem[] = [
    { label: 'ID', value: session.id },
    { label: 'Owner', value: ownerName },
    { label: 'Created', value: new Date(session.created).toLocaleString() },
    {
      label: 'Inactive Since',
      value: new Date(session.inactiveTimestamp).toLocaleString()
    },
    {
      label: 'Uptime',
      value: formatDuration(time.valueOf() - session.created)
    },
    { label: 'Address', value: import.meta.env.VITE_WORMHOLE_ADDRESS },
    { label: 'Port', value: import.meta.env.VITE_WORMHOLE_PORT },
    { label: 'Access', value: session.isPrivate ? 'Private' : 'Public' },
    { label: 'Password', value: session.password || 'N/A' },
    { label: 'Profile', value: session.profile },
    { label: 'Total Usage', value: session.usage }
  ];

  if (session.active) {
    details.push({ label: '# Peers', value: session.nPeers });
    details.push({
      label: 'Host',
      value: session.currentHost !== '' ? session.currentHost : 'No host'
    });
  }

  if (hostPassword) {
    details.push({ label: 'Host Password', value: hostPassword });
  }

  return (
    <Accordion.Item value={session.id}>
      <Accordion.Control>
        <AccordionHeaderRow
          fields={[
            { label: 'Session Name', value: session.roomName, span: 3 },
            { label: 'Owner', value: ownerName, span: 2 },
            {
              label: 'Created',
              value: new Date(session.created).toLocaleString(),
              span: 2
            },
            { label: 'Status', value: session.active ? 'Active' : 'Inactive', span: 1 }
          ]}
        />
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap={'xs'}>
          <DetailsList items={details} />
          {statistics && <UsageChart statistics={statistics} />}
          <Divider my={'xs'} />
          <Group justify={'flex-end'}>
            <RemoveSessionButton sessionId={session.id} roomName={session.roomName} />
          </Group>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
