# Student Portal Developer Guide: Teacher-Controlled Test Features

## 🎯 Overview

This guide provides detailed implementation instructions for integrating teacher-controlled test features into the Student Portal. Teachers can now control the pause button and in-question timer visibility for each mock test through the Admin Panel.

## 📋 Prerequisites

- Access to Student Portal codebase
- Understanding of current test interface components
- Knowledge of how practice vs mock test sessions are differentiated

## 🔍 Step 1: Identify Current Components

### 1.1 Locate Test Interface Files

Search for these key components in your Student Portal:

```bash
# Search for main test interface components
find src -name "*Test*" -type f | grep -E "(Interface|Component|Practice|Mock)"
find src -name "*Practice*" -type f
find src -name "*Mock*" -type f
```

**Common file patterns to look for:**
- `src/components/test/PracticeInterface.tsx`
- `src/components/test/MockTestInterface.tsx`
- `src/components/test/TestInterface.tsx`
- `src/pages/test/[testId]/page.tsx`
- `src/components/test/TestContainer.tsx`

### 1.2 Identify Key Components

Look for these specific UI elements:
- **Pause Button**: Usually named `PauseButton`, `PauseTestButton`, or similar
- **In-Question Timer**: Usually named `QuestionTimer`, `InQuestionTimer`, or similar
- **Main Timer**: The overall test timer component
- **Session Type Logic**: How the system determines if it's a practice or mock test

## 🗄️ Step 2: Update Database Queries

### 2.1 Find Test Data Fetching Functions

Search for functions that fetch test details:

```bash
# Search for test fetching functions
grep -r "from.*tests" src/
grep -r "select.*test" src/
grep -r "getTest" src/
```

### 2.2 Update SELECT Queries

**Before (example):**
```typescript
const { data: test } = await supabase
  .from('tests')
  .select('id, name, total_time_minutes, marks_per_correct, negative_marks_per_incorrect')
  .eq('id', testId)
  .single()
```

**After (updated):**
```typescript
const { data: test } = await supabase
  .from('tests')
  .select('id, name, total_time_minutes, marks_per_correct, negative_marks_per_incorrect, allow_pausing, show_in_question_timer')
  .eq('id', testId)
  .single()
```

### 2.3 Files to Update

Look for and update these types of files:
- Test data fetching functions
- API routes that return test data
- Server actions that fetch test details
- Any component that loads test information

## 🔧 Step 3: Update TypeScript Interfaces

### 3.1 Locate Test Type Definitions

Find your test interface definitions:

```bash
# Search for test type definitions
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "interface.*Test"
find src -name "types.ts" -o -name "types.tsx"
```

### 3.2 Update Test Interface

**Add these properties to your Test interface:**

```typescript
export interface Test {
  id: number
  name: string
  total_time_minutes: number
  marks_per_correct: number
  negative_marks_per_incorrect: number
  // ... existing properties
  
  // NEW PROPERTIES - Add these
  allow_pausing?: boolean
  show_in_question_timer?: boolean
}
```

### 3.3 Update Related Types

If you have other test-related interfaces, update them too:

```typescript
// Example: TestDetails interface
export interface TestDetails {
  id: number
  name: string
  total_time_minutes: number
  // ... existing properties
  
  // NEW PROPERTIES
  allow_pausing?: boolean
  show_in_question_timer?: boolean
}
```

## 🎨 Step 4: Implement Conditional Rendering Logic

### 4.1 Create Helper Functions

**Add this logic to your main test interface component:**

```typescript
// Add this to your test interface component
interface TestInterfaceProps {
  testDetails: {
    id: number
    name: string
    total_time_minutes: number
    allow_pausing?: boolean
    show_in_question_timer?: boolean
    // ... other properties
  }
  sessionType: 'practice' | 'mock_test' // Make sure this exists
}

export default function TestInterface({ testDetails, sessionType }: TestInterfaceProps) {
  
  // CRITICAL LOGIC - Add these helper functions
  const shouldShowPauseButton = sessionType === 'practice' || testDetails.allow_pausing
  const shouldShowInQuestionTimer = sessionType === 'practice' || testDetails.show_in_question_timer
  
  // Safe defaults for missing values
  const allowPausing = testDetails.allow_pausing ?? false
  const showInQuestionTimer = testDetails.show_in_question_timer ?? false
  
  return (
    <div className="test-interface">
      {/* Your existing test interface structure */}
      
      {/* Main Timer - Always visible */}
      <MainTimer duration={testDetails.total_time_minutes} />
      
      {/* CONDITIONAL: Pause Button */}
      {shouldShowPauseButton && (
        <PauseButton 
          onPause={handlePause}
          onResume={handleResume}
          isPaused={isPaused}
        />
      )}
      
      {/* Your question rendering logic */}
      <QuestionArea>
        {questions.map((question) => (
          <QuestionCard key={question.id}>
            {/* Question content */}
            
            {/* CONDITIONAL: In-Question Timer */}
            {shouldShowInQuestionTimer && (
              <InQuestionTimer 
                questionId={question.id}
                timeLimit={question.timeLimit}
                onTimeUp={handleTimeUp}
              />
            )}
          </QuestionCard>
        ))}
      </QuestionArea>
    </div>
  )
}
```

