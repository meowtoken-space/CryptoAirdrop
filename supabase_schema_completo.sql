-- ========================================
-- SISTEMA DE PONTOS MEOW TOKEN - SUPABASE
-- ========================================

-- Primeiro, vamos adicionar as colunas necessárias à tabela users existente
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS total_points BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS level_id INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience_points BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_total_points ON users(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level_id);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity);

-- ========================================
-- TABELA DE NÍVEIS
-- ========================================
CREATE TABLE IF NOT EXISTS levels (
    id SERIAL PRIMARY KEY,
    level_number INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    min_experience BIGINT NOT NULL,
    max_experience BIGINT,
    rewards JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir níveis básicos
INSERT INTO levels (level_number, name, min_experience, max_experience, rewards) VALUES
(1, 'Meow Novato', 0, 999, '{"title": "Primeiro Miado", "bonus_multiplier": 1.0}'),
(2, 'Gato Curioso', 1000, 2499, '{"title": "Explorador", "bonus_multiplier": 1.1}'),
(3, 'Felino Ativo', 2500, 4999, '{"title": "Caçador", "bonus_multiplier": 1.2}'),
(4, 'Mestre dos Miados', 5000, 9999, '{"title": "Veterano", "bonus_multiplier": 1.3}'),
(5, 'Lenda Felina', 10000, 19999, '{"title": "Lendário", "bonus_multiplier": 1.5}'),
(6, 'Deus dos Gatos', 20000, NULL, '{"title": "Divino", "bonus_multiplier": 2.0}')
ON CONFLICT (level_number) DO NOTHING;

-- ========================================
-- TABELA DE ATIVIDADES DE PONTOS
-- ========================================
CREATE TABLE IF NOT EXISTS point_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_wallet TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'game', 'daily_bonus', 'achievement', 'referral', etc.
    game_type TEXT, -- 'meow_clicker', 'crypto_quiz', 'lucky_spin', etc.
    points_earned BIGINT NOT NULL,
    experience_gained BIGINT DEFAULT 0,
    metadata JSONB DEFAULT '{}', -- dados específicos da atividade
    created_at TIMESTAMPTZ DEFAULT NOW(),
    session_id TEXT -- para agrupar atividades da mesma sessão
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_point_activities_user ON point_activities(user_wallet);
CREATE INDEX IF NOT EXISTS idx_point_activities_type ON point_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_point_activities_game ON point_activities(game_type);
CREATE INDEX IF NOT EXISTS idx_point_activities_date ON point_activities(created_at);

-- ========================================
-- TABELA DE CONQUISTAS (ACHIEVEMENTS)
-- ========================================
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    category TEXT NOT NULL, -- 'games', 'social', 'milestones', etc.
    rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    points_reward BIGINT DEFAULT 0,
    experience_reward BIGINT DEFAULT 0,
    requirements JSONB NOT NULL, -- condições para desbloquear
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir conquistas básicas
INSERT INTO achievements (name, description, category, rarity, points_reward, experience_reward, requirements) VALUES
('Primeiro Clique', 'Faça seu primeiro clique no Meow Clicker', 'games', 'common', 100, 50, '{"game": "meow_clicker", "action": "first_click"}'),
('Clicker Iniciante', 'Faça 100 cliques no Meow Clicker', 'games', 'common', 500, 250, '{"game": "meow_clicker", "total_clicks": 100}'),
('Mestre dos Cliques', 'Faça 1000 cliques no Meow Clicker', 'games', 'rare', 2000, 1000, '{"game": "meow_clicker", "total_clicks": 1000}'),
('Quiz Master', 'Acerte 10 perguntas seguidas no Crypto Quiz', 'games', 'epic', 1500, 750, '{"game": "crypto_quiz", "streak": 10}'),
('Sortudo', 'Ganhe o jackpot no Lucky Spin', 'games', 'legendary', 5000, 2500, '{"game": "lucky_spin", "jackpot": true}'),
('Explorador', 'Complete 5 mapas no Treasure Hunt', 'games', 'rare', 1000, 500, '{"game": "treasure_hunt", "maps_completed": 5}'),
('Guerreiro', 'Vença 10 batalhas no Battle Arena', 'games', 'epic', 2000, 1000, '{"game": "battle_arena", "wins": 10}'),
('Veterano', 'Jogue por 7 dias consecutivos', 'milestones', 'rare', 3000, 1500, '{"type": "daily_streak", "days": 7}'),
('Milionário', 'Acumule 1.000.000 de pontos', 'milestones', 'legendary', 10000, 5000, '{"total_points": 1000000}')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- TABELA DE CONQUISTAS DOS USUÁRIOS
-- ========================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_wallet TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    progress JSONB DEFAULT '{}', -- progresso atual para conquistas incrementais
    UNIQUE(user_wallet, achievement_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);

-- ========================================
-- TABELA DE LIMITES DIÁRIOS
-- ========================================
CREATE TABLE IF NOT EXISTS daily_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_wallet TEXT NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    game_type TEXT,
    points_earned_today BIGINT DEFAULT 0,
    activities_count INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_wallet, activity_type, game_type, last_reset_date)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_daily_limits_user ON daily_limits(user_wallet);
