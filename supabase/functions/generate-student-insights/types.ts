// Type definitions for the Insight Engine Edge Function

export interface FlagCheckerResult {
  flag: string | null;
  reason?: string;
}

export interface StudentInsightData {
  student_id: string;
  full_name: string;
  active_flags: string[];
}

export interface EdgeFunctionResponse {
  success: boolean;
  processed: number;
  errors: Array<{ student_id: string; error: string }>;
}

