import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface SendSessionRequest {
  sessionId: string;
  userIds: string[];
  sendVia: 'email' | 'whatsapp' | 'both';
  customMessage?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, userIds, sendVia, customMessage }: SendSessionRequest = await req.json();

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados da sessão
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Sessão não encontrada');
    }

    // Buscar dados dos usuários (agora com email)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone, email')
      .in('user_id', userIds);

    if (usersError) {
      throw new Error(`Erro ao buscar usuários: ${usersError.message}`);
    }

    console.log(`Enviando sessão "${session.title}" para ${users?.length || 0} usuários via ${sendVia}`);

    const results = [];

    for (const user of users || []) {
      try {
        // Criar atribuição da sessão
        const { error: assignError } = await supabase
          .from('user_sessions')
          .insert({
            session_id: sessionId,
            user_id: user.user_id,
            status: 'assigned',
            assigned_at: new Date().toISOString(),
            progress: 0
          });

        if (assignError) {
          console.error(`Erro ao atribuir sessão para ${user.full_name}:`, assignError);
        }

        let emailSent = false;
        let whatsappSent = false;

        // Enviar por email (agora reativado)
        if ((sendVia === 'email' || sendVia === 'both') && user.email) {
          try {
            await sendSessionEmail(session, user, customMessage);
            emailSent = true;
            console.log(`Email enviado para: ${user.email}`);
          } catch (error) {
            console.error(`Erro ao enviar email para ${user.email}:`, error);
          }
        }

        // Enviar por WhatsApp via n8n
        if ((sendVia === 'whatsapp' || sendVia === 'both') && user.phone) {
          try {
            await sendSessionWhatsApp(session, user, customMessage);
            whatsappSent = true;
            console.log(`WhatsApp enviado para: ${user.phone}`);
          } catch (error) {
            console.error(`Erro ao enviar WhatsApp para ${user.phone}:`, error);
          }
        }

        results.push({
          user_id: user.user_id,
          name: user.full_name,
          email_sent: emailSent,
          whatsapp_sent: whatsappSent,
          status: 'success'
        });

      } catch (error) {
        console.error(`Erro ao processar usuário ${user.full_name}:`, error);
        results.push({
          user_id: user.user_id,
          name: user.full_name,
          email_sent: false,
          whatsapp_sent: false,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Sessão enviada para ${users?.length || 0} usuários`,
      session_title: session.title,
      send_method: sendVia,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no envio de sessão:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendSessionEmail(session: any, user: any, customMessage?: string) {
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
  
  if (!resend) {
    throw new Error('RESEND_API_KEY não configurada');
  }

  const emailHTML = generateSessionEmailHTML(session, user, customMessage);

  const { error } = await resend.emails.send({
    from: 'Dr. Vita <sessoes@seudominio.com>',
    to: [user.email],
    subject: `🎯 Nova Sessão Disponível: ${session.title}`,
    html: emailHTML,
  });

  if (error) {
    throw new Error(`Erro ao enviar email: ${error.message}`);
  }
}

async function sendSessionWhatsApp(session: any, user: any, customMessage?: string) {
  // Buscar webhooks ativos do n8n
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Buscando webhooks n8n ativos...');
  
  const { data: webhooks } = await supabase
    .from('n8n_webhooks')
    .select('webhook_url')
    .eq('is_active', true);
    
  console.log('Webhooks encontrados:', webhooks);

  if (!webhooks || webhooks.length === 0) {
    throw new Error('Nenhum webhook n8n ativo encontrado para envio de sessões');
  }

  const whatsappMessage = generateSessionWhatsAppMessage(session, user, customMessage);

  // Enviar para todos os webhooks ativos
  for (const webhook of webhooks) {
    console.log(`Enviando para webhook: ${webhook.webhook_url}`);
    
    const payload = {
      event_type: 'session_assignment',
      user: {
        id: user.user_id,
        name: user.full_name,
        phone: user.phone
      },
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        estimated_time: session.estimated_time
      },
      message: whatsappMessage,
      timestamp: new Date().toISOString()
    };
    
    console.log('Payload enviado:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(webhook.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log(`Resposta do webhook: ${response.status} - ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro no webhook: ${errorText}`);
      throw new Error(`Erro na resposta do webhook n8n: ${response.status} - ${errorText}`);
    }
    
    console.log('Webhook enviado com sucesso!');
  }

  // Registrar no log
  await supabase
    .from('n8n_webhook_logs')
    .insert({
      user_id: user.user_id,
      webhook_id: crypto.randomUUID(),
      event_type: 'session_assignment',
      payload: {
        session_id: session.id,
        user_phone: user.phone,
        message_preview: whatsappMessage.substring(0, 100)
      },
      status: 'sent'
    });
}

function generateSessionEmailHTML(session: any, user: any, customMessage?: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Sessão - Dr. Vita</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 40px 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .content {
            padding: 40px;
        }
        .session-card {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin: 20px 0;
            border-left: 5px solid #667eea;
        }
        .session-title {
            color: #667eea;
            font-size: 1.8em;
            font-weight: 600;
            margin-bottom: 15px;
        }
        .session-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .meta-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .meta-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #667eea;
        }
        .meta-label {
            color: #666;
            font-size: 0.9em;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            background: #2d3436;
            color: white;
            text-align: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Dr. Vita</h1>
            <p>Nova Sessão Disponível</p>
        </div>

        <div class="content">
            <h2>Olá, ${user.full_name}!</h2>
            
            ${customMessage ? `<div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <h3 style="margin: 0 0 10px 0; color: #1976d2;">Mensagem Personalizada</h3>
                <p style="margin: 0;">${customMessage}</p>
            </div>` : ''}

            <div class="session-card">
                <div class="session-title">${session.title}</div>
                <p>${session.description}</p>
                
                <div class="session-meta">
                    <div class="meta-item">
                        <div class="meta-value">${session.estimated_time}min</div>
                        <div class="meta-label">Duração Estimada</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-value">${session.difficulty}</div>
                        <div class="meta-label">Dificuldade</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-value">${session.type}</div>
                        <div class="meta-label">Tipo</div>
                    </div>
                </div>

                ${session.materials_needed && session.materials_needed.length > 0 ? `
                <div style="margin: 20px 0;">
                    <h4>📋 Materiais Necessários:</h4>
                    <ul>
                        ${session.materials_needed.map((material: string) => `<li>${material}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" class="cta-button">🚀 Começar Sessão Agora</a>
                </div>
            </div>

            <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; text-align: center;">
                <p><strong>💡 Dica:</strong> Reserve um tempo tranquilo para realizar esta sessão e aproveite ao máximo sua jornada de desenvolvimento pessoal!</p>
            </div>
        </div>

        <div class="footer">
            <p>📱 Acesse o Dr. Vita para começar sua sessão</p>
            <p><small>Este email foi enviado automaticamente pelo sistema Dr. Vita</small></p>
        </div>
    </div>
</body>
</html>`;
}

function generateSessionWhatsAppMessage(session: any, user: any, customMessage?: string): string {
  let message = `🎯 *DR. VITA - NOVA SESSÃO*\n\n`;
  message += `Olá, ${user.full_name}! 👋\n\n`;
  
  if (customMessage) {
    message += `💬 *Mensagem Personalizada:*\n${customMessage}\n\n`;
  }
  
  message += `📚 *${session.title}*\n`;
  message += `${session.description}\n\n`;
  
  message += `⏱️ *Detalhes da Sessão:*\n`;
  message += `⏰ Duração: ${session.estimated_time} minutos\n`;
  message += `📊 Dificuldade: ${session.difficulty}\n`;
  message += `🎨 Tipo: ${session.type}\n\n`;
  
  if (session.materials_needed && session.materials_needed.length > 0) {
    message += `📋 *Materiais Necessários:*\n`;
    session.materials_needed.forEach((material: string) => {
      message += `• ${material}\n`;
    });
    message += `\n`;
  }
  
  message += `💡 *Dica:* Reserve um momento tranquilo para realizar esta sessão e aproveite ao máximo sua jornada de desenvolvimento pessoal!\n\n`;
  message += `📱 Acesse o app Dr. Vita para começar sua sessão agora mesmo!`;
  
  return message;
}