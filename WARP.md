# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

AdminPanel-IEPE is a sophisticated admin panel built with Next.js 15, designed for educational content management. It features an advanced question bank system, mock test creation, book management, and student administration capabilities.

### Technology Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **UI Framework**: Tailwind CSS v4, Shadcn UI (New York variant), Radix UI primitives
- **Rich Text Editing**: TipTap editor with extensive extensions for LaTeX, tables, and multimedia
- **Code Editing**: CodeMirror 6 with multi-language support
- **Authentication**: Supabase Auth with protected routes
- **State Management**: Zustand for global state, React Query for server state
- **Database**: Supabase (PostgreSQL)
- **File Management**: Cloudinary integration for media assets
- **PDF Generation**: React PDF renderer with Puppeteer
- **Data Processing**: Papa Parse for CSV handling

## Essential Commands

### Development
```bash
# Start development server with Turbopack (faster builds)
npm run dev

# Production build with Turbopack
npm run build

# Start production server
npm start

# Lint code using ESLint
npm run lint
```

### Testing & Debugging
```bash
# Run individual test pages (available routes):
# /test-editor - CodeMirror editor testing
# /editor-demo - TipTap editor demonstration
# /advanced-editor-demo - Advanced TipTap features
# /debug-line-break - LaTeX line break debugging
# /latex-line-break-test - LaTeX rendering tests
# /toolbar-refinements-test - Editor toolbar testing
# /bug-fixes-test - General bug testing page
```

## Project Architecture

### App Structure
The application follows Next.js 15 App Router conventions with a sophisticated component hierarchy:

**Core Layout System:**
- `MainLayout` - Provides mobile-responsive sidebar and header
- `ProtectedRoute` - Handles authentication and role-based access
- `AuthProvider` - Manages Supabase authentication state
- `QueryProvider` - Wraps TanStack Query for server state management

**Key Features:**
- **Content Management** (`/content`) - Advanced question bank with rich text editing, LaTeX support, and bulk import capabilities
- **Book Manager** (`/books`) - Library management with Cloudinary integration
- **Mock Tests** (`/tests`) - Test creation with blueprint-based generation
- **Student Management** (`/students`) - User administration and analytics
- **Dashboard** - Real-time system monitoring with iOS-inspired UI

### State Management Pattern
- **Global UI State**: Zustand stores (`filterStore.ts`) for cross-component state
- **Server State**: React Query for API calls and caching
- **Local State**: React hooks with custom abstractions (`useDebounce`, `useQuestionsData`, `useFilterSync`)

### Component Organization
```
src/components/
├── auth/           # Authentication components
├── layout/         # Layout components (Sidebar, Header, MainLayout)
├── dashboard/      # Dashboard-specific components
├── content/        # Content management UI
├── books/          # Book management components
├── ui/             # Shadcn UI components
└── editors/        # Rich text and code editors
```

### Type System
Comprehensive TypeScript types in `src/lib/types.ts`:
- `Question` - Core question data structure with LaTeX support
- `TestBlueprint` - Test generation configuration
- `PDFCustomizationSettings` - PDF export options
- `UIQuestion` - Enhanced question type with UI state

### Mobile-First Design
The application implements a sophisticated mobile-responsive system:
- `MobileProvider` context for responsive state management
- iOS-inspired design patterns with custom CSS classes
- Collapsible sidebar with gesture support
- Touch-optimized interfaces

## Development Workflows

### Adding New Questions
1. Navigate to `/content` for the main management interface
2. Use `/content/new` for quick question creation
3. Bulk import via CSV/JSONL files with validation
4. Rich text editor supports LaTeX, tables, images, and multimedia

### Creating Mock Tests
1. Access `/tests` for test management
2. Use blueprint-based generation for automated test creation
3. Custom question selection with chapter-wise organization
4. PDF export with customizable branding and layouts

### Editor Development
When working with the rich text editors:
- TipTap extensions are configured in editor components
- LaTeX rendering uses KaTeX with custom styling
- CodeMirror supports multiple programming languages
- Use debug routes (`/debug-*`) for testing specific features

### Database Schema
Questions follow a structured schema:
- `question_text` supports HTML with LaTeX expressions
- `options` stored as JSON object for multiple choice
- `admin_tags` array for categorization
- `difficulty` enum with 5-level granularity

### Authentication Flow
- Supabase handles user authentication
- `ProtectedRoute` component enforces access control
- User profiles cached for performance
- Automatic token refresh and session management

## Key Patterns

### Error Handling
- Comprehensive error reporting system with notifications
- Toast notifications via Sonner for user feedback
- Error boundary components for graceful degradation

### Performance Optimizations
- Turbopack for faster development builds
- React Query for intelligent caching
- Dynamic imports for code splitting
- Image optimization via Cloudinary

### Content Processing
- CSV/JSONL parsing with Papa Parse
- LaTeX expression validation and rendering
- HTML sanitization with DOMPurify
- Markdown processing for content import

## Environment Requirements

### Required Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Optional Environment Variables
```bash
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud>
CLOUDINARY_API_KEY=<cloudinary-key>
CLOUDINARY_API_SECRET=<cloudinary-secret>
```

## Common Tasks

### Running Single Tests
Use test routes for isolated feature testing:
- `/latex-line-break-test` - LaTeX rendering issues
- `/toolbar-refinements-test` - Editor toolbar functionality
- `/bug-fixes-test` - General debugging interface

### Content Import
1. Prepare CSV/JSONL files with required columns
2. Use bulk import interface in Content Management
3. Validate data before batch processing
4. Monitor import progress via notifications

### PDF Generation
- Tests export to PDF with custom branding
- Uses Puppeteer for server-side rendering
- Supports custom headers, footers, and watermarks
- LaTeX expressions rendered in PDFs

### Mobile Testing
- Use responsive design breakpoints
- Test sidebar collapse functionality
- Verify touch interactions
- Check iOS-specific styling patterns

This admin panel represents a mature educational technology platform with sophisticated content management, test creation, and user administration capabilities. The codebase emphasizes type safety, mobile responsiveness, and rich text editing features.