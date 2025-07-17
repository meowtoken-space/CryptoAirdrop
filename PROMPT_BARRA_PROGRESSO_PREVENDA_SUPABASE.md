# 🚀 PROMPT COMPLETO: BARRA DE PROGRESSO PRÉ-VENDA COM SUPABASE

## 🎯 **OBJETIVO**
Integrar o sistema de pontos Supabase com uma barra de progresso da pré-venda que se atualiza em tempo real conforme as pessoas compram tokens MEOW, criando um sistema dinâmico e interativo.

---

## 📋 **ESPECIFICAÇÕES TÉCNICAS**

### **🗄️ ESTRUTURA DO BANCO SUPABASE**

#### **1. CRIAR TABELA `presale_progress`:**
```sql
CREATE TABLE presale_progress (
  id SERIAL PRIMARY KEY,
  total_target BIGINT NOT NULL DEFAULT 1000000, -- Meta total (1M tokens)
  current_sold BIGINT NOT NULL DEFAULT 0, -- Tokens vendidos
  total_buyers INTEGER NOT NULL DEFAULT 0, -- Total de compradores
  current_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- Porcentagem atual
  last_purchase_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir registro inicial
INSERT INTO presale_progress (total_target, current_sold, total_buyers, current_percentage)
VALUES (1000000, 40000, 156, 4.00);
```

#### **2. CRIAR TABELA `presale_purchases`:**
```sql
CREATE TABLE presale_purchases (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  amount_tokens BIGINT NOT NULL, -- Quantidade de tokens comprados
  amount_sol DECIMAL(10,4) NOT NULL, -- Valor pago em SOL
  transaction_hash TEXT UNIQUE NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_points_bonus INTEGER DEFAULT 0, -- Bônus de pontos por comprar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_presale_purchases_wallet ON presale_purchases(wallet_address);
CREATE INDEX idx_presale_purchases_date ON presale_purchases(purchase_date);
```

#### **3. CRIAR TABELA `presale_milestones`:**
```sql
CREATE TABLE presale_milestones (
  id SERIAL PRIMARY KEY,
  percentage INTEGER NOT NULL, -- 25, 50, 75, 100
  title TEXT NOT NULL,
  description TEXT,
  reward_points INTEGER DEFAULT 0, -- Pontos de bônus ao atingir milestone
  is_achieved BOOLEAN DEFAULT FALSE,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir milestones
INSERT INTO presale_milestones (percentage, title, description, reward_points) VALUES
(25, 'Early Adopters', 'Primeiros 25% da pré-venda', 500),
(50, 'Community Power', 'Metade da meta alcançada', 1000),
(75, 'Almost There', 'Quase na meta final', 1500),
(100, 'Mission Complete', 'Meta da pré-venda atingida!', 2500);
```

---

### **🎨 COMPONENTE REACT ATUALIZADO**

#### **1. HOOK PERSONALIZADO `usePresaleProgress`:**
```typescript
// hooks/usePresaleProgress.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PresaleData {
  totalTarget: number;
  currentSold: number;
  totalBuyers: number;
  currentPercentage: number;
  lastPurchaseAt: string;
}

interface Milestone {
  id: number;
  percentage: number;
  title: string;
  description: string;
  rewardPoints: number;
  isAchieved: boolean;
  achievedAt: string | null;
}

export const usePresaleProgress = () => {
  const [presaleData, setPresaleData] = useState<PresaleData | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados iniciais
  const fetchPresaleData = async () => {
    try {
      setLoading(true);
      
      // Buscar progresso atual
      const { data: progressData, error: progressError } = await supabase
        .from('presale_progress')
        .select('*')
        .single();

      if (progressError) throw progressError;

      // Buscar milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('presale_milestones')
        .select('*')
        .order('percentage', { ascending: true });

      if (milestonesError) throw milestonesError;

      setPresaleData({
        totalTarget: progressData.total_target,
        currentSold: progressData.current_sold,
        totalBuyers: progressData.total_buyers,
        currentPercentage: progressData.current_percentage,
        lastPurchaseAt: progressData.last_purchase_at
      });

      setMilestones(milestonesData.map(m => ({
        id: m.id,
        percentage: m.percentage,
        title: m.title,
        description: m.description,
        rewardPoints: m.reward_points,
        isAchieved: m.is_achieved,
        achievedAt: m.achieved_at
      })));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Escutar mudanças em tempo real
  useEffect(() => {
    fetchPresaleData();

    // Subscription para mudanças em tempo real
    const progressSubscription = supabase
      .channel('presale_progress_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'presale_progress' },
        (payload) => {
          console.log('Progresso atualizado:', payload);
          fetchPresaleData();
        }
      )
      .subscribe();

    const milestonesSubscription = supabase
      .channel('milestones_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'presale_milestones' },
        (payload) => {
          console.log('Milestone atualizado:', payload);
          fetchPresaleData();
        }
      )
      .subscribe();

    return () => {
      progressSubscription.unsubscribe();
      milestonesSubscription.unsubscribe();
    };
  }, []);

  return {
    presaleData,
    milestones,
    loading,
    error,
    refetch: fetchPresaleData
  };
};
```

