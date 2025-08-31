-- Corrigir tipo da coluna gordura_visceral para aceitar valores decimais
ALTER TABLE weight_measurements 
ALTER COLUMN gordura_visceral TYPE NUMERIC(4,2);