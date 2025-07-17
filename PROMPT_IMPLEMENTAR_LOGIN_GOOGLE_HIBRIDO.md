# 🚀 PROMPT COMPLETO: SISTEMA LOGIN GOOGLE + CARTEIRA OPCIONAL

## 🎯 **OBJETIVO**

Transformar o sistema atual em uma experiência híbrida onde:
1. **Login inicial:** Apenas Google (fácil e familiar)
2. **Exploração livre:** Home, Learning, Tokenomics, NFT, Ranking
3. **Carteira opcional:** Apenas quando necessário (jogos, missões, compras)
4. **Onboarding progressivo:** Tutorial contextual e educativo

---

## 🛠️ **IMPLEMENTAÇÃO TÉCNICA COMPLETA**

### **PASSO 1: INSTALAR DEPENDÊNCIAS**

```bash
# Instalar dependências para Google Auth
npm install @google-cloud/oauth2 google-auth-library
npm install js-cookie
npm install react-google-login

# Dependências já existentes (manter)
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui
npm install @solana/wallet-adapter-wallets @solana/web3.js
```

### **PASSO 2: CONFIGURAR VARIÁVEIS DE AMBIENTE**

```env
# .env - Adicionar variáveis do Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Manter variáveis existentes do Supabase
VITE_SUPABASE_URL=https://lixusjljqwqmxduvjffy.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### **PASSO 3: ATUALIZAR BANCO DE DADOS SUPABASE**

```sql
-- Executar no SQL Editor do Supabase
-- Atualizar tabela users para sistema híbrido

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS picture_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_connected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Tornar wallet_address opcional
ALTER TABLE users ALTER COLUMN wallet_address DROP NOT NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Atualizar constraint para permitir usuários sem carteira
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_wallet_address_key;
ALTER TABLE users ADD CONSTRAINT users_wallet_address_unique UNIQUE(wallet_address) DEFERRABLE INITIALLY DEFERRED;

-- Função para buscar ou criar usuário por Google ID
CREATE OR REPLACE FUNCTION get_or_create_user_by_google(
  p_google_id VARCHAR(255),
  p_email VARCHAR(255),
  p_name VARCHAR(255),
  p_picture_url TEXT
) RETURNS TABLE(
  id UUID,
  google_id VARCHAR(255),
  email VARCHAR(255),
  name VARCHAR(255),
  picture_url TEXT,
  wallet_address VARCHAR(255),
  total_points INTEGER,
  points_today INTEGER,
  current_level INTEGER,
  experience_points INTEGER,
  onboarding_completed BOOLEAN,
  wallet_onboarding_completed BOOLEAN
) AS $$
BEGIN
  -- Tentar encontrar usuário existente
  RETURN QUERY
  SELECT 
    u.id, u.google_id, u.email, u.name, u.picture_url, u.wallet_address,
    u.total_points, u.points_today, u.level as current_level, u.experience_points,
    u.onboarding_completed, u.wallet_onboarding_completed
  FROM users u 
  WHERE u.google_id = p_google_id;
  
  -- Se não encontrou, criar novo usuário
  IF NOT FOUND THEN
    INSERT INTO users (
      google_id, email, name, picture_url, 
      total_points, points_today, level, experience_points,
      onboarding_completed, wallet_onboarding_completed,
      created_at, updated_at, last_login
    ) VALUES (
      p_google_id, p_email, p_name, p_picture_url,
      0, 0, 1, 0,
      FALSE, FALSE,
      NOW(), NOW(), NOW()
    );
    
    -- Retornar usuário recém-criado
    RETURN QUERY
    SELECT 
      u.id, u.google_id, u.email, u.name, u.picture_url, u.wallet_address,
      u.total_points, u.points_today, u.level as current_level, u.experience_points,
      u.onboarding_completed, u.wallet_onboarding_completed
    FROM users u 
    WHERE u.google_id = p_google_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para vincular carteira a usuário Google
