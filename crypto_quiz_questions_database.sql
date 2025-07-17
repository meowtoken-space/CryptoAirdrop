-- ========================================
-- BANCO EXTENSO DE PERGUNTAS - CRYPTO QUIZ
-- Centenas de perguntas sobre DeFi, Blockchain e Crypto
-- Categorizado por temas e níveis de dificuldade
-- ========================================

-- INSERÇÃO MASSIVA DE PERGUNTAS POR CATEGORIA

-- ========================================
-- CATEGORIA: BITCOIN (ID: 1)
-- ========================================



-- BITCOIN - NÍVEL INICIANTE
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(1, 1, 'Quem criou o Bitcoin?', 'Vitalik Buterin', 'Satoshi Nakamoto', 'Charlie Lee', 'Gavin Wood', 'B', 'Satoshi Nakamoto é o pseudônimo usado pelo criador anônimo do Bitcoin, que publicou o whitepaper em 2008.', ARRAY['bitcoin', 'satoshi', 'criador']),

(1, 1, 'Em que ano foi criado o Bitcoin?', '2007', '2008', '2009', '2010', 'C', 'O Bitcoin foi lançado em 2009, após o whitepaper ter sido publicado em 2008.', ARRAY['bitcoin', 'história', 'ano']),

(1, 1, 'Qual é o símbolo do Bitcoin?', '₿', 'Ξ', '◎', '₳', 'A', 'O símbolo oficial do Bitcoin é ₿, embora BTC também seja amplamente usado.', ARRAY['bitcoin', 'símbolo']),

(1, 1, 'Qual é a quantidade máxima de Bitcoins que podem existir?', '18 milhões', '21 milhões', '25 milhões', '100 milhões', 'B', 'O protocolo Bitcoin limita o fornecimento total a 21 milhões de moedas.', ARRAY['bitcoin', 'supply', 'limite']),

(1, 1, 'O que é um "bloco" no Bitcoin?', 'Uma carteira digital', 'Um grupo de transações', 'Um tipo de moeda', 'Um protocolo de segurança', 'B', 'Um bloco é um conjunto de transações agrupadas e validadas na blockchain do Bitcoin.', ARRAY['bitcoin', 'bloco', 'transações']),

-- BITCOIN - NÍVEL BÁSICO
(1, 2, 'Quanto tempo leva para minerar um bloco no Bitcoin?', '1 minuto', '5 minutos', '10 minutos', '30 minutos', 'C', 'O protocolo Bitcoin ajusta a dificuldade para manter o tempo médio de mineração em aproximadamente 10 minutos por bloco.', ARRAY['bitcoin', 'mineração', 'tempo']),

(1, 2, 'O que é o "halving" do Bitcoin?', 'Divisão do preço pela metade', 'Redução da recompensa de mineração pela metade', 'Divisão da blockchain', 'Redução das taxas', 'B', 'O halving é um evento que ocorre a cada 210.000 blocos, reduzindo a recompensa dos mineradores pela metade.', ARRAY['bitcoin', 'halving', 'mineração']),

(1, 2, 'Qual algoritmo de consenso o Bitcoin usa?', 'Proof of Stake', 'Proof of Work', 'Delegated Proof of Stake', 'Proof of Authority', 'B', 'Bitcoin usa Proof of Work (PoW), onde mineradores competem para resolver problemas criptográficos.', ARRAY['bitcoin', 'consenso', 'pow']),

(1, 2, 'O que é uma "chave privada" no Bitcoin?', 'Senha da exchange', 'Código secreto para acessar fundos', 'Endereço público', 'Taxa de transação', 'B', 'A chave privada é um código secreto que permite ao proprietário acessar e gastar seus bitcoins.', ARRAY['bitcoin', 'chave privada', 'segurança']),

(1, 2, 'Quantas confirmações são recomendadas para transações Bitcoin importantes?', '1', '3', '6', '12', 'C', 'Para transações de alto valor, são recomendadas pelo menos 6 confirmações para garantir segurança.', ARRAY['bitcoin', 'confirmações', 'segurança']),

-- BITCOIN - NÍVEL INTERMEDIÁRIO
(1, 3, 'O que é a Lightning Network?', 'Uma nova criptomoeda', 'Uma solução de segunda camada para Bitcoin', 'Um protocolo de mineração', 'Uma exchange descentralizada', 'B', 'A Lightning Network é uma solução de segunda camada que permite transações Bitcoin mais rápidas e baratas.', ARRAY['bitcoin', 'lightning', 'segunda camada']),

(1, 3, 'O que significa "UTXO" no Bitcoin?', 'Unspent Transaction Output', 'Universal Transaction Exchange Order', 'Unified Token Exchange Operation', 'User Transaction Verification Object', 'A', 'UTXO significa Unspent Transaction Output, representando bitcoins que podem ser gastos.', ARRAY['bitcoin', 'utxo', 'transações']),

