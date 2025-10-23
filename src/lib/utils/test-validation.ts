/**
 * Test Validation Utilities
 * 
 * Provides comprehensive validation for test metadata
 * to ensure data integrity before database operations.
 */

import type { Test } from '@/lib/supabase/admin'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validates test metadata for creation or update
 */
export function validateTestMetadata(testData: Partial<Test>): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required field validation
  if (!testData.name?.trim()) {
    errors.push("Test name is required")
  }

  if (!testData.total_time_minutes || testData.total_time_minutes <= 0) {
    errors.push("Duration must be greater than 0")
  }

  if (testData.marks_per_correct === undefined || testData.marks_per_correct <= 0) {
    errors.push("Marks per correct answer must be greater than 0")
  }

  // Negative marking validation
  if (testData.negative_marks_per_incorrect !== undefined) {
    if (testData.negative_marks_per_incorrect > 0) {
      errors.push("Negative marks must be 0 or negative (e.g., -0.25, 0)")
    }
  }

  // Status and scheduling validation
  if (testData.status === 'scheduled') {
    if (!testData.start_time) {
      errors.push("Scheduled tests must have a start time")
    }

    if (testData.end_time && testData.start_time) {
      const start = new Date(testData.start_time)
      const end = new Date(testData.end_time)
      if (end <= start) {
        errors.push("End time must be after start time")
      }
    }
  }

  // Result policy validation
  if (testData.result_policy) {
    if (!['instant', 'scheduled', 'perpetual'].includes(testData.result_policy)) {
      errors.push("Invalid result policy. Must be 'instant', 'scheduled', or 'perpetual'")
    }

    if (testData.result_policy === 'scheduled' && !testData.result_release_at) {
      errors.push("Result release time is required for scheduled result policy")
    }

    if (testData.result_policy === 'scheduled' && testData.result_release_at && testData.end_time) {
      const releaseTime = new Date(testData.result_release_at)
      const endTime = new Date(testData.end_time)
      if (releaseTime <= endTime) {
        errors.push("Result release time must be after test end time")
      }
    }
  }

  // Warnings (don't block, just inform)
  if (testData.start_time) {
    const start = new Date(testData.start_time)
    if (start < new Date()) {
      warnings.push("Start time is in the past")
    }
  }

  if (testData.status === 'scheduled' && !testData.start_time && !testData.end_time) {
    warnings.push("This will be a perpetual test (always available)")
  }

  if (!testData.description || testData.description.trim() === '') {
    warnings.push("Consider adding a description to help students understand the test")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Converts positive negative marks input to negative value for database
 */
export function convertNegativeMarks(value: number): number {
  // If user entered positive value, convert to negative
  return value > 0 ? -value : value
}

/**
 * Converts database negative marks to positive for display
 */
export function displayNegativeMarks(value: number): number {
  return Math.abs(value)
}

/**
 * Validates a single field and returns error message
 */
export function validateField(fieldName: string, value: any, context?: any): string | null {
  switch (fieldName) {
    case 'name':
      if (!value || !value.trim()) return "Test name is required"
      return null

    case 'total_time_minutes':
      if (!value || value <= 0) return "Duration must be greater than 0"
      return null

    case 'marks_per_correct':
      if (value === undefined || value <= 0) return "Marks must be greater than 0"
      return null

    case 'negative_marks_per_incorrect':
      if (value !== undefined && value > 0) return "Negative marks must be 0 or negative"
      return null

    case 'start_time':
      if (context?.status === 'scheduled' && !value) return "Start time is required for scheduled tests"
      return null

    case 'end_time':
      if (context?.start_time && value) {
        const start = new Date(context.start_time)
        const end = new Date(value)
        if (end <= start) return "End time must be after start time"
      }
      return null

    case 'result_release_at':
      if (context?.result_policy === 'scheduled' && !value) {
        return "Result release time is required for scheduled policy"
      }
      if (value && context?.end_time) {
        const releaseTime = new Date(value)
        const endTime = new Date(context.end_time)
        if (releaseTime <= endTime) {
          return "Result release time must be after test end time"
        }
      }
      return null

    default:
      return null
  }
}

/**
 * Get user-friendly error messages
 */
export function getFieldErrorMessage(fieldName: string): string {
  const errorMessages: Record<string, string> = {
    name: "Please enter a test name",
    description: "Please enter a test description",
    total_time_minutes: "Please enter a valid duration",
    marks_per_correct: "Please enter valid marks for correct answers",
    negative_marks_per_incorrect: "Please enter valid negative marks (0 or negative value)",
    start_time: "Please select a start time",
    end_time: "Please select an end time",
    result_policy: "Please select a result policy",
    result_release_at: "Please select when results will be released"
  }

  return errorMessages[fieldName] || "This field is required"
}

