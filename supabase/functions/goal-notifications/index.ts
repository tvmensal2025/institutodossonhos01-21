import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'email' | 'whatsapp';
  recipient?: string; // opcional: pode ser resolvido por recipientUserId
  recipientUserId?: string; // permite lookup server-side (bypass RLS)
  goalData: any;
  template: 'goal_approved' | 'goal_invite';
  senderName?: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, recipient, recipientUserId, goalData, template, senderName }: NotificationRequest = await req.json();

    // Resolver contato no servidor, usando SERVICE ROLE (bypass RLS)
    let resolvedRecipient = recipient;
    let resolvedPhone: string | undefined;

    if ((!resolvedRecipient || type === 'whatsapp') && recipientUserId) {
      // Tentar profiles primeiro
      const { data: prof } = await supabase
        .from('profiles')
        .select('email, phone')
        .eq('user_id', recipientUserId)
        .maybeSingle();

      if (type === 'email') {
        resolvedRecipient = resolvedRecipient || prof?.email || undefined;
        // fallback para auth.admin
        if (!resolvedRecipient && recipientUserId) {
          try {
            const { data: userAdmin } = await supabase.auth.admin.getUserById(recipientUserId);
            resolvedRecipient = userAdmin?.user?.email ?? undefined;
          } catch (_) {
            // ignore
          }
        }
      } else if (type === 'whatsapp') {
        resolvedPhone = prof?.phone || undefined;
      }
    }

    if (type === 'email' && resolvedRecipient) {
      await sendEmailNotification(resolvedRecipient, goalData, template, senderName);
    } else if (type === 'whatsapp' && (resolvedRecipient || resolvedPhone)) {
      await sendWhatsAppNotification(resolvedPhone || resolvedRecipient!, goalData, template, senderName);
    } else {
      // Nada resolvido; retornar 202 aceito mas sem envio
      return new Response(JSON.stringify({ success: false, reason: 'recipient_not_resolved' }), {
        status: 202,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in goal-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function sendEmailNotification(email: string, goalData: any, template: string, senderName?: string) {
  let subject = "";
  let html = "";

  if (template === 'goal_approved') {
    subject = "🎉 Sua meta foi aprovada!";
    html = `
      <h1>Parabéns! Sua meta foi aprovada!</h1>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2>${goalData.title}</h2>
        <p><strong>Meta:</strong> ${goalData.target_value} ${goalData.unit}</p>
        <p><strong>Pontos conquistados:</strong> ${goalData.final_points} pts</p>
        ${goalData.admin_notes ? `<p><strong>Comentários do admin:</strong> ${goalData.admin_notes}</p>` : ''}
      </div>
      <p>Agora você pode começar a trabalhar em sua meta! Acesse o sistema para acompanhar seu progresso.</p>
      <a href="${Deno.env.get('SITE_URL') || 'https://your-app.com'}/goals" 
         style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Ver Minha Meta
      </a>
    `;
  } else if (template === 'goal_invite') {
    subject = `🎯 ${senderName} te convidou para acompanhar uma meta`;
    html = `
      <h1>Você foi convidado para acompanhar uma meta!</h1>
      <p><strong>${senderName}</strong> te convidou para acompanhar a seguinte meta:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2>${goalData.title}</h2>
        <p>${goalData.description}</p>
        <p><strong>Meta:</strong> ${goalData.target_value} ${goalData.unit}</p>
      </div>
      <p>Junte-se à plataforma para apoiar ${senderName} e criar suas próprias metas!</p>
      <a href="${Deno.env.get('SITE_URL') || 'https://your-app.com'}/auth" 
         style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Participar da Plataforma
      </a>
    `;
  }

  await resend.emails.send({
    from: "Health Nexus <noreply@resend.dev>",
    to: [email],
    subject,
    html,
  });
}

async function sendWhatsAppNotification(phone: string, goalData: any, template: string, senderName?: string) {
  // Implementar integração com API do WhatsApp (ex: Twilio, N8N webhook)
  let message = "";

  if (template === 'goal_approved') {
    message = `🎉 *Sua meta foi aprovada!*\n\n*${goalData.title}*\nMeta: ${goalData.target_value} ${goalData.unit}\nPontos: ${goalData.final_points} pts\n\nAcesse: ${Deno.env.get('SITE_URL') || 'https://your-app.com'}/goals`;
  } else if (template === 'goal_invite') {
    message = `🎯 *${senderName} te convidou para uma meta!*\n\n*${goalData.title}*\n${goalData.description}\n\nMeta: ${goalData.target_value} ${goalData.unit}\n\nParticipe: ${Deno.env.get('SITE_URL') || 'https://your-app.com'}/auth`;
  }

  // Aqui você pode integrar com sua API de WhatsApp preferida
  console.log(`WhatsApp para ${phone}: ${message}`);
  
  // Exemplo de webhook N8N (se configurado)
  const webhookUrl = Deno.env.get("N8N_WHATSAPP_WEBHOOK");
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        message,
        type: 'goal_notification'
      })
    });
  }
}

serve(handler);