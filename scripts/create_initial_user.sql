-- Script para criar um usuário inicial no banco de dados
-- Execute este script no pgAdmin após criar o banco de dados e as tabelas

-- Verificar se o usuário já existe
DO $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'admin@example.com') INTO user_exists;
    
    IF NOT user_exists THEN
        -- Inserir o usuário admin (senha: admin123)
        -- A senha já está com hash bcrypt
        INSERT INTO users (id, email, encrypted_password, role, created_at, updated_at)
        VALUES (
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- UUID fixo para facilitar
            'admin@example.com',
            '$2a$10$rBSGqKRKN1Yd1CwTrWI/RuOKkB8cGCbQvAYJ4D0WJVUvX8Pw0.Mf.', -- hash de 'admin123'
            'admin',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Usuário admin criado com sucesso!';
        RAISE NOTICE 'Email: admin@example.com';
        RAISE NOTICE 'Senha: admin123';
        RAISE NOTICE 'IMPORTANTE: Altere esta senha após o primeiro login!';
    ELSE
        RAISE NOTICE 'Usuário admin já existe. Nenhuma ação necessária.';
    END IF;
END $$;
