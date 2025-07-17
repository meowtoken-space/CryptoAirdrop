-- ========================================
-- BANCO DE PERGUNTAS RECLASSIFICADAS
-- Sistema de Pontuação Equilibrado
-- ========================================

-- Limpar perguntas existentes para inserir as reclassificadas
DELETE FROM quiz_questions;

-- ========================================
-- BITCOIN - PERGUNTAS RECLASSIFICADAS
-- ========================================

-- FÁCIL (3 pontos) - Conceitos básicos
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(1, 1, 'O que é Bitcoin?', 'Uma empresa de tecnologia', 'Uma criptomoeda descentralizada', 'Um banco digital', 'Uma rede social', 'B', 'Bitcoin é a primeira e mais conhecida criptomoeda descentralizada, criada em 2009 por Satoshi Nakamoto.', '["bitcoin", "basico", "definicao"]'),

(1, 1, 'Quem criou o Bitcoin?', 'Vitalik Buterin', 'Satoshi Nakamoto', 'Elon Musk', 'Mark Zuckerberg', 'B', 'Satoshi Nakamoto é o pseudônimo usado pelo criador ou grupo de criadores do Bitcoin.', '["bitcoin", "historia", "satoshi"]'),

(1, 1, 'Em que ano foi criado o Bitcoin?', '2008', '2009', '2010', '2011', 'B', 'O Bitcoin foi lançado em 2009, após o whitepaper ter sido publicado em 2008.', '["bitcoin", "historia", "ano"]'),

(1, 1, 'Qual é o símbolo do Bitcoin?', 'BTC', 'BCH', 'BTG', 'BSV', 'A', 'BTC é o símbolo oficial do Bitcoin usado em exchanges e carteiras.', '["bitcoin", "simbolo", "ticker"]'),

(1, 1, 'Quantos bitcoins existirão no máximo?', '21 milhões', '100 milhões', '1 bilhão', 'Infinitos', 'A', 'O protocolo Bitcoin limita o supply máximo em 21 milhões de bitcoins.', '["bitcoin", "supply", "limite"]');

-- MÉDIO (7 pontos) - Conceitos que requerem estudo
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(1, 2, 'O que é halving do Bitcoin?', 'Divisão do preço pela metade', 'Redução da recompensa de mineração pela metade', 'Divisão da blockchain', 'Redução das taxas', 'B', 'O halving reduz a recompensa dos mineradores pela metade aproximadamente a cada 4 anos.', '["bitcoin", "halving", "mineracao"]'),

(1, 2, 'O que é mineração de Bitcoin?', 'Escavação física de bitcoins', 'Processo de validação de transações', 'Compra de bitcoins', 'Criação de carteiras', 'B', 'Mineração é o processo computacional de validar transações e adicionar blocos à blockchain.', '["bitcoin", "mineracao", "validacao"]'),

(1, 2, 'O que é uma carteira Bitcoin?', 'Conta bancária digital', 'Software que armazena chaves privadas', 'Aplicativo de pagamento', 'Site de exchange', 'B', 'Uma carteira Bitcoin é um software que gerencia suas chaves privadas para acessar seus bitcoins.', '["bitcoin", "carteira", "chaves"]'),

(1, 2, 'O que é hash no Bitcoin?', 'Senha da carteira', 'Função matemática de criptografia', 'Tipo de moeda', 'Taxa de transação', 'B', 'Hash é uma função matemática que converte dados em uma string de tamanho fixo, usada na segurança do Bitcoin.', '["bitcoin", "hash", "criptografia"]'),

(1, 2, 'O que são satoshis?', 'Criadores do Bitcoin', 'Menor unidade do Bitcoin', 'Tipo de carteira', 'Algoritmo de mineração', 'B', 'Satoshi é a menor unidade do Bitcoin, equivalente a 0.00000001 BTC.', '["bitcoin", "satoshi", "unidade"]');

-- DIFÍCIL (15 pontos) - Conceitos técnicos avançados
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(1, 3, 'O que é Proof of Work?', 'Prova de propriedade', 'Algoritmo de consenso baseado em poder computacional', 'Sistema de votação', 'Método de pagamento', 'B', 'Proof of Work é o algoritmo de consenso do Bitcoin que requer poder computacional para validar transações.', '["bitcoin", "pow", "consenso"]'),

