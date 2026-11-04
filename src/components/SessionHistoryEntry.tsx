import { Accordion, Group } from '@mantine/core';

import { UsageChart } from '@/components/UsageChart';
import { useSessionOwnerName } from '@/hooks/useSessionOwnerName';
import type { DetailItem, SessionHistoryData, Statistics } from '@/types/types';
import { formatDateTime, formatDuration } from '@/utils/format';

import { AccordionHeaderRow } from './AccordionHeaderRow';
import { DetailsList } from './DetailsList';
import { DownloadSessionButton } from './DownloadSessionButton';
import { RemoveSessionHistoryButton } from './RemoveSessionHistoryButton';

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
              value: formatDateTime(session.created),
              span: 2
            },
            {
              label: 'Last Used',
              value: formatDateTime(session.inactiveTimestamp),
              span: 2
            }
          ]}
        />
      </Accordion.Control>
      <Accordion.Panel>
        <DetailsList items={details} />
        {statistics && <UsageChart statistics={statistics} />}
        <Group mt={'xs'} gap={'xs'}>
          <DownloadSessionButton sessionId={session.id} />
          <RemoveSessionHistoryButton
            sessionId={session.id}
            roomName={session.roomName}
          />
        </Group>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
