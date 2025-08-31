-- Criar cron job para enviar relatórios semanais toda sexta-feira às 10:00
SELECT cron.schedule(
  'weekly-email-reports-friday',
  '0 10 * * 5', -- Sexta-feira às 10:00
  $$
  SELECT
    net.http_post(
        url:='https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/send-weekly-email-report',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI"}'::jsonb,
        body:='{"triggerType": "automatic_weekly"}'::jsonb
    ) as request_id;
  $$
);