(1, 3, 'O que é Lightning Network?', 'Nova versão do Bitcoin', 'Solução de segunda camada para escalabilidade', 'Exchange descentralizada', 'Algoritmo de mineração', 'B', 'Lightning Network é uma solução de segunda camada que permite transações mais rápidas e baratas.', '["bitcoin", "lightning", "escalabilidade"]'),

(1, 3, 'O que é SegWit?', 'Novo tipo de Bitcoin', 'Atualização que separa dados de assinatura', 'Exchange centralizada', 'Carteira hardware', 'B', 'SegWit (Segregated Witness) é uma atualização que aumenta a capacidade de transações do Bitcoin.', '["bitcoin", "segwit", "atualizacao"]'),

(1, 3, 'O que é Taproot?', 'Tipo de carteira', 'Atualização que melhora privacidade e smart contracts', 'Exchange descentralizada', 'Algoritmo de hash', 'B', 'Taproot é uma atualização do Bitcoin que melhora privacidade e habilita smart contracts mais complexos.', '["bitcoin", "taproot", "privacidade"]'),

(1, 3, 'Como funciona o ajuste de dificuldade?', 'Muda a cada transação', 'Ajusta automaticamente a cada 2016 blocos', 'É definido pelos mineradores', 'Nunca muda', 'B', 'A dificuldade de mineração se ajusta automaticamente a cada 2016 blocos para manter o tempo de bloco em ~10 minutos.', '["bitcoin", "dificuldade", "algoritmo"]');

-- ========================================
-- ETHEREUM - PERGUNTAS RECLASSIFICADAS
-- ========================================