#### **2. COMPONENTE `PresaleProgressBar`:**
```typescript
// components/PresaleProgressBar.tsx
import React from 'react';
import { usePresaleProgress } from '@/hooks/usePresaleProgress';

const PresaleProgressBar: React.FC = () => {
  const { presaleData, milestones, loading, error } = usePresaleProgress();

  if (loading) {
    return (
      <div className="w-[95%] md:w-full max-w-xl mx-auto p-4 md:p-12 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-950 via-slate-900 to-slate-950 rounded-3xl">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-800 rounded-2xl mb-8"></div>
          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !presaleData) {
    return (
      <div className="w-[95%] md:w-full max-w-xl mx-auto p-4 md:p-12 bg-red-950/20 rounded-3xl border border-red-500/20">
        <p className="text-red-400 text-center">Erro ao carregar dados da pré-venda</p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatPercentage = (percentage: number) => {
    return percentage.toFixed(1);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'from-emerald-500 via-teal-400 to-emerald-500';
    if (percentage >= 50) return 'from-yellow-500 via-orange-400 to-yellow-500';
    if (percentage >= 25) return 'from-blue-500 via-cyan-400 to-blue-500';
    return 'from-teal-500 via-emerald-400 to-teal-500';
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 100) return 'Concluída';
    if (percentage >= 75) return 'Quase lá';
    if (percentage >= 50) return 'Metade';
    if (percentage >= 25) return 'Aquecendo';
    return 'Iniciando';
  };

  return (
    <div className="w-[95%] md:w-full max-w-xl mx-auto p-4 md:p-12 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-950 via-slate-900 to-slate-950 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_0_1px_rgba(255,255,255,0.1)] border border-white/5 backdrop-blur-2xl relative overflow-hidden">
      
      {/* Efeitos de fundo animados */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 blur-3xl rotate-12 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 blur-3xl -rotate-12 animate-pulse delay-1000"></div>

      {/* Header com informações */}
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0 mb-8 md:mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 blur-xl opacity-50 group-hover:opacity-70 transition-all duration-500 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.5),inset_0_0_1px_rgba(255,255,255,0.1)]">
              <svg fill="currentColor" className="w-7 h-7 text-teal-400" viewBox="0 0 24 24">
                <path d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5-6.5-4.5-6.5 4.5 2.5-7.5-6-4.5h7.5z"></path>
              </svg>
            </div>
          </div>

          <div className="space-y-2 w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-wide">
                MEOW Token Pré-venda
              </h3>
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 shadow-[0_2px_8px_rgba(20,184,166,0.1)]">
                <span className="text-[10px] uppercase font-semibold tracking-widest text-teal-400">
                  {getStatusText(presaleData.currentPercentage)}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <p className="text-xs text-emerald-400/80">
                  {formatNumber(presaleData.totalBuyers)} compradores
                </p>
              </div>
              <div className="w-px h-3 bg-slate-700/50"></div>
              <p className="text-xs text-slate-400">
                {formatNumber(presaleData.currentSold)} / {formatNumber(presaleData.totalTarget)} tokens
              </p>
            </div>
          </div>
        </div>

        {/* Porcentagem atual */}
        <div className="relative group w-full sm:w-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
          <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-950 px-6 py-4 rounded-2xl border border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.2),inset_0_0_1px_rgba(255,255,255,0.1)] backdrop-blur-sm">
            <span className="text-3xl font-bold bg-gradient-to-r from-teal-300 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {formatPercentage(presaleData.currentPercentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* Barra de progresso principal */}
      <div className="relative h-8 bg-gradient-to-r from-slate-900 to-slate-950 rounded-2xl overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/5">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800/50 via-transparent to-slate-800/50"></div>
        </div>

        <div 
          className="h-full relative group transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(presaleData.currentPercentage, 100)}%` }}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${getProgressColor(presaleData.currentPercentage)}`}></div>

          {/* Efeito shimmer */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-25 translate-x-[-100%] animate-[shimmer_2s_infinite] group-hover:opacity-40"></div>
          </div>

          {/* Brilho */}
          <div className={`absolute inset-0 bg-gradient-to-r ${getProgressColor(presaleData.currentPercentage)} blur-sm opacity-60 group-hover:opacity-80 transition-all duration-500`}></div>

          {/* Borda direita */}
          <div className="absolute right-0 inset-y-0 w-px bg-white/20"></div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mt-8 px-2">
        <div className="flex justify-between relative gap-2 md:gap-4">
          <div className="absolute top-3 left-0 right-0 h-px bg-gradient-to-r from-teal-500/20 via-slate-700/20 to-slate-700/20"></div>

          {milestones.map((milestone) => {
            const isActive = presaleData.currentPercentage >= milestone.percentage;
            const isCurrent = presaleData.currentPercentage >= (milestone.percentage - 25) && presaleData.currentPercentage < milestone.percentage;
            
            return (
              <div
                key={milestone.id}
                className="flex flex-col items-center relative z-10 group cursor-pointer transition-transform hover:scale-110 duration-300"
                title={`${milestone.title}: ${milestone.description}`}
              >
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-slate-900 to-slate-950 p-1 md:p-1.5 border shadow-lg transition-all ${
                  isActive 
                    ? 'border-teal-500/50 group-hover:border-teal-400/70' 
                    : isCurrent
                    ? 'border-yellow-500/50 group-hover:border-yellow-400/70'
                    : 'border-slate-700/20 group-hover:border-slate-600/50'
                }`}>
                  <div className={`w-full h-full rounded-full ${
                    isActive 
                      ? 'bg-gradient-to-r from-teal-400 to-emerald-400' 
                      : isCurrent
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                      : 'bg-slate-700'
                  }`}></div>
                </div>
                <span className={`mt-1.5 text-xs md:text-sm font-medium ${
                  isActive 
                    ? 'text-teal-400' 
                    : isCurrent
                    ? 'text-yellow-400'
                    : 'text-slate-600'
                }`}>
                  {milestone.percentage}%
                </span>
                {milestone.isAchieved && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="mt-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/50 border border-white/5 shadow-lg w-full sm:w-auto">
            <span className="text-xs text-slate-400">
              Iniciado: <span className="text-white font-medium">Jan 14, 2025</span>
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/50 border border-white/5 shadow-lg w-full sm:w-auto">
            <span className="text-xs text-slate-400">
              Meta: <span className="text-white font-medium">Dez 2025</span>
            </span>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 shadow-lg w-full sm:w-auto">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></div>
            <span className="text-xs font-medium text-teal-400">
              {presaleData.currentPercentage >= 100 ? 'Concluída' : 'Em Andamento'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresaleProgressBar;
```

---

### **⚡ FUNÇÃO DE COMPRA INTEGRADA**

#### **3. HOOK `usePurchaseToken`:**
```typescript
// hooks/usePurchaseToken.ts
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabase';

export const usePurchaseToken = () => {
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchaseTokens = async (tokenAmount: number, solAmount: number) => {
    if (!publicKey) {
      setError('Carteira não conectada');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Simular transação Solana (substitua pela lógica real)
      const transactionHash = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 1. Registrar compra no banco
      const { error: purchaseError } = await supabase
        .from('presale_purchases')
        .insert({
          wallet_address: publicKey.toString(),
          amount_tokens: tokenAmount,
          amount_sol: solAmount,
          transaction_hash: transactionHash,
          user_points_bonus: Math.floor(tokenAmount / 100) // 1 ponto a cada 100 tokens
        });

      if (purchaseError) throw purchaseError;

      // 2. Atualizar progresso geral
      const { data: currentProgress } = await supabase
        .from('presale_progress')
        .select('*')
        .single();

      if (currentProgress) {
        const newSold = currentProgress.current_sold + tokenAmount;
        const newBuyers = currentProgress.total_buyers + 1;
        const newPercentage = (newSold / currentProgress.total_target) * 100;

        const { error: updateError } = await supabase
          .from('presale_progress')
          .update({
            current_sold: newSold,
            total_buyers: newBuyers,
            current_percentage: newPercentage,
            last_purchase_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', currentProgress.id);

        if (updateError) throw updateError;

        // 3. Verificar e atualizar milestones
        await checkAndUpdateMilestones(newPercentage);

        // 4. Adicionar pontos ao usuário
        await addPointsToUser(publicKey.toString(), Math.floor(tokenAmount / 100));
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na compra');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkAndUpdateMilestones = async (currentPercentage: number) => {
    const { data: milestones } = await supabase
      .from('presale_milestones')
      .select('*')
      .lte('percentage', currentPercentage)
      .eq('is_achieved', false);

    if (milestones && milestones.length > 0) {
      for (const milestone of milestones) {
        await supabase
          .from('presale_milestones')
          .update({
            is_achieved: true,
            achieved_at: new Date().toISOString()
          })
          .eq('id', milestone.id);

        // Dar bônus de pontos para todos os usuários
        console.log(`Milestone ${milestone.percentage}% atingido! Bônus: ${milestone.reward_points} pontos`);
      }
    }
  };

  const addPointsToUser = async (walletAddress: string, points: number) => {
    // Integrar com sistema de pontos existente
    const { error } = await supabase
      .from('users')
      .upsert({
        wallet_address: walletAddress,
        total_points: supabase.raw(`COALESCE(total_points, 0) + ${points}`),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'wallet_address'
      });

    if (error) {
      console.error('Erro ao adicionar pontos:', error);
    }
  };

  return {
    purchaseTokens,
    loading,
    error
  };
};
```

---

### **🎨 ANIMAÇÕES CSS PERSONALIZADAS**

#### **4. ADICIONAR AO TAILWIND CONFIG:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'progress-fill': 'progress-fill 1s ease-out',
        'milestone-achieved': 'milestone-achieved 0.6s ease-out',
        'pulse-success': 'pulse-success 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'progress-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' }
        },
        'milestone-achieved': {
          '0%': { transform: 'scale(1)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'pulse-success': {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' 
          },
          '70%': { 
            boxShadow: '0 0 0 10px rgba(34, 197, 94, 0)' 
          }
        }
      }
    }
  }
}
```

---

### **🔔 NOTIFICAÇÕES EM TEMPO REAL**

#### **5. COMPONENTE `PresaleNotifications`:**
```typescript
// components/PresaleNotifications.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Purchase {
  wallet_address: string;
  amount_tokens: number;
  amount_sol: number;
  purchase_date: string;
}

const PresaleNotifications: React.FC = () => {
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Escutar novas compras
    const subscription = supabase
      .channel('new_purchases')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'presale_purchases' },
        (payload) => {
          const newPurchase = payload.new as Purchase;
          
          // Adicionar à lista
          setRecentPurchases(prev => [newPurchase, ...prev.slice(0, 4)]);
          
          // Mostrar notificação
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 5000);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  if (!showNotification || recentPurchases.length === 0) return null;

  const latestPurchase = recentPurchases[0];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-emerald-900/90 to-teal-900/90 backdrop-blur-lg border border-emerald-500/20 rounded-2xl p-4 shadow-2xl max-w-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center animate-pulse-success">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-emerald-400 font-semibold text-sm">Nova Compra!</p>
            <p className="text-white text-xs">
              {formatWallet(latestPurchase.wallet_address)} comprou{' '}
              <span className="font-bold">{formatNumber(latestPurchase.amount_tokens)} MEOW</span>
            </p>
            <p className="text-emerald-300 text-xs">
              {latestPurchase.amount_sol} SOL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresaleNotifications;
```

---

### **📊 DASHBOARD ADMINISTRATIVO**

#### **6. COMPONENTE `PresaleAdmin`:**
```typescript
// components/admin/PresaleAdmin.tsx
import React, { useState } from 'react';
import { usePresaleProgress } from '@/hooks/usePresaleProgress';
import { supabase } from '@/lib/supabase';

const PresaleAdmin: React.FC = () => {
  const { presaleData, milestones, refetch } = usePresaleProgress();
  const [loading, setLoading] = useState(false);

  const updateProgress = async (newSold: number) => {
    setLoading(true);
    try {
      const newPercentage = (newSold / (presaleData?.totalTarget || 1000000)) * 100;
      
      await supabase
        .from('presale_progress')
        .update({
          current_sold: newSold,
          current_percentage: newPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      await refetch();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetProgress = async () => {
    if (!confirm('Tem certeza que deseja resetar o progresso?')) return;
    
    setLoading(true);
    try {
      await supabase
        .from('presale_progress')
        .update({
          current_sold: 0,
          total_buyers: 0,
          current_percentage: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      await supabase
        .from('presale_milestones')
        .update({
          is_achieved: false,
          achieved_at: null
        });

      await refetch();
    } catch (error) {
      console.error('Erro ao resetar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!presaleData) return <div>Carregando...</div>;

  return (
    <div className="p-6 bg-slate-900 rounded-2xl border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6">Admin - Pré-venda</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 p-4 rounded-xl">
          <h3 className="text-slate-400 text-sm">Tokens Vendidos</h3>
          <p className="text-2xl font-bold text-white">
            {new Intl.NumberFormat('pt-BR').format(presaleData.current_sold)}
          </p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl">
          <h3 className="text-slate-400 text-sm">Compradores</h3>
          <p className="text-2xl font-bold text-white">
            {presaleData.total_buyers}
          </p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl">
          <h3 className="text-slate-400 text-sm">Progresso</h3>
          <p className="text-2xl font-bold text-emerald-400">
            {presaleData.current_percentage.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => updateProgress(presaleData.current_sold + 10000)}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          +10k Tokens
        </button>
        <button
          onClick={() => updateProgress(presaleData.current_sold + 50000)}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          +50k Tokens
        </button>
        <button
          onClick={resetProgress}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          Reset
        </button>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl">
        <h3 className="text-white font-semibold mb-4">Milestones</h3>
        <div className="space-y-2">
          {milestones.map(milestone => (
            <div key={milestone.id} className="flex items-center justify-between p-2 bg-slate-700 rounded">
              <span className="text-slate-300">{milestone.percentage}% - {milestone.title}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                milestone.is_achieved 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-600 text-slate-300'
              }`}>
                {milestone.is_achieved ? 'Atingido' : 'Pendente'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PresaleAdmin;
```

---

## 🚀 **IMPLEMENTAÇÃO FINAL**

### **COMO USAR O PROMPT:**

1. **Execute o SQL** no Supabase para criar as tabelas
2. **Implemente os hooks** React no seu projeto
3. **Substitua o componente** de barra de progresso atual
4. **Adicione as notificações** em tempo real
5. **Configure o dashboard** administrativo
6. **Teste a integração** com compras simuladas

### **RESULTADO ESPERADO:**

- ✅ **Barra atualiza** em tempo real conforme compras
- ✅ **Milestones visuais** com animações
- ✅ **Notificações** de novas compras
- ✅ **Integração** com sistema de pontos
- ✅ **Dashboard admin** para controle
- ✅ **Performance otimizada** com subscriptions

**A barra de progresso agora será um sistema completo e dinâmico que incentiva mais compras e engaja a comunidade!** 🎯

