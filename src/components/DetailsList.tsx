import { DataList } from '@mantine/core';

import type { DetailItem } from '@/types/types';

interface Props {
  items: DetailItem[];
}

export function DetailsList({ items }: Props) {
  return (
    <DataList withDivider>
      {items.map((item) => (
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
  );
}
