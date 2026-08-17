/// <reference types="astro/client" />

declare module 'cloudflare:workers' {
  export const env: {
    SUPABASE_URL?: string;
    SUPABASE_PUBLISHABLE_KEY?: string;
    // Bypasses RLS. Required by /api/handle-check to read
    // forbidden_handle_patterns. Worker secret only — never expose to
    // the client.
    SUPABASE_SERVICE_ROLE_KEY?: string;
  };
}
