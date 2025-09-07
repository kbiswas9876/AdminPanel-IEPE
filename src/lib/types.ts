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
  options?: Record<string, string> | null;
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

// Type for chapter blueprint configuration
export type ChapterBlueprint = {
  random?: number;
  rules?: BlueprintRule[];
};

// Type for test blueprint configuration
export type TestBlueprint = Record<string, ChapterBlueprint>;

// Type for test question slot in the test creation wizard
export type TestQuestionSlot = {
  question: Question;
  source_type: 'random' | 'tag' | 'difficulty' | 'custom';
  chapter_name: string;
  source_value?: string | null;
  tempId?: string;
};

// Type for PDF customization settings
export type PDFCustomizationSettings = {
  // Header customization
  headerText?: string;
  headerLogo?: string; // Base64 encoded image or URL
  
  // Footer customization
  footerText?: string;
  footerLogo?: string; // Base64 encoded image or URL
  
  // Watermark customization
  watermarkText?: string;
  watermarkLogo?: string; // Base64 encoded image or URL
  watermarkOpacity?: number; // 0.1 to 0.5
  
  // Color scheme customization
  primaryColor?: string; // Hex color for headers, borders, etc.
  secondaryColor?: string; // Hex color for accents
  
  // Typography customization
  titleFont?: string;
  bodyFont?: string;
  
  // Layout customization
  showInstructions?: boolean;
  customInstructions?: string;
  showPageNumbers?: boolean;
  showTestMetadata?: boolean;
};

// Type for test metadata
export type Test = {
  id?: number;
  name: string;
  description?: string | null;
  total_time_minutes: number;
  marks_per_correct: number;
  negative_marks_per_incorrect: number;
  result_policy: 'instant' | 'scheduled';
  result_release_at?: string | null;
  created_at?: string;
  updated_at?: string;
  published?: boolean;
  publish_start_time?: string | null;
  publish_end_time?: string | null;
};

// Type for UI question (with additional UI-specific properties)
export type UIQuestion = Question & {
  // Additional UI-specific properties can be added here
  isSelected?: boolean;
  isEditing?: boolean;
};

// Type for chapter information
export type ChapterInfo = {
  name: string;
  available: number;
  tags: string[];
};

// Type for generated test slot (from blueprint generation)
export type GeneratedTestSlot = {
  question: Question;
  source_type: 'random' | 'rule';
  chapter_name: string;
  source_value?: string | null;
};