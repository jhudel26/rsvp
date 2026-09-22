import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    if (typeof window !== 'undefined') {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    // Return a dummy client for SSR/build time
    return createBrowserClient<Database>("https://placeholder.supabase.co", "placeholder-key");
  }
  
  return createBrowserClient<Database>(url, key);
}
