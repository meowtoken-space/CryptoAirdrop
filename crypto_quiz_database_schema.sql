-- ========================================
-- BANCO DE DADOS COMPLETO - CRYPTO QUIZ
-- Sistema de Perguntas DeFi/Blockchain/Crypto
-- ========================================

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS quiz_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#9a45fc',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Níveis de Dificuldade
CREATE TABLE IF NOT EXISTS quiz_difficulties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    level INTEGER NOT NULL UNIQUE,
    points_reward INTEGER NOT NULL,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela Principal de Perguntas
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES quiz_categories(id),
    difficulty_id INTEGER REFERENCES quiz_difficulties(id),
    question TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    source_url VARCHAR(500),
    tags TEXT[], -- Array de tags para busca
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Respostas dos Usuários
CREATE TABLE IF NOT EXISTS quiz_user_answers (
    id SERIAL PRIMARY KEY,
    user_wallet VARCHAR(100) NOT NULL,
    question_id INTEGER REFERENCES quiz_questions(id),
    selected_answer CHAR(1) NOT NULL CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN NOT NULL,
    points_earned INTEGER NOT NULL DEFAULT 0,
    time_taken INTEGER, -- em segundos
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_wallet, question_id) -- Usuário só pode responder cada pergunta uma vez
);

