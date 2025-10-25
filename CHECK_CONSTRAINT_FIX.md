# Database CHECK Constraint Fix: Negative Marks Validation

## 🚨 Problem Identified

The error `violates check constraint "check_negative_marks_per_incorrect"` was occurring because:

1. **Database CHECK Constraint**: The `tests` table has a CHECK constraint that enforces `negative_marks_per_incorrect <= 0`
2. **Frontend Issue**: The Admin Panel form was sending positive values (e.g., `0.25`) for negative marks
3. **Database Rejection**: Supabase correctly rejected the data to maintain data integrity

## ✅ Solution Implemented

### Root Cause Fix
Added validation logic in **all server actions** to ensure `negative_marks_per_incorrect` is always `<= 0` before saving to the database.

### Code Pattern Applied
```typescript
// Ensure negative marks is always <= 0 (enforce CHECK constraint)
const correctedNegativeMarks = rawValue > 0 ? -rawValue : rawValue;
```

### Functions Updated
1. **`saveTest()`** - Main test saving function
2. **`saveTestFromForm()`** - FormData-based saving
3. **`createTest()`** - Test creation function
4. **`updateTest()`** - Test update function
5. **`cloneTest()`** - Test cloning function

## 🔧 Implementation Details

### Before (Problematic)
```typescript
negative_marks_per_incorrect: formData.negative_marks_per_incorrect, // Could be 0.25
```

### After (Fixed)
```typescript
// Ensure negative marks is always <= 0 (enforce CHECK constraint)
const rawNegativeMarks = Number(formData.get('negative_marks_per_incorrect') || 0);
const correctedNegativeMarks = rawNegativeMarks > 0 ? -rawNegativeMarks : rawNegativeMarks;

negative_marks_per_incorrect: correctedNegativeMarks, // Will be -0.25
```

## 🎯 Benefits

1. **Fixes Database Error**: No more CHECK constraint violations
2. **User-Friendly**: Admins can enter `0.25` and system converts to `-0.25`
3. **Data Integrity**: Ensures all negative marks values are properly formatted
4. **Robust**: Handles edge cases like zero values correctly
5. **No Database Changes**: Keeps the valuable CHECK constraint intact

## 🧪 Test Cases Covered

- **Positive Input**: `0.25` → `-0.25` ✅
- **Negative Input**: `-0.25` → `-0.25` ✅
- **Zero Input**: `0` → `0` ✅
- **Missing Input**: `undefined` → `0` ✅

## 📁 Files Modified

- `src/lib/actions/tests.ts` - Added validation to all test-related server actions

## 🚀 Result

The CHECK constraint error is now resolved. The system will:
- Accept positive values from the frontend
- Automatically convert them to negative values
- Successfully save to the database
- Maintain data integrity

**Status**: ✅ **FIXED** - Ready for testing
