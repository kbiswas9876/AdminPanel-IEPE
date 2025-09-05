// This file holds all shared TypeScript types for the project.

// Type for a single question object, matching your database schema
export type Question = {
  id?: number;
  created_at: string;
  question_id: string;
  book_source: string;
  chapter_name: string;
  question_number_in_book?: number | null;
  question_text: string;
  options?: {
    a: string;
    b: string;
    c: string;
    d: string;
  } | null;
  correct_option?: string;
  solution_text?: string | null;
  exam_metadata?: string | null;
  admin_tags?: string[] | null;
  difficulty?: 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard' | null;
};

// Type for a single rule in the test blueprint
export type BlueprintRule = {
  tag: string | null;
  difficulty: string | null;
  quantity: number;
};

// Type for a chapter's section of the blueprint
export type ChapterBlueprint = {
  random?: number;
  rules?: BlueprintRule[];
};

// The main blueprint object type
export type TestBlueprint = {
  [chapterName: string]: ChapterBlueprint;
};

// Type for a single question slot in the "Review & Refine" stage
export type TestQuestionSlot = {
  question: Question;
  source_type: 'random' | 'tag' | 'difficulty' | 'rule';
  source_value?: string;
  rule_tag?: string | null;
  rule_difficulty?: string | null;
  chapter_name: string;
};

// Type for test creation and management
export type Test = {
  id: number;
  created_at: string;
  name: string;
  description?: string | null;
  total_time_minutes: number;
  marks_per_correct: number;
  negative_marks_per_incorrect: number;
  result_policy: 'instant' | 'scheduled';
  result_release_at?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status: 'draft' | 'scheduled' | 'live' | 'completed';
  question_count?: number;
};

// Type for search criteria in the Master Question Bank
export type QuestionSearchCriteria = {
  search?: string;
  book_source?: string;
  chapter_name?: string;
  difficulty?: 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard';
  tags?: string[];
  page?: number;
  pageSize?: number;
};

// Type for search results
export type QuestionSearchResults = {
  questions: Question[];
  total: number;
};

// Type for regeneration criteria
export type RegenerationCriteria = {
  chapter_name: string;
  source_type: 'random' | 'rule';
  rule_tag?: string | null;
  rule_difficulty?: string | null;
  exclude_ids: number[];
};

// Type for chapter information with question counts
export type ChapterInfo = {
  name: string;
  available: number;
  tags: string[];
  difficultyCounts?: Record<string, number>;
};

// Type for test save parameters
export type TestSaveParams = {
  testId?: number;
  name: string;
  description?: string;
  total_time_minutes: number;
  marks_per_correct: number;
  negative_marks_per_incorrect: number;
  result_policy: 'instant' | 'scheduled';
  result_release_at?: string | null;
  question_ids: number[];
  publish?: {
    start_time: string;
    end_time: string;
  } | null;
};