-- Tabela de Estatísticas das Perguntas
CREATE TABLE IF NOT EXISTS quiz_question_stats (
    question_id INTEGER PRIMARY KEY REFERENCES quiz_questions(id),
    total_answers INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    average_time DECIMAL(5,2), -- tempo médio em segundos
    difficulty_rating DECIMAL(3,2), -- 1.0 = muito fácil, 5.0 = muito difícil
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir Categorias
INSERT INTO quiz_categories (name, description, icon, color) VALUES
('Bitcoin', 'Perguntas sobre Bitcoin, a primeira criptomoeda', '₿', '#f7931a'),
('Ethereum', 'Perguntas sobre Ethereum e contratos inteligentes', 'Ξ', '#627eea'),
('DeFi', 'Finanças Descentralizadas e protocolos', '🏦', '#2ad6d0'),
('Solana', 'Blockchain Solana e seu ecossistema', '◎', '#9945ff'),
('NFTs', 'Tokens Não Fungíveis e arte digital', '🎨', '#ff6b6b'),
('Trading', 'Negociação e análise técnica', '📈', '#4ecdc4'),
('Staking', 'Proof of Stake e recompensas', '🔒', '#45b7d1'),
('Wallets', 'Carteiras digitais e segurança', '👛', '#96ceb4'),
('Altcoins', 'Criptomoedas alternativas', '🪙', '#feca57'),
('Blockchain', 'Tecnologia blockchain fundamental', '⛓️', '#ff9ff3'),
('Regulação', 'Aspectos legais e regulamentação', '⚖️', '#54a0ff'),
('Mining', 'Mineração e consenso', '⛏️', '#5f27cd'),
('Metaverso', 'Realidade virtual e Web3', '🌐', '#00d2d3'),
('GameFi', 'Jogos blockchain e P2E', '🎮', '#ff6348'),
('Yield Farming', 'Agricultura de rendimento', '🌾', '#2ed573');

-- Inserir Níveis de Dificuldade
INSERT INTO quiz_difficulties (name, level, points_reward, color) VALUES
('Iniciante', 1, 10, '#4CAF50'),
('Básico', 2, 15, '#8BC34A'),
('Intermediário', 3, 25, '#FF9800'),
('Avançado', 4, 40, '#FF5722'),
('Expert', 5, 60, '#9C27B0');

-- Índices para Performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON quiz_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_active ON quiz_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_user_answers_wallet ON quiz_user_answers(user_wallet);
CREATE INDEX IF NOT EXISTS idx_quiz_user_answers_question ON quiz_user_answers(question_id);

-- Função para Atualizar Estatísticas
CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO quiz_question_stats (question_id, total_answers, correct_answers)
    VALUES (NEW.question_id, 1, CASE WHEN NEW.is_correct THEN 1 ELSE 0 END)
    ON CONFLICT (question_id) 
    DO UPDATE SET
        total_answers = quiz_question_stats.total_answers + 1,
        correct_answers = quiz_question_stats.correct_answers + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para Atualizar Estatísticas Automaticamente
CREATE TRIGGER trigger_update_question_stats
    AFTER INSERT ON quiz_user_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_question_stats();

-- View para Ranking de Usuários no Quiz
CREATE OR REPLACE VIEW quiz_user_ranking AS
SELECT 
    user_wallet,
    COUNT(*) as total_questions_answered,
    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
    SUM(points_earned) as total_points,
    ROUND(
        (SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100, 
        2
    ) as accuracy_percentage,
    AVG(time_taken) as average_time,
    MAX(answered_at) as last_activity
FROM quiz_user_answers
GROUP BY user_wallet
ORDER BY total_points DESC, accuracy_percentage DESC;

-- View para Estatísticas Gerais
CREATE OR REPLACE VIEW quiz_general_stats AS
SELECT 
    (SELECT COUNT(*) FROM quiz_questions WHERE is_active = true) as total_questions,
    (SELECT COUNT(DISTINCT user_wallet) FROM quiz_user_answers) as total_players,
    (SELECT COUNT(*) FROM quiz_user_answers) as total_answers,
    (SELECT ROUND(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) * 100, 2) FROM quiz_user_answers) as global_accuracy,
    (SELECT COUNT(*) FROM quiz_categories) as total_categories;

-- Função para Obter Pergunta Aleatória
CREATE OR REPLACE FUNCTION get_random_question(
    p_user_wallet VARCHAR(100),
    p_category_id INTEGER DEFAULT NULL,
    p_difficulty_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    question_id INTEGER,
    category_name VARCHAR(100),
    difficulty_name VARCHAR(50),
    question TEXT,
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    points_reward INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        c.name,
        d.name,
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        d.points_reward
    FROM quiz_questions q
    JOIN quiz_categories c ON q.category_id = c.id
    JOIN quiz_difficulties d ON q.difficulty_id = d.id
    LEFT JOIN quiz_user_answers ua ON q.id = ua.question_id AND ua.user_wallet = p_user_wallet
    WHERE q.is_active = true
    AND ua.id IS NULL -- Usuário ainda não respondeu esta pergunta
    AND (p_category_id IS NULL OR q.category_id = p_category_id)
    AND (p_difficulty_id IS NULL OR q.difficulty_id = p_difficulty_id)
    ORDER BY RANDOM()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Função para Registrar Resposta
CREATE OR REPLACE FUNCTION submit_quiz_answer(
    p_user_wallet VARCHAR(100),
    p_question_id INTEGER,
    p_selected_answer CHAR(1),
    p_time_taken INTEGER DEFAULT NULL
)
RETURNS TABLE (
    is_correct BOOLEAN,
    points_earned INTEGER,
    correct_answer CHAR(1),
    explanation TEXT
) AS $$
DECLARE
    v_correct_answer CHAR(1);
    v_explanation TEXT;
    v_points INTEGER;
    v_is_correct BOOLEAN;
BEGIN
    -- Buscar resposta correta e explicação
    SELECT q.correct_answer, q.explanation, d.points_reward
    INTO v_correct_answer, v_explanation, v_points
    FROM quiz_questions q
    JOIN quiz_difficulties d ON q.difficulty_id = d.id
    WHERE q.id = p_question_id;
    
    -- Verificar se a resposta está correta
    v_is_correct := (p_selected_answer = v_correct_answer);
    
    -- Se incorreta, não ganha pontos
    IF NOT v_is_correct THEN
        v_points := 0;
    END IF;
    
    -- Inserir resposta do usuário
    INSERT INTO quiz_user_answers (
        user_wallet, 
        question_id, 
        selected_answer, 
        is_correct, 
        points_earned, 
        time_taken
    ) VALUES (
        p_user_wallet, 
        p_question_id, 
        p_selected_answer, 
        v_is_correct, 
        v_points, 
        p_time_taken
    );
    
    -- Retornar resultado
    RETURN QUERY SELECT v_is_correct, v_points, v_correct_answer, v_explanation;
END;
$$ LANGUAGE plpgsql;

-- Política de Segurança RLS (Row Level Security)
ALTER TABLE quiz_user_answers ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver suas próprias respostas
CREATE POLICY quiz_user_answers_policy ON quiz_user_answers
    FOR ALL USING (auth.jwt() ->> 'wallet_address' = user_wallet);

-- Comentários para Documentação
COMMENT ON TABLE quiz_categories IS 'Categorias das perguntas do quiz (Bitcoin, Ethereum, DeFi, etc.)';
COMMENT ON TABLE quiz_difficulties IS 'Níveis de dificuldade com pontuação correspondente';
COMMENT ON TABLE quiz_questions IS 'Banco principal de perguntas com múltipla escolha';
COMMENT ON TABLE quiz_user_answers IS 'Respostas dos usuários com pontuação e estatísticas';
COMMENT ON TABLE quiz_question_stats IS 'Estatísticas agregadas por pergunta';

COMMENT ON FUNCTION get_random_question IS 'Retorna pergunta aleatória que o usuário ainda não respondeu';
COMMENT ON FUNCTION submit_quiz_answer IS 'Registra resposta do usuário e calcula pontuação';

-- Dados de Exemplo para Teste
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
(1, 1, 'Quem criou o Bitcoin?', 'Vitalik Buterin', 'Satoshi Nakamoto', 'Charlie Lee', 'Gavin Wood', 'B', 'Satoshi Nakamoto é o pseudônimo usado pelo criador anônimo do Bitcoin.'),
(2, 2, 'O que significa "gas" na rede Ethereum?', 'Combustível para carros', 'Taxa de transação', 'Tipo de token', 'Protocolo de consenso', 'B', 'Gas é a unidade que mede o custo computacional das transações na Ethereum.'),
(3, 3, 'O que é "yield farming" em DeFi?', 'Plantar criptomoedas', 'Estratégia para maximizar retornos', 'Tipo de mineração', 'Protocolo de segurança', 'B', 'Yield farming é a prática de emprestar ou apostar criptomoedas para gerar retornos.'),
(4, 1, 'Qual é o token nativo da Solana?', 'ETH', 'BTC', 'SOL', 'ADA', 'C', 'SOL é o token nativo da blockchain Solana, usado para taxas e staking.'),
(5, 2, 'O que significa NFT?', 'New Financial Token', 'Non-Fungible Token', 'Network File Transfer', 'Next Future Technology', 'B', 'NFT significa Non-Fungible Token, um tipo de token único e não intercambiável.');

-- Verificação Final
SELECT 'Schema do CryptoQuiz criado com sucesso!' as status;

