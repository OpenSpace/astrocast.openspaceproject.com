import {
  Button,
  Checkbox,
  Group,
  Paper,
  Stack,
  Textarea,
  TextInput,
  Title
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import { useCreateSessionMutation } from '@/redux/api/wormholeApiSlice';
import { showApiErrorNotification } from '@/utils/notifications';
import { validateText } from '@/utils/validate';

// DateTimePicker values are 'YYYY-MM-DD HH:mm:ss' strings, parsed as local time.
function toEpochMs(value: string): number {
  return new Date(value.replace(' ', 'T')).getTime();
}

type NewSessionFormValues = {
  sessionName: string;
  profileName: string;
  password: string;
  hostPassword: string;
  isPrivate: boolean;
  description: string;
  version: string;
  keepAlive: boolean;
  startDate: string | null;
  endDate: string | null;
};

export function RequestNewSessionForm() {
  const [createSession, { isLoading }] = useCreateSessionMutation();

  const form = useForm<NewSessionFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      sessionName: '',
      profileName: '',
      password: '',
      hostPassword: '',
      isPrivate: false,
      description: '',
      version: '',
      keepAlive: false,
      startDate: null,
      endDate: null
    },
    validate: {
      sessionName: (value) =>
        validateText(value, {
          required: true,
          maxLength: 100,
          requiredMessage: 'Session name is required'
        }),
      profileName: (value) =>
        validateText(value, {
          required: true,
          maxLength: 100,
          requiredMessage: 'Profile name is required'
        }),
      password: (value) => validateText(value, { maxLength: 100 }),
      hostPassword: (value) =>
        validateText(value, {
          required: true,
          maxLength: 100,
          requiredMessage: 'Host password is required'
        }),
      description: (value) => validateText(value, { maxLength: 500, multiline: true }),
      version: (value) => validateText(value, { maxLength: 50 }),
      startDate: (value, formValues) => {
        if (!value || !formValues.endDate) {
          return null;
        }
        return toEpochMs(value) < toEpochMs(formValues.endDate)
          ? null
          : 'Start date must be before end date';
      },
      endDate: (value, formValues) => {
        if (!value || !formValues.startDate) {
          return null;
        }
        return toEpochMs(value) > toEpochMs(formValues.startDate)
          ? null
          : 'End date must be after start date';
      }
    }
  });

  async function handleSubmit(values: typeof form.values) {
    try {
      const session = await createSession({
        roomName: values.sessionName.trim(),
        profile: values.profileName.trim(),
        isPrivate: values.isPrivate,
        password: values.password.trim(),
        hostPassword: values.hostPassword.trim(),
        description: values.description.trim() || undefined,
        version: values.version.trim() || undefined,
        keepAlive: values.keepAlive || undefined,
        startDate: values.startDate ? toEpochMs(values.startDate) : undefined,
        endDate: values.endDate ? toEpochMs(values.endDate) : undefined
      }).unwrap();
      notifications.show({
        title: 'Session Created',
        message: `Session '${session.roomName}' created successfully!`,
        color: 'green'
      });
      form.reset();
    } catch (error) {
      showApiErrorNotification('Failed to Create Session', error);
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
              maxLength={100}
              key={form.key('sessionName')}
              {...form.getInputProps('sessionName')}
            />
            <TextInput
              withAsterisk
              label={'Profile name'}
              maxLength={100}
              key={form.key('profileName')}
              {...form.getInputProps('profileName')}
            />
          </Group>
          <Group grow align="flex-start">
            <TextInput
              label={'Password'}
              maxLength={100}
              key={form.key('password')}
              {...form.getInputProps('password')}
            />
            <TextInput
              withAsterisk
              label={'Host password'}
              maxLength={100}
              key={form.key('hostPassword')}
              {...form.getInputProps('hostPassword')}
            />
          </Group>
          <Textarea
            label={'Description'}
            placeholder={'Optional description of the session'}
            description={
              'Shown on the session card, for example what the session is about.'
            }
            maxLength={500}
            autosize
            minRows={2}
            key={form.key('description')}
            {...form.getInputProps('description')}
          />
          <Group grow align="flex-start">
            <DateTimePicker
              label={'Start date/time'}
              description={'Optional start of the planned session.'}
              key={form.key('startDate')}
              {...form.getInputProps('startDate')}
            />
            <DateTimePicker
              label={'End date/time'}
              description={'Optional end of the planned session.'}
              key={form.key('endDate')}
              {...form.getInputProps('endDate')}
            />
          </Group>
          <TextInput
            label={'OpenSpace version'}
            placeholder={'e.g. 1.0 or master'}
            description={'The OpenSpace version this session targets.'}
            maxLength={50}
            key={form.key('version')}
            {...form.getInputProps('version')}
            maw={
              'calc(50% - (var(--mantine-spacing-md) - var(--mantine-spacing-md) / 2))'
            }
          />

          <Group grow justify="space-between" align="flex-start">
            <Checkbox
              label={'Make private'}
              description={
                'Hide the session from the public list, the session will only be accessible to others via the session link.'
              }
              key={form.key('isPrivate')}
              {...form.getInputProps('isPrivate', { type: 'checkbox' })}
            />
            <Checkbox
              label={'Keep session'}
              description={
                'The session will not be removed automatically after 30 minutes of inactivity. It persists until closed or removed by an admin.'
              }
              key={form.key('keepAlive')}
              {...form.getInputProps('keepAlive', { type: 'checkbox' })}
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
