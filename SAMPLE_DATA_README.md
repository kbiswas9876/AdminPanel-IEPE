# 📚 Sample Questions Dataset - Pinnacle 6800 6th Ed

This directory contains comprehensive sample data for testing the new bulk upload system with 20 questions from different chapters of the Pinnacle 6800 6th Ed book.

## 📁 Files Included

### 1. `sample_questions_pinnacle_6800.jsonl`
- **Format**: JSONL (JSON Lines) - **Recommended for testing**
- **Content**: 20 questions in newline-delimited JSON format
- **Benefits**: LaTeX-safe, efficient parsing, streaming support

### 2. `sample_questions_pinnacle_6800.csv`
- **Format**: CSV (Comma Separated Values) - **Legacy format**
- **Content**: Same 20 questions in CSV format
- **Benefits**: Familiar format, Excel-compatible

## 📖 Chapter Coverage

The sample dataset covers **10 different chapters** with **2 questions each**:

| Chapter | Questions | Topics Covered |
|---------|-----------|----------------|
| **Percentage** | 2 | Basic percentage calculations, price changes |
| **Profit & Loss** | 2 | Profit calculations, marked price, discounts |
| **Simple Interest** | 2 | Interest calculations, rate finding |
| **Compound Interest** | 2 | Annual compounding, CI vs SI difference |
| **Time and Work** | 2 | Working together, pipe and cistern problems |
| **Time, Speed and Distance** | 2 | Train problems, relative speed, overtaking |
| **Ratio and Proportion** | 2 | Age problems, equal ratios |
| **Average** | 2 | Exclusion/inclusion of numbers |
| **Number System** | 2 | Remainders, arithmetic progressions |
| **Geometry** | 2 | Right triangles, circle sectors |

## 🧮 LaTeX Content Examples

The dataset includes various LaTeX mathematical expressions:

### Basic LaTeX:
- `$20\%$ of $100$` - Percentage symbols
- `$\dfrac{20}{100}\times 100$` - Fractions and multiplication
- `$2^6 \equiv 1 \pmod{7}$` - Exponents and modular arithmetic

### Complex LaTeX:
- `$\dfrac{1}{6} \times \pi \times 49 = \dfrac{49\pi}{6}$` - Mixed fractions and pi
- `$A = P(1 + \dfrac{R}{100})^n$` - Compound interest formula
- `$\dfrac{13}{2}(10 + 94) = \dfrac{13 \times 104}{2}$` - Arithmetic progression

## 🎯 Testing Scenarios

### 1. **JSONL Format Testing**
```bash
# Upload the JSONL file to test:
# - LaTeX preservation
# - Streaming parsing
# - Auto-ID generation
# - Batch upload performance
```

### 2. **CSV Format Testing**
```bash
# Upload the CSV file to test:
# - LaTeX sanitization
# - CSV parsing with quotes
# - Error handling
# - Legacy compatibility
```

### 3. **Validation Testing**
- **Required Fields**: All questions have complete data
- **Data Types**: Proper number/string/object types
- **LaTeX Safety**: Complex mathematical expressions
- **Options Validation**: Correct option exists in options

## 🚀 How to Test

### Step 1: Access the New Upload System
1. Navigate to `http://localhost:3000/content`
2. Click on the **"Advanced Import"** tab
3. You'll see the new drag-and-drop interface

### Step 2: Test JSONL Upload (Recommended)
1. Drag and drop `sample_questions_pinnacle_6800.jsonl`
2. Observe the parsing results and preview
3. Click "Upload 20 Questions"
4. Monitor the progress bar and batch processing

### Step 3: Test CSV Upload (Legacy)
1. Drag and drop `sample_questions_pinnacle_6800.csv`
2. Compare parsing results with JSONL version
3. Verify LaTeX sanitization is working
4. Upload and compare performance

### Step 4: Verify Results
1. Check that all 20 questions are uploaded
2. Verify LaTeX rendering in the question explorer
3. Confirm auto-generated question IDs
4. Test filtering by different chapters

## 📊 Expected Results

### Parsing Results:
- **Total Rows**: 20
- **Valid Questions**: 20
- **Errors**: 0
- **Success Rate**: 100%

### Upload Results:
- **Total Processed**: 20
- **Successfully Inserted**: 20
- **Errors**: 0
- **Duration**: ~2-5 seconds

### Generated Question IDs:
- Format: `PINNACLE_6800_6TH_ED_CHAPTER_NAME_QUESTION_NUMBER`
- Examples:
  - `PINNACLE_6800_6TH_ED_PERCENTAGE_1`
  - `PINNACLE_6800_6TH_ED_PROFIT_LOSS_1`
  - `PINNACLE_6800_6TH_ED_GEOMETRY_2`

## 🔍 Quality Assurance

### LaTeX Rendering Test:
After upload, verify these LaTeX expressions render correctly:
- Fractions: `$\dfrac{20}{100}$`
- Percentages: `$20\%$`
- Exponents: `$2^{100}$`
- Modular arithmetic: `$\equiv 1 \pmod{7}$`
- Greek letters: `$\pi$`
- Complex expressions: `$\dfrac{1}{6} \times \pi \times 49$`

### Data Integrity Test:
- All 10 chapters are represented
- Question numbers are sequential within chapters
- Options are properly formatted as JSON objects
- Admin tags are correctly parsed as arrays
- Exam metadata is preserved

## 🎉 Success Criteria

The bulk upload system is working correctly if:
- ✅ All 20 questions upload without errors
- ✅ LaTeX renders correctly in the UI
- ✅ Question IDs are auto-generated and unique
- ✅ All chapters are properly categorized
- ✅ Progress tracking works smoothly
- ✅ No data corruption occurs

## 📝 Notes

- **File Size**: Both files are small (~15KB) for quick testing
- **LaTeX Complexity**: Includes various mathematical expressions
- **Real-world Data**: Based on actual CAT exam patterns
- **Comprehensive Coverage**: Tests all major mathematical topics

This sample dataset provides a complete testing environment for the new bulk upload system, ensuring it handles real-world educational content with complex mathematical expressions safely and efficiently.
