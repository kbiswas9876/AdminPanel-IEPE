/**
 * Timezone utilities for consistent date/time handling across the application
 * 
 * Golden Rule: Store everything in UTC, convert to local time only for display
 */

/**
 * Convert a Date object to UTC ISO string for storage
 * @param dateObject - Date object in user's local timezone
 * @returns UTC ISO string ready for database storage
 */
export function toUTCISOString(dateObject: Date): string {
  if (!dateObject || isNaN(dateObject.getTime())) {
    throw new Error('Invalid date object provided')
  }
  return dateObject.toISOString()
}

/**
 * Convert a UTC ISO string from database to Date object for react-datepicker
 * @param utcISOString - UTC ISO string from database
 * @returns Date object in user's local timezone
 */
export function fromUTCISOString(utcISOString: string): Date {
  if (!utcISOString) {
    return new Date()
  }
  const parsed = new Date(utcISOString)
  if (isNaN(parsed.getTime())) {
    console.warn('Invalid UTC string provided:', utcISOString)
    return new Date()
  }
  return parsed
}

/**
 * Get current time in user's local timezone for default values
 * @param hoursFromNow - Hours to add to current time (default: 1)
 * @returns Date object in user's local timezone
 */
export function getDefaultTime(hoursFromNow: number = 1): Date {
  const now = new Date()
  return new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000)
}

/**
 * Format a date for display in user's local timezone
 * @param utcISOString - UTC ISO string from database
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string in user's local timezone
 */
export function formatForDisplay(utcISOString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = fromUTCISOString(utcISOString)
  return date.toLocaleString(undefined, {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...options
  })
}

/**
 * Validate that a date is in the future
 * @param date - Date to validate
 * @returns true if date is in the future
 */
export function isFutureDate(date: Date): boolean {
  return date > new Date()
}

/**
 * Validate that end date is after start date
 * @param startDate - Start date
 * @param endDate - End date
 * @returns true if end date is after start date
 */
export function isEndDateAfterStart(startDate: Date, endDate: Date): boolean {
  return endDate > startDate
}
