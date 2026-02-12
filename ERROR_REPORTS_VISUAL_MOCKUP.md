# Error Reports Management - Visual Mockup

## 🎨 High-Fidelity Visual Mockup

### Page Layout Overview
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🌟 HEADER SECTION (Sticky, Gradient Background)                                │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Error Reports Management                    [🔍 Search] [🔧 Filter]        │ │
│ │ Monitor and resolve user feedback to maintain question bank quality         │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ 📊 QUALITY CONTROL DASHBOARD (Gradient Card)                                    │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ 📈 Quality Control Dashboard                                               │ │
│ │ Real-time insights into report management and resolution metrics            │ │
│ │                                                                             │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │ │
│ │ │ 🚨 New      │ │ 👁️ In Review│ │ ✅ Resolved  │ │ ⏱️ Avg Time  │         │ │
│ │ │ Reports     │ │ Reports     │ │ Reports      │ │ Resolution   │         │ │
│ │ │    5        │ │    12       │ │    47        │ │    2.3d      │         │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘         │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│ 📋 MAIN CONTENT TABS                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                           │ │
│ │ │ 🚨 New      │ │ 👁️ In Review│ │ ✅ Resolved  │                           │ │
│ │ │ Reports (5) │ │ Reports (12)│ │ Reports (47) │                           │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘                           │ │
│ │                                                                             │ │
│ │ 📄 REPORT CARDS (Expandable)                                                │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 🔴│ Question #12345                    [Wrong Question] [New] [2d ago] │ │ │
│ │ │   │ └─ Clickable link to edit question                                  │ │ │
│ │ │   │                                                                     │ │ │
│ │ │   │ 📝 The question contains incorrect information about the chemical   │ │ │
│ │ │   │    formula. The answer key shows H2O but the question asks for... │ │ │
│ │ │   │    [Show more ▼]                                                    │ │ │
│ │ │   │                                                                     │ │ │
│ │ │   │ [Expanded Content]                                                  │ │ │
│ │ │   │ ┌─────────────────────────────────────────────────────────────────┐ │ │ │
│ │ │   │ │ 📚 Question Context                                            │ │ │
│ │ │   │ │ What is the chemical formula for water?                       │ │ │
│ │ │   │ │ Source: Chemistry Basics • Chapter 3                           │ │ │
│ │ │   │ └─────────────────────────────────────────────────────────────────┘ │ │ │
│ │ │   │                                                                     │ │ │
│ │ │   │ 👤 John Doe • john@email.com                                       │ │ │
│ │ │   │ 📅 Submitted Dec 15, 2023 at 2:30 PM                              │ │ │
│ │ │   └─────────────────────────────────────────────────────────────────────┘ │ │
│ │ │                                                                             │ │
│ │ │                                    [👁️ Mark as In Review]                  │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 🟡│ Question #12346                    [Wrong Answer] [New] [1d ago]   │ │ │
│ │ │   │                                                                     │ │ │
│ │ │   │ 📝 The correct answer should be option B, not option A as shown... │ │ │
│ │ │   │    [Show more ▼]                                                    │ │ │
│ │ │   │                                                                     │ │ │
│ │ │   │                                    [👁️ Mark as In Review]          │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ 🟢│ Question #12347                    [Formatting] [New] [Today]     │ │ │
│ │ │   │                                                                     │ │ │
│ │ │   │ 📝 The mathematical equation is not properly formatted. The...     │ │ │
│ │ │   │                                                                     │ │ │
│ │ │   │                                    [👁️ Mark as In Review]          │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Priority Indicator System
```
🔴 CRITICAL PRIORITY (Red Bar)
   - Wrong Question/Answer categories
   - Reports older than 1 day
   - Requires immediate attention

🟡 HIGH PRIORITY (Orange Bar)  
   - Reports older than 3 days
   - Medium urgency

🟡 MEDIUM PRIORITY (Yellow Bar)
   - Reports older than 1 day
   - Standard processing

🟢 LOW PRIORITY (Green Bar)
   - Recent reports (today)
   - Routine processing
```

### Category Badge System
```
🔴 Wrong Question    - Red background, red text
🟠 Wrong Answer      - Orange background, orange text  
🟡 Formatting Issue  - Yellow background, yellow text
🟣 No Solution       - Purple background, purple text
🔵 Translation Issue - Blue background, blue text
⚫ Other            - Gray background, gray text
```

### Status Badge System
```
🚨 New Reports Tab:
   - Red "New" badge with pulse animation
   - Time indicators (Today, 1d ago, 2d ago, etc.)

👁️ In Review Tab:
   - Blue "In Review" badge
   - "Overdue" badge for items >3 days
   - Review duration indicators

✅ Resolved Tab:
   - Green "Resolved" badge
   - Efficiency ratings (Excellent/Good/Average/Slow)
   - Resolution timeline cards
```

