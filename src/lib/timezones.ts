export interface TimezoneOption {
  code: string;
  iana: string;
  label: string;
  offset: string;
}

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { code: 'IST', iana: 'Asia/Kolkata', label: 'IST - India Standard Time (UTC+5:30)', offset: '+05:30' },
  { code: 'EST', iana: 'America/New_York', label: 'EST / EDT - US Eastern Time (UTC-5 / UTC-4)', offset: '-05:00' },
  { code: 'PST', iana: 'America/Los_Angeles', label: 'PST / PDT - US Pacific Time (UTC-8 / UTC-7)', offset: '-08:00' },
  { code: 'CST', iana: 'America/Chicago', label: 'CST / CDT - US Central Time (UTC-6 / UTC-5)', offset: '-06:00' },
  { code: 'MST', iana: 'America/Denver', label: 'MST / MDT - US Mountain Time (UTC-7 / UTC-6)', offset: '-07:00' },
  { code: 'GMT', iana: 'UTC', label: 'GMT / UTC - Greenwich Mean Time (UTC+0)', offset: '+00:00' },
  { code: 'BST', iana: 'Europe/London', label: 'UK / London Time (UTC+0 / UTC+1)', offset: '+00:00' },
  { code: 'CET', iana: 'Europe/Paris', label: 'CET - Central European Time (UTC+1 / UTC+2)', offset: '+01:00' },
  { code: 'GST', iana: 'Asia/Dubai', label: 'GST - Gulf Standard Time (Dubai, UAE) (UTC+4)', offset: '+04:00' },
  { code: 'PKT', iana: 'Asia/Karachi', label: 'PKT - Pakistan Standard Time (UTC+5)', offset: '+05:00' },
  { code: 'BST', iana: 'Asia/Dhaka', label: 'BST - Bangladesh Standard Time (UTC+6)', offset: '+06:00' },
  { code: 'SGT', iana: 'Asia/Singapore', label: 'SGT - Singapore / Malaysia Time (UTC+8)', offset: '+08:00' },
  { code: 'JST', iana: 'Asia/Tokyo', label: 'JST - Japan Standard Time (UTC+9)', offset: '+09:00' },
  { code: 'AEST', iana: 'Australia/Sydney', label: 'AEST - Australian Eastern Time (UTC+10)', offset: '+10:00' },
  { code: 'NZST', iana: 'Pacific/Auckland', label: 'NZST - New Zealand Standard Time (UTC+12)', offset: '+12:00' },
  { code: 'BRT', iana: 'America/Sao_Paulo', label: 'BRT - Brasilia Time (UTC-3)', offset: '-03:00' },
];

export function getUserBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (e) {
    return 'UTC';
  }
}

/**
 * Format timestamp into formatted date/time string in the seller's timezone
 */
export function formatDateInTimezone(
  dateInput: Date | number | string,
  timezone?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const targetTz = timezone || getUserBrowserTimezone();
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: targetTz,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };

  try {
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
  } catch (e) {
    // Fallback if timezone is invalid
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  }
}

/**
 * Returns short date e.g. "Aug 10, 2026" in target timezone
 */
export function formatLocalDate(dateInput: Date | number | string, timezone?: string): string {
  return formatDateInTimezone(dateInput, timezone, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Returns short time e.g. "06:45 PM" in target timezone
 */
export function formatLocalTime(dateInput: Date | number | string, timezone?: string): string {
  return formatDateInTimezone(dateInput, timezone, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Returns full timestamp with timezone label e.g., "10 Aug 2026, 06:45 PM (IST)"
 */
export function formatOrderTimestamp(createdAtMs: number, timezone?: string): string {
  const targetTz = timezone || getUserBrowserTimezone();
  const tzOption = COMMON_TIMEZONES.find(t => t.iana === targetTz);
  const tzCode = tzOption ? tzOption.code : targetTz.split('/')[1] || targetTz;

  const dateStr = formatDateInTimezone(createdAtMs, targetTz, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${dateStr} (${tzCode})`;
}

/**
 * Get current time in the given timezone as formatted string
 */
export function getCurrentTimeInTimezone(timezone?: string): string {
  const targetTz = timezone || getUserBrowserTimezone();
  const tzOption = COMMON_TIMEZONES.find(t => t.iana === targetTz);
  const tzLabel = tzOption ? `${tzOption.code}` : targetTz;

  const formatted = formatDateInTimezone(new Date(), targetTz, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${formatted} ${tzLabel}`;
}

/**
 * Get YYYY-MM-DD string for a timestamp evaluated in seller local timezone
 */
export function getLocalDateKey(dateInput: Date | number | string, timezone?: string): string {
  const targetTz = timezone || getUserBrowserTimezone();
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: targetTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);

    const year = parts.find(p => p.type === 'year')?.value || '2026';
    const month = parts.find(p => p.type === 'month')?.value || '01';
    const day = parts.find(p => p.type === 'day')?.value || '01';

    return `${year}-${month}-${day}`;
  } catch (e) {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Check if timestamp belongs to today in seller local timezone
 */
export function isTodayInTimezone(dateInput: Date | number | string, timezone?: string): boolean {
  const targetTz = timezone || getUserBrowserTimezone();
  const todayKey = getLocalDateKey(new Date(), targetTz);
  const itemKey = getLocalDateKey(dateInput, targetTz);
  return todayKey === itemKey;
}

/**
 * Check if timestamp belongs to this month in seller local timezone
 */
export function isThisMonthInTimezone(dateInput: Date | number | string, timezone?: string): boolean {
  const targetTz = timezone || getUserBrowserTimezone();
  const todayKey = getLocalDateKey(new Date(), targetTz); // YYYY-MM-DD
  const itemKey = getLocalDateKey(dateInput, targetTz);
  return todayKey.substring(0, 7) === itemKey.substring(0, 7);
}
