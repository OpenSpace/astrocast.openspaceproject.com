import type { ReactNode } from 'react';
import { Stack, Text } from '@mantine/core';

export function HeaderPair({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <Stack gap={0}>
      <Text size={'sm'} fw={700} c={'dark.0'}>
        {label}
      </Text>
      <Text size={'sm'} c={'dark.1'}>
        {value}
      </Text>
    </Stack>
  );
}