### Action Button System
```
New Reports Tab:
┌─────────────────────────────────┐
│ 👁️ Mark as In Review           │
└─────────────────────────────────┘
- Blue background
- Large, prominent button
- Loading state: "Processing..."

In Review Tab:
┌─────────────────┐ ┌─────────────────┐
│ ↶ Revert to New │ │ ✅ Mark Resolved│
└─────────────────┘ └─────────────────┘
- Gray outline / Green background
- Dual action layout
- Loading states for each action

Resolved Tab:
┌─────────────────────────────────┐
│ ↶ Re-open Report               │
└─────────────────────────────────┘
- Gray outline
- Single action option
- Loading state: "Reopening..."
```

### Mobile Responsive Layout
```
📱 MOBILE VIEW (Stacked Layout)
┌─────────────────────────────────┐
│ Error Reports Management         │
│ Monitor and resolve user...      │
│ [🔍] [🔧]                       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 📈 Quality Control Dashboard    │
│ ┌─────┐ ┌─────┐                 │
│ │ 🚨  │ │ 👁️  │                 │
│ │  5  │ │ 12  │                 │
│ └─────┘ └─────┘                 │
│ ┌─────┐ ┌─────┐                 │
│ │ ✅  │ │ ⏱️  │                 │
│ │ 47  │ │2.3d │                 │
│ └─────┘ └─────┘                 │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🚨 New Reports (5)              │
│ ┌─────────────────────────────┐ │
│ │ 🔴│ Question #12345         │ │
│ │   │ [Wrong Question] [New]  │ │
│ │   │                         │ │
│ │   │ 📝 The question contains│ │
│ │   │    incorrect information│ │
│ │   │    [Show more ▼]        │ │
│ │   │                         │ │
│ │   │ [👁️ Mark as In Review]  │ │
│ │ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Animation & Interaction States
```
🎭 MICRO-INTERACTIONS

Card Hover State:
┌─────────────────────────────────┐
│ 🔴│ Question #12345            │ │ ← Subtle shadow increase
│   │ [Wrong Question] [New]     │ │
│   │                             │ │
│   │ 📝 Description text...      │ │
│   │                             │ │
│   │ [👁️ Mark as In Review]      │ │
│ └─────────────────────────────────┘

Button Loading State:
┌─────────────────────────────────┐
│ 🔴│ Question #12345            │ │
│   │ [Wrong Question] [New]     │ │
│   │                             │ │
│   │ 📝 Description text...      │ │
│   │                             │ │
│   │ [⏳ Processing...]          │ │ ← Disabled with spinner
│ └─────────────────────────────────┘

Badge Pulse Animation:
🚨 New Reports (5) ← Pulse effect for attention
```

### Color Scheme & Visual Hierarchy
```
🎨 COLOR PALETTE

Primary Colors:
- Blue: #2563eb (Primary actions, links)
- Indigo: #4f46e5 (Secondary elements)
- Purple: #7c3aed (Accent elements)

Status Colors:
- Red: #dc2626 (Critical, errors, new reports)
- Orange: #ea580c (High priority, warnings)
- Yellow: #d97706 (Medium priority, pending)
- Green: #16a34a (Success, resolved, low priority)

Neutral Colors:
- Slate 50: #f8fafc (Background)
- Slate 100: #f1f5f9 (Card backgrounds)
- Slate 600: #475569 (Secondary text)
- Slate 900: #0f172a (Primary text)

Gradient Backgrounds:
- Header: slate-50 → blue-50/30 → indigo-50/20
- Dashboard: blue-600 → indigo-600 → purple-600
- Title Text: slate-900 → blue-900 → indigo-900
```

### Typography Scale
```
📝 TYPOGRAPHY SYSTEM

Page Title: 3xl (48px) - Bold, Gradient
Section Headers: 2xl (24px) - Bold
Card Titles: lg (18px) - Semibold
Body Text: base (16px) - Regular
Caption Text: sm (14px) - Regular
Badge Text: xs (12px) - Medium

Font Weights:
- Bold: 700 (Titles, important elements)
- Semibold: 600 (Card titles, labels)
- Medium: 500 (Badges, buttons)
- Regular: 400 (Body text, descriptions)
```

### Spacing & Layout Grid
```
📐 SPACING SYSTEM (8px Grid)

Container Padding: 24px (1.5rem)
Card Padding: 24px (1.5rem)
Element Spacing: 16px (1rem)
Compact Spacing: 8px (0.5rem)
Tight Spacing: 4px (0.25rem)

Layout Breakpoints:
- Mobile: < 768px (Stacked layout)
- Tablet: 768px - 1024px (Adjusted spacing)
- Desktop: > 1024px (Full-width layout)
```

This visual mockup demonstrates the complete transformation from a cramped, table-based interface to a modern, card-based design with full information visibility, clear visual hierarchy, and professional aesthetics following Material Design 3 principles.