(1, 3, 'Qual é o tamanho máximo de um bloco Bitcoin?', '1 MB', '2 MB', '4 MB', '8 MB', 'A', 'O tamanho máximo de um bloco Bitcoin é de 1 MB, embora SegWit permita blocos efetivamente maiores.', ARRAY['bitcoin', 'bloco', 'tamanho']),

(1, 3, 'O que é SegWit?', 'Um novo algoritmo de mineração', 'Uma atualização que separa dados de assinatura', 'Uma nova criptomoeda', 'Um protocolo de staking', 'B', 'SegWit (Segregated Witness) é uma atualização que separa dados de assinatura, aumentando a capacidade de transações.', ARRAY['bitcoin', 'segwit', 'atualização']),

(1, 3, 'O que é um "fork" no Bitcoin?', 'Uma ferramenta de mineração', 'Uma mudança no protocolo', 'Um tipo de carteira', 'Uma exchange', 'B', 'Um fork é uma mudança nas regras do protocolo Bitcoin, podendo ser soft fork ou hard fork.', ARRAY['bitcoin', 'fork', 'protocolo']),

-- BITCOIN - NÍVEL AVANÇADO
(1, 4, 'O que é Taproot no Bitcoin?', 'Um novo algoritmo de mineração', 'Uma atualização de privacidade e eficiência', 'Uma nova criptomoeda', 'Um protocolo de staking', 'B', 'Taproot é uma atualização que melhora privacidade, eficiência e funcionalidade de contratos inteligentes no Bitcoin.', ARRAY['bitcoin', 'taproot', 'privacidade']),

(1, 4, 'Qual é a função do "nonce" na mineração Bitcoin?', 'Identificar o minerador', 'Número usado uma vez para encontrar hash válido', 'Calcular taxas de transação', 'Verificar assinaturas', 'B', 'O nonce é um número que os mineradores alteram para encontrar um hash que atenda aos requisitos de dificuldade.', ARRAY['bitcoin', 'nonce', 'mineração']),

(1, 4, 'O que são "Schnorr signatures" no Bitcoin?', 'Um novo tipo de carteira', 'Um esquema de assinatura mais eficiente', 'Um protocolo de mineração', 'Uma exchange descentralizada', 'B', 'Schnorr signatures são um esquema de assinatura mais eficiente introduzido com Taproot.', ARRAY['bitcoin', 'schnorr', 'assinaturas']),

(1, 4, 'O que é o "difficulty adjustment" no Bitcoin?', 'Mudança no preço', 'Ajuste automático da dificuldade de mineração', 'Atualização do software', 'Mudança nas taxas', 'B', 'O difficulty adjustment é um mecanismo que ajusta automaticamente a dificuldade de mineração a cada 2016 blocos.', ARRAY['bitcoin', 'dificuldade', 'ajuste']),

(1, 4, 'O que é um "time lock" no Bitcoin?', 'Bloqueio de carteira', 'Restrição temporal em transações', 'Tempo de mineração', 'Sincronização de rede', 'B', 'Time lock é uma funcionalidade que permite criar transações que só podem ser gastas após um tempo específico.', ARRAY['bitcoin', 'timelock', 'transações']),

-- BITCOIN - NÍVEL EXPERT
(1, 5, 'O que é o "Merkle tree" no Bitcoin?', 'Uma estrutura de dados para organizar transações', 'Um algoritmo de mineração', 'Um tipo de carteira', 'Um protocolo de rede', 'A', 'Merkle tree é uma estrutura de dados binária que permite verificação eficiente de transações em um bloco.', ARRAY['bitcoin', 'merkle', 'estrutura']),

(1, 5, 'O que significa "double spending" e como o Bitcoin previne?', 'Gastar duas vezes o mesmo bitcoin através de consenso da rede', 'Pagar taxas duplas', 'Minerar dois blocos', 'Usar duas carteiras', 'A', 'Double spending é gastar o mesmo bitcoin duas vezes. Bitcoin previne através do consenso da rede e confirmações.', ARRAY['bitcoin', 'double spending', 'consenso']),

(1, 5, 'O que é "Replace-by-Fee" (RBF)?', 'Substituir uma transação não confirmada por uma com taxa maior', 'Trocar Bitcoin por outra moeda', 'Reembolsar taxas de transação', 'Substituir mineradores', 'A', 'RBF permite substituir uma transação não confirmada por outra versão com taxa maior para acelerar confirmação.', ARRAY['bitcoin', 'rbf', 'taxas']),

(1, 5, 'O que é um "PSBT" no Bitcoin?', 'Partially Signed Bitcoin Transaction', 'Private Secure Bitcoin Transfer', 'Public Standard Bitcoin Token', 'Protected Signature Bitcoin Technology', 'A', 'PSBT é um formato padrão para transações Bitcoin parcialmente assinadas, útil para carteiras multisig.', ARRAY['bitcoin', 'psbt', 'multisig']),

