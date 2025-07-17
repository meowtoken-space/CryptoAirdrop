# 🎮 SISTEMA DE GAMIFICAÇÃO COMPLETO - CRYPTOAIRDROP

## 📊 ANÁLISE DO SEU PROJETO

Baseado na análise do seu CryptoAirdrop, identifiquei:

### ✅ **O QUE JÁ EXISTE:**
- Frontend React + TypeScript + Tailwind
- Integração Solana (WalletProvider, PhantomLogin)
- Componentes de jogos criados (MeowClicker, CryptoQuiz, etc.)
- Sistema de autenticação (SupabaseAuth)
- Layout responsivo e design futurista

### 🎯 **O QUE PRECISA SER IMPLEMENTADO:**
- Sistema de pontos (Meow Points) off-chain
- Ranking em tempo real
- Criação de tokens Solana automática
- Pré-venda integrada
- Gamificação completa

---

## 🏆 ARQUITETURA RECOMENDADA

### **1. BACKEND: Supabase + PostgreSQL**

#### **Tabelas Necessárias:**

```sql
-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  meow_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_games_played INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Jogos
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  points_per_action INTEGER DEFAULT 1,
  max_daily_points INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true
);

-- Pontuações dos jogos
CREATE TABLE game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  game_id UUID REFERENCES games(id),
  points_earned INTEGER NOT NULL,
  session_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ranking
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  rank_position INTEGER,
  total_points INTEGER,
  period TEXT, -- 'daily', 'weekly', 'monthly', 'all_time'
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tokens criados
CREATE TABLE token_mints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  token_address TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  points_spent INTEGER NOT NULL,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pré-venda
CREATE TABLE presale_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount_sol DECIMAL NOT NULL,
  tokens_received DECIMAL NOT NULL,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Configuração Supabase:**

```javascript
// supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Configurar RLS (Row Level Security)
-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (wallet_address = auth.jwt() ->> 'wallet_address');

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (wallet_address = auth.jwt() ->> 'wallet_address');
```

---

### **2. SISTEMA DE PONTOS**

#### **Hook para Gerenciar Pontos:**

```typescript
// hooks/usePoints.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useWallet } from '@solana/wallet-adapter-react'

export const usePoints = () => {
  const { publicKey } = useWallet()
  const [points, setPoints] = useState(0)
  const [level, setLevel] = useState(1)
  const [xp, setXp] = useState(0)

  // Buscar pontos do usuário
  const fetchUserPoints = async () => {
    if (!publicKey) return

    const { data, error } = await supabase
      .from('users')
      .select('meow_points, level, xp')
      .eq('wallet_address', publicKey.toString())
      .single()

    if (data) {
      setPoints(data.meow_points)
      setLevel(data.level)
      setXp(data.xp)
    }
  }

  // Adicionar pontos
  const addPoints = async (gameId: string, pointsEarned: number) => {
    if (!publicKey) return

    try {
      // 1. Registrar pontuação do jogo
      await supabase.from('game_scores').insert({
        user_id: (await getUserId()),
        game_id: gameId,
        points_earned: pointsEarned
      })

      // 2. Atualizar pontos totais do usuário
      const newPoints = points + pointsEarned
      const newXp = xp + pointsEarned
      const newLevel = Math.floor(newXp / 1000) + 1

      await supabase
        .from('users')
        .update({
          meow_points: newPoints,
          xp: newXp,
          level: newLevel,
          total_games_played: supabase.sql`total_games_played + 1`
        })
        .eq('wallet_address', publicKey.toString())

      setPoints(newPoints)
      setXp(newXp)
      setLevel(newLevel)

      // 3. Atualizar ranking
      await updateRanking()

      return { success: true, newPoints, newLevel }
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error)
      return { success: false, error }
    }
  }

  // Atualizar ranking
  const updateRanking = async () => {
    // Função para recalcular posições no ranking
    await supabase.rpc('update_leaderboard')
  }

  useEffect(() => {
    fetchUserPoints()
  }, [publicKey])

  return {
    points,
    level,
    xp,
    addPoints,
    fetchUserPoints
  }
}
```

#### **Função SQL para Ranking:**

```sql
-- Função para atualizar ranking
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS void AS $$
BEGIN
  -- Ranking geral
  WITH ranked_users AS (
    SELECT 
      id,
      meow_points,
      ROW_NUMBER() OVER (ORDER BY meow_points DESC) as rank_pos
    FROM users
    WHERE meow_points > 0
  )
  INSERT INTO leaderboard (user_id, rank_position, total_points, period)
  SELECT id, rank_pos, meow_points, 'all_time'
  FROM ranked_users
  ON CONFLICT (user_id, period) 
  DO UPDATE SET 
    rank_position = EXCLUDED.rank_position,
    total_points = EXCLUDED.total_points,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

