-- Habilitar realtime para weight_measurements
ALTER TABLE weight_measurements REPLICA IDENTITY FULL;

-- Adicionar tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE weight_measurements;