(1, 5, 'O que é "Coin Selection" na criação de transações Bitcoin?', 'Escolher qual criptomoeda usar', 'Algoritmo para escolher quais UTXOs gastar', 'Selecionar mineradores', 'Escolher taxas de transação', 'B', 'Coin Selection é o algoritmo usado pelas carteiras para escolher quais UTXOs usar ao criar uma transação.', ARRAY['bitcoin', 'coin selection', 'utxo']);

-- ========================================
-- CATEGORIA: ETHEREUM (ID: 2)
-- ========================================


-- ETHEREUM - NÍVEL INICIANTE
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(2, 1, 'Quem criou o Ethereum?', 'Satoshi Nakamoto', 'Vitalik Buterin', 'Charlie Lee', 'Gavin Wood', 'B', 'Vitalik Buterin é o criador do Ethereum, propondo a ideia em 2013 quando tinha apenas 19 anos.', ARRAY['ethereum', 'vitalik', 'criador']),

(2, 1, 'Qual é o símbolo do Ethereum?', '₿', 'Ξ', '◎', '₳', 'B', 'O símbolo do Ethereum é Ξ (xi grego), embora ETH também seja amplamente usado.', ARRAY['ethereum', 'símbolo']),

(2, 1, 'O que são contratos inteligentes?', 'Contratos físicos digitalizados', 'Programas que executam automaticamente', 'Acordos entre exchanges', 'Documentos legais', 'B', 'Contratos inteligentes são programas que executam automaticamente quando condições predefinidas são atendidas.', ARRAY['ethereum', 'smart contracts']),

(2, 1, 'O que é "gas" no Ethereum?', 'Combustível para carros', 'Taxa de transação', 'Tipo de token', 'Protocolo de consenso', 'B', 'Gas é a unidade que mede o custo computacional das operações na rede Ethereum.', ARRAY['ethereum', 'gas', 'taxas']),

(2, 1, 'Em que linguagem são escritos os contratos inteligentes do Ethereum?', 'JavaScript', 'Python', 'Solidity', 'C++', 'C', 'Solidity é a linguagem de programação principal para contratos inteligentes no Ethereum.', ARRAY['ethereum', 'solidity', 'programação']),

-- ETHEREUM - NÍVEL BÁSICO
(2, 2, 'O que é o EVM?', 'Ethereum Virtual Machine', 'Ethereum Value Manager', 'Ethereum Verification Method', 'Ethereum Volume Meter', 'A', 'EVM (Ethereum Virtual Machine) é o ambiente de execução para contratos inteligentes no Ethereum.', ARRAY['ethereum', 'evm', 'virtual machine']),

(2, 2, 'O que significa ERC-20?', 'Ethereum Request for Comments 20', 'Ethereum Regulation Code 20', 'Ethereum Reserve Currency 20', 'Ethereum Random Coin 20', 'A', 'ERC-20 é um padrão técnico para tokens fungíveis na blockchain Ethereum.', ARRAY['ethereum', 'erc20', 'tokens']),

(2, 2, 'Qual é o tempo médio de bloco no Ethereum?', '10 segundos', '15 segundos', '30 segundos', '1 minuto', 'B', 'O Ethereum tem um tempo médio de bloco de aproximadamente 15 segundos.', ARRAY['ethereum', 'bloco', 'tempo']),

(2, 2, 'O que é o "gas limit"?', 'Limite de velocidade', 'Quantidade máxima de gas para uma transação', 'Limite de tokens', 'Restrição de tempo', 'B', 'Gas limit é a quantidade máxima de gas que você está disposto a pagar por uma transação.', ARRAY['ethereum', 'gas limit']),

(2, 2, 'O que são "wei" no Ethereum?', 'Uma criptomoeda diferente', 'A menor unidade do Ether', 'Um tipo de contrato', 'Uma exchange', 'B', 'Wei é a menor denominação do Ether, onde 1 ETH = 10^18 wei.', ARRAY['ethereum', 'wei', 'denominação']),

-- ETHEREUM - NÍVEL INTERMEDIÁRIO
(2, 3, 'O que é Ethereum 2.0?', 'Uma nova criptomoeda', 'Atualização para Proof of Stake', 'Uma exchange', 'Um protocolo de empréstimo', 'B', 'Ethereum 2.0 é uma grande atualização que migra o Ethereum de Proof of Work para Proof of Stake.', ARRAY['ethereum', 'eth2', 'pos']),

