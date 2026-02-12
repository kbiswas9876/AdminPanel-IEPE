// Performance Feedback Calculator for Admin Panel
// Mirror of the Student Portal's performance feedback logic
// Located in student-portal/src/lib/speed-calculator.ts

const ADVANCED_TIME_THRESHOLDS = {
  'Easy': 20,           // Instant-recall questions
  'Easy-Moderate': 30,  // Single-step calculations
  'Moderate': 45,       // Standard multi-step problems
  'Moderate-Hard': 60,  // Complex problems requiring careful thought
  'Hard': 90,           // Most challenging questions requiring deep understanding
  'default': 36,        // Baseline (100 questions in 60 minutes = 36 seconds/question)
};

export type AdvancedDifficulty = 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard' | null | undefined;
export type PerformanceState = 'Slow' | 'Superfast' | 'OnTime' | 'OnTimeButNotCorrect';

/**
 * Get target time for a question based on its difficulty
 * @param difficulty - The difficulty level from the five-tier model
 * @returns Target time in seconds
 */
export function getTargetTime(difficulty: AdvancedDifficulty): number {
  switch (difficulty) {
    case 'Easy':
      return ADVANCED_TIME_THRESHOLDS['Easy'];
    case 'Easy-Moderate':
      return ADVANCED_TIME_THRESHOLDS['Easy-Moderate'];
    case 'Moderate':
      return ADVANCED_TIME_THRESHOLDS['Moderate'];
    case 'Moderate-Hard':
      return ADVANCED_TIME_THRESHOLDS['Moderate-Hard'];
    case 'Hard':
      return ADVANCED_TIME_THRESHOLDS['Hard'];
    default:
      return ADVANCED_TIME_THRESHOLDS['default'];
  }
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