---

### **3. CRIAÇÃO DE TOKENS SOLANA**

#### **Serviço de Token Creation:**

```typescript
// services/tokenService.ts
import { 
  Connection, 
  Keypair, 
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js'
import { 
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'

export class TokenService {
  private connection: Connection
  private mintAuthority: Keypair // Sua chave privada para criar tokens

  constructor() {
    this.connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
    )
    // IMPORTANTE: Manter a chave privada segura no servidor
    this.mintAuthority = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.MINT_AUTHORITY_SECRET_KEY!))
    )
  }

  // Criar novo token MEOW
  async createMeowToken(
    userWallet: PublicKey,
    amount: number,
    pointsSpent: number
  ) {
    try {
      // 1. Criar mint (se não existir)
      const mint = await this.getOrCreateMeowMint()

      // 2. Criar conta de token para o usuário
      const userTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.mintAuthority,
        mint,
        userWallet
      )

      // 3. Mintar tokens para o usuário
      const signature = await mintTo(
        this.connection,
        this.mintAuthority,
        mint,
        userTokenAccount.address,
        this.mintAuthority,
        amount * 1e9 // Converter para lamports (9 decimais)
      )

      // 4. Registrar no banco de dados
      await supabase.from('token_mints').insert({
        user_id: await this.getUserId(userWallet),
        token_address: mint.toString(),
        amount: amount,
        points_spent: pointsSpent,
        transaction_hash: signature,
        status: 'completed'
      })

      return {
        success: true,
        signature,
        tokenAccount: userTokenAccount.address.toString(),
        amount
      }
    } catch (error) {
      console.error('Erro ao criar token:', error)
      return { success: false, error }
    }
  }

  // Obter ou criar mint do MEOW token
  private async getOrCreateMeowMint(): Promise<PublicKey> {
    // Verificar se já existe um mint salvo
    const existingMint = process.env.MEOW_TOKEN_MINT_ADDRESS
    
    if (existingMint) {
      return new PublicKey(existingMint)
    }

    // Criar novo mint
    const mint = await createMint(
      this.connection,
      this.mintAuthority,
      this.mintAuthority.publicKey,
      this.mintAuthority.publicKey,
      9 // 9 decimais
    )

    console.log('Novo MEOW Token criado:', mint.toString())
    return mint
  }

  // Converter pontos em tokens (taxa de conversão)
  calculateTokenAmount(points: number): number {
    // Exemplo: 1000 pontos = 1 MEOW token
    return points / 1000
  }
}
```

#### **API Route para Token Creation:**

```typescript
// pages/api/create-tokens.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { TokenService } from '../../services/tokenService'
import { PublicKey } from '@solana/web3.js'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { walletAddress, pointsToConvert } = req.body

    // Validações
    if (!walletAddress || !pointsToConvert) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (pointsToConvert < 1000) {
      return res.status(400).json({ error: 'Minimum 1000 points required' })
    }

    // Verificar se usuário tem pontos suficientes
    const { data: user } = await supabase
      .from('users')
      .select('meow_points')
      .eq('wallet_address', walletAddress)
      .single()

    if (!user || user.meow_points < pointsToConvert) {
      return res.status(400).json({ error: 'Insufficient points' })
    }

    // Criar tokens
    const tokenService = new TokenService()
    const tokenAmount = tokenService.calculateTokenAmount(pointsToConvert)
    
    const result = await tokenService.createMeowToken(
      new PublicKey(walletAddress),
      tokenAmount,
      pointsToConvert
    )

    if (result.success) {
      // Deduzir pontos do usuário
      await supabase
        .from('users')
        .update({ 
          meow_points: user.meow_points - pointsToConvert 
        })
        .eq('wallet_address', walletAddress)

      res.status(200).json({
        success: true,
        signature: result.signature,
        tokenAmount,
        pointsSpent: pointsToConvert
      })
    } else {
      res.status(500).json({ error: 'Failed to create tokens' })
    }
  } catch (error) {
    console.error('Token creation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

---

### **4. SISTEMA DE PRÉ-VENDA**

#### **Componente de Pré-venda:**

```typescript
// components/PreSale.tsx
import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'

