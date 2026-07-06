import { Button, Checkbox, Group, Paper, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import { useCreateSessionMutation } from '@/redux/api/wormholeApiSlice';

export function RequestNewSessionForm() {
  const [createSession, { isLoading }] = useCreateSessionMutation();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      sessionName: '',
      profileName: '',
      password: '',
      hostPassword: '',
      isPrivate: false
    },
    validate: {
      sessionName: (value) =>
        value.trim().length > 0 ? null : 'Session name is required',
      profileName: (value) =>
        value.trim().length > 0 ? null : 'Profile name is required',
      hostPassword: (value) =>
        value.trim().length > 0 ? null : 'Host password is required'
    }
  });

  async function handleSubmit(values: typeof form.values) {
    try {
      const session = await createSession({
        roomName: values.sessionName.trim(),
        profile: values.profileName.trim(),
        isPrivate: values.isPrivate,
        password: values.password.trim() || undefined,
        hostPassword: values.hostPassword.trim()
      }).unwrap();
      notifications.show({
        title: 'Session Created',
        message: `Session '${session.roomName}' created successfully!`,
        color: 'green'
      });
      form.reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const code = error?.status || '';
      const codeMessage = code ? `Error ${code} - ` : '';
      const title = `${codeMessage}Failed to Create Session`;
      notifications.show({
        title: title,
        message: error.data?.error,
        color: 'red'
      });
    }
  }

  return (
    <Paper mt={'md'} p={'xs'} withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Title order={2}>Create a new session</Title>
        <Stack>
          <Group grow align="flex-start">
            <TextInput
              withAsterisk
              label={'Session name'}
              key={form.key('sessionName')}
              {...form.getInputProps('sessionName')}
            />
            <TextInput
              label={'Password'}
              key={form.key('password')}
              {...form.getInputProps('password')}
            />
          </Group>
          <Group grow align="flex-start">
            <TextInput
              withAsterisk
              label={'Profile name'}
              key={form.key('profileName')}
              {...form.getInputProps('profileName')}
            />
            <TextInput
              withAsterisk
              label={'Host password'}
              key={form.key('hostPassword')}
              {...form.getInputProps('hostPassword')}
            />
          </Group>

          <Group grow justify="space-between" align="flex-start">
            <Checkbox
              label={'Make private'}
              description={
                'Hide the session from the public list, the session will only be accessible to others via the session link.'
              }
              key={form.key('isPrivate')}
              {...form.getInputProps('isPrivate', { type: 'checkbox' })}
            />
            <Group justify={'flex-end'}>
              <Button type={'submit'} loading={isLoading}>
                Create Session
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
