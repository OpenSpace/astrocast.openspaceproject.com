import { Button, Group, Paper, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import { useRequestAdminRightsMutation } from '@/redux/api/wormholeApiSlice';

export function RequestAdminRightsForm() {
  const [requestAdminRights, { isLoading }] = useRequestAdminRightsMutation();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      uid: '',
      secret: ''
    },
    validate: {
      uid: (value) => (value.trim().length > 0 ? null : 'User ID is required'),
      secret: (value) => (value.trim().length > 0 ? null : 'Secret is required')
    }
  });

  async function handleSubmit(values: typeof form.values) {
    try {
      const result = await requestAdminRights({
        uid: values.uid.trim(),
        secret: values.secret.trim()
      }).unwrap();
      notifications.show({
        title: 'Success',
        message: result.message,
        color: 'green'
      });
      form.reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const code = error?.status || '';
      const codeMessage = code ? `Error ${code} - ` : '';
      notifications.show({
        title: `${codeMessage}Failed to grant admin rights`,
        message: error.data?.error,
        color: 'red'
      });
    }
  }

  return (
    <Paper mt={'md'} p={'xs'} withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Title order={2}>Grant Admin Rights</Title>
        <Stack>
          <Group grow align={'flex-start'}>
            <TextInput
              withAsterisk
              label={'User ID'}
              key={form.key('uid')}
              {...form.getInputProps('uid')}
            />
            <TextInput
              withAsterisk
              label={'Secret'}
              key={form.key('secret')}
              {...form.getInputProps('secret')}
            />
          </Group>
          <Group justify={'flex-end'}>
            <Button type={'submit'} loading={isLoading}>
              Make User Admin
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
