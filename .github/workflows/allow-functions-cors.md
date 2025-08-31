Para erros de CORS nas Edge Functions (preflight bloqueado), confira:

- As funções devem responder OPTIONS com os cabeçalhos:
  - Access-Control-Allow-Origin: *
  - Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type, Authorization, X-Client-Info, Content-Type
  - Access-Control-Allow-Methods: POST, OPTIONS

Já aplicado em `supabase/functions/finalize-medical-document/index.ts`.