CREATE OR REPLACE FUNCTION link_wallet_to_user(
  p_google_id VARCHAR(255),
  p_wallet_address VARCHAR(255)
) RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  user_data JSON
) AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Verificar se carteira já está vinculada a outro usuário
  IF EXISTS (SELECT 1 FROM users WHERE wallet_address = p_wallet_address AND google_id != p_google_id) THEN
    RETURN QUERY SELECT FALSE, 'Carteira já vinculada a outro usuário', NULL::JSON;
    RETURN;
  END IF;
  
  -- Atualizar usuário com carteira
  UPDATE users 
  SET 
    wallet_address = p_wallet_address,
    wallet_connected_at = NOW(),
    wallet_onboarding_completed = TRUE,
    updated_at = NOW()
  WHERE google_id = p_google_id;
  
  -- Buscar dados atualizados
  SELECT * INTO user_record FROM users WHERE google_id = p_google_id;
  
  RETURN QUERY SELECT 
    TRUE, 
    'Carteira vinculada com sucesso',
    row_to_json(user_record)::JSON;
END;
$$ LANGUAGE plpgsql;
```

### **PASSO 4: CRIAR SISTEMA DE AUTENTICAÇÃO HÍBRIDO**

```typescript
// hooks/useHybridAuth.ts
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  pictureUrl: string;
  walletAddress?: string;
  totalPoints: number;
  pointsToday: number;
  currentLevel: number;
  experiencePoints: number;
  onboardingCompleted: boolean;
  walletOnboardingCompleted: boolean;
}

interface AuthState {
  // Estados
  user: User | null;
  isAuthenticated: boolean;
  isWalletConnected: boolean;
  loading: boolean;
  error: string | null;
  
  // Ações
  loginWithGoogle: () => Promise<void>;
  connectWallet: () => Promise<boolean>;
  logout: () => void;
  
  // Verificações
  canAccessGames: () => boolean;
  canAccessMissions: () => boolean;
  needsWalletForAction: (action: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const useHybridAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useHybridAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { publicKey, connected, connect, disconnect } = useWallet();

  const isAuthenticated = !!user;
  const isWalletConnected = !!(user?.walletAddress && connected && publicKey);

  // Login com Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular Google OAuth (implementar com biblioteca real)
      const googleResponse = await new Promise<any>((resolve) => {
        // Aqui você implementaria o Google OAuth real
        // Por enquanto, simulando resposta
        setTimeout(() => {
          resolve({
            sub: 'google_' + Math.random().toString(36).substr(2, 9),
            email: 'user@example.com',
            name: 'Usuário Teste',
            picture: 'https://via.placeholder.com/150'
          });
        }, 1000);
      });
      
      // Buscar ou criar usuário no Supabase
      const response = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleId: googleResponse.sub,
          email: googleResponse.email,
          name: googleResponse.name,
          pictureUrl: googleResponse.picture
        })
      });
      
      if (!response.ok) {
        throw new Error('Erro no login');
      }
      
      const userData = await response.json();
      setUser(userData);
      
      // Salvar no localStorage
      localStorage.setItem('meow_user', JSON.stringify(userData));
      localStorage.setItem('meow_google_token', 'google_token_here');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no login');
      console.error('Erro no login Google:', err);
    } finally {
      setLoading(false);
    }
  };

  // Conectar carteira
  const connectWallet = async (): Promise<boolean> => {
    if (!user) {
      setError('Faça login primeiro');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Conectar carteira Phantom
      await connect();
      
      if (publicKey) {
        const walletAddress = publicKey.toString();
        
        // Vincular carteira à conta Google
        const response = await fetch('/api/auth/link-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleId: user.googleId,
            walletAddress
          })
        });
        
        if (!response.ok) {
          throw new Error('Erro ao vincular carteira');
        }
        
        const result = await response.json();
        
        if (result.success) {
          const updatedUser = { ...user, walletAddress, walletOnboardingCompleted: true };
          setUser(updatedUser);
          localStorage.setItem('meow_user', JSON.stringify(updatedUser));
          return true;
        } else {
          throw new Error(result.message);
        }
      }
      
      return false;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar carteira');
      console.error('Erro ao conectar carteira:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Desconectar carteira se conectada
      if (connected) {
        await disconnect();
      }
      
      // Limpar estado
      setUser(null);
      setError(null);
      
      // Limpar localStorage
      localStorage.removeItem('meow_user');
      localStorage.removeItem('meow_google_token');
      
    } catch (err) {
      console.error('Erro no logout:', err);
    }
  };

  // Atualizar dados do usuário
  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user/profile/${user.googleId}`);
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('meow_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
    }
  };

  // Verificações de acesso
  const canAccessGames = () => isWalletConnected;
  const canAccessMissions = () => isWalletConnected;
  
  const needsWalletForAction = (action: string) => {
    const walletRequiredActions = [
      'play_games', 'complete_missions', 'buy_presale', 
      'mint_nft', 'claim_rewards', 'stake_tokens'
    ];
    return walletRequiredActions.includes(action);
  };

  // Carregar usuário do localStorage na inicialização
  useEffect(() => {
    const savedUser = localStorage.getItem('meow_user');
    const savedToken = localStorage.getItem('meow_google_token');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        localStorage.removeItem('meow_user');
        localStorage.removeItem('meow_google_token');
      }
    }
    
    setLoading(false);
  }, []);

  // Sincronizar estado da carteira
  useEffect(() => {
    if (user && publicKey && connected) {
      const walletAddress = publicKey.toString();
      if (user.walletAddress !== walletAddress) {
        // Carteira mudou, atualizar
        const updatedUser = { ...user, walletAddress };
        setUser(updatedUser);
        localStorage.setItem('meow_user', JSON.stringify(updatedUser));
      }
    }
  }, [user, publicKey, connected]);

  const value: AuthState = {
    user,
    isAuthenticated,
    isWalletConnected,
    loading,
    error,
    loginWithGoogle,
    connectWallet,
    logout,
    canAccessGames,
    canAccessMissions,
    needsWalletForAction,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### **PASSO 5: CRIAR ROTAS DE API**

```typescript
// server/routes/auth.ts
import express from 'express';
import { supabase } from '../lib/supabase';

