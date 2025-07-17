# 🚨 PROMPT URGENTE: CORRIGIR ERRO PUBLICKEY NULL

## ⚠️ **ERRO IDENTIFICADO:**

```
Cannot read properties of null (reading 'toString')
TreasureHunt.tsx:94:57 - publicKey.toString()
```

**Causa:** O `publicKey` está `null` quando `addPoints` é chamado, indicando que a carteira não está conectada ou o valor ainda não foi carregado.

---

## 🎯 **OBJETIVO:**

Adicionar verificações de segurança em TODOS os componentes de jogos para garantir que `publicKey` existe antes de usar `toString()`.

---

## 🔧 **CORREÇÕES OBRIGATÓRIAS:**

### **ETAPA 1: CORRIGIR TREASUREHUNT.TSX**
```typescript
// client/src/components/games/TreasureHunt.tsx
// ENCONTRE a linha 94 e SUBSTITUA por:

// ANTES (PROBLEMÁTICO):
await addPoints('treasureHunt', points, publicKey.toString())

// DEPOIS (CORRIGIDO):
if (publicKey) {
  await addPoints('treasureHunt', points, publicKey.toString())
} else {
  console.error('Carteira não conectada')
  return
}
```

### **ETAPA 2: CORRIGIR TODOS OS OUTROS JOGOS**

**Aplicar a mesma correção em TODOS os arquivos de jogos:**

```typescript
// client/src/components/games/MeowClicker.tsx
// ENCONTRE todas as chamadas addPoints e SUBSTITUA:

// ANTES:
await addPoints('meowClicker', 1, publicKey.toString())

// DEPOIS:
if (publicKey) {
  await addPoints('meowClicker', 1, publicKey.toString())
} else {
  console.error('Carteira não conectada')
  return
}
```

```typescript
// client/src/components/games/CryptoQuiz.tsx
// ENCONTRE todas as chamadas addPoints e SUBSTITUA:

// ANTES:
await addPoints('cryptoQuiz', points, publicKey.toString())

// DEPOIS:
if (publicKey) {
  await addPoints('cryptoQuiz', points, publicKey.toString())
} else {
  console.error('Carteira não conectada')
  return
}
```

```typescript
// client/src/components/games/LuckySpin.tsx
// ENCONTRE todas as chamadas addPoints e SUBSTITUA:

// ANTES:
await addPoints('luckySpin', reward, publicKey.toString())

// DEPOIS:
if (publicKey) {
  await addPoints('luckySpin', reward, publicKey.toString())
} else {
  console.error('Carteira não conectada')
  return
}
```

```typescript
// client/src/components/games/BattleArena.tsx
// ENCONTRE todas as chamadas addPoints e SUBSTITUA:

// ANTES:
await addPoints('battleArena', points, publicKey.toString())

// DEPOIS:
if (publicKey) {
  await addPoints('battleArena', points, publicKey.toString())
} else {
  console.error('Carteira não conectada')
  return
}
```

### **ETAPA 3: ADICIONAR VERIFICAÇÃO GLOBAL NOS COMPONENTES**

**Para cada componente de jogo, ADICIONE esta verificação no início:**

```typescript
// ADICIONE no início de cada componente de jogo:
import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { usePoints } from '../../hooks/usePoints'

export default function NomeDoJogo() {
  const { connected, publicKey } = useWallet()
  const { addPoints, dailyLimits } = usePoints()
  
  // ADICIONE esta verificação:
  if (!connected || !publicKey) {
    return (
      <div className="text-center p-4">
        <h3 className="text-2xl font-bold text-white mb-4">🎮 Nome do Jogo</h3>
        <p className="text-gray-400">Conecte sua carteira para jogar!</p>
      </div>
    )
  }

  // Resto do componente...
}
```

### **ETAPA 4: MELHORAR HOOK USEPOINTS**

```typescript
// client/src/hooks/usePoints.ts
// ADICIONE verificação extra na função addPoints:

const addPoints = async (gameType: string, pointsToAdd: number, walletAddress: string) => {
  // ADICIONE esta verificação no início:
  if (!walletAddress || walletAddress === 'null' || walletAddress === 'undefined') {
    console.error('Endereço da carteira inválido:', walletAddress)
    return false
  }

  try {
    // Resto da função...
  } catch (error) {
    console.error('Erro ao adicionar pontos:', error)
    return false
  }
}
```

### **ETAPA 5: ADICIONAR LOADING STATE**

