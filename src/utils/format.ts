export function formatDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Returns the viewer's local timezone as a UTC offset label, e.g. 'UTC+02:00'.
 * Session timestamps are stored as UTC epoch milliseconds and users are
 * distributed worldwide, so times are displayed in the viewer's local timezone
 * with the offset stated explicitly.
 */
export function getTimeZoneLabel(date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZoneName: 'shortOffset'
    }).formatToParts(date);
    const timeZone = parts.find((part) => part.type === 'timeZoneName');
    if (timeZone?.value) {
      return timeZone.value;
    }
  } catch {
    // Older browsers lack 'shortOffset' support, fall back to manual computation
  }
  const pad = (value: number): string => String(value).padStart(2, '0');

  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  return `UTC${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`;
}

/**
 * Formatters using the viewer's default locale, so each user sees dates in
 * the format their locale expects (e.g. '11/02/2026, 06:00 PM' in en-US,
 * '2026-11-02 18:00' in sv-SE).
 */
const baseDateTimeOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
};

function createDateTimeFormatter(withTimeZone: boolean): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat(
      undefined,
      withTimeZone
        ? { ...baseDateTimeOptions, timeZoneName: 'shortOffset' }
        : baseDateTimeOptions
    );
  } catch {
    // Older browsers don't support 'shortOffset'
    return new Intl.DateTimeFormat(undefined, baseDateTimeOptions);
  }
}

const dateTimeFormatter = createDateTimeFormatter(true);
const dateTimeValueFormatter = createDateTimeFormatter(false);

/** Formats an epoch millisecond timestamp in the viewer's locale, e.g. '2026-11-02 18:00'. */
export function formatDateTimeValue(epochMs: number): string {
  return dateTimeValueFormatter.format(new Date(epochMs));
}

/**
 * Formats an epoch millisecond timestamp in the viewer's locale with an
 * explicit UTC offset, e.g. '2026-11-02 18:00 UTC+01:00'.
 */
export function formatDateTime(epochMs: number): string {
  return dateTimeFormatter.format(new Date(epochMs));
}

/**
 * Formats a session's optional schedule for display, e.g.
 * 'Scheduled: 2026-11-02 18:00 - 2026-11-02 20:00 (UTC+01:00)'.
 * Returns null when the session has no scheduled times.
 */
export function formatSchedule(startDate?: number, endDate?: number): string | null {
  if (startDate && endDate) {
    return `Scheduled: ${formatDateTimeValue(startDate)} - ${formatDateTimeValue(endDate)} (${getTimeZoneLabel(new Date(startDate))})`;
  }
  if (startDate) {
    return `Starts: ${formatDateTime(startDate)}`;
  }
  if (endDate) {
    return `Ends: ${formatDateTime(endDate)}`;
  }
  return null;
}
