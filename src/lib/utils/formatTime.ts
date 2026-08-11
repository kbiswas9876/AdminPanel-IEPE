/**
 * Time Formatting Utilities
 * Standardizes all time displays to a clear, unambiguous format
 */

/**
 * Formats total seconds into a human-readable format (e.g., "1m 30s" or "90s")
 * This format is clearer than MM:SS which can be confused with HH:MM
 * @param totalSeconds - Total number of seconds (can be null, undefined, or NaN)
 * @returns Formatted string (e.g., "1m 30s" for 90 seconds, "5m 30s" for 330 seconds, "45s" for 45 seconds)
 * 
 * @example
 * formatSecondsToHumanReadable(90) // "1m 30s"
 * formatSecondsToHumanReadable(45) // "45s"
 * formatSecondsToHumanReadable(3665) // "1h 1m 5s"
 * formatSecondsToHumanReadable(0) // "0s"
 * formatSecondsToHumanReadable(null) // "0s"
 */
export function formatSecondsToHumanReadable(totalSeconds: number | null | undefined): string {
  // Handle invalid inputs
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds) || totalSeconds < 0) {
    return '0s'
  }

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.round(totalSeconds % 60)

  const parts: string[] = []

  if (hours > 0) {
    parts.push(`${hours}h`)
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`)
  }

  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}s`)
  }

  return parts.join(' ')
}

/**
 * Formats total seconds into MM:SS format (for backward compatibility)
 * @deprecated Use formatSecondsToHumanReadable instead for clearer formatting
 * @param totalSeconds - Total number of seconds (can be null, undefined, or NaN)
 * @returns Formatted string in MM:SS format (e.g., "05:30" for 330 seconds)
 */
export function formatSecondsToMMSS(totalSeconds: number | null | undefined): string {
  // Handle invalid inputs
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds) || totalSeconds < 0) {
    return '00:00'
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)

  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(seconds).padStart(2, '0')

  return `${formattedMinutes}:${formattedSeconds}`
}

/**
 * Formats total seconds into a human-readable format with hours if needed
 * For longer durations, use HH:MM:SS format
 * @param totalSeconds - Total number of seconds
 * @returns Formatted string (e.g., "01:30:00" for 5400 seconds, "05:30" for 330 seconds)
 */
export function formatSecondsToHHMMSS(totalSeconds: number | null | undefined): string {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds) || totalSeconds < 0) {
    return '00:00:00'
  }

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  if (hours > 0) {
    const formattedHours = String(hours).padStart(2, '0')
    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(seconds).padStart(2, '0')
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
  }

  // For durations less than 1 hour, use MM:SS format
  return formatSecondsToMMSS(totalSeconds)
}