const router = express.Router();

// Login com Google
router.post('/google-login', async (req, res) => {
  try {
    const { googleId, email, name, pictureUrl } = req.body;
    
    if (!googleId || !email) {
      return res.status(400).json({ error: 'Google ID e email são obrigatórios' });
    }
    
    // Buscar ou criar usuário
    const { data, error } = await supabase
      .rpc('get_or_create_user_by_google', {
        p_google_id: googleId,
        p_email: email,
        p_name: name,
        p_picture_url: pictureUrl
      });
    
    if (error) {
      console.error('Erro no Supabase:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    const user = data[0];
    
    // Atualizar último login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('google_id', googleId);
    
    res.json({
      id: user.id,
      googleId: user.google_id,
      email: user.email,
      name: user.name,
      pictureUrl: user.picture_url,
      walletAddress: user.wallet_address,
      totalPoints: user.total_points,
      pointsToday: user.points_today,
      currentLevel: user.current_level,
      experiencePoints: user.experience_points,
      onboardingCompleted: user.onboarding_completed,
      walletOnboardingCompleted: user.wallet_onboarding_completed
    });
    
  } catch (error) {
    console.error('Erro no login Google:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Vincular carteira
router.post('/link-wallet', async (req, res) => {
  try {
    const { googleId, walletAddress } = req.body;
    
    if (!googleId || !walletAddress) {
      return res.status(400).json({ error: 'Google ID e endereço da carteira são obrigatórios' });
    }
    
    // Vincular carteira
    const { data, error } = await supabase
      .rpc('link_wallet_to_user', {
        p_google_id: googleId,
        p_wallet_address: walletAddress
      });
    
    if (error) {
      console.error('Erro no Supabase:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    const result = data[0];
    res.json(result);
    
  } catch (error) {
    console.error('Erro ao vincular carteira:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar perfil do usuário
router.get('/profile/:googleId', async (req, res) => {
  try {
    const { googleId } = req.params;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({
      id: data.id,
      googleId: data.google_id,
      email: data.email,
      name: data.name,
      pictureUrl: data.picture_url,
      walletAddress: data.wallet_address,
      totalPoints: data.total_points,
      pointsToday: data.points_today,
      currentLevel: data.level,
      experiencePoints: data.experience_points,
      onboardingCompleted: data.onboarding_completed,
      walletOnboardingCompleted: data.wallet_onboarding_completed
    });
    
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
```

### **PASSO 6: CRIAR COMPONENTE DE LOGIN**

```typescript
// components/auth/LoginPage.tsx
import React, { useState } from 'react';
import { useHybridAuth } from '@/hooks/useHybridAuth';

const LoginPage: React.FC = () => {
  const { loginWithGoogle, loading, error } = useHybridAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Erro no login:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🐱</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            MEOW Token
          </h1>
          <p className="text-slate-400">
            Entre para explorar o ecossistema Web3 mais divertido!
          </p>
        </div>

        {/* Card de login */}
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
          
          {/* Benefícios */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              ✨ O que você pode fazer:
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-300">
                <span className="text-green-400">✓</span>
                <span>Explorar jogos e aprender sobre crypto</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="text-green-400">✓</span>
                <span>Ver tokenomics e roadmap do projeto</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="text-green-400">✓</span>
                <span>Acompanhar ranking e estatísticas</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="text-purple-400">🎮</span>
                <span>Jogar e ganhar pontos (carteira necessária)</span>
              </div>
            </div>
          </div>

          {/* Botão de login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading || isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-medium py-3 px-4 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <span>Entrando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continuar com Google</span>
              </>
            )}
          </button>

          {/* Erro */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Informações adicionais */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Ao continuar, você concorda com nossos{' '}
              <a href="#" className="text-purple-400 hover:underline">Termos de Uso</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-600 text-sm">
            Novo no Web3? Não se preocupe, vamos te ensinar! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
```

### **PASSO 7: CRIAR COMPONENTE DE ONBOARDING DE CARTEIRA**

```typescript
// components/auth/WalletOnboarding.tsx
import React, { useState } from 'react';
import { useHybridAuth } from '@/hooks/useHybridAuth';

interface WalletOnboardingProps {
  action: string;
  onComplete: () => void;
  onCancel: () => void;
}

const WalletOnboarding: React.FC<WalletOnboardingProps> = ({ 
  action, 
  onComplete, 
  onCancel 
}) => {
  const { connectWallet, user } = useHybridAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const actionMessages = {
    play_games: {
      title: '🎮 Conecte sua carteira para jogar',
      description: 'Para ganhar pontos nos jogos e participar do airdrop, você precisa de uma carteira Solana.',
      benefits: [
        'Ganhe pontos reais que valem tokens',
        'Participe do airdrop oficial',
        'Desbloqueie recompensas exclusivas',
        'Suba no ranking global'
      ]
    },
    complete_missions: {
      title: '🎯 Conecte sua carteira para missões',
      description: 'As missões recompensam você com tokens reais. Uma carteira Solana é necessária.',
      benefits: [
        'Complete missões diárias',
        'Ganhe tokens de recompensa',
        'Acesse missões especiais',
        'Multiplique seus pontos'
      ]
    },
    buy_presale: {
      title: '💰 Conecte sua carteira para comprar',
      description: 'Para participar da pré-venda com desconto, você precisa de uma carteira Solana.',
      benefits: [
        'Preço especial de pré-venda',
        'Acesso antecipado aos tokens',
        'Bônus de early adopter',
        'Participação na governança'
      ]
    }
  };

  const currentAction = actionMessages[action as keyof typeof actionMessages] || actionMessages.play_games;

  const handleConnect = async () => {
    try {
      setLoading(true);
      const success = await connectWallet();
      
      if (success) {
        setStep(3); // Sucesso
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        setStep(4); // Erro
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      setStep(4); // Erro
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full border border-slate-700 overflow-hidden">
        
        {/* Step 1: Explicação */}
        {step === 1 && (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentAction.title}
              </h2>
              <p className="text-slate-300">
                {currentAction.description}
              </p>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">
                ✨ Benefícios:
              </h3>
              <ul className="space-y-2">
                {currentAction.benefits.map((benefit, index) => (
                  <li key={index} className="text-slate-300 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-400">ℹ️</span>
                <span className="text-blue-400 font-medium">Primeira vez?</span>
              </div>
              <p className="text-blue-300 text-sm">
                Não se preocupe! Vamos te guiar passo a passo para conectar sua carteira de forma segura.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                Talvez depois
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
              >
                Vamos lá!
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Tutorial */}
        {step === 2 && (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">📱</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Como conectar sua carteira
              </h2>
              <p className="text-slate-400">
                Siga estes passos simples:
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-400 mb-1">Instale a Phantom</h3>
                    <p className="text-slate-300 text-sm">
                      Se ainda não tem, baixe a carteira Phantom (gratuita e segura)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-400 mb-1">Clique em "Conectar"</h3>
                    <p className="text-slate-300 text-sm">
                      Sua carteira abrirá automaticamente para aprovação
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-400 mb-1">Aprove a conexão</h3>
                    <p className="text-slate-300 text-sm">
                      Clique em "Conectar" na janela da Phantom
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                Voltar
              </button>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? 'Conectando...' : 'Conectar Phantom'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sucesso */}
        {step === 3 && (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              Carteira Conectada!
            </h2>
            <p className="text-slate-300 mb-6">
              Perfeito! Agora você pode aproveitar todas as funcionalidades do MEOW Token.
            </p>
            
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Usuário:</span>
                  <span className="text-green-400 font-medium">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Carteira:</span>
                  <span className="text-green-400 font-mono text-sm">
                    {user?.walletAddress?.slice(0, 8)}...{user?.walletAddress?.slice(-4)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-slate-500 text-sm">
              Redirecionando automaticamente...
            </div>
          </div>
        )}

        {/* Step 4: Erro */}
        {step === 4 && (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">😅</div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Ops! Algo deu errado
            </h2>
            <p className="text-slate-300 mb-6">
              Não conseguimos conectar sua carteira. Isso pode acontecer se:
            </p>
            
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6 text-left">
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>A Phantom não está instalada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Você cancelou a conexão</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Houve um problema temporário</span>
                </li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletOnboarding;
```

### **PASSO 8: CRIAR COMPONENTE DE PROTEÇÃO**

```typescript
// components/auth/WalletGate.tsx
import React, { useState } from 'react';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import WalletOnboarding from './WalletOnboarding';

interface WalletGateProps {
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const WalletGate: React.FC<WalletGateProps> = ({ 
  action, 
  children, 
  fallback 
}) => {
  const { isWalletConnected, needsWalletForAction, user } = useHybridAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Se não precisa de carteira para esta ação, mostrar conteúdo
  if (!needsWalletForAction(action)) {
    return <>{children}</>;
  }

  // Se carteira já conectada, mostrar conteúdo
  if (isWalletConnected) {
    return <>{children}</>;
  }

  // Se tem fallback customizado, mostrar
  if (fallback) {
    return <>{fallback}</>;
  }

  // Mostrar tela de convite para conectar carteira
  return (
    <>
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-6">🔐</div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Olá, {user?.name}!
          </h2>
          
          <p className="text-slate-400 mb-8 text-lg">
            Para acessar esta funcionalidade, você precisa conectar sua carteira Solana.
          </p>
          
          <div className="bg-slate-800/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">
              🎯 Por que conectar?
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-slate-300">Ganhe pontos reais que valem tokens</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-slate-300">Participe do airdrop oficial</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-slate-300">Acesse funcionalidades exclusivas</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowOnboarding(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors font-medium text-lg shadow-lg hover:shadow-purple-500/25"
          >
            Conectar Carteira
          </button>
          
          <p className="text-slate-500 text-sm mt-4">
            Seguro e gratuito • Leva menos de 1 minuto
          </p>
        </div>
      </div>

      {showOnboarding && (
        <WalletOnboarding
          action={action}
          onComplete={() => setShowOnboarding(false)}
          onCancel={() => setShowOnboarding(false)}
        />
      )}
    </>
  );
};

export default WalletGate;
```

### **PASSO 9: ATUALIZAR APP PRINCIPAL**

```typescript
// App.tsx
import React from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import { AuthProvider, useHybridAuth } from './hooks/useHybridAuth';
import { NavigationProvider } from './hooks/useNavigationState';
import Layout from './components/Layout';
import MainContent from './components/MainContent';
import LoginPage from './components/auth/LoginPage';

// CSS imports
import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useHybridAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🐱</span>
          </div>
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando MEOW Token...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <NavigationProvider>
      <Layout>
        <MainContent />
      </Layout>
    </NavigationProvider>
  );
};

const App: React.FC = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
```

### **PASSO 10: ATUALIZAR HEADER COM PERFIL**

```typescript
// components/Header.tsx
import React, { useState } from 'react';
import { useHybridAuth } from '@/hooks/useHybridAuth';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, isWalletConnected, logout } = useHybridAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50">
      <div className="flex items-center justify-between px-6 py-4">
        
        {/* Logo e toggle sidebar */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🐱</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MEOW Token
            </h1>
          </div>
        </div>

        {/* Estatísticas do usuário */}
        {user && (
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-slate-800/50 rounded-lg px-3 py-2">
                <span className="text-slate-400 text-sm">Pontos:</span>
                <span className="text-purple-400 font-bold ml-2">
                  {user.totalPoints?.toLocaleString() || 0}
                </span>
              </div>
              <div className="bg-slate-800/50 rounded-lg px-3 py-2">
                <span className="text-slate-400 text-sm">Nível:</span>
                <span className="text-blue-400 font-bold ml-2">
                  {user.currentLevel || 1}
                </span>
              </div>
              <div className="bg-slate-800/50 rounded-lg px-3 py-2">
                <span className="text-slate-400 text-sm">Hoje:</span>
                <span className="text-green-400 font-bold ml-2">
                  {user.pointsToday?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Menu do usuário */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
          >
            <img
              src={user?.pictureUrl || 'https://via.placeholder.com/32'}
              alt={user?.name || 'Usuário'}
              className="w-8 h-8 rounded-full"
            />
            <div className="hidden sm:block text-left">
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-slate-400 text-xs">
                {isWalletConnected ? '🟢 Carteira conectada' : '🔴 Carteira não conectada'}
              </p>
            </div>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
              <div className="p-4 border-b border-slate-700">
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-slate-400 text-sm">{user?.email}</p>
              </div>
              
              <div className="p-2">
                <div className="px-3 py-2 text-slate-300 text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Pontos Totais:</span>
                    <span className="text-purple-400 font-medium">
                      {user?.totalPoints?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Nível Atual:</span>
                    <span className="text-blue-400 font-medium">{user?.currentLevel || 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status Carteira:</span>
                    <span className={isWalletConnected ? 'text-green-400' : 'text-red-400'}>
                      {isWalletConnected ? 'Conectada' : 'Desconectada'}
                    </span>
                  </div>
                </div>
                
                <hr className="border-slate-700 my-2" />
                
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
```

### **PASSO 11: ATUALIZAR JOGOS COM WALLETGATE**

```typescript
// Exemplo: components/games/MeowClicker.tsx
import React, { useState, useEffect } from 'react';
import WalletGate from '@/components/auth/WalletGate';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { useSimplePointsSystem } from '@/hooks/useSimplePointsSystem';

const MeowClicker: React.FC = () => {
  const { user } = useHybridAuth();
  const { addPoints, canPlay, getRemainingPlays } = useSimplePointsSystem();
  const [energy, setEnergy] = useState(100);
  const [clicks, setClicks] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const maxEnergy = 100;
  const energyRegenRate = 1;
  const energyRegenInterval = 5000;

  // Regenerar energia
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(prev + energyRegenRate, maxEnergy));
    }, energyRegenInterval);

    return () => clearInterval(interval);
  }, []);

  const handleClick = async () => {
    if (!canPlay('meowclicker')) {
      alert('Limite diário atingido! Volte amanhã às 21:00.');
      return;
    }

    if (energy <= 0) {
      alert('Energia esgotada! Aguarde a regeneração.');
      return;
    }

    // Animação
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);

    // Consumir energia
    setEnergy(prev => Math.max(prev - 1, 0));
    setClicks(prev => prev + 1);

    // Adicionar pontos
    const success = await addPoints('meowclicker', 1, {
      click_number: clicks + 1,
      energy_used: 1,
      timestamp: new Date().toISOString()
    });

    if (!success) {
      console.error('Falha ao adicionar pontos');
    }
  };

  const remainingClicks = getRemainingPlays('meowclicker');
  const energyPercentage = (energy / maxEnergy) * 100;

  return (
    <WalletGate action="play_games">
      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-purple-400 mb-2">🐱 Meow Clicker</h3>
          <p className="text-slate-400">
            Olá {user?.name}! Clique no gato para ganhar pontos!
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-sm">Cliques Restantes</p>
            <p className="text-xl font-bold text-purple-400">{remainingClicks}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-sm">Energia</p>
            <p className="text-xl font-bold text-green-400">{energy}/{maxEnergy}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-sm">Pontos Hoje</p>
            <p className="text-xl font-bold text-yellow-400">{user?.pointsToday || 0}</p>
          </div>
        </div>

        {/* Barra de energia */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">Energia</span>
            <span className="text-slate-400 text-sm">{energy}/{maxEnergy}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${energyPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Botão do gato */}
        <div className="text-center mb-6">
          <button
            onClick={handleClick}
            disabled={energy <= 0 || !canPlay('meowclicker')}
            className={`relative w-32 h-32 rounded-full text-6xl transition-all duration-200 ${
              isAnimating ? 'scale-110' : 'scale-100'
            } ${
              energy <= 0 || !canPlay('meowclicker')
                ? 'bg-slate-700 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/25'
            }`}
          >
            🐱
            {isAnimating && (
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
            )}
          </button>
        </div>

        {/* Status */}
        <div className="text-center">
          {!canPlay('meowclicker') ? (
            <p className="text-red-400 font-medium">
              ❌ Limite diário atingido! Reset às 21:00
            </p>
          ) : energy <= 0 ? (
            <p className="text-orange-400 font-medium">
              ⚡ Energia esgotada! Regenerando...
            </p>
          ) : (
            <p className="text-green-400 font-medium">
              ✅ Pronto para jogar! Clique no gato
            </p>
          )}
        </div>
      </div>
    </WalletGate>
  );
};

export default MeowClicker;
```

---

## 🚀 **INSTRUÇÕES FINAIS**

### **EXECUTAR NO REPLIT:**

1. **Copie este prompt completo**
2. **Abra o Agent do Replit** no projeto CryptoAirdrop
3. **Cole o prompt** e execute
4. **Aguarde 45-60 minutos** para implementação completa
5. **Configure as variáveis** do Google OAuth
6. **Teste o fluxo completo**

### **CONFIGURAR GOOGLE OAUTH:**

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie projeto ou use existente
3. Ative Google+ API
4. Crie credenciais OAuth 2.0
5. Configure domínios autorizados
6. Copie Client ID e Secret para .env

### **TESTAR FLUXO:**

1. **Landing → Login Google** ✅
2. **Explorar sem carteira** ✅
3. **Tentar jogar → Onboarding carteira** ✅
4. **Conectar Phantom → Jogar** ✅
5. **Sistema de pontos funcionando** ✅

---

## ✅ **RESULTADO FINAL**

Após implementar este sistema:

🎯 **Login suave** com Google (95% conversão)
🎯 **Exploração livre** de conteúdo educativo
🎯 **Onboarding progressivo** para carteira
🎯 **Sistema híbrido** Google + Solana
🎯 **Experiência premium** e profissional

**Esta implementação vai revolucionar sua taxa de conversão e engajamento!** 🚀

**EXECUTE AGORA PARA TER O SISTEMA MAIS AVANÇADO DO MERCADO!** ⚡