-- FÁCIL (3 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(2, 1, 'O que é Ethereum?', 'Uma criptomoeda', 'Uma plataforma para smart contracts', 'Um banco digital', 'Uma exchange', 'B', 'Ethereum é uma plataforma descentralizada que permite a criação de smart contracts e DApps.', '["ethereum", "plataforma", "smart-contracts"]'),

(2, 1, 'Quem criou o Ethereum?', 'Satoshi Nakamoto', 'Vitalik Buterin', 'Charles Hoskinson', 'Gavin Wood', 'B', 'Vitalik Buterin é o criador principal do Ethereum, proposto em 2013 e lançado em 2015.', '["ethereum", "vitalik", "criador"]'),

(2, 1, 'Qual é o token nativo do Ethereum?', 'BTC', 'ETH', 'ETC', 'ERC', 'B', 'ETH (Ether) é a criptomoeda nativa da rede Ethereum.', '["ethereum", "ether", "token"]'),

(2, 1, 'Em que ano foi lançado o Ethereum?', '2014', '2015', '2016', '2017', 'B', 'O Ethereum foi oficialmente lançado em julho de 2015.', '["ethereum", "lancamento", "historia"]');

-- MÉDIO (7 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(2, 2, 'O que são smart contracts?', 'Contratos em papel', 'Programas que executam automaticamente', 'Acordos verbais', 'Documentos legais', 'B', 'Smart contracts são programas que executam automaticamente quando condições predefinidas são atendidas.', '["ethereum", "smart-contracts", "automacao"]'),

(2, 2, 'O que é gas no Ethereum?', 'Combustível físico', 'Taxa para executar transações', 'Tipo de token', 'Algoritmo de consenso', 'B', 'Gas é a taxa paga para executar transações e smart contracts na rede Ethereum.', '["ethereum", "gas", "taxas"]'),

(2, 2, 'O que é ERC-20?', 'Versão do Ethereum', 'Padrão para tokens fungíveis', 'Tipo de carteira', 'Algoritmo de hash', 'B', 'ERC-20 é o padrão mais comum para criar tokens fungíveis na rede Ethereum.', '["ethereum", "erc20", "tokens"]'),

(2, 2, 'O que é uma DApp?', 'Aplicativo móvel', 'Aplicação descentralizada', 'Site comum', 'Jogo online', 'B', 'DApp (Decentralized Application) é uma aplicação que roda em uma rede blockchain descentralizada.', '["ethereum", "dapp", "descentralizacao"]');

-- DIFÍCIL (15 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(2, 3, 'O que é Ethereum 2.0?', 'Nova criptomoeda', 'Atualização para Proof of Stake', 'Exchange descentralizada', 'Tipo de carteira', 'B', 'Ethereum 2.0 é a atualização que migrou o Ethereum de Proof of Work para Proof of Stake.', '["ethereum", "eth2", "pos"]'),

(2, 3, 'O que é sharding no Ethereum?', 'Divisão de tokens', 'Técnica de escalabilidade que divide a rede', 'Tipo de mineração', 'Algoritmo de hash', 'B', 'Sharding divide a rede Ethereum em partes menores para processar mais transações simultaneamente.', '["ethereum", "sharding", "escalabilidade"]'),

(2, 3, 'O que é MEV?', 'Tipo de token', 'Valor Extraível Máximo por mineradores', 'Algoritmo de consenso', 'Carteira hardware', 'B', 'MEV (Maximal Extractable Value) é o valor que mineradores podem extrair reordenando transações.', '["ethereum", "mev", "mineradores"]');

-- ========================================
-- DEFI - PERGUNTAS RECLASSIFICADAS
-- ========================================

-- FÁCIL (3 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(3, 1, 'O que significa DeFi?', 'Digital Finance', 'Decentralized Finance', 'Distributed Finance', 'Direct Finance', 'B', 'DeFi significa Decentralized Finance (Finanças Descentralizadas).', '["defi", "definicao", "descentralizacao"]'),

(3, 1, 'O que é uma DEX?', 'Exchange centralizada', 'Exchange descentralizada', 'Tipo de token', 'Carteira digital', 'B', 'DEX (Decentralized Exchange) é uma exchange que opera sem autoridade central.', '["defi", "dex", "exchange"]'),

(3, 1, 'O que é staking?', 'Compra de tokens', 'Bloqueio de tokens para ganhar recompensas', 'Venda de tokens', 'Troca de tokens', 'B', 'Staking é o processo de bloquear tokens para ajudar a validar transações e ganhar recompensas.', '["defi", "staking", "recompensas"]');

-- MÉDIO (7 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(3, 2, 'O que é yield farming?', 'Agricultura tradicional', 'Estratégia para maximizar retornos em DeFi', 'Tipo de mineração', 'Compra de terras', 'B', 'Yield farming é a prática de mover fundos entre protocolos DeFi para maximizar retornos.', '["defi", "yield-farming", "retornos"]'),

(3, 2, 'O que é liquidity pool?', 'Piscina física', 'Reserva de tokens para facilitar trocas', 'Tipo de carteira', 'Algoritmo de consenso', 'B', 'Liquidity pool é uma reserva de tokens que permite trocas descentralizadas sem order books.', '["defi", "liquidity-pool", "amm"]'),

(3, 2, 'O que é AMM?', 'Automated Money Maker', 'Automated Market Maker', 'Advanced Mining Machine', 'Automated Minting Mechanism', 'B', 'AMM (Automated Market Maker) é um protocolo que permite trocas automáticas usando algoritmos.', '["defi", "amm", "algoritmo"]'),

(3, 2, 'O que é impermanent loss?', 'Perda permanente de tokens', 'Perda temporária por mudanças de preço', 'Taxa de transação', 'Erro de sistema', 'B', 'Impermanent loss é a perda temporária que ocorre quando preços de tokens em um pool mudam.', '["defi", "impermanent-loss", "risco"]');

-- DIFÍCIL (15 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(3, 3, 'O que é flash loan?', 'Empréstimo rápido tradicional', 'Empréstimo sem garantia que deve ser pago na mesma transação', 'Tipo de staking', 'Algoritmo de consenso', 'B', 'Flash loan é um empréstimo DeFi que deve ser tomado e pago na mesma transação blockchain.', '["defi", "flash-loan", "emprestimo"]'),

(3, 3, 'O que é arbitragem em DeFi?', 'Resolução de disputas', 'Explorar diferenças de preço entre exchanges', 'Tipo de governança', 'Algoritmo de hash', 'B', 'Arbitragem é a prática de lucrar com diferenças de preço do mesmo ativo em diferentes mercados.', '["defi", "arbitragem", "trading"]'),

(3, 3, 'O que é composability em DeFi?', 'Criação de música', 'Capacidade de combinar protocolos como blocos de Lego', 'Tipo de mineração', 'Algoritmo de consenso', 'B', 'Composability permite que protocolos DeFi sejam combinados para criar funcionalidades mais complexas.', '["defi", "composability", "protocolos"]');

-- ========================================
-- SOLANA - PERGUNTAS RECLASSIFICADAS
-- ========================================

-- FÁCIL (3 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(4, 1, 'Qual é o token nativo da Solana?', 'SOL', 'SOLANA', 'SLN', 'SOLA', 'A', 'SOL é o token nativo da blockchain Solana.', '["solana", "sol", "token"]'),

(4, 1, 'Quem fundou a Solana?', 'Vitalik Buterin', 'Anatoly Yakovenko', 'Charles Hoskinson', 'Gavin Wood', 'B', 'Anatoly Yakovenko é o fundador da Solana Labs e criador da blockchain Solana.', '["solana", "anatoly", "fundador"]'),

(4, 1, 'Qual é o símbolo da Solana?', 'SLN', 'SOL', 'SOLA', 'SOLANA', 'B', 'SOL é o símbolo oficial do token nativo da Solana.', '["solana", "simbolo", "ticker"]');

-- MÉDIO (7 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(4, 2, 'O que é Proof of History?', 'Prova de eventos passados', 'Mecanismo de ordenação temporal de transações', 'Tipo de staking', 'Algoritmo de hash', 'B', 'Proof of History é uma inovação da Solana que cria uma ordem temporal verificável de eventos.', '["solana", "poh", "inovacao"]'),

(4, 2, 'Qual é a velocidade de transação da Solana?', '7 TPS', '65.000 TPS', '1.000 TPS', '100 TPS', 'B', 'A Solana pode processar até 65.000 transações por segundo teoricamente.', '["solana", "velocidade", "tps"]'),

(4, 2, 'O que é um validator na Solana?', 'Usuário comum', 'Nó que valida transações', 'Tipo de carteira', 'Exchange', 'B', 'Validators são nós da rede que validam transações e produzem blocos na Solana.', '["solana", "validator", "rede"]'),

(4, 2, 'O que é Phantom?', 'Protocolo DeFi', 'Carteira para Solana', 'Exchange descentralizada', 'Algoritmo de consenso', 'B', 'Phantom é uma das carteiras mais populares para a blockchain Solana.', '["solana", "phantom", "carteira"]');

-- DIFÍCIL (15 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(4, 3, 'O que são epochs na Solana?', 'Tipos de tokens', 'Períodos de tempo para rotação de validators', 'Algoritmos de hash', 'Tipos de transação', 'B', 'Epochs são períodos de aproximadamente 2-3 dias onde a liderança dos validators é determinada.', '["solana", "epochs", "validators"]'),

(4, 3, 'O que é slashing na Solana?', 'Redução de preço', 'Penalidade por comportamento malicioso de validators', 'Tipo de transação', 'Algoritmo de consenso', 'B', 'Slashing é a penalidade aplicada a validators que se comportam de forma maliciosa ou negligente.', '["solana", "slashing", "penalidade"]'),

(4, 3, 'O que é Jupiter na Solana?', 'Planeta do sistema solar', 'Agregador de liquidez para swaps', 'Tipo de validator', 'Algoritmo de hash', 'B', 'Jupiter é o principal agregador de liquidez da Solana, encontrando as melhores rotas para swaps.', '["solana", "jupiter", "dex"]'),

(4, 3, 'O que é Raydium?', 'Tipo de token', 'AMM e DEX na Solana', 'Carteira digital', 'Algoritmo de consenso', 'B', 'Raydium é um dos principais AMMs (Automated Market Makers) da rede Solana.', '["solana", "raydium", "amm"]');

-- ========================================
-- TRADING - PERGUNTAS RECLASSIFICADAS
-- ========================================

-- FÁCIL (3 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(5, 1, 'O que significa HODL?', 'Hold On for Dear Life', 'Hold On for Dear Life', 'High Order Digital Ledger', 'Hash of Digital Ledger', 'A', 'HODL significa "Hold On for Dear Life" - estratégia de manter criptomoedas a longo prazo.', '["trading", "hodl", "estrategia"]'),

(5, 1, 'O que é market cap?', 'Capital do mercado', 'Valor total de todas as moedas em circulação', 'Taxa de mercado', 'Preço máximo', 'B', 'Market cap é o valor total de mercado de uma criptomoeda (preço × supply circulante).', '["trading", "market-cap", "avaliacao"]'),

(5, 1, 'O que significa bull market?', 'Mercado de touros', 'Mercado em alta', 'Mercado de ursos', 'Mercado estável', 'B', 'Bull market é um período prolongado de alta nos preços dos ativos.', '["trading", "bull-market", "alta"]'),

(5, 1, 'O que significa bear market?', 'Mercado de ursos', 'Mercado em baixa', 'Mercado de touros', 'Mercado estável', 'B', 'Bear market é um período prolongado de queda nos preços dos ativos.', '["trading", "bear-market", "baixa"]');

-- MÉDIO (7 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(5, 2, 'O que é volume de trading?', 'Altura do gráfico', 'Quantidade de ativos negociados', 'Preço médio', 'Número de traders', 'B', 'Volume é a quantidade total de um ativo que foi negociado em um período específico.', '["trading", "volume", "liquidez"]'),

(5, 2, 'O que é volatilidade?', 'Estabilidade de preço', 'Variação de preço ao longo do tempo', 'Volume de negociação', 'Número de transações', 'B', 'Volatilidade mede o grau de variação do preço de um ativo ao longo do tempo.', '["trading", "volatilidade", "risco"]'),

(5, 2, 'O que é stop loss?', 'Parar de negociar', 'Ordem para limitar perdas', 'Ganho máximo', 'Taxa de transação', 'B', 'Stop loss é uma ordem que vende automaticamente quando o preço atinge um nível predefinido para limitar perdas.', '["trading", "stop-loss", "gestao-risco"]');

-- DIFÍCIL (15 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(5, 3, 'O que é análise técnica?', 'Análise de tecnologia', 'Estudo de gráficos e padrões de preço', 'Análise de código', 'Estudo de hardware', 'B', 'Análise técnica é o estudo de gráficos de preços e indicadores para prever movimentos futuros.', '["trading", "analise-tecnica", "graficos"]'),

(5, 3, 'O que é RSI?', 'Relative Strength Index', 'Relative Strength Index', 'Random Signal Indicator', 'Rapid Signal Index', 'A', 'RSI (Relative Strength Index) é um indicador que mede se um ativo está sobrecomprado ou sobrevendido.', '["trading", "rsi", "indicador"]'),

(5, 3, 'O que é MACD?', 'Moving Average Convergence Divergence', 'Moving Average Convergence Divergence', 'Market Analysis Crypto Data', 'Maximum Average Crypto Divergence', 'A', 'MACD é um indicador que mostra a relação entre duas médias móveis do preço de um ativo.', '["trading", "macd", "indicador"]');

-- ========================================
-- NFTS - PERGUNTAS RECLASSIFICADAS
-- ========================================

-- FÁCIL (3 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(6, 1, 'O que significa NFT?', 'New Financial Token', 'Non-Fungible Token', 'Network File Transfer', 'Next Future Technology', 'B', 'NFT significa Non-Fungible Token - um token único e não intercambiável.', '["nft", "definicao", "token"]'),

(6, 1, 'Qual blockchain popularizou os NFTs?', 'Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'B', 'Ethereum foi a primeira blockchain a popularizar os NFTs com o padrão ERC-721.', '["nft", "ethereum", "historia"]'),

(6, 1, 'O que torna um NFT único?', 'Seu preço', 'Seu ID único na blockchain', 'Sua cor', 'Seu tamanho', 'B', 'Cada NFT tem um ID único registrado na blockchain que o torna não intercambiável.', '["nft", "unicidade", "blockchain"]');

-- MÉDIO (7 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(6, 2, 'Qual é o padrão mais comum para NFTs no Ethereum?', 'ERC-20', 'ERC-721', 'ERC-1155', 'ERC-777', 'B', 'ERC-721 é o padrão mais comum para NFTs únicos no Ethereum.', '["nft", "erc721", "padrao"]'),

(6, 2, 'O que é minting de NFT?', 'Destruição do NFT', 'Criação de um novo NFT', 'Venda do NFT', 'Transferência do NFT', 'B', 'Minting é o processo de criar um novo NFT e registrá-lo na blockchain.', '["nft", "minting", "criacao"]'),

(6, 2, 'O que é um marketplace de NFT?', 'Loja física', 'Plataforma para comprar e vender NFTs', 'Tipo de carteira', 'Algoritmo de consenso', 'B', 'Marketplace de NFT é uma plataforma onde usuários podem comprar, vender e trocar NFTs.', '["nft", "marketplace", "comercio"]');

-- DIFÍCIL (15 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(6, 3, 'O que são royalties em NFTs?', 'Impostos governamentais', 'Porcentagem paga ao criador em vendas secundárias', 'Taxa de transação', 'Preço mínimo', 'B', 'Royalties são porcentagens automáticas pagas ao criador original a cada venda secundária do NFT.', '["nft", "royalties", "criador"]'),

(6, 3, 'O que são metadados de NFT?', 'Preço do NFT', 'Informações descritivas armazenadas off-chain', 'ID do NFT', 'Dono do NFT', 'B', 'Metadados são informações descritivas do NFT (nome, descrição, imagem) geralmente armazenadas off-chain.', '["nft", "metadados", "informacoes"]'),

(6, 3, 'O que é IPFS em relação aos NFTs?', 'Tipo de NFT', 'Sistema de armazenamento descentralizado', 'Marketplace de NFT', 'Padrão de token', 'B', 'IPFS (InterPlanetary File System) é usado para armazenar metadados e arquivos de NFTs de forma descentralizada.', '["nft", "ipfs", "armazenamento"]');

-- ========================================
-- WALLETS - PERGUNTAS RECLASSIFICADAS
-- ========================================

-- FÁCIL (3 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(7, 1, 'O que é uma carteira de criptomoedas?', 'Carteira física', 'Software que gerencia chaves privadas', 'Conta bancária', 'Aplicativo de pagamento', 'B', 'Uma carteira de criptomoedas é um software que gerencia suas chaves privadas para acessar seus fundos.', '["wallet", "definicao", "chaves"]'),

(7, 1, 'Qual a diferença entre carteira quente e fria?', 'Cor da carteira', 'Conexão com internet', 'Preço da carteira', 'Tamanho da carteira', 'B', 'Carteira quente está conectada à internet, carteira fria está offline para maior segurança.', '["wallet", "hot-cold", "seguranca"]'),

(7, 1, 'O que é uma seed phrase?', 'Senha da carteira', 'Sequência de palavras para recuperar a carteira', 'Endereço da carteira', 'Tipo de criptografia', 'B', 'Seed phrase é uma sequência de palavras que permite recuperar acesso à sua carteira.', '["wallet", "seed-phrase", "recuperacao"]'),

(7, 1, 'O que é MetaMask?', 'Tipo de máscara', 'Carteira de criptomoedas para navegador', 'Exchange centralizada', 'Protocolo DeFi', 'B', 'MetaMask é uma carteira popular que funciona como extensão de navegador para Ethereum.', '["wallet", "metamask", "navegador"]');

-- MÉDIO (7 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(7, 2, 'Quantas palavras tem uma seed phrase padrão?', '8 palavras', '12 ou 24 palavras', '16 palavras', '32 palavras', 'B', 'Seed phrases padrão têm 12 ou 24 palavras, sendo 12 palavras mais comum para uso pessoal.', '["wallet", "seed-phrase", "palavras"]'),

(7, 2, 'O que é uma chave privada?', 'Senha pública', 'Código secreto que controla seus fundos', 'Endereço da carteira', 'Nome da carteira', 'B', 'Chave privada é o código secreto que permite controlar e gastar suas criptomoedas.', '["wallet", "chave-privada", "controle"]'),

(7, 2, 'O que é uma chave pública?', 'Senha secreta', 'Endereço que outros podem ver para enviar fundos', 'Tipo de carteira', 'Algoritmo de hash', 'B', 'Chave pública é derivada da chave privada e pode ser compartilhada para receber fundos.', '["wallet", "chave-publica", "endereco"]');

-- DIFÍCIL (15 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(7, 3, 'O que é derivação de chaves?', 'Cópia de chaves', 'Processo de gerar múltiplas chaves de uma seed', 'Roubo de chaves', 'Backup de chaves', 'B', 'Derivação de chaves é o processo matemático de gerar múltiplas chaves privadas a partir de uma seed phrase.', '["wallet", "derivacao", "criptografia"]'),

(7, 3, 'O que é uma HD wallet?', 'High Definition wallet', 'Hierarchical Deterministic wallet', 'Hard Drive wallet', 'Heavy Duty wallet', 'B', 'HD wallet (Hierarchical Deterministic) pode gerar múltiplos endereços de uma única seed phrase.', '["wallet", "hd-wallet", "hierarquica"]'),

(7, 3, 'O que é multisig?', 'Múltiplas assinaturas', 'Carteira que requer múltiplas chaves para transações', 'Múltiplas moedas', 'Múltiplos usuários', 'B', 'Multisig é uma carteira que requer múltiplas assinaturas (chaves) para autorizar transações.', '["wallet", "multisig", "seguranca"]');

-- ========================================
-- SEGURANÇA - PERGUNTAS RECLASSIFICADAS
-- ========================================

-- FÁCIL (3 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(8, 1, 'Qual é a regra mais importante de segurança?', 'Usar exchanges', 'Nunca compartilhar chave privada', 'Comprar muitas moedas', 'Usar só carteiras online', 'B', 'Nunca compartilhe sua chave privada ou seed phrase com ninguém - isso dá controle total dos seus fundos.', '["seguranca", "chave-privada", "regra"]'),

(8, 1, 'O que é phishing?', 'Tipo de pesca', 'Tentativa de roubar informações pessoais', 'Algoritmo de consenso', 'Tipo de carteira', 'B', 'Phishing é uma tentativa fraudulenta de obter informações sensíveis se passando por entidade confiável.', '["seguranca", "phishing", "fraude"]'),

(8, 1, 'O que é 2FA?', 'Two Factor Authentication', 'Two Factor Authentication', 'Two Financial Assets', 'Two Fast Algorithms', 'A', '2FA (Two Factor Authentication) adiciona uma camada extra de segurança além da senha.', '["seguranca", "2fa", "autenticacao"]');

-- MÉDIO (7 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(8, 2, 'O que é um honeypot em crypto?', 'Pote de mel', 'Contrato que permite comprar mas não vender', 'Tipo de carteira', 'Exchange descentralizada', 'B', 'Honeypot é um smart contract malicioso que permite comprar tokens mas impede a venda.', '["seguranca", "honeypot", "scam"]'),

(8, 2, 'O que é rug pull?', 'Puxar tapete', 'Criadores abandonam projeto e roubam fundos', 'Tipo de staking', 'Algoritmo de consenso', 'B', 'Rug pull é quando criadores de um projeto abandonam-no subitamente e fogem com os fundos dos investidores.', '["seguranca", "rug-pull", "scam"]'),

(8, 2, 'O que é slippage?', 'Escorregão', 'Diferença entre preço esperado e executado', 'Taxa de transação', 'Tipo de carteira', 'B', 'Slippage é a diferença entre o preço esperado e o preço real de execução de uma transação.', '["seguranca", "slippage", "trading"]');

-- DIFÍCIL (15 pontos)
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(8, 3, 'O que é um ataque de 51%?', 'Ataque com 51 pessoas', 'Controle de mais de 50% do poder de hash', 'Roubo de 51 bitcoins', 'Hack de 51 carteiras', 'B', 'Ataque de 51% ocorre quando uma entidade controla mais de 50% do poder de hash de uma rede.', '["seguranca", "51-attack", "consenso"]'),

(8, 3, 'O que é front-running?', 'Correr na frente', 'Executar transação antes de outra para lucrar', 'Tipo de mineração', 'Algoritmo de hash', 'B', 'Front-running é executar uma transação antes de outra conhecida para obter vantagem financeira.', '["seguranca", "front-running", "mev"]'),

(8, 3, 'O que é sandwich attack?', 'Ataque de sanduíche', 'Cercar transação com duas outras para lucrar', 'Tipo de phishing', 'Algoritmo de consenso', 'B', 'Sandwich attack envolve colocar uma transação antes e depois da vítima para manipular preços.', '["seguranca", "sandwich-attack", "mev"]');

-- Verificar distribuição final
SELECT 
    d.name as dificuldade,
    d.points as pontos,
    COUNT(q.id) as total_perguntas,
    ROUND(COUNT(q.id) * 100.0 / (SELECT COUNT(*) FROM quiz_questions), 2) as porcentagem
FROM quiz_difficulties d
LEFT JOIN quiz_questions q ON d.id = q.difficulty_id
GROUP BY d.id, d.name, d.points
ORDER BY d.points;