CREATE INDEX IF NOT EXISTS idx_daily_limits_date ON daily_limits(last_reset_date);

-- ========================================
-- TABELA DE SNAPSHOTS PARA TGE
-- ========================================
CREATE TABLE IF NOT EXISTS tge_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_name TEXT UNIQUE NOT NULL,
    description TEXT,
    total_users INTEGER NOT NULL,
    total_points BIGINT NOT NULL,
    conversion_rate DECIMAL(20,8), -- pontos por token
    snapshot_data JSONB NOT NULL, -- dados completos do ranking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT, -- admin que criou
    is_final BOOLEAN DEFAULT false
);

-- ========================================
-- TABELA DE CONFIGURAÇÕES DO SISTEMA
-- ========================================
CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT
);

-- Inserir configurações padrão
INSERT INTO system_config (key, value, description) VALUES
('daily_limits', '{
    "meow_clicker": {"max_points": 10000, "max_activities": 100},
    "crypto_quiz": {"max_points": 5000, "max_activities": 20},
    "lucky_spin": {"max_points": 3000, "max_activities": 10},
    "treasure_hunt": {"max_points": 8000, "max_activities": 15},
    "battle_arena": {"max_points": 12000, "max_activities": 25}
}', 'Limites diários por jogo'),
('point_multipliers', '{
    "base": 1.0,
    "weekend": 1.5,
    "special_events": 2.0,
    "level_bonus": true
}', 'Multiplicadores de pontos'),
('anti_cheat', '{
    "max_points_per_minute": 1000,
    "max_activities_per_minute": 10,
    "suspicious_threshold": 5000,
    "auto_ban": false
}', 'Configurações anti-fraude'),
('achievements_enabled', 'true', 'Sistema de conquistas ativo'),
('leaderboard_size', '100', 'Tamanho do ranking público')
ON CONFLICT (key) DO NOTHING;

-- ========================================
-- FUNÇÕES ÚTEIS
-- ========================================

-- Função para calcular nível baseado na experiência
CREATE OR REPLACE FUNCTION calculate_user_level(exp_points BIGINT)
RETURNS INTEGER AS $$
DECLARE
    user_level INTEGER;
BEGIN
    SELECT level_number INTO user_level
    FROM levels
    WHERE min_experience <= exp_points
    AND (max_experience IS NULL OR exp_points <= max_experience)
    ORDER BY level_number DESC
    LIMIT 1;
    
    RETURN COALESCE(user_level, 1);
END;
$$ LANGUAGE plpgsql;

