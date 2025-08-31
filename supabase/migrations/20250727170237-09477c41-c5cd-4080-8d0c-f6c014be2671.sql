-- Criar função cron para envio automático de relatórios semanais
SELECT cron.schedule(
  'weekly-health-reports',
  '0 19 * * 5', -- Toda sexta-feira às 19:00 (0 minutos, 19 horas, qualquer dia do mês, qualquer mês, sexta-feira)
  $$
  SELECT
    net.http_post(
        url:='https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/send-weekly-email-report',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI"}'::jsonb,
        body:='{"triggerType": "automatic_weekly", "customMessage": "📧 Relatório semanal automático - Veja como foi sua semana de saúde!"}'::jsonb
    ) as request_id;
  $$
);