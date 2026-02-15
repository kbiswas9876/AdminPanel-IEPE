# Student Portal Integration Guide

## Overview
This guide outlines the changes needed in the Student Portal to implement teacher-controlled test features (pause button and in-question timer toggles).

## Required Changes

### 1. Database Query Updates

#### Update Test Data Fetching
**Files to modify**: Any component that fetches test details for students

**Current query** (example):
```typescript
const { data: test } = await supabase
  .from('tests')
  .select('id, name, total_time_minutes, marks_per_correct, negative_marks_per_incorrect')
  .eq('id', testId)
  .single()
```

**Updated query**:
```typescript
const { data: test } = await supabase
  .from('tests')
  .select('id, name, total_time_minutes, marks_per_correct, negative_marks_per_incorrect, allow_pausing, show_in_question_timer')
  .eq('id', testId)
  .single()
```

### 2. TypeScript Interface Updates

#### Update Test Interface
**File**: `src/types/test.ts` or similar

**Add to test interface**:
```typescript
export interface Test {
  id: number
  name: string
  total_time_minutes: number
  marks_per_correct: number
  negative_marks_per_incorrect: number
  allow_pausing?: boolean
  show_in_question_timer?: boolean
  // ... other existing fields
}
```

### 3. Conditional Rendering Logic

#### Main Test Interface Component
**File**: `src/components/test/PracticeInterface.tsx` or similar main test component

**Add conditional logic**:
```typescript
interface TestInterfaceProps {
  testDetails: {
    id: number
    name: string
    total_time_minutes: number
    allow_pausing?: boolean
    show_in_question_timer?: boolean
    // ... other fields
  }
  sessionType: 'practice' | 'mock_test'
}

export default function TestInterface({ testDetails, sessionType }: TestInterfaceProps) {
  
  // Determine if features should be visible
  const shouldShowPauseButton = sessionType === 'practice' || testDetails.allow_pausing
  const shouldShowInQuestionTimer = sessionType === 'practice' || testDetails.show_in_question_timer

  return (
    <div>
      <Header>
        {/* Main Timer (always visible) */}
        <MainTimer duration={testDetails.total_time_minutes} />

        {/* Conditionally render the Pause Button */}
        {shouldShowPauseButton && (
          <PauseButton onClick={handlePause} />
        )}
      </Header>

      <QuestionArea>
        {questions.map((question) => (
          <QuestionCard key={question.id}>
            {/* ... question content ... */}
            
            <CardFooter>
              {/* Conditionally render the In-Question Timer */}
              {shouldShowInQuestionTimer && (
                <InQuestionTimer questionId={question.id} />
              )}
            </CardFooter>
          </QuestionCard>
        ))}
      </QuestionArea>
    </div>
  )
}
```

### 4. Component Updates

#### Pause Button Component
**File**: `src/components/test/PauseButton.tsx` or similar

**Wrap with conditional rendering**:
```typescript
// In parent component
{shouldShowPauseButton && (
  <PauseButton 
    onPause={handlePause}
    onResume={handleResume}
    isPaused={isPaused}
  />
)}
```

#### In-Question Timer Component
**File**: `src/components/test/InQuestionTimer.tsx` or similar

**Wrap with conditional rendering**:
```typescript
// In question component
{shouldShowInQuestionTimer && (
  <InQuestionTimer 
    questionId={question.id}
    timeLimit={question.timeLimit}
    onTimeUp={handleTimeUp}
  />
)}
```

### 5. Session Type Logic

#### Practice vs Mock Test Detection
**File**: Where session type is determined

**Ensure proper session type detection**:
```typescript
// Example logic for determining session type
const sessionType = isPracticeSession ? 'practice' : 'mock_test'

// Practice sessions always show both features
// Mock tests respect the database settings
const shouldShowPauseButton = sessionType === 'practice' || testDetails.allow_pausing
const shouldShowInQuestionTimer = sessionType === 'practice' || testDetails.show_in_question_timer
```

### 6. Testing Checklist

#### Database Integration
- [ ] Test data fetching includes new columns
- [ ] TypeScript interfaces updated
- [ ] No TypeScript errors

#### UI Conditional Rendering
- [ ] Pause button shows when `allow_pausing = true`
- [ ] Pause button hidden when `allow_pausing = false`
- [ ] In-question timer shows when `show_in_question_timer = true`
- [ ] In-question timer hidden when `show_in_question_timer = false`
- [ ] Practice sessions always show both features (regardless of settings)

#### Edge Cases
- [ ] Handles `null`/`undefined` values gracefully
- [ ] Defaults to strict mode when settings are missing
- [ ] Practice sessions override mock test settings

### 7. Implementation Notes

#### Backward Compatibility
- All existing tests will have `allow_pausing = true` and `show_in_question_timer = true`
- This preserves current behavior for existing tests
- New tests will default to `false` (strict mode)

#### Default Behavior
- **Practice Sessions**: Always flexible (pause + timer visible)
- **Mock Tests**: Controlled by database settings
- **Missing Settings**: Default to strict mode (no pause, no timer)

#### Error Handling
```typescript
// Safe defaults
const allowPausing = testDetails.allow_pausing ?? false
const showInQuestionTimer = testDetails.show_in_question_timer ?? false

// Practice sessions override
const shouldShowPauseButton = sessionType === 'practice' || allowPausing
const shouldShowInQuestionTimer = sessionType === 'practice' || showInQuestionTimer
```

## Files to Modify

1. **Test data fetching functions** - Add new columns to SELECT queries
2. **Test interface components** - Add conditional rendering logic
3. **TypeScript interfaces** - Add new boolean properties
4. **Pause button component** - Wrap with conditional rendering
5. **In-question timer component** - Wrap with conditional rendering
6. **Session type detection** - Ensure proper practice vs mock test logic

## Success Criteria

- [ ] Students can see pause button when teacher enables it
- [ ] Students cannot see pause button when teacher disables it
- [ ] Students can see in-question timer when teacher enables it
- [ ] Students cannot see in-question timer when teacher disables it
- [ ] Practice sessions always show both features
- [ ] No breaking changes to existing functionality
- [ ] All TypeScript types are consistent