### 4.2 Update Pause Button Component

**Find your pause button component and wrap it with conditional rendering:**

```typescript
// In your main test component
{shouldShowPauseButton && (
  <PauseButton 
    onPause={handlePause}
    onResume={handleResume}
    isPaused={isPaused}
    className="pause-button"
  />
)}
```

### 4.3 Update In-Question Timer Component

**Find your in-question timer component and wrap it with conditional rendering:**

```typescript
// In your question component
{shouldShowInQuestionTimer && (
  <InQuestionTimer 
    questionId={question.id}
    timeLimit={question.timeLimit}
    onTimeUp={handleTimeUp}
    className="question-timer"
  />
)}
```

## 🔍 Step 5: Session Type Detection

### 5.1 Identify Session Type Logic

**Find where your system determines if it's a practice or mock test:**

```bash
# Search for session type logic
grep -r "practice" src/ | grep -i "session\|type"
grep -r "mock" src/ | grep -i "session\|type"
```

### 5.2 Ensure Proper Session Type Detection

**Make sure you have logic like this:**

```typescript
// Example session type detection
const sessionType = isPracticeSession ? 'practice' : 'mock_test'

// Or based on URL/routing
const sessionType = pathname.includes('/practice/') ? 'practice' : 'mock_test'

// Or based on test configuration
const sessionType = testDetails.is_practice_test ? 'practice' : 'mock_test'
```

### 5.3 Update Session Type Logic

**Ensure your session type logic works with the new conditional rendering:**

```typescript
// This is the key logic - practice sessions always show both features
const shouldShowPauseButton = sessionType === 'practice' || testDetails.allow_pausing
const shouldShowInQuestionTimer = sessionType === 'practice' || testDetails.show_in_question_timer
```

## 🧪 Step 6: Testing Implementation

### 6.1 Test Data Setup

**Create test cases with different configurations:**

```typescript
// Test case 1: Strict mock test (no pause, no timer)
const strictTest = {
  id: 1,
  name: "Strict Mock Test",
  allow_pausing: false,
  show_in_question_timer: false
}

// Test case 2: Flexible mock test (pause + timer)
const flexibleTest = {
  id: 2,
  name: "Flexible Mock Test", 
  allow_pausing: true,
  show_in_question_timer: true
}

// Test case 3: Practice session (always flexible)
const practiceSession = {
  sessionType: 'practice',
  testDetails: strictTest // Even with strict settings, practice should show both
}
```

### 6.2 Test Scenarios

**Test these specific scenarios:**

1. **Mock Test with `allow_pausing = true`**
   - ✅ Pause button should be visible
   - ✅ Students can pause and resume

2. **Mock Test with `allow_pausing = false`**
   - ✅ Pause button should be hidden
   - ✅ No pause functionality available

3. **Mock Test with `show_in_question_timer = true`**
   - ✅ In-question timer should be visible
   - ✅ Timer should work for each question

4. **Mock Test with `show_in_question_timer = false`**
   - ✅ In-question timer should be hidden
   - ✅ Only main test timer visible

5. **Practice Session (regardless of settings)**
   - ✅ Both pause button and timer should always be visible
   - ✅ Should work even if test has strict settings

### 6.3 Edge Cases

**Test these edge cases:**

```typescript
// Missing values - should default to strict mode
const testWithMissingValues = {
  id: 3,
  name: "Test with Missing Values",
  allow_pausing: undefined,
  show_in_question_timer: null
}
// Expected: No pause button, no in-question timer

// Null values - should default to strict mode  
const testWithNullValues = {
  id: 4,
  name: "Test with Null Values",
  allow_pausing: null,
  show_in_question_timer: null
}
// Expected: No pause button, no in-question timer
```

## 📁 Step 7: File Organization

### 7.1 Files You'll Likely Need to Modify

**Based on common Student Portal structures:**

