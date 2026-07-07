import { Accordion } from '@mantine/core';

import { UsageChart } from '@/components/UsageChart';
import { useSessionOwnerName } from '@/hooks/useSessionOwnerName';
import type { DetailItem, SessionHistoryData, Statistics } from '@/types/types';
import { formatDuration } from '@/utils/format';

import { AccordionHeaderRow } from './AccordionHeaderRow';
import { DetailsList } from './DetailsList';

interface Props {
  session: SessionHistoryData;
  statistics?: Statistics;
}

export function SessionHistoryEntry({ session, statistics }: Props) {
  const ownerName = useSessionOwnerName(session.owner);

  const details: DetailItem[] = [
    { label: 'ID', value: session.id },
    { label: 'Owner', value: ownerName },
    { label: 'Uptime', value: formatDuration(session.uptime) },
    { label: 'Total Usage', value: session.usage }
  ];

  return (
    <Accordion.Item value={session.id}>
      <Accordion.Control>
        <AccordionHeaderRow
          fields={[
            { label: 'Session Name', value: session.roomName, span: 3 },
            {
              label: 'Created',
              value: new Date(session.created).toLocaleString(),
              span: 2
            },
            {
              label: 'Last Used',
              value: new Date(session.inactiveTimestamp).toLocaleString(),
              span: 2
            }
          ]}
        />
      </Accordion.Control>
      <Accordion.Panel>
        <DetailsList items={details} />
        {statistics && <UsageChart statistics={statistics} />}
      </Accordion.Panel>
    </Accordion.Item>
  );
}
