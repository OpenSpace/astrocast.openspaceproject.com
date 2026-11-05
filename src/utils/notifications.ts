import { notifications } from '@mantine/notifications';

interface ApiError {
  status?: number;
  data?: { error?: string };
  message?: string;
}

/**
 * Shows a red notification for a failed API request. The title is prefixed
 * with the HTTP status code when one is available, and the message prefers
 * the server-provided error, falling back to the error's own message.
 */
export function showApiErrorNotification(title: string, error: unknown): void {
  const apiError = error as ApiError;
  const codeMessage = apiError?.status ? `Error ${apiError.status} - ` : '';
  notifications.show({
    title: `${codeMessage}${title}`,
    message: apiError?.data?.error ?? apiError?.message,
    color: 'red'
  });
}
