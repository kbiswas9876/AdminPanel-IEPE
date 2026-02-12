-- Add active_flags column to user_profiles for AI-powered insight engine
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS active_flags TEXT[] DEFAULT '{}';

-- Create GIN index for efficient array queries and filtering
CREATE INDEX IF NOT EXISTS idx_user_profiles_active_flags 
ON public.user_profiles USING GIN (active_flags);

-- Add trajectory_data column for caching performance calculations
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS trajectory_data JSONB;

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.active_flags IS 
'Array of active insight flags: PERFORMANCE_DECLINE, HIGH_BOOKMARK_RATE_LOW_SUCCESS, HIGH_ACHIEVER, etc. Automatically updated by Edge Function.';

COMMENT ON COLUMN public.user_profiles.trajectory_data IS 
'Cached performance trajectory data: { trend: "improving"|"declining"|"stable", projected_score_30_days: number, slope: number, last_calculated: timestamp }';

