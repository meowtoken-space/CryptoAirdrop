# 🚨 PROMPT CORRIGIDO PARA AGENTE REPLIT - SISTEMA DE PONTOS MEOW TOKEN

## ⚠️ **INSTRUÇÕES CRÍTICAS - LEIA ANTES DE EXECUTAR:**

**NÃO APAGUE NADA EXISTENTE!** Este prompt deve APENAS ADICIONAR funcionalidades, nunca remover ou substituir código existente.

**NÃO TOQUE NO BANCO DE DADOS!** Use apenas as tabelas já criadas no Supabase.

**NÃO REMOVA JOGOS EXISTENTES!** Apenas integre o sistema de pontos aos jogos que já existem.

---

## 🎯 **OBJETIVO ESPECÍFICO:**

Integrar um sistema de pontos ao projeto CryptoAirdrop existente, conectando com o Supabase já configurado, SEM remover ou alterar funcionalidades existentes.

---

## 📋 **PASSO A PASSO OBRIGATÓRIO:**

### **ETAPA 1: VERIFICAR ESTRUTURA EXISTENTE (NÃO ALTERAR)**
```bash
# Apenas verifique se existem estes arquivos (NÃO os modifique):
- client/src/pages/Games.tsx (ou similar)
- client/src/components/games/ (pasta com jogos)
- Qualquer sistema de autenticação existente
```

### **ETAPA 2: CONFIGURAR VARIÁVEIS DE AMBIENTE**
```bash
# Adicione no arquivo .env (ou crie se não existir):
VITE_SUPABASE_URL=https://lixusjljqwqmxduvjffy.supabase.co
VITE_SUPABASE_ANON_KEY=[AGUARDANDO_CHAVE_DO_USUARIO]
```

### **ETAPA 3: INSTALAR DEPENDÊNCIAS (SE NECESSÁRIO)**
```bash
# Execute apenas se @supabase/supabase-js não estiver instalado:
npm install @supabase/supabase-js
```

### **ETAPA 4: CRIAR HOOK DE PONTOS (NOVO ARQUIVO)**
```typescript
// client/src/hooks/usePoints.ts (CRIAR NOVO ARQUIVO)
import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export const usePoints = () => {
  const [points, setPoints] = useState(0)
  const [dailyLimits, setDailyLimits] = useState({
    meowClicker: 0,
    cryptoQuiz: 0,
    luckySpin: 0,
    treasureHunt: 0,
    battleArena: 0
  })

  // Função para verificar se é um novo dia (reset às 21:00)
  const isNewDay = (lastReset: string) => {
    const now = new Date()
    const lastResetDate = new Date(lastReset)
    const today21h = new Date()
    today21h.setHours(21, 0, 0, 0)
    
    if (now.getHours() >= 21) {
      return lastResetDate < today21h
    } else {
      const yesterday21h = new Date(today21h)
      yesterday21h.setDate(yesterday21h.getDate() - 1)
      return lastResetDate < yesterday21h
    }
  }

  // Função para adicionar pontos
  const addPoints = async (gameType: string, pointsToAdd: number, walletAddress: string) => {
    if (!walletAddress) return false

    try {
      // Verificar limites diários
      const limits = {
        meowClicker: 1000,
        cryptoQuiz: 20,
        luckySpin: 5,
        treasureHunt: 3,
        battleArena: 10
      }

      if (dailyLimits[gameType] >= limits[gameType]) {
        throw new Error('Limite diário atingido')
      }

      // Buscar usuário atual
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      let currentPoints = 0
      let currentLimits = { ...dailyLimits }

      if (userData) {
        currentPoints = userData.total_points || 0
        
        // Verificar se precisa resetar limites diários
        if (userData.last_reset && isNewDay(userData.last_reset)) {
          currentLimits = {
            meowClicker: 0,
            cryptoQuiz: 0,
            luckySpin: 0,
            treasureHunt: 0,
            battleArena: 0
          }
        } else {
          currentLimits = {
            meowClicker: userData.meowClicker_daily || 0,
            cryptoQuiz: userData.cryptoQuiz_daily || 0,
            luckySpin: userData.luckySpin_daily || 0,
            treasureHunt: userData.treasureHunt_daily || 0,
            battleArena: userData.battleArena_daily || 0
          }
        }
      }

      // Verificar limite novamente com dados atualizados
      if (currentLimits[gameType] >= limits[gameType]) {
        throw new Error('Limite diário atingido')
      }

      // Atualizar pontos no Supabase
      const updateData = {
        wallet_address: walletAddress,
        total_points: currentPoints + pointsToAdd,
        last_activity: new Date().toISOString(),
        last_reset: new Date().toISOString(),
        [`${gameType}_daily`]: currentLimits[gameType] + 1
      }

      const { error } = await supabase
        .from('users')
        .upsert(updateData)

      if (error) throw error

      setPoints(currentPoints + pointsToAdd)
      setDailyLimits(prev => ({
        ...prev,
        [gameType]: currentLimits[gameType] + 1
      }))

      return true
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error)
      return false
    }
  }

  // Carregar dados do usuário
  const loadUserData = async (walletAddress: string) => {
    if (!walletAddress) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (data) {
        setPoints(data.total_points || 0)
        
        // Verificar se precisa resetar limites diários
        if (data.last_reset && isNewDay(data.last_reset)) {
          // Reset automático
          const resetData = {
            meowClicker_daily: 0,
            cryptoQuiz_daily: 0,
            luckySpin_daily: 0,
            treasureHunt_daily: 0,
            battleArena_daily: 0,
            last_reset: new Date().toISOString()
          }

          await supabase
            .from('users')
            .update(resetData)
            .eq('wallet_address', walletAddress)
          
          setDailyLimits({
            meowClicker: 0,
            cryptoQuiz: 0,
            luckySpin: 0,
            treasureHunt: 0,
            battleArena: 0
          })
        } else {
          setDailyLimits({
            meowClicker: data.meowClicker_daily || 0,
            cryptoQuiz: data.cryptoQuiz_daily || 0,
            luckySpin: data.luckySpin_daily || 0,
            treasureHunt: data.treasureHunt_daily || 0,
            battleArena: data.battleArena_daily || 0
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  return {
    points,
    dailyLimits,
    addPoints,
    loadUserData
  }
}
```