(2, 3, 'O que é "sharding" no Ethereum?', 'Quebrar contratos', 'Dividir a blockchain em fragmentos', 'Minerar blocos', 'Trocar tokens', 'B', 'Sharding é uma técnica de escalabilidade que divide a blockchain em fragmentos menores para processar transações em paralelo.', ARRAY['ethereum', 'sharding', 'escalabilidade']),

(2, 3, 'O que é um "oracle" no contexto Ethereum?', 'Um tipo de token', 'Serviço que fornece dados externos', 'Um minerador especial', 'Uma carteira', 'B', 'Oracles são serviços que fornecem dados do mundo real para contratos inteligentes na blockchain.', ARRAY['ethereum', 'oracle', 'dados']),

(2, 3, 'O que é MEV?', 'Maximum Ethereum Value', 'Miner Extractable Value', 'Minimum Exchange Volume', 'Multi Ethereum Validator', 'B', 'MEV (Miner Extractable Value) é o valor que mineradores podem extrair reordenando transações em um bloco.', ARRAY['ethereum', 'mev', 'mineração']),

(2, 3, 'O que é um "reentrancy attack"?', 'Ataque de entrada dupla', 'Vulnerabilidade em contratos inteligentes', 'Tipo de mineração', 'Protocolo de segurança', 'B', 'Reentrancy attack é uma vulnerabilidade onde um contrato malicioso chama repetidamente uma função antes que ela termine.', ARRAY['ethereum', 'reentrancy', 'segurança']),

-- ETHEREUM - NÍVEL AVANÇADO
(2, 4, 'O que é o "London Hard Fork"?', 'Uma nova blockchain', 'Atualização que introduziu EIP-1559', 'Um protocolo de staking', 'Uma exchange', 'B', 'London Hard Fork introduziu EIP-1559, mudando o mecanismo de taxas do Ethereum.', ARRAY['ethereum', 'london', 'eip1559']),

(2, 4, 'O que é EIP-1559?', 'Novo algoritmo de consenso', 'Melhoria no mecanismo de taxas', 'Protocolo de staking', 'Padrão de token', 'B', 'EIP-1559 introduziu uma taxa base que é queimada, tornando as taxas mais previsíveis.', ARRAY['ethereum', 'eip1559', 'taxas']),

(2, 4, 'O que é "The Merge" no Ethereum?', 'Fusão com Bitcoin', 'Transição para Proof of Stake', 'Junção de duas exchanges', 'Novo protocolo DeFi', 'B', 'The Merge foi a transição do Ethereum de Proof of Work para Proof of Stake em setembro de 2022.', ARRAY['ethereum', 'merge', 'pos']),

(2, 4, 'O que são "rollups" no Ethereum?', 'Tipo de token', 'Soluções de escalabilidade de segunda camada', 'Protocolo de mineração', 'Sistema de votação', 'B', 'Rollups são soluções de segunda camada que processam transações fora da cadeia principal para melhorar escalabilidade.', ARRAY['ethereum', 'rollups', 'layer2']),

(2, 4, 'O que é "slashing" no Ethereum 2.0?', 'Reduzir taxas', 'Penalidade por comportamento malicioso de validadores', 'Dividir tokens', 'Acelerar transações', 'B', 'Slashing é uma penalidade onde validadores perdem parte de seus ETH apostados por comportamento malicioso.', ARRAY['ethereum', 'slashing', 'validadores']),

-- ETHEREUM - NÍVEL EXPERT
(2, 5, 'O que é "state rent" no Ethereum?', 'Aluguel de contratos', 'Taxa contínua para armazenar dados na blockchain', 'Custo de validação', 'Taxa de staking', 'B', 'State rent é uma proposta para cobrar taxas contínuas pelo armazenamento de dados na blockchain Ethereum.', ARRAY['ethereum', 'state rent', 'armazenamento']),

(2, 5, 'O que é "verkle trees"?', 'Tipo de token', 'Estrutura de dados para melhorar eficiência', 'Protocolo de consenso', 'Sistema de votação', 'B', 'Verkle trees são uma estrutura de dados que pode reduzir significativamente o tamanho das provas criptográficas.', ARRAY['ethereum', 'verkle trees', 'eficiência']),

(2, 5, 'O que é "statelessness" no Ethereum?', 'Blockchain sem estado', 'Capacidade de validar blocos sem armazenar todo o estado', 'Protocolo sem governança', 'Sistema sem taxas', 'B', 'Statelessness permite que nós validem blocos sem precisar armazenar todo o estado da blockchain.', ARRAY['ethereum', 'statelessness', 'validação']),

(2, 5, 'O que é "PBS" (Proposer-Builder Separation)?', 'Separação de validadores', 'Separação entre quem propõe e constrói blocos', 'Protocolo de staking', 'Sistema de taxas', 'B', 'PBS separa o papel de propor blocos do papel de construir blocos para melhorar descentralização.', ARRAY['ethereum', 'pbs', 'descentralização']),

