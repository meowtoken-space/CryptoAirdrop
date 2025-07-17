-- ========================================
-- SISTEMA DE DIFICULDADE RECLASSIFICADO
-- Meow Token CryptoQuiz - Pontuação Equilibrada
-- ========================================

-- Primeiro, vamos atualizar a tabela de dificuldades com o novo sistema
UPDATE quiz_difficulties SET 
    name = 'Fácil',
    points = 3,
    description = 'Perguntas básicas sobre conceitos fundamentais de crypto'
WHERE id = 1;

UPDATE quiz_difficulties SET 
    name = 'Médio',
    points = 7,
    description = 'Perguntas intermediárias que requerem conhecimento prático'
WHERE id = 2;

UPDATE quiz_difficulties SET 
    name = 'Difícil',
    points = 15,
    description = 'Perguntas avançadas para especialistas em crypto'
WHERE id = 3;

-- Adicionar nova dificuldade Expert para perguntas muito técnicas
INSERT INTO quiz_difficulties (id, name, points, description) VALUES
(4, 'Expert', 25, 'Perguntas extremamente técnicas para desenvolvedores e traders profissionais');

-- ========================================
-- RECLASSIFICAÇÃO DAS PERGUNTAS POR CATEGORIA
-- ========================================

-- BITCOIN - RECLASSIFICAÇÃO
-- Fácil (3 pontos) - Conceitos básicos que qualquer pessoa deveria saber
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%O que é Bitcoin%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%Quem criou o Bitcoin%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%Em que ano foi criado%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%Qual é o símbolo%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%Quantos bitcoins%';

-- Médio (7 pontos) - Conceitos que requerem estudo básico
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é halving%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é mineração%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é blockchain%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é uma carteira%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é hash%';

-- Difícil (15 pontos) - Conceitos técnicos avançados
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é Proof of Work%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é Lightning Network%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é SegWit%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é Taproot%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%dificuldade de mineração%';

-- ETHEREUM - RECLASSIFICAÇÃO
-- Fácil (3 pontos)
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%O que é Ethereum%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%Quem criou o Ethereum%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%Qual é o token nativo%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%Em que ano foi lançado%';

-- Médio (7 pontos)
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que são smart contracts%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é gas%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é ERC-20%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é DApp%';

-- Difícil (15 pontos)
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é Ethereum 2.0%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é sharding%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é EIP%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é MEV%';

-- DEFI - RECLASSIFICAÇÃO
-- Fácil (3 pontos)
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%O que significa DeFi%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%O que é uma DEX%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%O que é staking%';

-- Médio (7 pontos)
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é yield farming%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é liquidity pool%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é AMM%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é impermanent loss%';

-- Difícil (15 pontos)
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é flash loan%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é arbitragem%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é composability%';

-- SOLANA - RECLASSIFICAÇÃO
-- Fácil (3 pontos)
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%Qual é o token nativo da Solana%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%Quem fundou a Solana%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%Qual é o símbolo da Solana%';

-- Médio (7 pontos)
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é Proof of History%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%Qual é a velocidade de transação%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é um validator%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é Phantom%';

-- Difícil (15 pontos)
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que são epochs%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é slashing%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é Jupiter%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é Raydium%';

-- TRADING - RECLASSIFICAÇÃO
-- Fácil (3 pontos)
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%O que significa HODL%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%O que é market cap%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%O que significa bull market%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%O que significa bear market%';

-- Médio (7 pontos)
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é volume%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é volatilidade%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é stop loss%';

-- Difícil (15 pontos)
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é análise técnica%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é RSI%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é MACD%';

-- NFTS - RECLASSIFICAÇÃO
-- Fácil (3 pontos)
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%O que significa NFT%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%Qual blockchain popularizou%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%O que torna um NFT único%';

-- Médio (7 pontos)
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%Qual é o padrão mais comum%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é minting%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é marketplace%';

-- Difícil (15 pontos)
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é royalty%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é metadata%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é IPFS%';

-- WALLETS - RECLASSIFICAÇÃO
-- Fácil (3 pontos)
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%O que é uma carteira%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%diferença entre carteira quente%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%O que é uma seed phrase%';
UPDATE quiz_questions SET difficulty_id = 1 WHERE question LIKE '%O que é MetaMask%';

-- Médio (7 pontos)
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%Quantas palavras%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é chave privada%';
UPDATE quiz_questions SET difficulty_id = 2 WHERE question LIKE '%O que é chave pública%';

-- Difícil (15 pontos)
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é derivação%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é HD wallet%';
UPDATE quiz_questions SET difficulty_id = 3 WHERE question LIKE '%O que é multisig%';

-- ========================================
-- VERIFICAÇÃO DO SISTEMA RECLASSIFICADO
-- ========================================

-- Consulta para verificar distribuição por dificuldade
SELECT 
    d.name as dificuldade,
    d.points as pontos,
    COUNT(q.id) as total_perguntas,
    ROUND(COUNT(q.id) * 100.0 / (SELECT COUNT(*) FROM quiz_questions), 2) as porcentagem
FROM quiz_difficulties d
LEFT JOIN quiz_questions q ON d.id = q.difficulty_id
GROUP BY d.id, d.name, d.points
ORDER BY d.points;

-- Consulta para verificar distribuição por categoria e dificuldade
SELECT 
    c.name as categoria,
    d.name as dificuldade,
    d.points as pontos,
    COUNT(q.id) as perguntas
FROM quiz_categories c
CROSS JOIN quiz_difficulties d
LEFT JOIN quiz_questions q ON c.id = q.category_id AND d.id = q.difficulty_id
GROUP BY c.id, c.name, d.id, d.name, d.points
ORDER BY c.name, d.points;

-- ========================================
-- SISTEMA DE PONTUAÇÃO BALANCEADO
-- ========================================

/*
NOVA ESTRUTURA DE PONTUAÇÃO:

🟢 FÁCIL (3 pontos):
- Conceitos básicos que qualquer iniciante deveria saber
- Definições simples
- Fatos históricos básicos
- Símbolos e nomes

🟡 MÉDIO (7 pontos):
- Conceitos que requerem estudo e prática
- Funcionamento de protocolos
- Características técnicas básicas
- Uso prático de ferramentas

🔴 DIFÍCIL (15 pontos):
- Conceitos avançados e técnicos
- Detalhes de implementação
- Estratégias complexas
- Conhecimento especializado

🟣 EXPERT (25 pontos):
- Conceitos extremamente técnicos
- Desenvolvimento e programação
- Trading profissional
- Arquitetura de sistemas

DISTRIBUIÇÃO IDEAL:
- 40% Fácil (3 pts) - Para engajar iniciantes
- 35% Médio (7 pts) - Para usuários regulares  
- 20% Difícil (15 pts) - Para especialistas
- 5% Expert (25 pts) - Para profissionais

BONUS SISTEMA:
- Velocidade: +50% dos pontos base se responder em <10s
- Streak: +1 ponto por resposta consecutiva correta
- Primeira tentativa: +2 pontos bonus
- Categoria completa: +10 pontos bonus
*/

-- Comentário final
SELECT 'Sistema de dificuldade reclassificado com sucesso!' as status;

