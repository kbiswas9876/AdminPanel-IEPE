-- Create student_notes table for audit trail of admin notes
-- Migration: 20250124_add_student_notes_table

CREATE TABLE IF NOT EXISTS public.student_notes (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_student_notes_student_id ON public.student_notes(student_id, created_at DESC);
CREATE INDEX idx_student_notes_admin_id ON public.student_notes(admin_id);

-- Enable RLS
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all notes
CREATE POLICY "Admins can view all notes" ON public.student_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: System can insert notes
CREATE POLICY "System can insert notes" ON public.student_notes
  FOR INSERT WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE public.student_notes IS 'Admin notes for student profiles with full audit trail';
COMMENT ON COLUMN public.student_notes.student_id IS 'Reference to the student user profile';
COMMENT ON COLUMN public.student_notes.admin_id IS 'Reference to the admin who created the note';
COMMENT ON COLUMN public.student_notes.note IS 'Administrative note text';
COMMENT ON COLUMN public.student_notes.created_at IS 'Timestamp when the note was created';