export const PreSale: React.FC = () => {
  const { publicKey, sendTransaction } = useWallet()
  const [solAmount, setSolAmount] = useState('')
  const [loading, setLoading] = useState(false)

  // Configurações da pré-venda
  const PRESALE_RATE = 1000000 // 1 SOL = 1,000,000 MEOW tokens
  const PRESALE_WALLET = new PublicKey('YOUR_PRESALE_WALLET_ADDRESS')
  const MIN_PURCHASE = 0.1 // SOL mínimo
  const MAX_PURCHASE = 10 // SOL máximo

  const handlePurchase = async () => {
    if (!publicKey || !sendTransaction) return

    const amount = parseFloat(solAmount)
    if (amount < MIN_PURCHASE || amount > MAX_PURCHASE) {
      alert(`Compra deve ser entre ${MIN_PURCHASE} e ${MAX_PURCHASE} SOL`)
      return
    }

    setLoading(true)

    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL!
      )

      // Criar transação
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: PRESALE_WALLET,
          lamports: amount * 1e9 // Converter SOL para lamports
        })
      )

      // Enviar transação
      const signature = await sendTransaction(transaction, connection)
      
      // Confirmar transação
      await connection.confirmTransaction(signature, 'confirmed')

      // Registrar compra no banco
      const tokensReceived = amount * PRESALE_RATE
      
      await fetch('/api/presale-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          amountSol: amount,
          tokensReceived,
          transactionHash: signature
        })
      })

      alert(`Compra realizada! Você receberá ${tokensReceived.toLocaleString()} MEOW tokens`)
      setSolAmount('')
    } catch (error) {
      console.error('Erro na compra:', error)
      alert('Erro ao processar compra')
    } finally {
      setLoading(false)
    }
  }

  const calculateTokens = () => {
    const amount = parseFloat(solAmount) || 0
    return (amount * PRESALE_RATE).toLocaleString()
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-purple-900 to-blue-900 p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Pré-venda MEOW Token</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-white mb-2">Quantidade SOL</label>
          <input
            type="number"
            value={solAmount}
            onChange={(e) => setSolAmount(e.target.value)}
            placeholder="0.1"
            min={MIN_PURCHASE}
            max={MAX_PURCHASE}
            step="0.1"
            className="w-full p-3 rounded-lg bg-black/20 text-white border border-purple-500"
          />
        </div>

        <div className="bg-black/20 p-3 rounded-lg">
          <p className="text-white">
            Você receberá: <span className="font-bold">{calculateTokens()} MEOW</span>
          </p>
          <p className="text-sm text-gray-300">
            Taxa: 1 SOL = {PRESALE_RATE.toLocaleString()} MEOW
          </p>
        </div>

        <button
          onClick={handlePurchase}
          disabled={!publicKey || loading || !solAmount}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Processando...' : 'Comprar Tokens'}
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-300">
        <p>• Mínimo: {MIN_PURCHASE} SOL</p>
        <p>• Máximo: {MAX_PURCHASE} SOL</p>
        <p>• Tokens serão enviados automaticamente</p>
      </div>
    </div>
  )
}
```

---

### **5. RANKING EM TEMPO REAL**

#### **Componente de Leaderboard:**

```typescript
// components/Leaderboard.tsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface LeaderboardEntry {
  rank_position: number
  user: {
    username: string
    wallet_address: string
    level: number
  }
  total_points: number
}

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('all_time')
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = async () => {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('leaderboard')
      .select(`
        rank_position,
        total_points,
        user:users(username, wallet_address, level)
      `)
      .eq('period', period)
      .order('rank_position', { ascending: true })
      .limit(100)

    if (data) {
      setLeaderboard(data)
    }
    
    setLoading(false)
  }

  // Subscription para atualizações em tempo real
  useEffect(() => {
    fetchLeaderboard()

    const subscription = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leaderboard',
          filter: `period=eq.${period}`
        }, 
        () => {
          fetchLeaderboard()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [period])

  const formatWallet = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return '👑'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${position}`
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-white mb-6">🏆 Ranking</h2>

      {/* Filtros de período */}
      <div className="flex space-x-2 mb-6">
        {(['all_time', 'monthly', 'weekly', 'daily'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg font-medium ${
              period === p
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {p === 'all_time' ? 'Geral' : 
             p === 'monthly' ? 'Mensal' :
             p === 'weekly' ? 'Semanal' : 'Diário'}
          </button>
        ))}
      </div>

      {/* Lista do ranking */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          leaderboard.map((entry) => (
            <div
              key={`${entry.user.wallet_address}-${period}`}
              className={`flex items-center justify-between p-4 rounded-lg ${
                entry.rank_position <= 3
                  ? 'bg-gradient-to-r from-yellow-900/20 to-purple-900/20 border border-yellow-500/30'
                  : 'bg-gray-800/50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold w-12 text-center">
                  {getRankIcon(entry.rank_position)}
                </div>
                
                <div>
                  <p className="font-medium text-white">
                    {entry.user.username || formatWallet(entry.user.wallet_address)}
                  </p>
                  <p className="text-sm text-gray-400">
                    Level {entry.user.level}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-purple-400">
                  {entry.total_points.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">pontos</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

---

### **6. INTEGRAÇÃO COM JOGOS**

#### **Hook para Jogos:**

```typescript
// hooks/useGameIntegration.ts
import { usePoints } from './usePoints'
import { supabase } from '../lib/supabase'

export const useGameIntegration = () => {
  const { addPoints } = usePoints()

  // Registrar pontuação do Meow Clicker
  const submitMeowClickerScore = async (clicks: number) => {
    const points = clicks * 1 // 1 ponto por clique
    return await addPoints('meow-clicker', points)
  }

  // Registrar pontuação do Quiz
  const submitQuizScore = async (correctAnswers: number, totalQuestions: number) => {
    const points = (correctAnswers / totalQuestions) * 100
    return await addPoints('crypto-quiz', Math.floor(points))
  }

  // Registrar pontuação da Lucky Spin
  const submitSpinScore = async (prize: number) => {
    return await addPoints('lucky-spin', prize)
  }

  // Registrar pontuação do Treasure Hunt
  const submitTreasureScore = async (treasuresFound: number) => {
    const points = treasuresFound * 50
    return await addPoints('treasure-hunt', points)
  }

  // Registrar pontuação da Battle Arena
  const submitBattleScore = async (won: boolean, enemyLevel: number) => {
    const points = won ? enemyLevel * 25 : enemyLevel * 5
    return await addPoints('battle-arena', points)
  }

  return {
    submitMeowClickerScore,
    submitQuizScore,
    submitSpinScore,
    submitTreasureScore,
    submitBattleScore
  }
}
```

---

### **7. CONFIGURAÇÃO DE AMBIENTE**

#### **Variáveis de Ambiente (.env.local):**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
MINT_AUTHORITY_SECRET_KEY=[your_secret_key_array]
MEOW_TOKEN_MINT_ADDRESS=your_token_mint_address

# Pré-venda
PRESALE_WALLET_ADDRESS=your_presale_wallet_address

# APIs externas
COINGECKO_API_KEY=your_coingecko_key
TWITTER_API_KEY=your_twitter_key
TELEGRAM_BOT_TOKEN=your_telegram_token
```

---

### **8. IMPLEMENTAÇÃO NO SEU PROJETO**

#### **Passos para Implementar:**

1. **Configurar Supabase:**
   ```bash
   npm install @supabase/supabase-js
   ```
   - Criar projeto no Supabase
   - Executar as queries SQL das tabelas
   - Configurar RLS e políticas

2. **Instalar Dependências Solana:**
   ```bash
   npm install @solana/web3.js @solana/spl-token @solana/wallet-adapter-react
   ```

3. **Criar os Hooks:**
   - Copiar `usePoints.ts` e `useGameIntegration.ts`
   - Integrar com seus componentes de jogos existentes

4. **Implementar APIs:**
   - Criar `/api/create-tokens.ts`
   - Criar `/api/presale-purchase.ts`
   - Configurar autenticação

5. **Atualizar Componentes:**
   - Integrar `useGameIntegration` nos jogos
   - Adicionar componente de Leaderboard
   - Implementar sistema de conversão de pontos

6. **Deploy:**
   - Configurar variáveis de ambiente
   - Fazer deploy no Vercel/Netlify
   - Testar todas as funcionalidades

---

### **9. RECURSOS AVANÇADOS**

#### **Sistema de Conquistas:**

```typescript
// Sistema de badges e conquistas
const achievements = [
  { id: 'first_click', name: 'Primeiro Clique', points: 10 },
  { id: 'hundred_clicks', name: '100 Cliques', points: 100 },
  { id: 'quiz_master', name: 'Mestre do Quiz', points: 200 },
  { id: 'lucky_winner', name: 'Sortudo', points: 150 },
  { id: 'treasure_hunter', name: 'Caçador de Tesouros', points: 300 }
]
```

#### **Sistema de Referral:**

```typescript
// Sistema de indicação
const referralBonus = async (referrerWallet: string, newUserWallet: string) => {
  // Dar bônus para quem indicou
  await addPoints('referral', 500, referrerWallet)
  // Dar bônus para novo usuário
  await addPoints('welcome', 100, newUserWallet)
}
```

#### **Daily Rewards:**

```typescript
// Recompensas diárias
const claimDailyReward = async () => {
  const lastClaim = await getLastDailyClaim()
  const now = new Date()
  
  if (canClaimDaily(lastClaim, now)) {
    const streak = await getDailyStreak()
    const bonus = Math.min(streak * 10, 100) // Máximo 100 pontos de bônus
    await addPoints('daily_reward', 50 + bonus)
  }
}
```

---

## 🎯 RESUMO EXECUTIVO

### **BENEFÍCIOS DESTA ARQUITETURA:**

✅ **Escalável:** Supabase suporta milhões de usuários
✅ **Tempo Real:** Rankings e pontuações atualizados instantaneamente  
✅ **Seguro:** RLS e validações server-side
✅ **Blockchain:** Integração nativa com Solana
✅ **Gamificado:** Sistema completo de pontos, níveis e conquistas
✅ **Monetização:** Pré-venda e conversão de pontos em tokens

### **CRONOGRAMA DE IMPLEMENTAÇÃO:**

- **Semana 1:** Configurar Supabase e tabelas
- **Semana 2:** Implementar sistema de pontos
- **Semana 3:** Criar sistema de tokens Solana
- **Semana 4:** Implementar pré-venda e ranking
- **Semana 5:** Testes e otimizações
- **Semana 6:** Deploy e lançamento

### **CUSTOS ESTIMADOS:**

- **Supabase:** $0-25/mês (dependendo do uso)
- **Solana RPC:** $0-50/mês (ou usar público)
- **Deploy:** $0 (Vercel/Netlify gratuito)
- **Total:** $0-75/mês

---

## 🚀 PRÓXIMOS PASSOS

1. **Decidir se quer implementar** ou contratar desenvolvedor
2. **Configurar Supabase** e criar as tabelas
3. **Gerar chaves Solana** para criação de tokens
4. **Implementar passo a passo** seguindo este guia
5. **Testar tudo** antes do lançamento

**Este é o sistema mais completo e profissional para gamificação + blockchain que existe no mercado!** 🔥

Quer que eu ajude a implementar alguma parte específica ou tem alguma dúvida sobre o processo?

