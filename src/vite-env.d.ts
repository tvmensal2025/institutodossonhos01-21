/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GITHUB_REPO_URL: string
  readonly VITE_GITHUB_REPO_NAME: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENVIRONMENT: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_ENABLE_NOTIFICATIONS: string
  readonly VITE_APP_URL: string
  readonly VITE_SOFIA_DETERMINISTIC_ONLY: string
  readonly VITE_SOFIA_USE_GPT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