-- Função para adicionar pontos a um usuário
CREATE OR REPLACE FUNCTION add_user_points(
    wallet_addr TEXT,
    points BIGINT,
    exp_points BIGINT DEFAULT 0,
    activity_type TEXT DEFAULT 'manual',
    game_type TEXT DEFAULT NULL,
    metadata JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    new_level INTEGER;
    old_level INTEGER;
    result JSONB;
BEGIN
    -- Inserir usuário se não existir
    INSERT INTO users (wallet_address, total_points, experience_points)
    VALUES (wallet_addr, points, exp_points)
    ON CONFLICT (wallet_address) DO UPDATE SET
        total_points = users.total_points + points,
        experience_points = users.experience_points + exp_points,
        last_activity = NOW();
    
    -- Calcular novo nível
    SELECT level_id INTO old_level FROM users WHERE wallet_address = wallet_addr;
    SELECT calculate_user_level(users.experience_points) INTO new_level 
    FROM users WHERE wallet_address = wallet_addr;
    
    -- Atualizar nível se mudou
    IF new_level != old_level THEN
        UPDATE users SET level_id = new_level WHERE wallet_address = wallet_addr;
    END IF;
    
    -- Registrar atividade
    INSERT INTO point_activities (
        user_wallet, activity_type, game_type, points_earned, 
        experience_gained, metadata
    ) VALUES (
        wallet_addr, activity_type, game_type, points, exp_points, metadata
    );
    
    -- Retornar resultado
    SELECT jsonb_build_object(
        'success', true,
        'points_added', points,
        'experience_added', exp_points,
        'new_total_points', total_points,
        'new_experience', experience_points,
        'old_level', old_level,
        'new_level', new_level,
        'level_up', (new_level > old_level)
    ) INTO result
    FROM users WHERE wallet_address = wallet_addr;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para obter ranking global
CREATE OR REPLACE FUNCTION get_global_ranking(limit_size INTEGER DEFAULT 100)
RETURNS TABLE (
    rank BIGINT,
    wallet_address TEXT,
    username TEXT,
    total_points BIGINT,
    level_id INTEGER,
    level_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY u.total_points DESC) as rank,
        u.wallet_address,
        u.username,
        u.total_points,
        u.level_id,
        l.name as level_name
    FROM users u
    LEFT JOIN levels l ON u.level_id = l.level_number
    WHERE u.is_active = true
    ORDER BY u.total_points DESC
    LIMIT limit_size;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ========================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_limits ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários (podem ver e editar apenas seus próprios dados)
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (wallet_address = current_setting('app.current_user_wallet', true));

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (wallet_address = current_setting('app.current_user_wallet', true));

-- Políticas para atividades de pontos
CREATE POLICY "Users can view own activities" ON point_activities
    FOR SELECT USING (user_wallet = current_setting('app.current_user_wallet', true));

CREATE POLICY "System can insert activities" ON point_activities
    FOR INSERT WITH CHECK (true);

-- Políticas para conquistas
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (user_wallet = current_setting('app.current_user_wallet', true));

-- Políticas para limites diários
CREATE POLICY "Users can view own limits" ON daily_limits
    FOR SELECT USING (user_wallet = current_setting('app.current_user_wallet', true));

-- ========================================
-- TRIGGERS PARA ATUALIZAÇÕES AUTOMÁTICAS
-- ========================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_limits_updated_at
    BEFORE UPDATE ON daily_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at
    BEFORE UPDATE ON system_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VIEWS ÚTEIS
-- ========================================

-- View do ranking global
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY u.total_points DESC) as rank,
    u.wallet_address,
    u.username,
    u.total_points,
    u.experience_points,
    u.level_id,
    l.name as level_name,
    l.rewards as level_rewards,
    u.last_activity
FROM users u
LEFT JOIN levels l ON u.level_id = l.level_number
WHERE u.is_active = true
ORDER BY u.total_points DESC;

-- View de estatísticas do usuário
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.wallet_address,
    u.total_points,
    u.experience_points,
    u.level_id,
    l.name as level_name,
    COUNT(DISTINCT pa.activity_type) as activities_played,
    COUNT(ua.achievement_id) as achievements_unlocked,
    MAX(pa.created_at) as last_game_activity,
    COALESCE(SUM(pa.points_earned), 0) as total_points_earned
FROM users u
LEFT JOIN levels l ON u.level_id = l.level_number
LEFT JOIN point_activities pa ON u.wallet_address = pa.user_wallet
LEFT JOIN user_achievements ua ON u.wallet_address = ua.user_wallet
GROUP BY u.wallet_address, u.total_points, u.experience_points, u.level_id, l.name;

-- ========================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ========================================

-- Inserir alguns usuários de exemplo (comentado por padrão)
/*
INSERT INTO users (wallet_address, username, total_points, experience_points) VALUES
('demo1...', 'MeowMaster', 15000, 8000),
('demo2...', 'CryptoKitty', 12000, 6000),
('demo3...', 'TokenCat', 8000, 4000)
ON CONFLICT (wallet_address) DO NOTHING;
*/

-- ========================================
-- COMENTÁRIOS FINAIS
-- ========================================

-- Este schema fornece:
-- 1. Sistema completo de pontos e experiência
-- 2. Sistema de níveis com recompensas
-- 3. Conquistas (achievements) configuráveis
-- 4. Limites diários por jogo
-- 5. Snapshots para TGE
-- 6. Configurações flexíveis
-- 7. Funções úteis para operações comuns
-- 8. Segurança com RLS
-- 9. Performance com índices otimizados
-- 10. Views para consultas frequentes

COMMIT;

