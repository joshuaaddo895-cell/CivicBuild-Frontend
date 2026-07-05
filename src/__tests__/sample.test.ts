import { formatCount, formatFullName, isNonEmptyString, truncate } from '../utils/formatters';

describe('formatFullName', () => {
  it('joins first and last name with a space', () => {
    expect(formatFullName('John', 'Doe')).toBe('John Doe');
  });

  it('trims leading/trailing whitespace from each part', () => {
    expect(formatFullName('  Jane ', ' Smith ')).toBe('Jane Smith');
  });

  it('handles single-word names gracefully', () => {
    expect(formatFullName('Madonna', '')).toBe('Madonna');
  });
});

describe('truncate', () => {
  it('returns the original string when under maxLength', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('returns the original string when exactly at maxLength', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });

  it('truncates and appends ellipsis when over maxLength', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
  });
});

describe('formatCount', () => {
  it('returns plain numbers below 1000', () => {
    expect(formatCount(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatCount(1500)).toBe('1.5K');
  });

  it('formats millions with M suffix', () => {
    expect(formatCount(2_500_000)).toBe('2.5M');
  });
});

describe('isNonEmptyString', () => {
  it('returns true for a non-empty string', () => {
    expect(isNonEmptyString('hello')).toBe(true);
  });

  it('returns false for an empty string', () => {
    expect(isNonEmptyString('')).toBe(false);
  });

  it('returns false for a whitespace-only string', () => {
    expect(isNonEmptyString('   ')).toBe(false);
  });

  it('returns false for non-string values', () => {
    expect(isNonEmptyString(42)).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
  });
});
