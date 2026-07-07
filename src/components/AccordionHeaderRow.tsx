import type { ReactNode } from 'react';
import { Grid, Stack, Text } from '@mantine/core';

interface HeaderField {
  label: string;
  value: ReactNode;
  span: number;
}

interface Props {
  fields: HeaderField[];
}

export function AccordionHeaderRow({ fields }: Props) {
  return (
    <Grid grow>
      {fields.map((field) => (
        <Grid.Col key={field.label} span={field.span}>
          <Stack gap={0}>
            <Text size={'sm'} fw={700} c={'dark.0'}>
              {field.label}
            </Text>
            <Text size={'sm'} c={'dark.1'}>
              {field.value}
            </Text>
          </Stack>
        </Grid.Col>
      ))}
    </Grid>
  );
}