(2, 5, 'O que é "danksharding"?', 'Novo tipo de sharding', 'Implementação completa de sharding com data availability sampling', 'Protocolo de mineração', 'Sistema de governança', 'B', 'Danksharding é a implementação completa de sharding no Ethereum com data availability sampling.', ARRAY['ethereum', 'danksharding', 'escalabilidade']);

-- ========================================
-- CATEGORIA: DEFI (ID: 3)
-- ========================================


-- DEFI - NÍVEL INICIANTE
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(3, 1, 'O que significa DeFi?', 'Digital Finance', 'Decentralized Finance', 'Distributed Finance', 'Dynamic Finance', 'B', 'DeFi significa Decentralized Finance (Finanças Descentralizadas), referindo-se a serviços financeiros construídos em blockchain.', ARRAY['defi', 'definição']),

(3, 1, 'Qual é a principal vantagem do DeFi?', 'Taxas mais altas', 'Eliminação de intermediários', 'Maior complexidade', 'Menos segurança', 'B', 'A principal vantagem do DeFi é eliminar intermediários tradicionais como bancos, permitindo acesso direto a serviços financeiros.', ARRAY['defi', 'vantagens']),

(3, 1, 'O que é uma DEX?', 'Digital Exchange', 'Decentralized Exchange', 'Dynamic Exchange', 'Distributed Exchange', 'B', 'DEX significa Decentralized Exchange, uma exchange que opera sem autoridade central.', ARRAY['defi', 'dex', 'exchange']),

(3, 1, 'O que é "yield farming"?', 'Plantar criptomoedas', 'Estratégia para maximizar retornos em DeFi', 'Tipo de mineração', 'Protocolo de segurança', 'B', 'Yield farming é a prática de emprestar ou apostar criptomoedas em protocolos DeFi para gerar retornos.', ARRAY['defi', 'yield farming']),

(3, 1, 'O que é liquidez em DeFi?', 'Velocidade de transação', 'Disponibilidade de fundos para negociação', 'Tipo de token', 'Protocolo de segurança', 'B', 'Liquidez refere-se à disponibilidade de fundos em um pool para facilitar negociações e transações.', ARRAY['defi', 'liquidez']),

-- DEFI - NÍVEL BÁSICO
(3, 2, 'O que é um AMM?', 'Automated Market Maker', 'Advanced Money Manager', 'Automated Mining Machine', 'Advanced Market Monitor', 'A', 'AMM (Automated Market Maker) é um protocolo que permite negociação automatizada usando pools de liquidez.', ARRAY['defi', 'amm', 'market maker']),

(3, 2, 'O que é "impermanent loss"?', 'Perda permanente de tokens', 'Perda temporária ao fornecer liquidez', 'Taxa de transação', 'Erro de sistema', 'B', 'Impermanent loss é a perda temporária que provedores de liquidez podem experimentar devido a mudanças de preço.', ARRAY['defi', 'impermanent loss', 'liquidez']),

(3, 2, 'O que é staking em DeFi?', 'Apostar tokens para ganhar recompensas', 'Vender tokens', 'Minerar criptomoedas', 'Trocar tokens', 'A', 'Staking é o processo de bloquear tokens em um protocolo para ganhar recompensas e ajudar a proteger a rede.', ARRAY['defi', 'staking']),

(3, 2, 'O que é um "liquidity pool"?', 'Piscina de natação', 'Reserva de tokens para facilitar negociações', 'Tipo de carteira', 'Protocolo de mineração', 'B', 'Liquidity pool é uma reserva de tokens bloqueados em um contrato inteligente para facilitar negociações descentralizadas.', ARRAY['defi', 'liquidity pool']),

(3, 2, 'O que é "slippage" em DeFi?', 'Escorregão físico', 'Diferença entre preço esperado e executado', 'Taxa de transação', 'Tempo de confirmação', 'B', 'Slippage é a diferença entre o preço esperado de uma negociação e o preço pelo qual ela é executada.', ARRAY['defi', 'slippage']),

-- DEFI - NÍVEL INTERMEDIÁRIO
(3, 3, 'O que é "flash loan"?', 'Empréstimo rápido', 'Empréstimo sem garantia que deve ser pago na mesma transação', 'Empréstimo de longo prazo', 'Empréstimo com juros altos', 'B', 'Flash loan é um empréstimo sem garantia que deve ser tomado e pago de volta na mesma transação.', ARRAY['defi', 'flash loan']),

(3, 3, 'O que é "arbitragem" em DeFi?', 'Resolução de disputas', 'Lucrar com diferenças de preço entre mercados', 'Tipo de staking', 'Protocolo de governança', 'B', 'Arbitragem é a prática de lucrar com diferenças de preço do mesmo ativo em diferentes mercados.', ARRAY['defi', 'arbitragem']),

