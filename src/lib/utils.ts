import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate CSV template for bulk import
export function generateCSVTemplate(): string {
  const headers = [
    'question_id',
    'book_source',
    'chapter_name',
    'question_number_in_book',
    'question_text',
    'options',
    'correct_option',
    'solution_text',
    'exam_metadata',
    'admin_tags'
  ]
  
  const sampleRow = [
    'PIN6800_PER_1',
    'Pinnacle 6800 6th Ed',
    'Percentage',
    '1',
    'What is 20% of 100?',
    '{"a": "10", "b": "20", "c": "30", "d": "40"}',
    'b',
    '20% of 100 = (20/100) × 100 = 20',
    'CAT 2023, Slot 1',
    'Percentage, Basic Math'
  ]
  
  return [headers, sampleRow].map(row => row.join(',')).join('\n')
}
