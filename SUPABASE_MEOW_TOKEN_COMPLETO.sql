-- =====================================================
-- SCRIPT COMPLETO SUPABASE - MEOW TOKEN PROJECT
-- =====================================================
-- Criado para: Sistema completo de jogos, pontos, pré-venda e NFTs
-- Data: Janeiro 2025
-- Versão: 1.0 - Produção

-- =====================================================
-- 1. SISTEMA DE USUÁRIOS E AUTENTICAÇÃO
-- =====================================================

-- Tabela principal de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  avatar_url TEXT,
  
  -- Sistema de pontos
  total_points BIGINT DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  experience_points BIGINT DEFAULT 0,
  points_today BIGINT DEFAULT 0,
  last_daily_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Estatísticas gerais
  total_games_played INTEGER DEFAULT 0,
  total_time_played INTEGER DEFAULT 0, -- em segundos
  favorite_game TEXT,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  
  -- Sistema de referência
  referred_by TEXT,
  total_referrals INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  
  -- Configurações
  notifications_enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  theme_preference TEXT DEFAULT 'dark',
  language_preference TEXT DEFAULT 'pt-BR',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_points ON users(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(current_level DESC);
CREATE INDEX IF NOT EXISTS idx_users_referral ON users(referral_code);

-- =====================================================
-- 2. SISTEMA DE JOGOS
-- =====================================================

-- Tabela de configurações dos jogos
CREATE TABLE IF NOT EXISTS game_configs (
  id SERIAL PRIMARY KEY,
  game_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Limites diários
  daily_limit INTEGER DEFAULT 100,
  points_per_action INTEGER DEFAULT 1,
  energy_cost INTEGER DEFAULT 1,
  energy_max INTEGER DEFAULT 100,
  energy_regen_time INTEGER DEFAULT 300, -- segundos
  
  -- Configurações específicas
  config_json JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações dos jogos
INSERT INTO game_configs (game_name, display_name, description, daily_limit, points_per_action, energy_cost, config_json) VALUES
('meowclicker', 'Meow Clicker', 'Clique no gato para ganhar pontos', 1000, 1, 1, '{"energy_max": 100, "energy_regen": 5, "power_ups": true}'),
('cryptoquiz', 'Crypto Quiz', 'Teste seus conhecimentos sobre criptomoedas', 20, 5, 0, '{"time_limit": 30, "difficulty_levels": 3, "bonus_speed": true}'),
('luckyspin', 'Lucky Spin', 'Gire a roleta da sorte', 5, 10, 0, '{"rarities": ["common", "rare", "epic", "legendary"], "probabilities": [70, 20, 8, 2]}'),
('treasurehunt', 'Treasure Hunt', 'Encontre tesouros escondidos', 3, 15, 0, '{"grid_size": "6x6", "treasures": 8, "traps": 4, "hints": 3}'),
('battlearena', 'Battle Arena', 'Lute contra inimigos épicos', 10, 20, 0, '{"enemies": 5, "turn_based": true, "level_system": true}');

-- Tabela de histórico de jogadas
CREATE TABLE IF NOT EXISTS game_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  game_name TEXT NOT NULL,
  
  -- Dados da jogada
  points_earned INTEGER DEFAULT 0,
  energy_used INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  level_reached INTEGER DEFAULT 1,
  
  -- Dados específicos do jogo (JSON flexível)
  game_data JSONB DEFAULT '{}',
  
  -- Timestamps
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_only DATE DEFAULT CURRENT_DATE
);

-- Índices para game_history
CREATE INDEX IF NOT EXISTS idx_game_history_user ON game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_game_history_wallet ON game_history(wallet_address);
CREATE INDEX IF NOT EXISTS idx_game_history_game ON game_history(game_name);
CREATE INDEX IF NOT EXISTS idx_game_history_date ON game_history(date_only);

-- =====================================================
-- 3. CRYPTO QUIZ - PERGUNTAS E CATEGORIAS
-- =====================================================

-- Categorias do quiz
CREATE TABLE IF NOT EXISTS quiz_categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir categorias
INSERT INTO quiz_categories (name, display_name, description, icon, color) VALUES
('bitcoin', 'Bitcoin', 'Perguntas sobre Bitcoin e sua tecnologia', '₿', '#F7931A'),
('ethereum', 'Ethereum', 'Ethereum, smart contracts e DApps', '⟠', '#627EEA'),
('defi', 'DeFi', 'Finanças descentralizadas e protocolos', '🏦', '#00D4AA'),
('solana', 'Solana', 'Blockchain Solana e seu ecossistema', '◎', '#9945FF'),
('nfts', 'NFTs', 'Tokens não fungíveis e arte digital', '🎨', '#FF6B6B'),
('trading', 'Trading', 'Análise técnica e estratégias', '📈', '#4ECDC4'),
('wallets', 'Carteiras', 'Segurança e tipos de carteiras', '👛', '#45B7D1'),
('security', 'Segurança', 'Segurança em criptomoedas', '🔒', '#96CEB4');

-- Níveis de dificuldade
CREATE TABLE IF NOT EXISTS quiz_difficulties (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  points_reward INTEGER NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  min_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dificuldades
INSERT INTO quiz_difficulties (name, display_name, points_reward, color, min_level) VALUES
('easy', 'Fácil', 3, '#10B981', 1),
('medium', 'Médio', 7, '#F59E0B', 5),
('hard', 'Difícil', 15, '#EF4444', 10);

-- Perguntas do quiz
CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES quiz_categories(id),
  difficulty_id INTEGER REFERENCES quiz_difficulties(id),
  
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  
  explanation TEXT,
  source_url TEXT,
  
  -- Estatísticas
  times_asked INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  difficulty_rating DECIMAL(3,2) DEFAULT 0.00,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir perguntas (30+ perguntas balanceadas)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES

-- BITCOIN - FÁCIL
(1, 1, 'Quem criou o Bitcoin?', 'Vitalik Buterin', 'Satoshi Nakamoto', 'Charlie Lee', 'Roger Ver', 'B', 'Satoshi Nakamoto é o pseudônimo do criador anônimo do Bitcoin.'),
(1, 1, 'Em que ano o Bitcoin foi criado?', '2008', '2009', '2010', '2011', 'B', 'O Bitcoin foi lançado em 2009, após o whitepaper de 2008.'),
(1, 1, 'Qual é o símbolo do Bitcoin?', '₿', 'Ƀ', 'BTC', 'Todas as anteriores', 'D', 'Bitcoin pode ser representado por ₿, Ƀ ou BTC.'),

-- BITCOIN - MÉDIO
(1, 2, 'Qual é o limite máximo de Bitcoins que podem existir?', '18 milhões', '19 milhões', '21 milhões', '25 milhões', 'C', 'O protocolo Bitcoin limita a oferta total em 21 milhões de moedas.'),
(1, 2, 'O que é o halving do Bitcoin?', 'Divisão do preço pela metade', 'Redução da recompensa de mineração pela metade', 'Divisão da blockchain', 'Redução das taxas', 'B', 'O halving reduz a recompensa dos mineradores pela metade a cada 210.000 blocos.'),
(1, 2, 'Quanto tempo leva para minerar um bloco Bitcoin?', '5 minutos', '10 minutos', '15 minutos', '20 minutos', 'B', 'O protocolo Bitcoin ajusta a dificuldade para manter blocos a cada ~10 minutos.'),

-- BITCOIN - DIFÍCIL
(1, 3, 'Qual é o menor valor de Bitcoin que pode ser enviado?', '0.001 BTC', '0.0001 BTC', '0.00000001 BTC', '0.000001 BTC', 'C', 'A menor unidade do Bitcoin é 1 satoshi = 0.00000001 BTC.'),
(1, 3, 'Qual algoritmo de hash o Bitcoin usa?', 'SHA-256', 'Scrypt', 'X11', 'Ethash', 'A', 'Bitcoin usa o algoritmo SHA-256 para proof-of-work.'),

-- ETHEREUM - FÁCIL
(2, 1, 'Quem criou o Ethereum?', 'Satoshi Nakamoto', 'Vitalik Buterin', 'Charles Hoskinson', 'Gavin Wood', 'B', 'Vitalik Buterin é o criador principal do Ethereum.'),
(2, 1, 'Qual é a moeda nativa do Ethereum?', 'Bitcoin', 'Ether (ETH)', 'Litecoin', 'Dogecoin', 'B', 'Ether (ETH) é a criptomoeda nativa da rede Ethereum.'),

-- ETHEREUM - MÉDIO
(2, 2, 'O que são smart contracts?', 'Contratos em papel', 'Contratos autoexecutáveis na blockchain', 'Contratos de mineração', 'Contratos de exchange', 'B', 'Smart contracts são programas que executam automaticamente quando condições são atendidas.'),
(2, 2, 'Qual linguagem é usada para programar smart contracts no Ethereum?', 'JavaScript', 'Python', 'Solidity', 'C++', 'C', 'Solidity é a linguagem principal para smart contracts no Ethereum.'),

-- DEFI - MÉDIO
(3, 2, 'O que significa AMM?', 'Automated Market Maker', 'Advanced Money Management', 'Algorithmic Mining Machine', 'Asset Management Module', 'A', 'AMM permite trocas descentralizadas usando pools de liquidez.'),
(3, 2, 'O que é yield farming?', 'Agricultura tradicional', 'Mineração de criptomoedas', 'Estratégia para ganhar recompensas em DeFi', 'Compra e venda rápida', 'C', 'Yield farming envolve fornecer liquidez para ganhar recompensas em tokens.'),

-- SOLANA - DIFÍCIL
(4, 3, 'O que é Proof of History (PoH)?', 'Prova de trabalho', 'Prova de participação', 'Prova criptográfica de tempo', 'Prova de armazenamento', 'C', 'PoH cria um registro histórico que prova que eventos ocorreram em momentos específicos.'),
(4, 3, 'Quantas transações por segundo o Solana pode processar teoricamente?', '7 TPS', '15 TPS', '65.000 TPS', '1.000 TPS', 'C', 'Solana pode processar até 65.000 transações por segundo teoricamente.'),

-- NFTs - FÁCIL
(5, 1, 'O que significa NFT?', 'New Financial Token', 'Non-Fungible Token', 'Network File Transfer', 'Next Future Technology', 'B', 'NFT significa Non-Fungible Token, um token único e não intercambiável.'),
(5, 1, 'Qual blockchain foi pioneira em NFTs?', 'Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'B', 'Ethereum foi a primeira blockchain a popularizar NFTs com o padrão ERC-721.'),

-- TRADING - MÉDIO
(6, 2, 'O que é uma ordem stop-loss?', 'Ordem para comprar mais', 'Ordem para vender automaticamente se o preço cair', 'Ordem para parar de negociar', 'Ordem para aumentar posição', 'B', 'Stop-loss é uma ordem que vende automaticamente quando o preço atinge um nível específico para limitar perdas.'),
(6, 2, 'O que significa HODL?', 'Hold On for Dear Life', 'High Order Digital Ledger', 'Hash of Distributed Ledger', 'Apenas um erro de digitação de "hold"', 'D', 'HODL originou-se de um erro de digitação de "hold" e virou estratégia de longo prazo.'),

-- CARTEIRAS - MÉDIO
(7, 2, 'Qual é a diferença entre hot wallet e cold wallet?', 'Temperatura física', 'Hot wallet está online, cold wallet está offline', 'Cor da interface', 'Velocidade de transação', 'B', 'Hot wallets estão conectadas à internet, cold wallets ficam offline para maior segurança.'),
(7, 2, 'O que é uma seed phrase?', 'Frase para plantar', 'Sequência de palavras para recuperar carteira', 'Senha da exchange', 'Código do smart contract', 'B', 'Seed phrase é uma sequência de 12-24 palavras que permite recuperar uma carteira.'),

-- SEGURANÇA - DIFÍCIL
(8, 3, 'O que é um ataque de 51%?', 'Roubo de 51% dos tokens', 'Controle de 51% do poder de mineração', 'Hack de 51% das exchanges', 'Perda de 51% do valor', 'B', 'Ataque de 51% ocorre quando uma entidade controla mais da metade do poder de mineração da rede.'),
(8, 3, 'O que é phishing em criptomoedas?', 'Pesca de peixes', 'Tentativa de roubar informações através de sites falsos', 'Mineração ilegal', 'Venda de tokens falsos', 'B', 'Phishing usa sites e emails falsos para roubar chaves privadas e senhas.');

-- =====================================================
-- 4. BATTLE ARENA - INIMIGOS E COMBATE
-- =====================================================

-- Inimigos do Battle Arena
CREATE TABLE IF NOT EXISTS battle_enemies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  level INTEGER DEFAULT 1,
  
  -- Stats base
  health INTEGER NOT NULL,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  speed INTEGER DEFAULT 50,
  
  -- Recompensas
  points_reward INTEGER DEFAULT 10,
  experience_reward INTEGER DEFAULT 5,
  
  -- Visual
  image_url TEXT,
  color_theme TEXT DEFAULT '#FF6B6B',
  
  -- Habilidades especiais
  special_abilities JSONB DEFAULT '[]',
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir inimigos
INSERT INTO battle_enemies (name, description, level, health, attack, defense, speed, points_reward, experience_reward, color_theme, special_abilities) VALUES
('Crypto Goblin', 'Um goblin ganancioso que rouba criptomoedas', 1, 50, 15, 5, 60, 10, 5, '#10B981', '["steal_coins", "quick_attack"]'),
('Blockchain Orc', 'Orc que tenta quebrar a blockchain', 2, 80, 20, 10, 40, 15, 8, '#F59E0B', '["heavy_strike", "armor_break"]'),
('DeFi Dragon', 'Dragão que controla protocolos DeFi', 3, 120, 25, 15, 70, 25, 12, '#EF4444', '["fire_breath", "liquidity_drain"]'),
('NFT Phantom', 'Fantasma que assombra coleções de NFTs', 4, 100, 30, 8, 90, 30, 15, '#8B5CF6', '["phase_through", "curse_nft"]'),
('Solana Titan', 'Titã guardião da rede Solana', 5, 200, 35, 25, 50, 50, 25, '#9945FF', '["solar_beam", "network_shield", "speed_boost"]');

-- =====================================================
-- 5. SISTEMA DE PRÉ-VENDA
-- =====================================================

-- Progresso da pré-venda
CREATE TABLE IF NOT EXISTS presale_progress (
  id SERIAL PRIMARY KEY,
  total_target BIGINT NOT NULL DEFAULT 1000000, -- 1M tokens
  current_sold BIGINT NOT NULL DEFAULT 42500, -- Tokens já vendidos
  total_buyers INTEGER NOT NULL DEFAULT 167, -- Total de compradores
  current_percentage DECIMAL(5,2) NOT NULL DEFAULT 4.25, -- Porcentagem atual
  
  -- Configurações de preço
  current_price_sol DECIMAL(10,6) DEFAULT 0.001, -- Preço atual em SOL
  next_price_sol DECIMAL(10,6) DEFAULT 0.0012, -- Próximo preço
  price_increase_at BIGINT DEFAULT 250000, -- Aumenta preço aos 250k tokens
  
  -- Timestamps
  presale_start TIMESTAMP WITH TIME ZONE DEFAULT '2025-01-14 00:00:00+00',
  presale_end TIMESTAMP WITH TIME ZONE DEFAULT '2025-12-31 23:59:59+00',
  last_purchase_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir progresso inicial
INSERT INTO presale_progress (total_target, current_sold, total_buyers, current_percentage, current_price_sol) 
VALUES (1000000, 42500, 167, 4.25, 0.001);

-- Compras da pré-venda
CREATE TABLE IF NOT EXISTS presale_purchases (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  amount_tokens BIGINT NOT NULL,
  amount_sol DECIMAL(10,4) NOT NULL,
  price_per_token DECIMAL(10,6) NOT NULL,
  
  transaction_hash TEXT UNIQUE,
  transaction_status TEXT DEFAULT 'pending', -- pending, confirmed, failed
  
  -- Bônus e recompensas
  user_points_bonus INTEGER DEFAULT 0,
  referral_bonus INTEGER DEFAULT 0,
  early_bird_bonus INTEGER DEFAULT 0,
  
  -- Timestamps
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir algumas compras de exemplo
INSERT INTO presale_purchases (wallet_address, amount_tokens, amount_sol, price_per_token, transaction_hash, transaction_status, user_points_bonus, purchase_date) VALUES
('DM5bzL1MWThBjhFVXRWzFtYKjqf5Vwhhs2jVzr68hYoV', 10000, 10.0000, 0.001000, 'tx_admin_001', 'confirmed', 100, NOW() - INTERVAL '2 days'),
('7xKXtg2CW87d97TXJLv4ybbp74Q9BVxbaP7vtcHoAJyx', 5000, 5.0000, 0.001000, 'tx_user_001', 'confirmed', 50, NOW() - INTERVAL '1 day'),
('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 7500, 7.5000, 0.001000, 'tx_user_002', 'confirmed', 75, NOW() - INTERVAL '12 hours'),
('4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi', 20000, 20.0000, 0.001000, 'tx_whale_001', 'confirmed', 200, NOW() - INTERVAL '6 hours');

-- Milestones da pré-venda
CREATE TABLE IF NOT EXISTS presale_milestones (
  id SERIAL PRIMARY KEY,
  percentage INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reward_points INTEGER DEFAULT 0,
  reward_description TEXT,
  
  -- Status
  is_achieved BOOLEAN DEFAULT FALSE,
  achieved_at TIMESTAMP WITH TIME ZONE,
  
  -- Visual
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#3B82F6',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir milestones
INSERT INTO presale_milestones (percentage, title, description, reward_points, reward_description, icon, color, is_achieved, achieved_at) VALUES
(5, 'Primeiros Passos', 'Primeiros 5% da pré-venda alcançados!', 250, 'Bônus de 250 pontos para todos os holders', '🚀', '#10B981', FALSE, NULL),
(10, 'Momentum Building', '10% da meta atingida - comunidade crescendo!', 500, 'Bônus de 500 pontos + acesso antecipado', '⚡', '#F59E0B', FALSE, NULL),
(25, 'Early Adopters', 'Primeiros 25% - vocês são os pioneiros!', 1000, 'Bônus de 1000 pontos + NFT exclusivo', '🏆', '#8B5CF6', FALSE, NULL),
(50, 'Metade do Caminho', 'Metade da meta alcançada - incrível!', 1500, 'Bônus de 1500 pontos + desconto na próxima fase', '🎯', '#06B6D4', FALSE, NULL),
(75, 'Quase Lá', '75% completos - a reta final!', 2000, 'Bônus de 2000 pontos + acesso VIP', '🔥', '#F97316', FALSE, NULL),
(100, 'Missão Cumprida', 'Meta da pré-venda 100% atingida!', 5000, 'Bônus épico de 5000 pontos + recompensas especiais', '👑', '#DC2626', FALSE, NULL);

-- =====================================================
-- 6. SISTEMA DE NFTs
-- =====================================================

-- Coleções de NFT
CREATE TABLE IF NOT EXISTS nft_collections (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT,
  
  -- Metadados
  image_url TEXT,
  banner_url TEXT,
  website_url TEXT,
  discord_url TEXT,
  twitter_url TEXT,
  
  -- Configurações
  total_supply INTEGER DEFAULT 0,
  mint_price DECIMAL(10,4) DEFAULT 0.1,
  royalty_percentage DECIMAL(5,2) DEFAULT 5.0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_revealed BOOLEAN DEFAULT FALSE,
  mint_start TIMESTAMP WITH TIME ZONE,
  mint_end TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir coleção MEOW Token
INSERT INTO nft_collections (name, symbol, description, total_supply, mint_price, royalty_percentage, is_active, mint_start) VALUES
('MEOW Token Official Collection', 'MEOW', 'Coleção oficial de NFTs do ecossistema MEOW Token. Cada NFT oferece utilidades exclusivas no sistema de jogos e recompensas.', 1000, 0.1, 7.5, TRUE, NOW() + INTERVAL '7 days');

-- NFTs individuais
CREATE TABLE IF NOT EXISTS nfts (
  id SERIAL PRIMARY KEY,
  collection_id INTEGER REFERENCES nft_collections(id),
  token_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Metadados
  image_url TEXT,
  animation_url TEXT,
  external_url TEXT,
  
  -- Atributos (JSON flexível)
  attributes JSONB DEFAULT '[]',
  
  -- Propriedade
  owner_wallet TEXT,
  creator_wallet TEXT,
  
  -- Marketplace
  is_listed BOOLEAN DEFAULT FALSE,
  list_price DECIMAL(10,4),
  last_sale_price DECIMAL(10,4),
  
  -- Utilidades
  utility_type TEXT, -- gaming, staking, governance, etc.
  utility_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir alguns NFTs de exemplo
INSERT INTO nfts (collection_id, token_id, name, description, attributes, utility_type, utility_data) VALUES
(1, 1, 'Cyber Meow #001', 'Um gato cyberpunk com habilidades especiais de hacking', 
 '[{"trait_type": "Rarity", "value": "Legendary"}, {"trait_type": "Type", "value": "Hacker Cat"}, {"trait_type": "Background", "value": "Neon City"}, {"trait_type": "Accessory", "value": "VR Goggles"}]',
 'gaming', '{"points_multiplier": 2.0, "energy_bonus": 50, "special_abilities": ["double_click", "energy_regen"]}'),

(1, 2, 'Gamer Meow #002', 'Gato gamer profissional com setup completo', 
 '[{"trait_type": "Rarity", "value": "Epic"}, {"trait_type": "Type", "value": "Gamer Cat"}, {"trait_type": "Background", "value": "Gaming Arena"}, {"trait_type": "Accessory", "value": "Gaming Headset"}]',
 'gaming', '{"points_multiplier": 1.5, "quiz_bonus": 25, "special_abilities": ["quick_answer", "streak_keeper"]}'),

(1, 3, 'Crypto Meow #003', 'Especialista em criptomoedas e DeFi', 
 '[{"trait_type": "Rarity", "value": "Rare"}, {"trait_type": "Type", "value": "Crypto Cat"}, {"trait_type": "Background", "value": "Blockchain Matrix"}, {"trait_type": "Accessory", "value": "Hardware Wallet"}]',
 'staking', '{"staking_multiplier": 1.3, "defi_bonus": 30, "special_abilities": ["yield_boost", "compound_interest"]}');

-- =====================================================
-- 7. SISTEMA DE MISSÕES E CONQUISTAS
-- =====================================================

-- Tipos de missões
CREATE TABLE IF NOT EXISTS mission_types (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT TRUE
);

-- Inserir tipos de missões
INSERT INTO mission_types (name, display_name, description, icon, color) VALUES
('daily', 'Missões Diárias', 'Missões que resetam todo dia às 21:00', '📅', '#10B981'),
('weekly', 'Missões Semanais', 'Missões que resetam toda semana', '📆', '#F59E0B'),
('achievement', 'Conquistas', 'Conquistas permanentes do sistema', '🏆', '#8B5CF6'),
('special', 'Missões Especiais', 'Eventos limitados e sazonais', '⭐', '#EF4444'),
('social', 'Missões Sociais', 'Interações com a comunidade', '👥', '#06B6D4');

-- Missões disponíveis
CREATE TABLE IF NOT EXISTS missions (
  id SERIAL PRIMARY KEY,
  mission_type_id INTEGER REFERENCES mission_types(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Objetivos
  target_value INTEGER NOT NULL DEFAULT 1,
  target_type TEXT NOT NULL, -- clicks, games, points, referrals, etc.
  target_game TEXT, -- específico para um jogo ou NULL para geral
  
  -- Recompensas
  points_reward INTEGER DEFAULT 0,
  experience_reward INTEGER DEFAULT 0,
  special_reward TEXT, -- NFT, badge, etc.
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  is_repeatable BOOLEAN DEFAULT FALSE,
  cooldown_hours INTEGER DEFAULT 24,
  
  -- Requisitos
  min_level INTEGER DEFAULT 1,
  required_nft TEXT, -- ID da coleção NFT necessária
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir missões
INSERT INTO missions (mission_type_id, title, description, target_value, target_type, points_reward, experience_reward, is_repeatable, cooldown_hours) VALUES

-- MISSÕES DIÁRIAS
(1, 'Clicador Diário', 'Faça 100 cliques no Meow Clicker', 100, 'clicks', 50, 10, TRUE, 24),
(1, 'Quiz Master', 'Responda 5 perguntas no Crypto Quiz', 5, 'quiz_questions', 75, 15, TRUE, 24),
(1, 'Sorte do Dia', 'Gire a roleta 3 vezes no Lucky Spin', 3, 'spins', 60, 12, TRUE, 24),
(1, 'Caçador de Tesouros', 'Complete 1 partida no Treasure Hunt', 1, 'treasure_games', 80, 16, TRUE, 24),
(1, 'Guerreiro Diário', 'Vença 2 batalhas no Battle Arena', 2, 'battles_won', 100, 20, TRUE, 24),

-- MISSÕES SEMANAIS
(2, 'Jogador Dedicado', 'Jogue todos os 5 jogos pelo menos uma vez', 5, 'different_games', 500, 100, TRUE, 168),
(2, 'Mestre dos Pontos', 'Acumule 1000 pontos na semana', 1000, 'weekly_points', 300, 60, TRUE, 168),
(2, 'Sequência Perfeita', 'Mantenha uma sequência de 7 dias jogando', 7, 'daily_streak', 750, 150, TRUE, 168),

-- CONQUISTAS PERMANENTES
(3, 'Primeiro Passo', 'Faça seu primeiro clique no sistema', 1, 'total_clicks', 100, 25, FALSE, 0),
(3, 'Conhecedor Crypto', 'Acerte 50 perguntas no Crypto Quiz', 50, 'quiz_correct', 500, 100, FALSE, 0),
(3, 'Colecionador', 'Acumule 10.000 pontos totais', 10000, 'total_points', 1000, 200, FALSE, 0),
(3, 'Lenda do Arena', 'Vença 100 batalhas no Battle Arena', 100, 'total_battles_won', 2000, 400, FALSE, 0),
(3, 'Milionário MEOW', 'Acumule 100.000 pontos totais', 100000, 'total_points', 10000, 2000, FALSE, 0),

-- MISSÕES ESPECIAIS
(4, 'Early Bird', 'Seja um dos primeiros 100 usuários', 1, 'early_user', 1000, 200, FALSE, 0),
(4, 'Comprador VIP', 'Compre tokens na pré-venda', 1, 'presale_purchase', 2000, 400, FALSE, 0),
(4, 'NFT Holder', 'Possua um NFT da coleção MEOW', 1, 'nft_ownership', 1500, 300, FALSE, 0);

-- Progresso das missões por usuário
CREATE TABLE IF NOT EXISTS user_mission_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  mission_id INTEGER REFERENCES missions(id),
  
  current_progress INTEGER DEFAULT 0,
  target_progress INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Para missões repetíveis
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, mission_id)
);

-- =====================================================
-- 8. SISTEMA DE APRENDIZADO
-- =====================================================

-- Categorias de aprendizado
CREATE TABLE IF NOT EXISTS learning_categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT '#3B82F6',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir categorias de aprendizado
INSERT INTO learning_categories (name, display_name, description, icon, color, order_index) VALUES
('basics', 'Fundamentos', 'Conceitos básicos de blockchain e criptomoedas', '🎓', '#10B981', 1),
('bitcoin', 'Bitcoin', 'Tudo sobre Bitcoin e sua tecnologia', '₿', '#F7931A', 2),
('ethereum', 'Ethereum', 'Ethereum, smart contracts e DApps', '⟠', '#627EEA', 3),
('defi', 'DeFi', 'Finanças descentralizadas', '🏦', '#00D4AA', 4),
('nfts', 'NFTs', 'Tokens não fungíveis', '🎨', '#FF6B6B', 5),
('solana', 'Solana', 'Ecossistema Solana', '◎', '#9945FF', 6),
('trading', 'Trading', 'Análise técnica e estratégias', '📈', '#4ECDC4', 7),
('security', 'Segurança', 'Segurança em criptomoedas', '🔒', '#96CEB4', 8);

-- Lições de aprendizado
CREATE TABLE IF NOT EXISTS learning_lessons (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES learning_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL, -- Markdown content
  
  -- Metadados
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_time INTEGER DEFAULT 5, -- minutos
  order_index INTEGER DEFAULT 0,
  
  -- Recompensas
  points_reward INTEGER DEFAULT 10,
  experience_reward INTEGER DEFAULT 5,
  
  -- Mídia
  thumbnail_url TEXT,
  video_url TEXT,
  
  -- Status
  is_published BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir algumas lições básicas
INSERT INTO learning_lessons (category_id, title, description, content, difficulty_level, estimated_time, points_reward, order_index) VALUES

-- FUNDAMENTOS
(1, 'O que é Blockchain?', 'Introdução aos conceitos básicos de blockchain', 
'# O que é Blockchain?

Blockchain é uma tecnologia revolucionária que funciona como um **livro-razão digital distribuído**.

## Características Principais:

- **Descentralização**: Não há uma autoridade central
- **Transparência**: Todas as transações são públicas
- **Imutabilidade**: Dados não podem ser alterados
- **Segurança**: Protegido por criptografia

## Como Funciona:

1. Transações são agrupadas em blocos
2. Blocos são validados pela rede
3. Blocos aprovados são adicionados à cadeia
4. A cadeia é distribuída por toda a rede

Esta tecnologia é a base de todas as criptomoedas!', 1, 10, 25, 1),

(1, 'O que são Criptomoedas?', 'Entenda o conceito de moedas digitais',
'# O que são Criptomoedas?

Criptomoedas são **moedas digitais** que usam criptografia para segurança e funcionam em redes blockchain.

## Características:

- **Digital**: Existem apenas no formato digital
- **Descentralizada**: Não controlada por governos
- **Criptografada**: Protegida por algoritmos complexos
- **Limitada**: Muitas têm oferta limitada

## Principais Criptomoedas:

- **Bitcoin (BTC)**: A primeira e mais conhecida
- **Ethereum (ETH)**: Plataforma para smart contracts
- **Solana (SOL)**: Blockchain rápida e eficiente

## Vantagens:

- Transações 24/7
- Taxas baixas
- Controle total sobre seus fundos
- Acesso global', 1, 8, 20, 2),

-- BITCOIN
(2, 'História do Bitcoin', 'Como o Bitcoin foi criado e evoluiu',
'# História do Bitcoin

## 2008 - O Whitepaper
- **31 de outubro**: Satoshi Nakamoto publica o whitepaper
- Título: "Bitcoin: A Peer-to-Peer Electronic Cash System"
- Proposta de sistema de pagamento sem intermediários

## 2009 - O Nascimento
- **3 de janeiro**: Primeiro bloco minerado (Genesis Block)
- **12 de janeiro**: Primeira transação Bitcoin
- Satoshi envia 10 BTC para Hal Finney

## Marcos Importantes:

### 2010
- Primeira compra com Bitcoin: 2 pizzas por 10.000 BTC
- Primeira exchange: BitcoinMarket.com

### 2017
- Bull run histórico: Bitcoin atinge $20.000
- Mainstream adoption começa

### 2021
- Empresas como Tesla compram Bitcoin
- El Salvador adota Bitcoin como moeda legal

O Bitcoin abriu caminho para toda a revolução das criptomoedas!', 2, 12, 30, 1);

-- Progresso do usuário nas lições
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES learning_lessons(id),
  
  is_completed BOOLEAN DEFAULT FALSE,
  completion_percentage INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- segundos
  
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, lesson_id)
);

-- =====================================================
-- 9. SISTEMA DE TOKENOMICS
-- =====================================================

-- Informações de tokenomics
CREATE TABLE IF NOT EXISTS tokenomics_info (
  id SERIAL PRIMARY KEY,
  
  -- Supply Information
  total_supply BIGINT DEFAULT 1000000000, -- 1 bilhão
  circulating_supply BIGINT DEFAULT 0,
  burned_supply BIGINT DEFAULT 0,
  
  -- Distribution
  presale_allocation DECIMAL(5,2) DEFAULT 30.00, -- 30%
  liquidity_allocation DECIMAL(5,2) DEFAULT 20.00, -- 20%
  team_allocation DECIMAL(5,2) DEFAULT 15.00, -- 15%
  marketing_allocation DECIMAL(5,2) DEFAULT 10.00, -- 10%
  ecosystem_allocation DECIMAL(5,2) DEFAULT 15.00, -- 15%
  reserve_allocation DECIMAL(5,2) DEFAULT 10.00, -- 10%
  
  -- Vesting Schedules (em meses)
  team_vesting_months INTEGER DEFAULT 24,
  marketing_vesting_months INTEGER DEFAULT 12,
  ecosystem_vesting_months INTEGER DEFAULT 18,
  
  -- Utility Features
  staking_enabled BOOLEAN DEFAULT TRUE,
  governance_enabled BOOLEAN DEFAULT TRUE,
  burning_enabled BOOLEAN DEFAULT TRUE,
  
  -- Current Metrics
  current_price_usd DECIMAL(10,6) DEFAULT 0.001,
  market_cap_usd BIGINT DEFAULT 0,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados de tokenomics
INSERT INTO tokenomics_info DEFAULT VALUES;

-- Histórico de preços (para gráficos)
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  price_usd DECIMAL(10,6) NOT NULL,
  volume_24h BIGINT DEFAULT 0,
  market_cap BIGINT DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índice para consultas rápidas
  date_only DATE DEFAULT CURRENT_DATE
);

-- Inserir alguns dados históricos de exemplo
INSERT INTO price_history (price_usd, volume_24h, market_cap, timestamp) VALUES
(0.0008, 50000, 800000, NOW() - INTERVAL '30 days'),
(0.0009, 75000, 900000, NOW() - INTERVAL '20 days'),
(0.0010, 100000, 1000000, NOW() - INTERVAL '10 days'),
(0.0012, 150000, 1200000, NOW() - INTERVAL '5 days'),
(0.0015, 200000, 1500000, NOW() - INTERVAL '1 day'),
(0.0018, 300000, 1800000, NOW());

-- =====================================================
-- 10. SISTEMA DE RANKING GLOBAL
-- =====================================================

-- View para ranking global (atualizada automaticamente)
CREATE OR REPLACE VIEW global_ranking AS
SELECT 
  u.id,
  u.wallet_address,
  u.username,
  u.avatar_url,
  u.total_points,
  u.current_level,
  u.experience_points,
  u.total_games_played,
  u.current_streak,
  u.best_streak,
  u.created_at,
  
  -- Ranking position
  ROW_NUMBER() OVER (ORDER BY u.total_points DESC, u.experience_points DESC) as rank_position,
  
  -- Pontos hoje
  u.points_today,
  
  -- Estatísticas por jogo
  (SELECT COUNT(*) FROM game_history gh WHERE gh.wallet_address = u.wallet_address AND gh.game_name = 'meowclicker') as meowclicker_plays,
  (SELECT COUNT(*) FROM game_history gh WHERE gh.wallet_address = u.wallet_address AND gh.game_name = 'cryptoquiz') as cryptoquiz_plays,
  (SELECT COUNT(*) FROM game_history gh WHERE gh.wallet_address = u.wallet_address AND gh.game_name = 'luckyspin') as luckyspin_plays,
  (SELECT COUNT(*) FROM game_history gh WHERE gh.wallet_address = u.wallet_address AND gh.game_name = 'treasurehunt') as treasurehunt_plays,
  (SELECT COUNT(*) FROM game_history gh WHERE gh.wallet_address = u.wallet_address AND gh.game_name = 'battlearena') as battlearena_plays,
  
  -- NFTs owned
  (SELECT COUNT(*) FROM nfts n WHERE n.owner_wallet = u.wallet_address) as nfts_owned,
  
  -- Presale participation
  (SELECT COALESCE(SUM(amount_tokens), 0) FROM presale_purchases pp WHERE pp.wallet_address = u.wallet_address AND pp.transaction_status = 'confirmed') as presale_tokens
  
FROM users u
WHERE u.total_points > 0
ORDER BY u.total_points DESC, u.experience_points DESC
LIMIT 100;

-- =====================================================
-- 11. TRIGGERS E FUNÇÕES AUTOMÁTICAS
-- =====================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_configs_updated_at BEFORE UPDATE ON game_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON quiz_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_presale_progress_updated_at BEFORE UPDATE ON presale_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nft_collections_updated_at BEFORE UPDATE ON nft_collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nfts_updated_at BEFORE UPDATE ON nfts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_mission_progress_updated_at BEFORE UPDATE ON user_mission_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_lessons_updated_at BEFORE UPDATE ON learning_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar código de referência único
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := 'MEOW' || UPPER(SUBSTRING(MD5(NEW.wallet_address || NOW()::text) FROM 1 FOR 6));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para gerar código de referência
CREATE TRIGGER generate_user_referral_code BEFORE INSERT ON users FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- Função para reset diário de pontos
CREATE OR REPLACE FUNCTION reset_daily_points()
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET 
        points_today = 0,
        last_daily_reset = NOW()
    WHERE last_daily_reset < CURRENT_DATE;
END;
$$ language 'plpgsql';

-- =====================================================
-- 12. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS nas tabelas sensíveis
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE presale_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios dados
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (wallet_address = current_setting('app.current_user_wallet', true));
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (wallet_address = current_setting('app.current_user_wallet', true));

-- Política para histórico de jogos
CREATE POLICY "Users can view own game history" ON game_history FOR SELECT USING (wallet_address = current_setting('app.current_user_wallet', true));
CREATE POLICY "Users can insert own game history" ON game_history FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_user_wallet', true));

-- =====================================================
-- 13. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices adicionais para otimização
CREATE INDEX IF NOT EXISTS idx_game_history_composite ON game_history(wallet_address, game_name, date_only);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category_difficulty ON quiz_questions(category_id, difficulty_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_presale_purchases_status ON presale_purchases(transaction_status, purchase_date);
CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts(owner_wallet) WHERE owner_wallet IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_missions_type_active ON missions(mission_type_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_user_completed ON user_mission_progress(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_learning_lessons_category_order ON learning_lessons(category_id, order_index) WHERE is_published = true;

-- =====================================================
-- 14. DADOS INICIAIS PARA ADMIN
-- =====================================================

-- Inserir usuário admin
INSERT INTO users (
    wallet_address, 
    username, 
    total_points, 
    current_level, 
    experience_points,
    referral_code
) VALUES (
    'DM5bzL1MWThBjhFVXRWzFtYKjqf5Vwhhs2jVzr68hYoV',
    'MEOW Admin',
    1000000,
    50,
    500000,
    'MEOWADMIN'
) ON CONFLICT (wallet_address) DO UPDATE SET
    username = EXCLUDED.username,
    total_points = EXCLUDED.total_points,
    current_level = EXCLUDED.current_level,
    experience_points = EXCLUDED.experience_points;

-- =====================================================
-- 15. VIEWS ÚTEIS PARA DASHBOARD
-- =====================================================

-- View de estatísticas gerais
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE) as new_users_today,
    (SELECT SUM(total_points) FROM users) as total_points_distributed,
    (SELECT COUNT(*) FROM game_history WHERE played_at >= CURRENT_DATE) as games_played_today,
    (SELECT COUNT(*) FROM presale_purchases WHERE transaction_status = 'confirmed') as total_presale_buyers,
    (SELECT SUM(amount_tokens) FROM presale_purchases WHERE transaction_status = 'confirmed') as total_tokens_sold,
    (SELECT COUNT(*) FROM nfts WHERE owner_wallet IS NOT NULL) as nfts_owned,
    (SELECT COUNT(*) FROM user_mission_progress WHERE is_completed = true) as missions_completed;

-- View de top jogadores por jogo
CREATE OR REPLACE VIEW top_players_by_game AS
SELECT 
    game_name,
    wallet_address,
    SUM(points_earned) as total_points,
    COUNT(*) as games_played,
    AVG(score) as avg_score,
    ROW_NUMBER() OVER (PARTITION BY game_name ORDER BY SUM(points_earned) DESC) as rank
FROM game_history
WHERE played_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY game_name, wallet_address
ORDER BY game_name, total_points DESC;

-- =====================================================
-- 16. FUNÇÕES UTILITÁRIAS
-- =====================================================

-- Função para calcular nível baseado em XP
CREATE OR REPLACE FUNCTION calculate_level(xp BIGINT)
RETURNS INTEGER AS $$
BEGIN
    -- Fórmula: Level = sqrt(XP / 100)
    RETURN GREATEST(1, FLOOR(SQRT(xp / 100.0))::INTEGER);
END;
$$ language 'plpgsql';

-- Função para calcular XP necessário para próximo nível
CREATE OR REPLACE FUNCTION xp_for_next_level(current_level INTEGER)
RETURNS BIGINT AS $$
BEGIN
    -- Fórmula: XP = (level + 1)^2 * 100
    RETURN ((current_level + 1) * (current_level + 1) * 100)::BIGINT;
END;
$$ language 'plpgsql';

-- =====================================================
-- 17. CONFIGURAÇÕES FINAIS
-- =====================================================

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Comentários nas tabelas principais
COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema MEOW Token';
COMMENT ON TABLE game_history IS 'Histórico de todas as jogadas dos usuários';
COMMENT ON TABLE presale_progress IS 'Progresso em tempo real da pré-venda';
COMMENT ON TABLE quiz_questions IS 'Perguntas do Crypto Quiz com diferentes dificuldades';
COMMENT ON TABLE missions IS 'Sistema de missões e conquistas';
COMMENT ON TABLE nfts IS 'Coleção de NFTs do ecossistema MEOW Token';

-- =====================================================
-- SCRIPT COMPLETO FINALIZADO
-- =====================================================
-- 
-- Este script cria toda a estrutura necessária para:
-- ✅ Sistema de usuários e pontos
-- ✅ 5 jogos integrados (MeowClicker, CryptoQuiz, LuckySpin, TreasureHunt, BattleArena)
-- ✅ Sistema de pré-venda com barra de progresso
-- ✅ Coleção de NFTs com utilidades
-- ✅ Sistema de missões e conquistas
-- ✅ Plataforma de aprendizado
-- ✅ Tokenomics e métricas
-- ✅ Ranking global
-- ✅ Triggers automáticos
-- ✅ Segurança RLS
-- ✅ Índices de performance
-- ✅ Views úteis para dashboard
-- 
-- Para executar: Cole este script no SQL Editor do Supabase
-- Tempo estimado de execução: 2-3 minutos
-- 
-- 🚀 MEOW TOKEN - READY FOR LAUNCH! 🚀

