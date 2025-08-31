### Environment Variables

All secrets are placeholders; never commit real values.

Frontend (Vite)

| Name | Used in | Required | Type | Example |
| --- | --- | --- | --- | --- |
| VITE_SUPABASE_URL | `src/lib/config.ts` | yes | url | `https://<PROJECT>.supabase.co` |
| VITE_SUPABASE_ANON_KEY | `src/lib/config.ts` | yes | jwt | `<ANON_KEY>` |
| VITE_SUPABASE_EDGE_URL | `src/pages/SofiaNutricionalPage.tsx` | optional | url | `https://<PROJECT>.supabase.co/functions/v1` |
| VITE_API_BASE_URL | `src/lib/config.ts` | optional | url | `http://localhost:5173` |
| VITE_OPENAI_API_KEY | `src/lib/config.ts` | optional | string | `sk-...` |
| VITE_OPENAI_BASE_URL | `src/lib/config.ts` | optional | url | `https://api.openai.com/v1` |
| VITE_OPENAI_MODEL | `src/lib/config.ts` | optional | string | `gpt-4o` |
| VITE_OPENAI_MAX_TOKENS | `src/lib/config.ts` | optional | int | `1000` |
| VITE_OPENAI_TEMPERATURE | `src/lib/config.ts` | optional | float | `0.7` |
| VITE_APP_NAME | `src/lib/config.ts` | optional | string | `Mission Health Nexus` |
| VITE_APP_VERSION | `src/lib/config.ts` | optional | string | `1.0.0` |
| VITE_APP_ENVIRONMENT | `src/lib/config.ts` | optional | enum | `development`/`staging`/`production` |
| VITE_ENABLE_ANALYTICS | `src/lib/config.ts` | optional | bool | `true`/`false` |
| VITE_DEBUG_MODE | `src/lib/config.ts` | optional | bool | `true`/`false` |
| VITE_ENABLE_NOTIFICATIONS | `src/lib/config.ts` | optional | bool | `true`/`false` |
| VITE_ENABLE_GPT_ASSISTANT | `src/lib/config.ts` | optional | bool | `true`/`false` |

Edge Functions (Supabase)

| Name | Functions | Required |
| --- | --- | --- |
| SUPABASE_URL | many | yes |
| SUPABASE_SERVICE_ROLE_KEY | many | yes |
| RESEND_API_KEY | `goal-notifications`, `send-email` | optional (for email) |
| SITE_URL | `goal-notifications` | optional |
| N8N_WHATSAPP_WEBHOOK | `goal-notifications`, `send-whatsapp-report` | optional |
| OPENAI_API_KEY | `sofia-image-analysis`, `gpt-chat` | optional |
| GOOGLE_AI_API_KEY | `sofia-image-analysis` | optional |
| SOFIA_GEMINI_MODEL | `sofia-image-analysis` | optional |
| SOFIA_PORTION_MODE | `sofia-image-analysis` | optional |
| SOFIA_PORTION_CONFIDENCE_MIN | `sofia-image-analysis` | optional |
| SOFIA_USE_GPT | `sofia-image-analysis` | optional |
| SOFIA_STRICT_MODE | `sofia-image-analysis` | optional |
| OLLAMA_PROXY_URL | `sofia-image-analysis` | optional |
| YOLO_ENABLED | `sofia-image-analysis` | optional |
| YOLO_SERVICE_URL | `sofia-image-analysis` | optional |
| LABEL_STUDIO_ENABLED | `sofia-image-analysis` | optional |
| LABEL_STUDIO_URL | `sofia-image-analysis` | optional |
| LABEL_STUDIO_TOKEN | `sofia-image-analysis` | optional |
| LABEL_STUDIO_PROJECT_ID | `sofia-image-analysis` | optional |
| GOOGLE_FIT_CLIENT_ID | `google-fit-*` | yes for Google Fit |
| GOOGLE_FIT_CLIENT_SECRET | `google-fit-*` | yes for Google Fit |
| MEALIE_BASE_URL | `generate-meal-plan` | optional |
| MEALIE_API_TOKEN | `generate-meal-plan` | optional |

.env.example

```bash
# Frontend
VITE_SUPABASE_URL=https://<PROJECT>.supabase.co
VITE_SUPABASE_ANON_KEY=<ANON_PUBLIC_KEY>
VITE_SUPABASE_EDGE_URL=https://<PROJECT>.supabase.co/functions/v1
VITE_API_BASE_URL=http://localhost:5173
VITE_APP_NAME=Mission Health Nexus
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_GPT_ASSISTANT=false

# Optional providers
VITE_OPENAI_API_KEY=
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
VITE_OPENAI_MODEL=gpt-4o
VITE_OPENAI_MAX_TOKENS=1000
VITE_OPENAI_TEMPERATURE=0.7
```

