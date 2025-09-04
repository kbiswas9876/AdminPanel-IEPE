// /lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// Define a function to create a Supabase client for client-side operations
export function createClient() {
  // Pass Supabase URL and anonymous key to the client
  return createBrowserClient(
    // The exclamation mark (!) asserts that the value is not null or undefined.
    // This is safe because Next.js ensures these env vars are available on the client.
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