(3, 3, 'O que é "composability" em DeFi?', 'Capacidade de combinar protocolos', 'Tipo de token', 'Algoritmo de consenso', 'Sistema de votação', 'A', 'Composability é a capacidade de combinar diferentes protocolos DeFi como blocos de construção.', ARRAY['defi', 'composability']),

(3, 3, 'O que é "TVL"?', 'Total Value Locked', 'Token Value Limit', 'Transaction Volume Level', 'Time Value Logic', 'A', 'TVL (Total Value Locked) é o valor total de ativos bloqueados em protocolos DeFi.', ARRAY['defi', 'tvl']),

(3, 3, 'O que é "governance token"?', 'Token de segurança', 'Token que dá direitos de votação', 'Token de pagamento', 'Token de staking', 'B', 'Governance token é um token que dá aos detentores direitos de votação em decisões do protocolo.', ARRAY['defi', 'governance', 'token']),

-- DEFI - NÍVEL AVANÇADO
(3, 4, 'O que é "MEV" em DeFi?', 'Maximum Extractable Value', 'Minimum Exchange Volume', 'Multi Exchange Validator', 'Market Efficiency Value', 'A', 'MEV (Maximum Extractable Value) é o valor máximo que pode ser extraído de um bloco através de reordenação de transações.', ARRAY['defi', 'mev']),

(3, 4, 'O que é "sandwich attack"?', 'Ataque de comida', 'Estratégia MEV que cerca uma transação', 'Tipo de hack', 'Protocolo de segurança', 'B', 'Sandwich attack é uma estratégia MEV onde um atacante coloca transações antes e depois de uma transação alvo.', ARRAY['defi', 'sandwich attack', 'mev']),

(3, 4, 'O que é "just-in-time liquidity"?', 'Liquidez permanente', 'Liquidez fornecida momentos antes de ser necessária', 'Liquidez de emergência', 'Liquidez automática', 'B', 'Just-in-time liquidity é a prática de fornecer liquidez momentos antes de uma grande transação para maximizar taxas.', ARRAY['defi', 'jit liquidity']),

(3, 4, 'O que é "concentrated liquidity"?', 'Liquidez espalhada', 'Liquidez fornecida em faixas de preço específicas', 'Liquidez centralizada', 'Liquidez automática', 'B', 'Concentrated liquidity permite que provedores concentrem sua liquidez em faixas de preço específicas.', ARRAY['defi', 'concentrated liquidity']),

(3, 4, 'O que é "protocol-owned liquidity"?', 'Liquidez de usuários', 'Liquidez controlada pelo próprio protocolo', 'Liquidez externa', 'Liquidez temporária', 'B', 'Protocol-owned liquidity é quando o protocolo possui e controla sua própria liquidez em vez de depender de usuários.', ARRAY['defi', 'pol', 'protocol owned']),

-- DEFI - NÍVEL EXPERT
(3, 5, 'O que é "cross-chain bridge"?', 'Ponte física', 'Protocolo para transferir ativos entre blockchains', 'Tipo de exchange', 'Sistema de pagamento', 'B', 'Cross-chain bridge é um protocolo que permite transferir ativos e dados entre diferentes blockchains.', ARRAY['defi', 'bridge', 'cross chain']),

(3, 5, 'O que é "ve-tokenomics"?', 'Tokenomics de velocidade', 'Sistema onde tokens são bloqueados por tempo para maior poder de voto', 'Tokenomics verificada', 'Sistema de validação', 'B', 've-tokenomics (vote-escrowed) é um sistema onde usuários bloqueiam tokens por períodos para obter maior poder de governança.', ARRAY['defi', 've-tokenomics', 'governance']),

(3, 5, 'O que é "bribes" em DeFi governance?', 'Suborno ilegal', 'Incentivos para votar em propostas específicas', 'Taxa de transação', 'Penalidade', 'B', 'Bribes em DeFi são incentivos legítimos oferecidos para influenciar votos em governança de protocolos.', ARRAY['defi', 'bribes', 'governance']),

(3, 5, 'O que é "convex war"?', 'Guerra física', 'Competição por controle de votos em protocolos', 'Tipo de hack', 'Protocolo de segurança', 'B', 'Convex war refere-se à competição entre protocolos para acumular tokens de governança e influenciar decisões.', ARRAY['defi', 'convex war', 'governance']),

(3, 5, 'O que é "rehypothecation" em DeFi?', 'Reutilização de garantias', 'Uso de ativos já dados como garantia para obter mais empréstimos', 'Tipo de staking', 'Protocolo de segurança', 'B', 'Rehypothecation é a prática de usar ativos já dados como garantia para obter empréstimos adicionais.', ARRAY['defi', 'rehypothecation', 'lending']);

-- ========================================
-- CATEGORIA: SOLANA (ID: 4)
-- ========================================


