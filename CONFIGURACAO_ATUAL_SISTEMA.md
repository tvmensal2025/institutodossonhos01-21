# CONFIGURAÇÃO ATUAL DO SISTEMA DR. VITAL

## ⚠️ IMPORTANTE: NÃO ALTERAR ESTRUTURA

### 1. ESTRUTURA DO BANCO DE DADOS

#### Tabela `medical_documents`:
```sql
CREATE TABLE IF NOT EXISTS medical_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('exame_laboratorial', 'exame_imagem', 'relatorio_medico', 'prescricao', 'historico_clinico', 'certificado_medico')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  description TEXT,
  doctor_name TEXT,
  clinic_name TEXT,
  exam_date TEXT,
  results TEXT,
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'alterado', 'critico', 'pendente')),
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'ready', 'error')),
  report_path TEXT,
  report_meta JSONB DEFAULT '{}'::jsonb,
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_stage TEXT,
  progress_pct INTEGER,
  images_total INTEGER,
  images_processed INTEGER,
  estimated_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**IMPORTANTE**: A coluna é `type` (NÃO `exam_type`)

### 2. CONFIGURAÇÃO DO STORAGE

#### Bucket `medical-documents`:
- **Público**: true
- **Tamanho máximo**: 50MB
- **Tipos permitidos**: image/jpeg, image/png, image/gif, image/webp, application/pdf

#### Políticas RLS (NÃO ALTERAR):
```sql
-- Políticas públicas para evitar problemas de upload
CREATE POLICY "medical_docs_public_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'medical-documents');

CREATE POLICY "medical_docs_public_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'medical-documents');

CREATE POLICY "medical_docs_public_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'medical-documents');

CREATE POLICY "medical_docs_public_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'medical-documents');
```

### 3. FUNÇÕES EDGE (NÃO ALTERAR ESTRUTURA)

#### `finalize-medical-document`:
- **Coluna**: `type` (NÃO `exam_type`)
- **Service Role**: Para operações de banco e storage
- **Aceita**: `userId` no corpo da requisição
- **Caminhos**: `tmp/<userId>/...` → `<userId>/<docId>/...`

#### `analyze-medical-exam`:
- **Modelo**: `gpt-5`
- **Tokens**: 8000
- **Temperature**: 0.05
- **Timeout**: 30s por imagem
- **Tratamento de erro**: Continua mesmo com falhas em imagens individuais

### 4. FRONTEND (NÃO ALTERAR)

#### Upload:
- **Método**: Upload direto para Supabase Storage
- **Caminho**: `tmp/${user.id}/${crypto.randomUUID()}.${fileExt}`
- **Sem conversão base64**

#### Finalização:
- **Função**: `finalize-medical-document`
- **Parâmetros**: `tmpPaths`, `title`, `examType`, `userId`
- **Coluna**: `type` (NÃO `exam_type`)

### 5. CONFIGURAÇÕES CORS (NÃO ALTERAR)

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type, Range',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
};
```

### 6. CHAVES DE API (NÃO ALTERAR)

#### Supabase:
- **URL**: `https://hlrkoyywjpckdotimtik.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI`

### 7. ESTRUTURA DE CAMINHOS (NÃO ALTERAR)

#### Upload temporário:
```
tmp/{userId}/{uuid}.{ext}
```

#### Caminho final:
```
{userId}/{docId}/{index}-{filename}
```

### 8. TRATAMENTO DE ERROS (NÃO ALTERAR)

#### Download de imagens:
- **Timeout**: 30s por imagem
- **Continue on error**: Sim
- **Logs detalhados**: Sim
- **Fallback**: Usa caminho original se falhar

#### Análise GPT-5:
- **Retry**: Não implementado (manter assim)
- **Fallback**: Não implementado (manter assim)

### 9. BOTÕES DE CONTROLE (NÃO ALTERAR)

#### Interface:
- **"Ver agora"**: Refresh do documento
- **"🔄 Reiniciar"**: Force restart da análise
- **Logs**: Console do navegador

### 10. COMANDOS DE DEPLOY (NÃO ALTERAR)

```bash
# Deploy das funções
npx supabase functions deploy finalize-medical-document --project-ref hlrkoyywjpckdotimtik
npx supabase functions deploy analyze-medical-exam --project-ref hlrkoyywjpckdotimtik

# Aplicar políticas RLS (se necessário)
# Executar fix-storage-rls-public.sql no Console SQL do Supabase
```

---

## ⚠️ REGRAS IMPORTANTES:

1. **NUNCA** altere a estrutura do banco
2. **NUNCA** mude o nome da coluna `type` para `exam_type`
3. **NUNCA** altere as políticas RLS do storage
4. **NUNCA** mude o método de upload direto
5. **NUNCA** altere o timeout de 30s
6. **NUNCA** remova o tratamento de erro resiliente
7. **SEMPRE** use GPT-5 para análise
8. **SEMPRE** mantenha os logs detalhados

## 🔧 EM CASO DE PROBLEMAS:

1. Verificar logs no console do navegador
2. Usar botão "🔄 Reiniciar" para documentos travados
3. Verificar se políticas RLS estão aplicadas
4. Confirmar se coluna é `type` (não `exam_type`)
5. Verificar se caminhos seguem padrão `tmp/{userId}/...`
