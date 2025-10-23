# Admin Panel Migration Testing Guide

**For:** QA Team & Developers  
**Purpose:** Step-by-step testing procedures for mock tests schema migration  
**Status:** Ready for Testing

---

## 🎯 Overview

This guide provides detailed testing procedures to verify that the Admin Panel correctly handles all new mock test database fields after the schema migration.

---

## 📋 Pre-Testing Checklist

Before you begin testing, ensure:

- [ ] Admin Panel deployed to production/staging
- [ ] You have admin credentials
- [ ] Browser console is open (F12) to catch any errors
- [ ] You understand the new fields being tested

---

## 🧪 Test Suite 1: New Test Creation

### **Test 1.1: Complete Test Creation Flow**

**Objective:** Verify all new fields can be entered and saved

**Steps:**

1. **Navigate to Tests Page**
   ```
   URL: /tests
   ```

2. **Click "Create Test" Button**
   - Should open test creation modal
   - Two options: "From Blueprint" or "From Question Bank"

3. **Select Questions** (any method)
   - Select at least 5 questions
   - Click "Next" or "Continue"

4. **Fill Test Finalization Form**
   
   **Basic Information:**
   - Name: `Schema Migration Test 1`
   - Description: `Testing new fields after migration`
   - Total Time: `120` minutes

   **Scoring Configuration** (NEW SECTION):
   - Marks per Correct: `1`
   - Negative Marks per Incorrect: `0.25`
   - ✅ **Verify:** Marking scheme preview shows `+1 / -0.25`

   **Result Policy** (NEW SECTION):
   - Select: `Instant (Immediately after submission)`
   - ✅ **Verify:** No additional fields appear

5. **Click "Save as Draft"**

6. **Verification:**
   - [ ] Success toast message appears
   - [ ] Redirected to `/tests` page
   - [ ] New test appears in list with `Draft` badge
   - [ ] Test card shows marking scheme: `+1 / -0.25`

**Expected Result:** ✅ Test created successfully with all new fields

---

### **Test 1.2: Scheduled Result Policy**

**Objective:** Verify conditional result release field

**Steps:**

1. **Create New Test** (follow steps 1-3 from Test 1.1)

2. **Fill Basic Information**
   - Name: `Schema Migration Test 2 - Scheduled Results`
   - Duration: `90` minutes

3. **Scoring Configuration**
   - Marks per Correct: `2`
   - Negative Marks: `0.5` (enter as positive)

4. **Result Policy** (Critical):
   - Select: `Scheduled (Release at specific time)`
   - ✅ **Verify:** Orange box appears with date/time picker
   - ✅ **Verify:** Field is labeled "Result Release Time *"
   - Select a future date/time (e.g., tomorrow at 10:00 AM)

5. **Try to Save Without Result Release Time**
   - Clear the result release field
   - Click "Save as Draft"
   - ✅ **Verify:** Validation error appears
   - ✅ **Verify:** Error message: "Result release time is required"

6. **Fill Result Release Time**
   - Enter valid future date/time
   - Click "Save as Draft"

**Expected Result:** ✅ Test saved with scheduled result policy

---

### **Test 1.3: Negative Marks Auto-Conversion**

**Objective:** Verify negative marks are converted and stored correctly

**Steps:**

1. **Create New Test** (follow standard flow)

2. **Scoring Configuration**
   - Marks per Correct: `1`
   - Negative Marks: Enter `1.5` (positive value)
   - ✅ **Verify:** Value displays as `1.5` in input
   - ✅ **Verify:** Marking scheme preview shows `+1 / -1.5` (auto-converted)

3. **Save Test**

4. **Verification via Database Query** (if possible):
   ```sql
   SELECT negative_marks_per_incorrect FROM tests WHERE name = 'test_name';
   ```
   - ✅ **Verify:** Database shows `-1.5`, not `1.5`

5. **Edit the Test**
   - Go back to edit the saved test
   - ✅ **Verify:** Negative marks field shows `1.5` (positive, for editing)
   - ✅ **Verify:** Marking scheme shows `+1 / -1.5`

**Expected Result:** ✅ Negative marks stored as negative, displayed as positive

---

## 🧪 Test Suite 2: Test Publishing

