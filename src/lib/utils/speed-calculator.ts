// Performance Feedback Calculator for Admin Panel
// Mirror of the Student Portal's performance feedback logic
// Located in student-portal/src/lib/speed-calculator.ts

// Note: 'Very Easy' (15s) and 'Very Hard' (100s) are documented as future-proofing
// for upcoming database schema expansions while maintaining current active schema compatibility.
const ADVANCED_TIME_THRESHOLDS = {
  'Very Easy': 15,     // Documented future-proofing (Instant recall)
  'Easy': 20,          // Simple recall / quick answer (18s - 20s baseline)
  'Easy-Moderate': 28, // Single-step calculation / reading (25s - 28s baseline)
  'Moderate': 40,      // Standard multi-step problem (35s - 40s baseline)
  'Moderate-Hard': 60, // Complex problem requiring calculation/thought (55s - 60s baseline)
  'Hard': 80,          // Most challenging questions (75s - 80s baseline)
  'Very Hard': 100,    // Documented future-proofing (Deep multi-concept)
  'default': 30,       // Baseline default
};

export type AdvancedDifficulty = 
  | 'Very Easy'
  | 'Easy' 
  | 'Easy-Moderate' 
  | 'Moderate' 
  | 'Moderate-Hard' 
  | 'Hard' 
  | 'Very Hard'
  | null 
  | undefined;
export type PerformanceState = 'Slow' | 'Superfast' | 'OnTime' | 'OnTimeButNotCorrect';

/**
 * Get target time for a question based on its difficulty
 * @param difficulty - The difficulty level from the five-tier model
 * @returns Target time in seconds
 */
export function getTargetTime(difficulty: AdvancedDifficulty): number {
  if (!difficulty) return ADVANCED_TIME_THRESHOLDS.default;
  return ADVANCED_TIME_THRESHOLDS[difficulty] || ADVANCED_TIME_THRESHOLDS.default;
}

/**
 * Get nuanced performance state for a question
 * Hierarchical algorithm that provides sophisticated feedback based on speed and accuracy.
 * Priority: Slow > Accuracy > Speed analysis
 * 
 * @param timeTakenInSeconds - The time the user took to answer
 * @param difficulty - The difficulty level from the five-tier model
 * @param answerStatus - The correctness of the answer ('correct', 'incorrect', 'skipped')
 * @returns Performance state: 'Slow', 'Superfast', 'OnTime', or 'OnTimeButNotCorrect'
 */
export function getNuancedPerformanceState(
  timeTakenInSeconds: number,
  difficulty: AdvancedDifficulty,
  answerStatus: 'correct' | 'incorrect' | 'skipped'
): PerformanceState {
  // Step 1: Get the target time for this question
  const threshold = getTargetTime(difficulty);

  const slowThreshold = threshold * 1.10; // 110% of target time
  const superfastThreshold = threshold * 0.80; // 80% of target time

  // PRIORITY 1: The "Slow" Check. This overrides everything else.
  if (timeTakenInSeconds > slowThreshold) {
    return 'Slow';
  }

  // PRIORITY 2: The "Accuracy" Check (only runs if the user was NOT slow).
  if (answerStatus === 'correct') {
    // If Correct, check for exceptional speed.
    if (timeTakenInSeconds < superfastThreshold) {
      return 'Superfast';
    } else {
      // Correct and within the normal time range.
      return 'OnTime';
    }
  } else {
    // This block handles both 'incorrect' and 'skipped' statuses.
    // Since the "Slow" check failed, we know they were within the time limit.
    return 'OnTimeButNotCorrect';
  }
}

/**
 * Get performance feedback label for display
 * @param performanceState - The performance state
 * @returns Display label
 */
export function getPerformanceLabel(performanceState: PerformanceState): string {
  switch (performanceState) {
    case 'Slow':
      return 'SLOW';
    case 'Superfast':
      return 'SUPERFAST';
    case 'OnTime':
      return 'ON TIME';
    case 'OnTimeButNotCorrect':
      return 'ON TIME BUT NOT CORRECT';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Get performance feedback styling (mirrors Student Portal)
 * @param performanceState - The performance state
 * @returns Styling classes
 */
export function getPerformanceChipStyle(performanceState: PerformanceState): {
  containerClass: string;
  icon: string;
  label: string;
} {
  switch (performanceState) {
    case 'Slow':
      return {
        containerClass: 'bg-red-500 text-white shadow-lg shadow-red-200/50',
        icon: '😞',
        label: 'SLOW',
      };
    case 'Superfast':
      return {
        containerClass: 'bg-green-500 text-white shadow-lg shadow-green-200/50',
        icon: '😄',
        label: 'SUPERFAST',
      };
    case 'OnTime':
      return {
        containerClass: 'bg-green-500 text-white shadow-lg shadow-green-200/50',
        icon: '🙂',
        label: 'ON TIME',
      };
    case 'OnTimeButNotCorrect':
      return {
        containerClass: 'bg-gray-500 text-white shadow-lg shadow-gray-200/50',
        icon: '😐',
        label: 'ON TIME BUT NOT CORRECT',
      };
    default:
      return {
        containerClass: 'bg-gray-500 text-white shadow-lg shadow-gray-200/50',
        icon: '⏱️',
        label: 'TIME',
      };
  }
}

export { ADVANCED_TIME_THRESHOLDS };

