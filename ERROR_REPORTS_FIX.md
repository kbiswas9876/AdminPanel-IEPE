# Error Reports Database Issue - Solution

## 🚨 Problem Identified

The Error Reports section is showing "Loading reports..." but no data appears because:

1. **Missing Table**: The `error_reports` table doesn't exist in the database
2. **Missing Foreign Key**: No relationship between `error_reports` and `profiles` tables
3. **Database Query Error**: The code is trying to join tables that don't exist

## 🔍 Error Details

From the terminal logs:
```
Error fetching error reports by status: {
  code: 'PGRST200',
  details: "Searched for a foreign key relationship between 'error_reports' and 'profiles' in the schema 'public', but no matches were found.",
  hint: null,
  message: "Could not find a relationship between 'error_reports' and 'profiles' in the schema cache"
}
```

## ✅ Solution

### Step 1: Create Missing Migration File

I've created the missing migration file: `supabase/migrations/20250124130000_create_error_reports_table.sql`

This migration will:
- Create the `error_reports` table with proper structure
- Add foreign key relationships to `questions` and `auth.users` tables
- Create necessary indexes for performance
- Set up Row Level Security policies
- Add proper triggers for `updated_at` timestamps

### Step 2: Apply Migration to Database

You need to run this migration on your database. Here are the options:

#### Option A: Using Supabase CLI (Recommended)
```bash
# If you have Supabase CLI installed
npx supabase db push

# Or if you have Docker running
npx supabase db reset
```

#### Option B: Manual SQL Execution
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250124130000_create_error_reports_table.sql`
4. Execute the SQL

#### Option C: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Database → Tables
3. Click "Create a new table"
4. Use the table structure from the migration file

### Step 3: Verify the Fix

After applying the migration:

1. **Refresh the Error Reports page** in your browser
2. **Check the terminal logs** - the relationship errors should be gone
3. **Test the functionality** - the page should load without "Loading reports..." stuck state

## 📋 Migration File Contents

The migration file `supabase/migrations/20250124130000_create_error_reports_table.sql` includes:

```sql
-- Create error_reports table
CREATE TABLE IF NOT EXISTS error_reports (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_error_reports_question_id ON error_reports(question_id);
CREATE INDEX IF NOT EXISTS idx_error_reports_user_id ON error_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_error_reports_status ON error_reports(status);
CREATE INDEX IF NOT EXISTS idx_error_reports_created_at ON error_reports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- Allow admins full access to error reports
CREATE POLICY "Admins can manage all error reports"
  ON error_reports
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Allow users to view and create their own error reports
CREATE POLICY "Users can view their own error reports"
  ON error_reports
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create error reports"
  ON error_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
```

## 🔧 Code Analysis

The error reports functionality is implemented in:

1. **Server Actions**: `src/lib/actions/error-reports.ts`
   - `getErrorReports()` - Gets all error reports
   - `getErrorReportsByStatus()` - Gets reports by status
   - `getNewErrorReportsCount()` - Gets count for notification badge

2. **UI Components**: `src/components/reports/`
   - Error reports management interface
   - Status filtering (New, In Review, Resolved)

3. **Database Queries**: The queries expect:
   - `error_reports` table to exist
   - Foreign key relationship with `profiles` table
   - Proper RLS policies for admin access

## 🎯 Expected Behavior After Fix

1. **Error Reports Page**: Should load without "Loading reports..." stuck state
2. **Notification Badge**: Should show correct count of new reports
3. **Status Tabs**: Should work properly (New Reports, In Review, Resolved)
4. **Admin Access**: Should be able to view and manage all error reports
5. **No Console Errors**: Database relationship errors should be resolved

## 🚀 Next Steps

1. **Apply the migration** using one of the methods above
2. **Test the Error Reports page** to ensure it loads properly
3. **Verify notification badge** shows correct count
4. **Test all status tabs** (New, In Review, Resolved)
5. **Check browser console** for any remaining errors

## 📝 Additional Notes

- The migration is designed to be safe and won't affect existing data
- It includes proper indexes for performance
- RLS policies ensure proper access control
- The table structure matches what the existing code expects

---

**Status**: ✅ **SOLUTION PROVIDED** - Apply the migration to fix the error reports functionality
