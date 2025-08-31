-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Agendar relatório semanal para todos os domingos às 8h da manhã
SELECT cron.schedule(
    'weekly-health-reports',
    '0 8 * * 0', -- Domingo às 8h00 (formato: minuto hora * * dia_da_semana)
    $$
    SELECT
      net.http_post(
          url:='https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/weekly-health-report',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI"}'::jsonb,
          body:='{"type": "weekly_report", "timestamp": "' || now() || '"}'::jsonb
      ) as request_id;
    $$
);

-- Verificar se o cron job foi criado
SELECT * FROM cron.job;