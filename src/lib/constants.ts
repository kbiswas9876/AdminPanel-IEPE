export const REPORT_OPTIONS = [
  { tag: 'wrong_question', label: 'Wrong Question' },
  { tag: 'wrong_answer', label: 'Wrong Answer' },
  { tag: 'formatting_issue', label: 'Formatting Issue' },
  { tag: 'no_solution', label: 'No Solution Provided' },
  { tag: 'translation_issue', label: 'Translation Issue' },
  { tag: 'other', label: 'Other...' },
] as const; // 'as const' provides strong type safety

export type ReportTag = typeof REPORT_OPTIONS[number]['tag'];
