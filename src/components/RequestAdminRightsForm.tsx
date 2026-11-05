import { Button, Group, Paper, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import { useRequestAdminRightsMutation } from '@/redux/api/wormholeApiSlice';
import { showApiErrorNotification } from '@/utils/notifications';
import { validateText } from '@/utils/validate';

export function RequestAdminRightsForm() {
  const [requestAdminRights, { isLoading }] = useRequestAdminRightsMutation();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      uid: '',
      secret: ''
    },
    validate: {
      uid: (value) =>
        validateText(value, {
          required: true,
          maxLength: 128,
          requiredMessage: 'User ID is required'
        }),
      secret: (value) =>
        validateText(value, {
          required: true,
          maxLength: 128,
          requiredMessage: 'Secret is required'
        })
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
    } catch (error) {
      showApiErrorNotification('Failed to grant admin rights', error);
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
              maxLength={128}
              key={form.key('uid')}
              {...form.getInputProps('uid')}
            />
            <TextInput
              withAsterisk
              label={'Secret'}
              maxLength={128}
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