```
src/
├── components/
│   ├── test/
│   │   ├── TestInterface.tsx          # Main test component
│   │   ├── PracticeInterface.tsx      # Practice test component
│   │   ├── MockTestInterface.tsx      # Mock test component
│   │   ├── PauseButton.tsx            # Pause button component
│   │   ├── QuestionTimer.tsx          # In-question timer
│   │   └── TestContainer.tsx          # Test container
│   └── ui/
│       └── Timer.tsx                  # Timer components
├── pages/
│   ├── test/
│   │   └── [testId]/
│   │       └── page.tsx               # Test page
│   └── practice/
│       └── [testId]/
│           └── page.tsx                # Practice page
├── lib/
│   ├── supabase.ts                    # Database queries
│   ├── types.ts                       # Type definitions
│   └── utils.ts                       # Utility functions
└── hooks/
    ├── useTest.ts                      # Test data hook
    └── useTimer.ts                     # Timer hook
```

### 7.2 Priority Order for Changes

1. **High Priority** (Core functionality):
   - Update database queries
   - Update TypeScript interfaces
   - Implement conditional rendering logic

2. **Medium Priority** (UI components):
   - Update pause button component
   - Update in-question timer component
   - Update main test interface

3. **Low Priority** (Polish):
   - Add loading states
   - Add error handling
   - Add accessibility features

## 🚨 Step 8: Common Pitfalls to Avoid

### 8.1 TypeScript Errors

**Common error:**
```typescript
// ❌ Wrong - missing optional chaining
const shouldShow = testDetails.allow_pausing

// ✅ Correct - safe access with fallback
const shouldShow = testDetails.allow_pausing ?? false
```

### 8.2 Session Type Logic

**Common mistake:**
```typescript
// ❌ Wrong - doesn't handle practice sessions
const shouldShowPause = testDetails.allow_pausing

// ✅ Correct - practice sessions always flexible
const shouldShowPause = sessionType === 'practice' || testDetails.allow_pausing
```

### 8.3 Database Queries

**Common mistake:**
```typescript
// ❌ Wrong - missing new columns
.select('id, name, total_time_minutes')

// ✅ Correct - includes new columns
.select('id, name, total_time_minutes, allow_pausing, show_in_question_timer')
```

## ✅ Step 9: Verification Checklist

### 9.1 Database Integration
- [ ] Test data fetching includes new columns
- [ ] TypeScript interfaces updated
- [ ] No TypeScript compilation errors

### 9.2 UI Conditional Rendering
- [ ] Pause button shows when `allow_pausing = true`
- [ ] Pause button hidden when `allow_pausing = false`
- [ ] In-question timer shows when `show_in_question_timer = true`
- [ ] In-question timer hidden when `show_in_question_timer = false`
- [ ] Practice sessions always show both features

### 9.3 Edge Cases
- [ ] Handles `null`/`undefined` values gracefully
- [ ] Defaults to strict mode when settings are missing
- [ ] Practice sessions override mock test settings
- [ ] No console errors or warnings

### 9.4 User Experience
- [ ] Smooth transitions when toggling features
- [ ] Clear visual feedback for enabled/disabled features
- [ ] No broken layouts or missing elements
- [ ] Mobile responsiveness maintained

## 🎯 Step 10: Implementation Timeline

### Day 1: Database & Types
- Update database queries
- Update TypeScript interfaces
- Test data fetching

### Day 2: Core Logic
- Implement conditional rendering logic
- Update main test interface component
- Test basic functionality

### Day 3: UI Components
- Update pause button component
- Update in-question timer component
- Test UI interactions

### Day 4: Testing & Polish
- Comprehensive testing
- Edge case handling
- Bug fixes and refinements

## 📞 Support & Questions

If you encounter any issues during implementation:

1. **Check the Admin Panel**: Verify that the toggle switches are working correctly
2. **Database Verification**: Ensure the migration ran successfully and data is correct
3. **TypeScript Errors**: Check for missing type definitions or incorrect interfaces
4. **Console Logging**: Add temporary console.log statements to debug conditional logic

## 🎉 Success Criteria

Your implementation is complete when:

- ✅ Students can see pause button when teacher enables it
- ✅ Students cannot see pause button when teacher disables it  
- ✅ Students can see in-question timer when teacher enables it
- ✅ Students cannot see in-question timer when teacher disables it
- ✅ Practice sessions always show both features
- ✅ No breaking changes to existing functionality
- ✅ All TypeScript types are consistent
- ✅ No console errors or warnings

---

**Ready to implement? Start with Step 1 and work through each section systematically. The key is the conditional logic: `sessionType === 'practice' || testDetails.allow_pausing`**
