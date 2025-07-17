-- ======================================
-- ESTRUTURA DE LOGIN GOOGLE HÍBRIDO
-- ======================================

-- 1. HABILITAR EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. VERIFICAR SE TABELA USERS EXISTE
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      points INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END
$$;

-- 3. ATUALIZAR TABELA USERS PARA SUPORTAR LOGIN HÍBRIDO
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS wallet_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. ADICIONAR CONSTRAINTS UNIQUE (COM VERIFICAÇÃO)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_google_id_key') THEN
    ALTER TABLE users ADD CONSTRAINT users_google_id_key UNIQUE (google_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key') THEN
    ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_wallet_address_key') THEN
    ALTER TABLE users ADD CONSTRAINT users_wallet_address_key UNIQUE (wallet_address);
  END IF;
END
$$;

-- 5. CRIAR TABELA DE SESSÕES
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB
);

-- 6. CRIAR TABELA DE VINCULAÇÃO GOOGLE-WALLET
CREATE TABLE IF NOT EXISTS wallet_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_primary BOOLEAN DEFAULT TRUE
);

-- 7. CRIAR FUNÇÃO PARA REGISTRAR/LOGAR COM GOOGLE
CREATE OR REPLACE FUNCTION register_or_login_google(
  p_google_id TEXT,
  p_email TEXT,
  p_display_name TEXT,
  p_avatar_url TEXT
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verificar se usuário já existe
  SELECT id INTO v_user_id FROM users WHERE google_id = p_google_id;
  
  -- Se não existir, criar novo usuário
  IF v_user_id IS NULL THEN
    INSERT INTO users (
      google_id, 
      email, 
      display_name, 
      avatar_url,
      wallet_connected
    ) VALUES (
      p_google_id,
      p_email,
      p_display_name,
      p_avatar_url,
      FALSE
    ) RETURNING id INTO v_user_id;
  ELSE
    -- Atualizar informações do usuário existente
    UPDATE users SET
      email = p_email,
      display_name = p_display_name,
      avatar_url = p_avatar_url,
      last_login = NOW()
    WHERE id = v_user_id;
  END IF;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CRIAR FUNÇÃO PARA VINCULAR CARTEIRA
CREATE OR REPLACE FUNCTION link_wallet_to_user(
  p_user_id UUID,
  p_wallet_address TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN;
BEGIN
  -- Verificar se carteira já está vinculada a outro usuário
  IF EXISTS (SELECT 1 FROM users WHERE wallet_address = p_wallet_address AND id != p_user_id) THEN
    RETURN FALSE;
  END IF;
  
  -- Atualizar usuário com endereço da carteira
  UPDATE users SET
    wallet_address = p_wallet_address,
    wallet_connected = TRUE
  WHERE id = p_user_id;
  
  -- Registrar conexão
  INSERT INTO wallet_connections (
    user_id,
    wallet_address,
    is_primary
  ) VALUES (
    p_user_id,
    p_wallet_address,
    TRUE
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CRIAR FUNÇÃO PARA VERIFICAR ACESSO
CREATE OR REPLACE FUNCTION check_wallet_required_access(
  p_user_id UUID,
  p_feature TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_wallet_connected BOOLEAN;
  v_feature_requires_wallet BOOLEAN;
BEGIN
  -- Verificar se usuário tem carteira conectada
  SELECT wallet_connected INTO v_wallet_connected 
  FROM users WHERE id = p_user_id;
  
  -- Verificar se feature requer carteira
  v_feature_requires_wallet := 
    CASE p_feature
      WHEN 'games' THEN TRUE
      WHEN 'missions' THEN TRUE
      WHEN 'presale' THEN TRUE
      WHEN 'nft' THEN TRUE
      WHEN 'home' THEN FALSE
      WHEN 'learning' THEN FALSE
      WHEN 'tokenomics' THEN FALSE
      WHEN 'ranking' THEN FALSE
      ELSE FALSE
    END;
  
  -- Retornar se usuário pode acessar
  RETURN NOT v_feature_requires_wallet OR v_wallet_connected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_user_id ON wallet_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- 11. INSERIR DADOS DE EXEMPLO (APENAS SE NÃO EXISTIREM)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE google_id = '123456789') THEN
    INSERT INTO users (
      google_id, 
      email, 
      display_name, 
      avatar_url, 
      wallet_address, 
      wallet_connected,
      points
    ) VALUES 
    ('123456789', 'admin@meowtoken.com', 'Admin MEOW', 'https://i.pravatar.cc/150?img=3', 'DM5bzL1MWThBjhFVXRWzFtYKjqf5Vwhhs2jVzr68hYoV', TRUE, 1000);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM users WHERE google_id = '987654321') THEN
    INSERT INTO users (
      google_id, 
      email, 
      display_name, 
      avatar_url, 
      wallet_connected,
      points
    ) VALUES 
    ('987654321', 'user1@example.com', 'Crypto Cat', 'https://i.pravatar.cc/150?img=8', FALSE, 500);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM users WHERE google_id = '456789123') THEN
    INSERT INTO users (
      google_id, 
      email, 
      display_name, 
      avatar_url, 
      wallet_address, 
      wallet_connected,
      points
    ) VALUES 
    ('456789123', 'user2@example.com', 'Token Tiger', 'https://i.pravatar.cc/150?img=12', 'GK2zqSsXLA2JwYRkCzNLEyTkSHBZfyQ5jitSPagCaQsT', TRUE, 750);
  END IF;
END
$$;

-- 12. CRIAR POLÍTICAS DE SEGURANÇA RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_policy ON users;
DROP POLICY IF EXISTS wallet_connections_policy ON wallet_connections;
DROP POLICY IF EXISTS user_sessions_policy ON user_sessions;

CREATE POLICY users_policy ON users
  USING (true);
  
CREATE POLICY wallet_connections_policy ON wallet_connections
  USING (true);
  
CREATE POLICY user_sessions_policy ON user_sessions
  USING (true);

-- Fim da implementação do sistema de login Google híbrido

