# 🐱 MEOW Token - Sistema de Airdrop Gamificado

![MEOW Token Banner](https://img.shields.io/badge/MEOW-Token-purple?style=for-the-badge&logo=solana&logoColor=white)
![Solana](https://img.shields.io/badge/Solana-Blockchain-green?style=for-the-badge&logo=solana)
![Status](https://img.shields.io/badge/Status-Pronto%20para%20Desenvolvimento-brightgreen?style=for-the-badge)

## 🚀 Visão Geral

O **MEOW Token** é um sistema revolucionário de airdrop gamificado construído na blockchain Solana. Combina jogos interativos, sistema de pontos, NFTs exclusivos e uma pré-venda inovadora para criar a experiência de airdrop mais envolvente do mercado.

## ✨ Características Principais

### 🎮 Sistema de Jogos
- **5 Jogos Únicos**: MeowClicker, CryptoQuiz, LuckySpin, TreasureHunt, BattleArena
- **Sistema de Pontos**: Ganhe pontos jogando e seja elegível para o TGE
- **Ranking Global**: Compete com outros jogadores em tempo real
- **Reset Diário**: Novas oportunidades todos os dias às 21:00

### 🔗 Integração Blockchain
- **Solana Native**: Construído especificamente para Solana
- **Phantom Wallet**: Integração completa com carteiras Solana
- **Sistema Anti-Fraude**: Validação blockchain para todos os pontos
- **Transações Rápidas**: Aproveitando a velocidade da Solana

### 🎨 Interface Cyberpunk
- **Design Futurista**: Visual cyberpunk com efeitos neon
- **Responsivo**: Funciona perfeitamente em desktop e mobile
- **Animações Fluidas**: Experiência visual imersiva
- **Tema Personalizado**: Cores roxas e ciano características

### 💰 Sistema de Pré-venda
- **Barra de Progresso**: Acompanhe o progresso em tempo real
- **Milestones**: Recompensas especiais ao atingir metas
- **Transparência Total**: Todos os dados verificáveis no Supabase
- **Integração com Pontos**: Bônus para participantes ativos

## 🛠️ Stack Tecnológico

### Frontend
- **React 18**: Framework principal
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização moderna
- **Vite**: Build tool otimizado

### Backend
- **Supabase**: Banco de dados e autenticação
- **PostgreSQL**: Banco de dados robusto
- **Real-time**: Atualizações em tempo real
- **Row Level Security**: Segurança avançada

### Blockchain
- **Solana Web3.js**: Integração com Solana
- **Phantom Wallet**: Conexão de carteiras
- **Jupiter API**: Swaps e preços
- **Metaplex**: Padrão para NFTs

## 📁 Estrutura do Projeto

```
CryptoAirdrop/
├── 📄 Documentação/
│   ├── GUIA_CONTROLE_TOTAL_SUPABASE.md
│   ├── GUIA_COMPLETO_SOLSEA_MEOW_TOKEN.md
│   ├── PRD_SISTEMA_LOGIN_MEOW_TOKEN.md
│   ├── MEOW_TOKEN_LOGIN_PLAN.md
│   └── PREVC_MEOW_TOKEN_COMPLETO.md
├── 🔧 Prompts de Implementação/
│   ├── PROMPT_AGENTE_REPLIT_ATUALIZADO_FINAL.md
│   ├── PROMPT_BARRA_PROGRESSO_PREVENDA_SUPABASE.md
│   ├── PROMPT_IMPLEMENTAR_LOGIN_GOOGLE_HIBRIDO.md
│   └── PROMPT_IMPLEMENTAR_SISTEMA_AUTENTICACAO_COMPLETO.md
├── 🗄️ Banco de Dados/
│   ├── SUPABASE_MEOW_TOKEN_COMPLETO.sql
│   ├── SUPABASE_LOGIN_GOOGLE_FINAL.sql
│   └── crypto_quiz_questions_database.sql
├── 🎮 Componentes de Jogos/
│   ├── MeowClicker.tsx
│   ├── CryptoQuiz.tsx
│   ├── LuckySpin.tsx
│   ├── TreasureHunt.tsx
│   └── BattleArena.tsx
├── 🔗 Integrações/
│   ├── SolanaWallet.tsx
│   ├── JupiterSwap.tsx
│   ├── CoinGeckoAPI.tsx
│   └── supabase_client_config.js
└── 📋 Planejamento/
    ├── sistema_pontos_tge.md
    ├── sistema_gamificacao_completo.md
    └── documentacao_final_sistema_pontos.md
```

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Autenticação
- [x] Login com Google OAuth
- [x] Verificação de email
- [x] Conexão opcional de carteira Phantom
- [x] Sistema híbrido (Google + Carteira)

### ✅ Jogos Gamificados
- [x] **MeowClicker**: Sistema de energia e multiplicadores
- [x] **CryptoQuiz**: 30+ perguntas sobre crypto/DeFi
- [x] **LuckySpin**: Roleta com 5 níveis de raridade
- [x] **TreasureHunt**: Caça ao tesouro estilo campo minado
- [x] **BattleArena**: Sistema de batalha RPG por turnos

### ✅ Sistema de Pontos
- [x] Integração completa com Supabase
- [x] Validação por carteira Solana
- [x] Limites diários por jogo
- [x] Reset automático às 21:00
- [x] Ranking global em tempo real

### ✅ Pré-venda Interativa
- [x] Barra de progresso dinâmica
- [x] Sistema de milestones
- [x] Notificações de compras
- [x] Integração com sistema de pontos

## 🚀 Como Usar no Cursor

### 1. Clone o Repositório
```bash
git clone https://github.com/meowtoken-space/CryptoAirdrop.git
cd CryptoAirdrop
```

### 2. Análise Completa
```bash
# Listar todos os arquivos importantes
find . -name "*.md" -o -name "*.sql" -o -name "*.tsx" -o -name "*.js" | head -50

# Ver estrutura do projeto
tree -L 2
```

### 3. Documentos Essenciais
- **PREVC_MEOW_TOKEN_COMPLETO.md** - Guia completo para implementação
- **DEPLOY_INSTRUCTIONS.md** - Instruções de deploy
- **PROMPT_AGENTE_REPLIT_ATUALIZADO_FINAL.md** - Prompt principal

### 4. Configure o Ambiente
```bash
# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
```

## 🔧 Configuração

### Variáveis de Ambiente Necessárias
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
```

### Configuração do Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute os scripts SQL fornecidos
3. Configure as políticas RLS
4. Ative a autenticação Google

## 📊 Métricas e Analytics

### Sistema de Pontos
- **Total de Pontos**: Soma de todos os jogos
- **Pontos Diários**: Reset às 21:00 (horário de Brasília)
- **Ranking**: Top 50 jogadores em tempo real
- **Histórico**: Todas as ações registradas

### Jogos Balanceados
- **MeowClicker**: 1 ponto por clique (máx. 1000/dia)
- **CryptoQuiz**: 3-15 pontos por pergunta (máx. 20/dia)
- **LuckySpin**: 1-50 pontos por spin (máx. 5/dia)
- **TreasureHunt**: 5-25 pontos por tesouro (máx. 3/dia)
- **BattleArena**: 3-15 pontos por vitória (máx. 10/dia)

## 🛡️ Segurança

### Medidas Implementadas
- **Row Level Security**: Proteção a nível de banco
- **Validação de Carteira**: Verificação de assinatura
- **Rate Limiting**: Controle de requests
- **Anti-Cheat**: Sistema de detecção de fraudes
- **Criptografia**: AES-256 para dados sensíveis

## 🤝 Contribuição

Este projeto está em desenvolvimento ativo. Para contribuir:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🔗 Links Importantes

- **Website**: [Em breve]
- **Documentação**: [Pasta raiz](.)
- **Supabase**: [Dashboard](https://supabase.com/dashboard)
- **Solana**: [Solana.com](https://solana.com)

## 📞 Contato

- **Email**: meowtoken@space.com
- **Twitter**: [@MeowTokenSpace](https://twitter.com/MeowTokenSpace)
- **Discord**: [MEOW Community](https://discord.gg/meowtoken)

---

## 🎯 Para Desenvolvedores (Claude Code)

### Documentos Essenciais:
1. **PREVC_MEOW_TOKEN_COMPLETO.md** - Planejamento completo
2. **PROMPT_AGENTE_REPLIT_ATUALIZADO_FINAL.md** - Implementação
3. **SUPABASE_MEOW_TOKEN_COMPLETO.sql** - Banco de dados

### Ordem de Implementação:
1. Configurar Supabase (executar SQLs)
2. Implementar autenticação híbrida
3. Desenvolver jogos (MeowClicker → CryptoQuiz → outros)
4. Integrar sistema de pontos
5. Criar ranking global
6. Implementar pré-venda

### Comandos Úteis:
```bash
# Análise rápida do projeto
ls -la *.md *.sql *.tsx *.js | head -20

# Ver prompts de implementação
ls PROMPT_*.md

# Ver componentes de jogos
ls *Clicker* *Quiz* *Spin* *Hunt* *Arena*
```

**🐱 Feito com amor pela comunidade MEOW Token** 💜

![Footer](https://img.shields.io/badge/Powered%20by-Solana-green?style=for-the-badge&logo=solana)
![Footer](https://img.shields.io/badge/Built%20with-React-blue?style=for-the-badge&logo=react)
![Footer](https://img.shields.io/badge/Database-Supabase-green?style=for-the-badge&logo=supabase)

