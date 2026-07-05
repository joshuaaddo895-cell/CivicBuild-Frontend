/**
 * Formats a full name from first and last name parts.
 */
export const formatFullName = (firstName: string, lastName: string): string => {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
};

/**
 * Truncates a string to a maximum length, appending ellipsis if needed.
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

/**
 * Formats a number with K/M suffixes for compact display.
 */
export const formatCount = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
};

/**
 * Checks if a value is a non-empty string.
 */
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};