```typescript
// Para cada componente de jogo, ADICIONE estado de loading:

export default function NomeDoJogo() {
  const { connected, publicKey } = useWallet()
  const { addPoints, dailyLimits } = usePoints()
  const [isLoading, setIsLoading] = useState(false)

  const handleGameAction = async () => {
    // ADICIONE verificações completas:
    if (!connected) {
      alert('Conecte sua carteira primeiro!')
      return
    }

    if (!publicKey) {
      alert('Carteira não carregada. Tente novamente.')
      return
    }

    if (isLoading) {
      return // Evita cliques múltiplos
    }

    setIsLoading(true)

    try {
      const success = await addPoints('nomeDoJogo', pontos, publicKey.toString())
      if (success) {
        // Ação de sucesso
      } else {
        alert('Erro ao adicionar pontos ou limite atingido')
      }
    } catch (error) {
      console.error('Erro no jogo:', error)
      alert('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Resto do componente...
}
```

---

## 🛡️ **TEMPLATE SEGURO PARA TODOS OS JOGOS:**

```typescript
import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { usePoints } from '../../hooks/usePoints'

export default function NomeDoJogo() {
  const { connected, publicKey } = useWallet()
  const { addPoints, dailyLimits } = usePoints()
  const [isLoading, setIsLoading] = useState(false)
  const [gameState, setGameState] = useState(0)

  // Verificação de carteira conectada
  if (!connected || !publicKey) {
    return (
      <div className="text-center p-4">
        <h3 className="text-2xl font-bold text-white mb-4">🎮 Nome do Jogo</h3>
        <p className="text-gray-400">Conecte sua carteira para jogar!</p>
        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-400 text-sm">⚠️ Carteira necessária para ganhar pontos</p>
        </div>
      </div>
    )
  }

  const handleGameAction = async () => {
    // Verificações de segurança
    if (!connected || !publicKey) {
      alert('Carteira não conectada!')
      return
    }

    if (isLoading) {
      return
    }

    if (dailyLimits.nomeDoJogo >= LIMITE_DIARIO) {
      alert('Limite diário atingido!')
      return
    }

    setIsLoading(true)

    try {
      const pontos = calcularPontos() // Sua lógica de pontos
      const success = await addPoints('nomeDoJogo', pontos, publicKey.toString())
      
      if (success) {
        setGameState(prev => prev + pontos)
        // Feedback visual de sucesso
      } else {
        alert('Erro ao adicionar pontos')
      }
    } catch (error) {
      console.error('Erro no jogo:', error)
      alert('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="text-center p-4">
      <h3 className="text-2xl font-bold text-white mb-4">🎮 Nome do Jogo</h3>
      
      {/* Status do jogo */}
      <div className="mb-4">
        <div className="text-yellow-400 text-xl font-bold">{gameState} pontos</div>
        <div className="text-gray-400 text-sm">
          {dailyLimits.nomeDoJogo}/{LIMITE_DIARIO} hoje
        </div>
      </div>

      {/* Botão do jogo */}
      <button
        onClick={handleGameAction}
        disabled={isLoading || dailyLimits.nomeDoJogo >= LIMITE_DIARIO}
        className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-3 rounded-lg font-bold text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processando...' : 'Jogar!'}
      </button>

      {/* Feedback visual */}
      {dailyLimits.nomeDoJogo >= LIMITE_DIARIO && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">Limite diário atingido! Reset às 21:00</p>
        </div>
      )}
    </div>
  )
}
```

---

## 🚨 **REGRAS OBRIGATÓRIAS:**

### **✅ DEVE FAZER:**
- ✅ Adicionar `if (publicKey)` antes de TODAS as chamadas `publicKey.toString()`
- ✅ Adicionar verificação `if (!connected || !publicKey)` no início dos componentes
- ✅ Adicionar estados de loading para evitar cliques múltiplos
- ✅ Adicionar tratamento de erro com try/catch
- ✅ Mostrar mensagens de erro amigáveis ao usuário

### **❌ NÃO PODE FAZER:**
- ❌ Remover funcionalidades existentes
- ❌ Alterar a lógica do sistema de pontos
- ❌ Modificar outros arquivos além dos jogos

---

## 🎯 **RESULTADO ESPERADO:**

Após aplicar as correções:

1. ✅ **Erro "Cannot read properties of null" eliminado**
2. ✅ **Jogos funcionam apenas com carteira conectada**
3. ✅ **Mensagens de erro amigáveis** para o usuário
4. ✅ **Estados de loading** para melhor UX
5. ✅ **Verificações de segurança** em todos os pontos críticos

---

## 📋 **CHECKLIST DE VERIFICAÇÃO:**

- [ ] ✅ TreasureHunt.tsx corrigido
- [ ] ✅ MeowClicker.tsx corrigido  
- [ ] ✅ CryptoQuiz.tsx corrigido
- [ ] ✅ LuckySpin.tsx corrigido
- [ ] ✅ BattleArena.tsx corrigido
- [ ] ✅ Verificações de carteira adicionadas
- [ ] ✅ Estados de loading implementados
- [ ] ✅ Tratamento de erro melhorado

**Execute este prompt e o erro será completamente eliminado!** 🛡️