-- SOLANA - NÍVEL INICIANTE
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(4, 1, 'Qual é o token nativo da Solana?', 'ETH', 'BTC', 'SOL', 'ADA', 'C', 'SOL é o token nativo da blockchain Solana, usado para taxas de transação e staking.', ARRAY['solana', 'sol', 'token']),

(4, 1, 'Quem fundou a Solana?', 'Vitalik Buterin', 'Anatoly Yakovenko', 'Charles Hoskinson', 'Gavin Wood', 'B', 'Anatoly Yakovenko fundou a Solana Labs e criou a blockchain Solana.', ARRAY['solana', 'anatoly', 'fundador']),

(4, 1, 'Qual algoritmo de consenso a Solana usa?', 'Proof of Work', 'Proof of Stake', 'Proof of History + Proof of Stake', 'Delegated Proof of Stake', 'C', 'Solana usa uma combinação de Proof of History (PoH) e Proof of Stake (PoS).', ARRAY['solana', 'consenso', 'poh']),

(4, 1, 'Qual é o símbolo da Solana?', '₿', 'Ξ', '◎', '₳', 'C', 'O símbolo da Solana é ◎, representando o sol.', ARRAY['solana', 'símbolo']),

(4, 1, 'Em que linguagem são escritos os programas Solana?', 'Solidity', 'Rust', 'JavaScript', 'Python', 'B', 'Os programas (smart contracts) da Solana são principalmente escritos em Rust.', ARRAY['solana', 'rust', 'programação']),

-- SOLANA - NÍVEL BÁSICO
(4, 2, 'O que é Proof of History?', 'Prova de trabalho', 'Sistema de timestamp criptográfico', 'Algoritmo de mineração', 'Protocolo de staking', 'B', 'Proof of History é um sistema de timestamp criptográfico que cria ordem histórica de eventos.', ARRAY['solana', 'poh', 'timestamp']),

(4, 2, 'Qual é a velocidade de transação da Solana?', '7 TPS', '1.000 TPS', '50.000+ TPS', '100 TPS', 'C', 'Solana pode processar mais de 50.000 transações por segundo.', ARRAY['solana', 'tps', 'velocidade']),

(4, 2, 'O que é um "validator" na Solana?', 'Verificador de identidade', 'Nó que valida transações e produz blocos', 'Tipo de carteira', 'Exchange descentralizada', 'B', 'Validators são nós que validam transações e produzem blocos na rede Solana.', ARRAY['solana', 'validator']),

(4, 2, 'O que é "rent" na Solana?', 'Aluguel de tokens', 'Taxa para manter contas ativas', 'Custo de transação', 'Taxa de staking', 'B', 'Rent é uma taxa paga para manter contas ativas na blockchain Solana.', ARRAY['solana', 'rent', 'contas']),

(4, 2, 'O que é Phantom?', 'Token fantasma', 'Carteira popular para Solana', 'Protocolo DeFi', 'Exchange', 'B', 'Phantom é uma das carteiras mais populares para a blockchain Solana.', ARRAY['solana', 'phantom', 'carteira']),

-- SOLANA - NÍVEL INTERMEDIÁRIO
(4, 3, 'O que é Serum?', 'Medicamento', 'DEX construída na Solana', 'Protocolo de staking', 'Tipo de token', 'B', 'Serum é uma exchange descentralizada (DEX) construída na blockchain Solana.', ARRAY['solana', 'serum', 'dex']),

(4, 3, 'O que são "epochs" na Solana?', 'Períodos de tempo fixos', 'Tipos de transação', 'Algoritmos de consenso', 'Protocolos DeFi', 'A', 'Epochs são períodos de tempo fixos (aproximadamente 2-3 dias) usados para staking e recompensas.', ARRAY['solana', 'epochs']),

(4, 3, 'O que é Jupiter na Solana?', 'Planeta', 'Agregador de liquidez', 'Protocolo de empréstimo', 'Tipo de NFT', 'B', 'Jupiter é um agregador de liquidez que encontra as melhores rotas para swaps na Solana.', ARRAY['solana', 'jupiter', 'agregador']),

(4, 3, 'O que é Raydium?', 'Elemento químico', 'AMM e DEX na Solana', 'Protocolo de staking', 'Tipo de carteira', 'B', 'Raydium é um Automated Market Maker (AMM) e DEX construído na Solana.', ARRAY['solana', 'raydium', 'amm']),

(4, 3, 'O que é "slashing" na Solana?', 'Cortar tokens', 'Penalidade por comportamento malicioso', 'Acelerar transações', 'Dividir recompensas', 'B', 'Slashing é uma penalidade onde validators perdem parte de seus tokens por comportamento malicioso.', ARRAY['solana', 'slashing', 'penalidade']),