### **Test 2.1: Publish with Result Policy**

**Objective:** Verify result policy persists through publishing

**Steps:**

1. **Create Draft Test** with:
   - Result Policy: `Scheduled`
   - Result Release: [Future date]

2. **Click "Publish Test" Button**
   - Unified publish modal opens
   - Fill in start/end times
   - ✅ **Verify:** Result policy remains `Scheduled`
   - ✅ **Verify:** Result release time pre-filled

3. **Confirm & Publish**

4. **Verification:**
   - Test status changes to `Scheduled`
   - Test card shows:
     - Start time
     - End time
     - Results: [Your result release time]

**Expected Result:** ✅ Published test retains result policy

---

## 🧪 Test Suite 3: Display & List View

### **Test 3.1: Test Card Display**

**Objective:** Verify all new fields appear in test list

**Steps:**

1. **Navigate to `/tests`**

2. **For Each Test Card, Verify:**

   **Stats Section:**
   - [ ] Questions count displayed
   - [ ] Duration displayed
   - [ ] **NEW:** Marking scheme displayed as `+X / -Y`

   **Timeline Section:**
   - [ ] Start time displayed
   - [ ] End time displayed (or "∞ Perpetual")
   - [ ] **NEW:** Results line (only if not instant)

3. **Specific Checks:**

   **For test with instant results:**
   - ✅ **Verify:** No "Results" line in timeline

   **For test with scheduled results:**
   - ✅ **Verify:** "Results" line shows release date/time

   **For test with manual results:**
   - ✅ **Verify:** "Results" line shows "Manual Release"

**Expected Result:** ✅ All new fields visible and correctly formatted

---

## 🧪 Test Suite 4: Editing Existing Tests

### **Test 4.1: Edit Pre-Migration Test**

**Objective:** Verify old tests work after migration

**Steps:**

1. **Select a Test Created Before Migration**
   - Click "Edit" from test actions menu

2. **Verify Form Pre-Population:**
   - [ ] Name, description, duration populated
   - [ ] **NEW:** Marks per correct populated (likely default: 1)
   - [ ] **NEW:** Negative marks populated (likely default: 0)
   - [ ] **NEW:** Result policy populated (likely default: instant)

3. **Modify New Fields:**
   - Change negative marks to `0.33`
   - Change result policy to `Manual`

4. **Save Changes**

5. **Verification:**
   - [ ] Test updated successfully
   - [ ] New values persist after reload
   - [ ] Test card shows updated marking scheme

**Expected Result:** ✅ Old tests editable with new fields

---

### **Test 4.2: Edit Recently Created Test**

**Objective:** Verify tests with new fields edit correctly

**Steps:**

1. **Edit Test Created in Test 1.1**

2. **Verify All Fields Pre-Filled:**
   - [ ] Marking scheme fields show correct values
   - [ ] Result policy correct
   - [ ] Result release time (if scheduled) correct

3. **Modify Values:**
   - Change marks per correct: `1` → `2`
   - Change negative marks: `0.25` → `0.5`
   - Keep result policy same

4. **Save & Verify:**
   - [ ] Changes saved
   - [ ] Marking scheme updates to `+2 / -0.5`

**Expected Result:** ✅ Tests with new fields edit smoothly

---

## 🧪 Test Suite 5: Validation Testing

### **Test 5.1: Required Field Validation**

**Objective:** Verify validation prevents invalid data

**Test Cases:**

| Test Case | Action | Expected Result |
|-----------|--------|-----------------|
| **Empty Marks** | Leave marks per correct empty → Save | ❌ Error: "Marks must be greater than 0" |
| **Zero Marks** | Enter `0` for marks → Save | ❌ Error: "Marks must be greater than 0" |
| **Positive Negative Marks** | Enter `0.5` for negative marks → Display shows `-0.5` | ✅ Auto-converted |
| **Scheduled Without Date** | Select "Scheduled" policy → Don't enter date → Save | ❌ Error: "Result release time required" |
| **Result Before End** | Set result release before test end → Save | ❌ Error: "Result release must be after end time" |

---

## 🧪 Test Suite 6: Edge Cases

### **Test 6.1: Zero Negative Marks**

