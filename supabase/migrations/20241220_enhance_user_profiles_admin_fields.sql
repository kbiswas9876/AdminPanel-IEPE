-- Add admin-specific fields to user_profiles table
-- Migration: 20241220_enhance_user_profiles_admin_fields

-- Add new columns if they don't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS job_title VARCHAR(100),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email VARCHAR(255); -- Store email in profile for faster access

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login_at DESC);

-- Add comment to table
COMMENT ON TABLE user_profiles IS 'Extended user profiles with admin-specific fields and preferences';
COMMENT ON COLUMN user_profiles.profile_picture_url IS 'URL to user profile picture (stored in Cloudinary or similar)';
COMMENT ON COLUMN user_profiles.phone_number IS 'User contact phone number';
COMMENT ON COLUMN user_profiles.department IS 'Department or team (for admins)';
COMMENT ON COLUMN user_profiles.job_title IS 'Job title or role description';
COMMENT ON COLUMN user_profiles.bio IS 'Short biography or description';
COMMENT ON COLUMN user_profiles.timezone IS 'User preferred timezone (e.g., America/New_York, UTC)';
COMMENT ON COLUMN user_profiles.language IS 'User preferred language code (e.g., en, es, fr)';
COMMENT ON COLUMN user_profiles.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN user_profiles.email IS 'Cached email from auth.users for faster lookups';