### **ETAPA 5: CRIAR COMPONENTE DE RANKING (NOVO ARQUIVO)**
```typescript
// client/src/components/GlobalRanking.tsx (CRIAR NOVO ARQUIVO)
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

interface RankingUser {
  wallet_address: string
  total_points: number
}

export default function GlobalRanking() {
  const [ranking, setRanking] = useState<RankingUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRanking()
  }, [])

  const loadRanking = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('wallet_address, total_points')
        .order('total_points', { ascending: false })
        .limit(10)

      if (data) {
        setRanking(data)
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">🏆 Ranking Global</h2>
      
      {loading ? (
        <p className="text-gray-400">Carregando ranking...</p>
      ) : (
        <div className="space-y-3">
          {ranking.map((user, index) => (
            <div key={user.wallet_address} className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`font-bold ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-gray-300' :
                  index === 2 ? 'text-orange-400' :
                  'text-white'
                }`}>
                  #{index + 1}
                </span>
                <span className="text-gray-300 font-mono">
                  {user.wallet_address.slice(0, 4)}...{user.wallet_address.slice(-4)}
                </span>
              </div>
              <span className="text-yellow-400 font-bold">{user.total_points.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### **ETAPA 6: MODIFICAR PÁGINA GAMES EXISTENTE (APENAS ADICIONAR)**
```typescript
// ENCONTRE o arquivo da página Games (pode ser Games.tsx, games.tsx, ou similar)
// ADICIONE estas importações no TOPO do arquivo:
import { usePoints } from '../hooks/usePoints'
import GlobalRanking from '../components/GlobalRanking'

// DENTRO do componente Games, ADICIONE estas linhas:
const { points, dailyLimits, loadUserData } = usePoints()

// ADICIONE um useEffect para carregar dados quando conectar carteira:
useEffect(() => {
  if (connected && publicKey) {
    loadUserData(publicKey.toString())
  }
}, [connected, publicKey])

// ADICIONE um header com pontos totais ANTES dos jogos existentes:
{connected && (
  <div className="max-w-7xl mx-auto mb-8">
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">🎮 Meow Games</h1>
        <div className="text-right">
          <p className="text-gray-300">Pontos Totais</p>
          <p className="text-3xl font-bold text-yellow-400">{points.toLocaleString()}</p>
        </div>
      </div>
    </div>
  </div>
)}

