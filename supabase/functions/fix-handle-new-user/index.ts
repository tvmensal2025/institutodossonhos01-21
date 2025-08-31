import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Corrigir função handle_new_user
    const { error } = await supabaseClient.rpc('sql', {
      query: `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SECURITY DEFINER SET search_path = ''
        AS $$
        BEGIN
          INSERT INTO public.profiles (
            id, 
            full_name, 
            email,
            avatar_url,
            phone,
            birth_date,
            gender,
            city,
            state,
            height,
            bio,
            goals,
            achievements
          )
          VALUES (
            NEW.id,
            NEW.raw_user_meta_data ->> 'full_name',
            NEW.email,
            NEW.raw_user_meta_data ->> 'avatar_url',
            NEW.raw_user_meta_data ->> 'phone',
            (NEW.raw_user_meta_data ->> 'birth_date')::DATE,
            NEW.raw_user_meta_data ->> 'gender',
            NEW.raw_user_meta_data ->> 'city',
            NEW.raw_user_meta_data ->> 'state',
            (NEW.raw_user_meta_data ->> 'height')::DECIMAL,
            COALESCE(NEW.raw_user_meta_data ->> 'bio', 'Transformando minha vida através da saúde e bem-estar.'),
            COALESCE(
              CASE 
                WHEN NEW.raw_user_meta_data ? 'goals' THEN 
                  ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'goals'))
                ELSE ARRAY['Perder peso', 'Melhorar condicionamento', 'Adotar hábitos saudáveis']
              END
            ),
            COALESCE(
              CASE 
                WHEN NEW.raw_user_meta_data ? 'achievements' THEN 
                  ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'achievements'))
                ELSE ARRAY['Primeira semana completa', 'Primeira pesagem registrada']
              END
            )
          );
          RETURN NEW;
        END;
        $$;
      `
    })

    if (error) {
      console.error('Erro ao corrigir função:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Função handle_new_user corrigida com sucesso!',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