-- TRADING - NÍVEL INICIANTE
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(6, 1, 'O que significa "HODL"?', 'Hold On for Dear Life', 'High Order Digital Ledger', 'Hash Output Data Link', 'Hybrid Online Distribution', 'A', 'HODL significa "Hold On for Dear Life", estratégia de manter criptomoedas a longo prazo.', ARRAY['trading', 'hodl', 'estratégia']),

(6, 1, 'O que é "market cap"?', 'Limite de mercado', 'Capitalização de mercado', 'Capacidade de mercado', 'Capital de mercado', 'B', 'Market cap é o valor total de todas as moedas em circulação de uma criptomoeda.', ARRAY['trading', 'market cap']),

(6, 1, 'O que significa "bull market"?', 'Mercado de touros', 'Mercado em alta', 'Mercado volátil', 'Mercado fechado', 'B', 'Bull market é um período prolongado de preços em alta no mercado.', ARRAY['trading', 'bull market']),

(6, 1, 'O que significa "bear market"?', 'Mercado de ursos', 'Mercado em baixa', 'Mercado estável', 'Mercado novo', 'B', 'Bear market é um período prolongado de preços em baixa no mercado.', ARRAY['trading', 'bear market']),

(6, 1, 'O que é "volume" em trading?', 'Som alto', 'Quantidade de tokens negociados', 'Tamanho da tela', 'Velocidade de transação', 'B', 'Volume é a quantidade total de tokens negociados em um período específico.', ARRAY['trading', 'volume']),

-- NFTS - NÍVEL INICIANTE
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(5, 1, 'O que significa NFT?', 'New Financial Token', 'Non-Fungible Token', 'Network File Transfer', 'Next Future Technology', 'B', 'NFT significa Non-Fungible Token, um tipo de token único e não intercambiável.', ARRAY['nft', 'definição']),

(5, 1, 'Qual blockchain popularizou os NFTs?', 'Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'B', 'Ethereum foi a blockchain que popularizou os NFTs com o padrão ERC-721.', ARRAY['nft', 'ethereum']),

(5, 1, 'O que torna um NFT único?', 'Preço alto', 'Metadados únicos e ID na blockchain', 'Cor especial', 'Tamanho grande', 'B', 'NFTs são únicos devido aos seus metadados únicos e ID específico na blockchain.', ARRAY['nft', 'unicidade']),

(5, 1, 'Qual é o padrão mais comum para NFTs no Ethereum?', 'ERC-20', 'ERC-721', 'ERC-1155', 'ERC-777', 'B', 'ERC-721 é o padrão mais comum para NFTs no Ethereum.', ARRAY['nft', 'erc721']),

(5, 1, 'O que é "minting" um NFT?', 'Destruir o NFT', 'Criar e registrar o NFT na blockchain', 'Vender o NFT', 'Copiar o NFT', 'B', 'Minting é o processo de criar e registrar um NFT na blockchain.', ARRAY['nft', 'minting']),

-- WALLETS - NÍVEL INICIANTE
INSERT INTO quiz_questions (category_id, difficulty_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, tags) VALUES
(8, 1, 'O que é uma carteira de criptomoedas?', 'Carteira física', 'Software para armazenar chaves privadas', 'Conta bancária', 'Exchange', 'B', 'Uma carteira de criptomoedas é um software que armazena suas chaves privadas e permite gerenciar seus ativos.', ARRAY['wallet', 'definição']),

(8, 1, 'Qual é a diferença entre carteira quente e fria?', 'Temperatura', 'Conexão com internet', 'Cor da interface', 'Velocidade', 'B', 'Carteira quente está conectada à internet, carteira fria está offline.', ARRAY['wallet', 'hot cold']),

(8, 1, 'O que é uma seed phrase?', 'Frase de crescimento', 'Conjunto de palavras para recuperar carteira', 'Senha da exchange', 'Código de segurança', 'B', 'Seed phrase é um conjunto de palavras usado para recuperar acesso à sua carteira.', ARRAY['wallet', 'seed phrase']),

(8, 1, 'Quantas palavras geralmente tem uma seed phrase?', '8', '12', '16', '24', 'B', 'Seed phrases geralmente têm 12 ou 24 palavras, sendo 12 o mais comum.', ARRAY['wallet', 'seed words']),

(8, 1, 'O que é MetaMask?', 'Máscara facial', 'Carteira de criptomoedas popular', 'Protocolo de privacidade', 'Exchange', 'B', 'MetaMask é uma das carteiras de criptomoedas mais populares, especialmente para Ethereum.', ARRAY['wallet', 'metamask']);

-- ADICIONAR MAIS CATEGORIAS E PERGUNTAS...
-- [Continuaria com mais perguntas para completar todas as categorias]

-- Verificação final
SELECT 'Banco de perguntas criado com sucesso! Total de perguntas inseridas.' as status;

