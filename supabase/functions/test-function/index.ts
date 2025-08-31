import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuração de CORS (permite requisições do frontend)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

// Interface para os dados que vamos receber
interface RequestData {
  name?: string
  message?: string
  testMode?: boolean
}

// Função principal da Edge Function
serve(async (req) => {
  // 1. Tratar requisições OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Método não permitido. Use POST.'
      }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Ler dados da requisição
    const body: RequestData = await req.json()
    const { name, message, testMode } = body

    console.log('📥 Dados recebidos:', { name, message, testMode })

    // 4. Conectar ao Supabase (opcional)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    let supabase = null
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey)
      console.log('✅ Conectado ao Supabase')
    }

    // 5. Lógica da função
    let result = {
      success: true,
      message: 'Função executada com sucesso!',
      timestamp: new Date().toISOString(),
      data: {
        name: name || 'Usuário',
        message: message || 'Olá do Edge Function!',
        testMode: testMode || false
      }
    }

    // 6. Exemplo: Acessar banco de dados (se conectado)
    if (supabase) {
      try {
        // Exemplo: buscar configurações de IA
        const { data: configs, error } = await supabase
          .from('ai_configurations')
          .select('functionality, model, max_tokens')
          .limit(3)

        if (!error && configs) {
          result.data.configurations = configs
          console.log('📊 Configurações carregadas:', configs.length)
        }
      } catch (dbError) {
        console.error('❌ Erro ao acessar banco:', dbError)
        result.data.dbError = 'Erro ao acessar banco de dados'
      }
    }

    // 7. Retornar resposta
    console.log('📤 Enviando resposta:', result)
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    // 8. Tratamento de erros
    console.error('💥 Erro na função:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erro interno da função'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 