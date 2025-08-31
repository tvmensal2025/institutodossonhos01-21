import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔧 Limpando e inserindo configurações de IA...')

    // Primeiro, limpar todas as configurações
    const { error: deleteError } = await supabase
      .from('ai_configurations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar tudo, exceto um ID dummy se existir
    
    if (deleteError) {
      console.error('❌ Erro ao limpar tabela:', deleteError)
    } else {
      console.log('✅ Tabela limpa')
    }

    const configurations = [
      {
        functionality: 'chat_daily',
        service_name: 'openai',
        model: 'gpt-4o',
        max_tokens: 4000,
        temperature: 0.8,
        is_active: true,
        preset_level: 'maximo'
      },
      {
        functionality: 'weekly_report',
        service_name: 'openai',
        model: 'gpt-4o',
        max_tokens: 8192,
        temperature: 0.8,
        is_active: true,
        preset_level: 'maximo'
      },
      {
        functionality: 'monthly_report',
        service_name: 'openai',
        model: 'gpt-4o',
        max_tokens: 8192,
        temperature: 0.7,
        is_active: true,
        preset_level: 'maximo'
      },
      {
        functionality: 'medical_analysis',
        service_name: 'openai',
        model: 'gpt-4o',
        max_tokens: 8192,
        temperature: 0.3,
        is_active: true,
        preset_level: 'maximo'
      },
      {
        functionality: 'preventive_analysis',
        service_name: 'openai',
        model: 'gpt-4o',
        max_tokens: 8192,
        temperature: 0.5,
        is_active: true,
        preset_level: 'maximo'
      }
    ]

    const results = []

    for (const config of configurations) {
      try {
        const { data, error } = await supabase
          .from('ai_configurations')
          .insert(config) // Changed from upsert to insert after fixing unique constraint issue

        if (error) {
          console.error(`❌ Erro ao inserir ${config.functionality}:`, error)
          results.push({ functionality: config.functionality, success: false, error: error.message })
        } else {
          console.log(`✅ Configuração ${config.functionality} inserida`)
          results.push({ functionality: config.functionality, success: true })
        }
      } catch (error) {
        console.error(`💥 Erro fatal ao inserir ${config.functionality}:`, error)
        results.push({ functionality: config.functionality, success: false, error: error.message })
      }
    }

    // Verificar configurações após inserção
    const { data: existingConfigs, error: checkError } = await supabase
      .from('ai_configurations')
      .select('functionality, service_name, model, max_tokens')

    if (checkError) {
      console.error('❌ Erro ao verificar configurações:', checkError)
    } else {
      console.log('📊 Configurações após inserção:', existingConfigs)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Configurações de IA processadas',
        results,
        existingConfigs: existingConfigs || []
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('💥 Erro fatal:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}) 