**Steps:**
1. Create test with negative marks: `0`
2. Save test
3. **Verify:** Marking scheme shows `+1 / 0`
4. **Verify:** No validation errors

**Expected Result:** ✅ Zero negative marks allowed

---

### **Test 6.2: Very Small Negative Marks**

**Steps:**
1. Create test with negative marks: `0.01`
2. Save test
3. **Verify:** Stored as `-0.01`
4. **Verify:** Displays correctly in all views

**Expected Result:** ✅ Decimal precision maintained

---

### **Test 6.3: Large Numbers**

**Steps:**
1. Create test with marks per correct: `10`
2. Negative marks: `5`
3. Save test
4. **Verify:** Marking scheme shows `+10 / -5`

**Expected Result:** ✅ Large values handled

---

## 🧪 Test Suite 7: Regression Testing

**Objective:** Ensure existing functionality still works

### **Checklist:**

- [ ] **Test Creation:** Basic flow unchanged
- [ ] **Question Selection:** Still works (blueprint & bank)
- [ ] **Test Deletion:** Still functional
- [ ] **Test Actions:** Edit, Delete, View, Publish all work
- [ ] **Test Search/Filter:** Works with new tests
- [ ] **Perpetual Tests:** Still create correctly (NULL end_time)
- [ ] **Test Preview:** Shows all information correctly

---

## 📊 Test Results Template

Use this template to record test results:

```markdown
## Test Execution Report

**Date:** [Date]  
**Tester:** [Name]  
**Environment:** [Production/Staging]

### Test Suite 1: New Test Creation
- Test 1.1: ✅ PASS / ❌ FAIL - Notes: ___________
- Test 1.2: ✅ PASS / ❌ FAIL - Notes: ___________
- Test 1.3: ✅ PASS / ❌ FAIL - Notes: ___________

### Test Suite 2: Test Publishing
- Test 2.1: ✅ PASS / ❌ FAIL - Notes: ___________

### Test Suite 3: Display & List View
- Test 3.1: ✅ PASS / ❌ FAIL - Notes: ___________

### Test Suite 4: Editing Existing Tests
- Test 4.1: ✅ PASS / ❌ FAIL - Notes: ___________
- Test 4.2: ✅ PASS / ❌ FAIL - Notes: ___________

### Test Suite 5: Validation Testing
- Test 5.1: ✅ PASS / ❌ FAIL - Notes: ___________

### Test Suite 6: Edge Cases
- Test 6.1: ✅ PASS / ❌ FAIL - Notes: ___________
- Test 6.2: ✅ PASS / ❌ FAIL - Notes: ___________
- Test 6.3: ✅ PASS / ❌ FAIL - Notes: ___________

### Test Suite 7: Regression Testing
- Regression: ✅ PASS / ❌ FAIL - Notes: ___________

### Summary
**Total Tests:** 12  
**Passed:** __  
**Failed:** __  
**Pass Rate:** __%

### Issues Found
1. [Issue description] - Severity: [High/Medium/Low]
2. [Issue description] - Severity: [High/Medium/Low]
```

---

## 🐛 Bug Reporting Template

If you find bugs, report them using this format:

```markdown
## Bug Report

**Bug ID:** BUG-XXX  
**Severity:** [Critical/High/Medium/Low]  
**Component:** [Form/Display/Validation]

### Description
[Clear description of the bug]

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screenshots
[Attach screenshots if possible]

### Environment
- Browser: [Chrome/Firefox/Safari]
- Version: [Browser version]
- OS: [Windows/Mac/Linux]

### Console Errors
[Copy any console errors]
```

---

## ✅ Sign-Off Criteria

Testing is complete when:

- [ ] All test suites executed
- [ ] Pass rate ≥ 95%
- [ ] All critical bugs fixed
- [ ] Regression tests pass
- [ ] Documentation reviewed
- [ ] Ready for production use

---

## 📞 Support Contacts

**For Technical Issues:**
- Admin Panel Team: [Contact]
- Database Team: [Contact]

**For Test Failures:**
- Report bugs immediately
- Don't proceed to next suite if critical failures occur

---

**Happy Testing! 🧪**

---

**Document Version:** 1.0  
**Last Updated:** October 23, 2025  
**Status:** Ready for Testing

