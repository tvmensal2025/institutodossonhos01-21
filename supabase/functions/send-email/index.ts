import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface EmailRequest {
  to: string;
  subject: string;
  message?: string;
  html?: string;
  name?: string;
  type?: string;
  button_label?: string;
  button_url?: string;
  logo_url?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, message, html, name, type = 'general', button_label, button_url, logo_url }: EmailRequest = await req.json();

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY deve estar configurado');
    }

    const logo = logo_url || 'http://45.67.221.216:8086/logoids.png';
    const baseTemplate = (bodyHtml: string) => `
      <div style="background:#f6f7fb;padding:24px">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #eee;display:flex;align-items:center;gap:12px">
              <img src="${logo}" width="120" alt="Instituto dos Sonhos" style="display:block"/>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 24px 8px 24px;font-family:Arial,sans-serif;color:#111">
              <h2 style="margin:0 0 8px 0;font-size:20px;line-height:1.3">${subject}</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px 24px;font-family:Arial,sans-serif;color:#444;line-height:1.6">
              ${bodyHtml}
              ${button_url ? `
                <div style=\"margin-top:16px\">
                  <a href=\"${button_url}\" style=\"background:#2563eb;color:#fff;text-decoration:none;padding:12px 16px;border-radius:8px;display:inline-block;font-weight:600\" target=\"_blank\">${button_label || 'Abrir relatório'}</a>
                </div>
              ` : ''}
              ${name ? `<p style=\"color:#777;font-size:12px;margin-top:16px\">Enviado para: ${name}</p>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #eee;color:#888;font-size:12px;font-family:Arial,sans-serif">
              Este email foi enviado pela plataforma Instituto dos Sonhos.
            </td>
          </tr>
        </table>
      </div>`;

    const emailHtml = html ?? baseTemplate(`<p>${message || ''}</p>`);

    const resend = new Resend(resendApiKey);
    const emailResponse = await resend.emails.send({
      from: "Dr. Vital <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: emailHtml,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ 
      success: !emailResponse.error, 
      messageId: emailResponse.data?.id,
      message: emailResponse.error ? `Erro: ${emailResponse.error.message}` : 'Email enviado com sucesso!'
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});