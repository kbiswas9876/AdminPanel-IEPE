# Admin Panel

A secure admin panel built with Next.js 14, Tailwind CSS, Shadcn UI, and Supabase authentication.

## Features

- ✅ Next.js 14 with App Router
- ✅ Tailwind CSS for styling
- ✅ Shadcn UI components
- ✅ Supabase authentication
- ✅ Protected routes
- ✅ Professional layout with sidebar and header
- ✅ Login/logout functionality
- ✅ Responsive design

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   The `.env.local` file has been created with your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Authentication Setup

Before you can log in, you need to create an admin user in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Click "Add user" and create an admin account
4. Use these credentials to log into the admin panel

## Project Structure

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── layout.tsx            # Root layout with AuthProvider
│   └── page.tsx              # Dashboard (protected)
├── components/
│   ├── auth/
│   │   └── protected-route.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── main-layout.tsx
│   │   └── sidebar.tsx
│   └── ui/                   # Shadcn UI components
└── lib/
    ├── auth.tsx              # Authentication context
    ├── supabase.ts           # Supabase client
    └── utils.ts              # Utility functions
```

## How to Test

1. **Start the server:** `npm run dev`
2. **Access the app:** Go to http://localhost:3000
3. **You should be redirected to:** http://localhost:3000/login
4. **Create a user in Supabase** (if you haven't already)
5. **Log in** with your credentials
6. **You should see:** The dashboard with a logout button
7. **Test logout:** Click logout to return to login page

## Security Features

- Protected routes that redirect unauthenticated users
- Secure Supabase authentication
- Service role key for admin operations
- Environment variables for sensitive data

## Next Steps

This foundation is ready for adding:
- User management
- Content management
- Data tables
- Forms for CRUD operations
- Additional admin features

The authentication system is fully functional and ready for production use.