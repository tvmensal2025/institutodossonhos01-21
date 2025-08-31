-- Atualizar o usuário atual para admin para que possa criar sessões
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = 'af81cf7a-3251-41f9-b3c2-3ecfe48a7cd7';