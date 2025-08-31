-- Criar perfil de teste para o usuário atual
INSERT INTO profiles (user_id, full_name, email) VALUES 
('82c33d8a-60fe-4e10-9e0e-679125e0fc08', 'Fernando Dias', 'lu@gmail.com')
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email;

-- Verificar se o perfil foi criado
SELECT * FROM profiles WHERE user_id = '82c33d8a-60fe-4e10-9e0e-679125e0fc08';