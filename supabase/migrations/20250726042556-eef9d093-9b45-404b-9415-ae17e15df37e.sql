-- Remover o cron job anterior se existir
SELECT cron.unschedule('weekly-email-reports');

-- Criar novo cron job para enviar relatórios semanais toda sexta-feira às 10:00
SELECT cron.schedule(
  'weekly-email-reports',
  '0 10 * * 5', -- Sexta-feira às 10:00
  $$
  SELECT
    net.http_post(
        url:='https://vzatfuakmidogfhzqzxp.supabase.co/functions/v1/send-weekly-email-report',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YXRmdWFrbWlkb2dmaHpxenhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MjEwNzMsImV4cCI6MjA1MDE5NzA3M30.2hndfvNDRJN6LgAvZQXOLiF7EhHaIr-f_UOT3zjVCas"}'::jsonb,
        body:='{"triggerType": "automatic_weekly"}'::jsonb
    ) as request_id;
  $$
);