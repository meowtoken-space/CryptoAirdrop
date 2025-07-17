# 🚨 PROMPT URGENTE: CORRIGIR CONTEXTO DE CARTEIRA

## 🎯 **PROBLEMA IDENTIFICADO:**

A página Games não está detectando a carteira Phantom que já está conectada globalmente no projeto. Isso acontece porque:

1. **Contexto não compartilhado** - Games.tsx não acessa o mesmo contexto de carteira
2. **Import incorreto** - Pode estar importando useWallet de local errado
3. **Provider não envolvendo** - Games pode não estar dentro do WalletProvider
4. **Estado não sincronizado** - Carteira conecta mas estado não propaga

---

## 🔧 **INSTRUÇÕES OBRIGATÓRIAS:**

### **PASSO 1: VERIFICAR ESTRUTURA DO PROJETO**

Primeiro, identifique como a carteira está configurada no projeto:

```bash
# PROCURAR ARQUIVOS DE CONFIGURAÇÃO:
find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "WalletProvider\|useWallet"
```

### **PASSO 2: CORRIGIR IMPORT DO useWallet**

**PROBLEMA:** Games.tsx pode estar importando useWallet do local errado.

**SOLUÇÃO:** Use o mesmo import que funciona no resto do projeto:

```typescript
// VERIFICAR QUAL IMPORT FUNCIONA NO PROJETO:
// Opção 1 (mais comum):
import { useWallet } from '@solana/wallet-adapter-react';

// Opção 2 (se projeto usa contexto customizado):
import { useWallet } from '../contexts/WalletContext';

// Opção 3 (se projeto usa hook customizado):
import { useWallet } from '../hooks/useWallet';
```

### **PASSO 3: GARANTIR QUE GAMES ESTÁ DENTRO DO PROVIDER**

**PROBLEMA:** Games.tsx pode não estar envolvida pelo WalletProvider.

**SOLUÇÃO:** Verificar e corrigir a estrutura:

```typescript
// App.tsx ou _app.tsx DEVE TER:
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

const App = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {/* GAMES DEVE ESTAR AQUI DENTRO */}
          <Router>
            <Routes>
              <Route path="/games" element={<Games />} />
            </Routes>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
```

### **PASSO 4: CORRIGIR GAMES.TSX**

**PROBLEMA:** Games.tsx não está usando o contexto corretamente.

**SOLUÇÃO:** Implementação correta:

```typescript
// client/src/pages/Games.tsx
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react'; // USAR O MESMO IMPORT DO PROJETO
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Importar componentes dos jogos
import MeowClicker from '../components/games/MeowClicker';
import LuckySpin from '../components/games/LuckySpin';
import TreasureHunt from '../components/games/TreasureHunt';
import CryptoQuiz from '../components/games/CryptoQuiz';
import BattleArena from '../components/games/BattleArena';
import GlobalRanking from '../components/GlobalRanking';
import PointsHeader from '../components/PointsHeader';

const Games = () => {
  const { connected, publicKey, connecting } = useWallet();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Aguardar um momento para o contexto carregar
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // DEBUG: Mostrar estado da carteira
  console.log('Games - Wallet State:', { connected, publicKey: publicKey?.toString(), connecting });

  if (isLoading || connecting) {
    return (
      <div className="games-loading">
        <div className="loading-spinner"></div>
        <p>Carregando jogos...</p>
      </div>
    );
  }

  if (!connected || !publicKey) {
    return (
      <div className="games-connect-wallet">
        <div className="connect-card">
          <h2>🎮 Jogos MEOW Token</h2>
          <p>Conecte sua carteira Phantom para acessar os jogos e ganhar pontos!</p>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  return (
    <div className="games-page">
      {/* HEADER COM PONTOS */}
      <PointsHeader />
      
      {/* GRID DE JOGOS */}
      <div className="games-grid">
        <MeowClicker />
        <LuckySpin />
        <TreasureHunt />
        <CryptoQuiz />
        <BattleArena />
      </div>
      
      {/* RANKING GLOBAL */}
      <GlobalRanking />
    </div>
  );
};

export default Games;
```

### **PASSO 5: CORRIGIR COMPONENTES DOS JOGOS**

**PROBLEMA:** Cada jogo pode estar fazendo verificação duplicada.

**SOLUÇÃO:** Simplificar verificação nos jogos:

```typescript
// EM CADA COMPONENTE DE JOGO (MeowClicker, LuckySpin, etc.):
import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react'; // MESMO IMPORT

const MeowClicker = () => {
  const { connected, publicKey } = useWallet();

  // SE CHEGOU ATÉ AQUI, CARTEIRA JÁ ESTÁ CONECTADA
  // MAS FAZER VERIFICAÇÃO DE SEGURANÇA:
  if (!connected || !publicKey) {
    return (
      <div className="game-card">
        <h3>🐱 Meow Clicker</h3>
        <p>Erro: Carteira desconectada</p>
      </div>
    );
  }

  // RESTO DA LÓGICA DO JOGO...
  return (
    <div className="game-card">
      <h3>🐱 Meow Clicker</h3>
      {/* CONTEÚDO DO JOGO */}
    </div>
  );
};

export default MeowClicker;
```

### **PASSO 6: ADICIONAR CSS DE LOADING**

```css
/* ESTILOS PARA LOADING E CONEXÃO */
.games-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--neon-cyan);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(154, 69, 252, 0.3);
  border-top: 3px solid var(--neon-purple);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.games-connect-wallet {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 20px;
}

.connect-card {
  background: linear-gradient(145deg, #1a0d2e, #2d1b3d);
  border: 2px solid var(--neon-purple);
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  box-shadow: 
    0 0 30px rgba(154, 69, 252, 0.5),
    inset 0 0 20px rgba(42, 214, 208, 0.1);
}

.connect-card h2 {
  color: var(--neon-cyan);
  margin-bottom: 20px;
  text-shadow: 0 0 20px var(--neon-cyan);
}

.connect-card p {
  color: #ffffff;
  margin-bottom: 30px;
  line-height: 1.6;
}
```

---

## 🚀 **IMPLEMENTAÇÃO OBRIGATÓRIA:**

### **EXECUTE ESTAS VERIFICAÇÕES:**

1. **Encontre o import correto** do useWallet no projeto
2. **Verifique se Games está dentro** do WalletProvider
3. **Use o mesmo contexto** em toda a aplicação
4. **Adicione logs de debug** para verificar estado
5. **Teste a propagação** do estado da carteira

### **DEBUGGING:**

Adicione estes logs temporários:

```typescript
// NO COMPONENTE PRINCIPAL (onde carteira funciona):
console.log('Main - Wallet:', { connected, publicKey: publicKey?.toString() });

// NA PÁGINA GAMES:
console.log('Games - Wallet:', { connected, publicKey: publicKey?.toString() });
```

---

## ✅ **RESULTADO ESPERADO:**

Após implementar:
- ✅ **Games detecta carteira** automaticamente
- ✅ **Mesmo estado** em toda aplicação
- ✅ **Jogos aparecem** sem pedir reconexão
- ✅ **Transição suave** entre páginas
- ✅ **Debug logs** para verificar funcionamento

**EXECUTE ESTE PROMPT PARA CORRIGIR A INTEGRAÇÃO DE CONTEXTO!** 🚀