// ADICIONE o ranking APÓS os jogos existentes:
{connected && <GlobalRanking />}
```

### **ETAPA 7: INTEGRAR COM JOGOS EXISTENTES (APENAS ADICIONAR)**

**Para cada jogo existente, ADICIONE estas linhas:**

```typescript
// No TOPO de cada componente de jogo, ADICIONE:
import { usePoints } from '../../hooks/usePoints'
import { useWallet } from '@solana/wallet-adapter-react'

// DENTRO do componente, ADICIONE:
const { addPoints, dailyLimits } = usePoints()
const { publicKey } = useWallet()

// QUANDO o jogador ganhar pontos, ADICIONE esta chamada:
const handleGameAction = async () => {
  if (publicKey) {
    const success = await addPoints('nomeDoJogo', pontosGanhos, publicKey.toString())
    if (success) {
      // Mostrar sucesso
      console.log('Pontos adicionados com sucesso!')
    } else {
      // Mostrar erro ou limite atingido
      console.log('Erro ao adicionar pontos ou limite atingido')
    }
  }
}

// ADICIONE indicador de limite diário:
<div className="text-sm text-gray-400">
  {dailyLimits.nomeDoJogo}/LIMITE_MAXIMO hoje
</div>
```

---

## 🚨 **REGRAS OBRIGATÓRIAS:**

### **✅ PODE FAZER:**
- ✅ Criar novos arquivos
- ✅ Adicionar importações
- ✅ Adicionar componentes
- ✅ Adicionar hooks
- ✅ Instalar dependências necessárias

### **❌ NÃO PODE FAZER:**
- ❌ Apagar arquivos existentes
- ❌ Remover código existente
- ❌ Alterar estrutura do banco de dados
- ❌ Modificar sistema de autenticação existente
- ❌ Remover jogos existentes
- ❌ Alterar configurações do Vite/React

---

## 🎯 **CONFIGURAÇÕES ESPECÍFICAS:**

### **Limites Diários:**
- MeowClicker: 1000 ações
- CryptoQuiz: 20 perguntas
- LuckySpin: 5 spins
- TreasureHunt: 3 mapas
- BattleArena: 10 batalhas

### **Reset Diário:**
- Horário: 21:00 (horário de Brasília)
- Automático via função `isNewDay()`

### **Pontuação CryptoQuiz:**
- Fácil: 3 pontos
- Médio: 7 pontos
- Difícil: 15 pontos
- Bônus velocidade: +50% (≤10s), +25% (≤20s)

### **Carteira Admin:**
```
DM5bzL1MWThBjhFVXRWzFtYKjqf5Vwhhs2jVzr68hYoV
```

---

## 📋 **CHECKLIST DE VERIFICAÇÃO:**

Antes de finalizar, VERIFIQUE:

- [ ] ✅ Todos os arquivos existentes estão intactos
- [ ] ✅ Sistema de autenticação existente funciona
- [ ] ✅ Jogos existentes ainda funcionam
- [ ] ✅ Novos arquivos foram criados corretamente
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Hook usePoints funciona
- [ ] ✅ Ranking global carrega
- [ ] ✅ Pontos são salvos no Supabase
- [ ] ✅ Limites diários funcionam
- [ ] ✅ Reset às 21:00 funciona

---

## 🚀 **RESULTADO ESPERADO:**

Após executar este prompt, o usuário terá:

1. ✅ **Sistema de pontos funcionando** conectado ao Supabase
2. ✅ **Todos os jogos existentes intactos** e funcionando
3. ✅ **Ranking global** em tempo real
4. ✅ **Limites diários** com reset às 21:00
5. ✅ **Interface integrada** sem quebrar o design existente
6. ✅ **Banco de dados preservado** sem perda de dados

---

## ⚠️ **EM CASO DE ERRO:**

Se algo der errado:

1. **PARE IMEDIATAMENTE**
2. **NÃO CONTINUE** a implementação
3. **RELATE O ERRO** específico encontrado
4. **AGUARDE INSTRUÇÕES** antes de prosseguir

**NUNCA force uma implementação que está dando erro!**

---

## 🎯 **MENSAGEM FINAL:**

Este prompt foi criado para ser **100% seguro** e **não destrutivo**. Ele apenas ADICIONA funcionalidades ao projeto existente, sem remover ou alterar nada que já funciona.

**Execute com confiança, mas siga EXATAMENTE as instruções!**

