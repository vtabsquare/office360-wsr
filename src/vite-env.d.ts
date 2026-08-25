/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_GMAIL_SENDER_EMAIL?: string;
  readonly VITE_DEFAULT_MANAGER_EMAIL?: string;
  readonly VITE_DEFAULT_CC_EMAILS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
