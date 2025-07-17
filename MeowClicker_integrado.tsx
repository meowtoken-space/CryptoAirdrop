// MeowClicker_integrado.tsx - Versão integrada com sistema de pontos
import React, { useState, useEffect, useCallback } from 'react';

// Tipos para o sistema de pontos
interface PointsResult {
  success: boolean;
  pointsEarned?: number;
  error?: string;
  levelUp?: boolean;
  newLevel?: number;
  sessionData?: any;
}

// Declaração global para o sistema de pontos
declare global {
  interface Window {
    gameIntegration?: {
      submitMeowClickerScore: (clicks: number, energy: number, powerUps?: string[]) => PointsResult;
      getDailyLimitsRemaining: () => Record<string, number>;
    };
    meowUI?: {
      showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
    };
    meowPoints?: {
      getUserData: () => any;
      connectWallet: (address: string) => void;
    };
  }
}

interface PowerUp {
  id: string;
  name: string;
  multiplier: number;
  duration: number;
  cost: number;
  icon: string;
}

const MeowClicker: React.FC = () => {
  // Estados do jogo original
  const [clicks, setClicks] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [maxEnergy, setMaxEnergy] = useState(100);
  const [energyRegenRate, setEnergyRegenRate] = useState(1);
  const [clickPower, setClickPower] = useState(1);
  const [autoClickers, setAutoClickers] = useState(0);
  const [coins, setCoins] = useState(0);
  
  // Estados dos power-ups
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);
  const [powerUpTimers, setPowerUpTimers] = useState<Record<string, number>>({});
  
  // Estados do sistema de pontos
  const [pointsEarned, setPointsEarned] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(500);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [lastPointsAnimation, setLastPointsAnimation] = useState<number | null>(null);

  // Power-ups disponíveis
  const powerUps: PowerUp[] = [
    { id: 'double_click', name: 'Clique Duplo', multiplier: 2, duration: 30, cost: 50, icon: '⚡' },
    { id: 'energy_boost', name: 'Energia Extra', multiplier: 1, duration: 60, cost: 75, icon: '🔋' },
    { id: 'mega_click', name: 'Mega Clique', multiplier: 5, duration: 15, cost: 100, icon: '💥' },
    { id: 'auto_energy', name: 'Auto Energia', multiplier: 1, duration: 45, cost: 80, icon: '🔄' }
  ];

  // Verificar conexão da carteira
  useEffect(() => {
    const checkWalletConnection = () => {
      if (window.meowPoints) {
        try {
          const userData = window.meowPoints.getUserData();
          setIsWalletConnected(!!userData.walletAddress);
        } catch (error) {
          setIsWalletConnected(false);
        }
      }
    };

    checkWalletConnection();
    
    // Verificar a cada 5 segundos
    const interval = setInterval(checkWalletConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // Verificar limites diários
  useEffect(() => {
    const checkDailyLimits = () => {
      if (window.gameIntegration) {
        try {
          const limits = window.gameIntegration.getDailyLimitsRemaining();
          const meowClickerLimit = limits['Meow Clicker'] || 0;
          setDailyUsed(500 - meowClickerLimit);
        } catch (error) {
          console.error('Erro ao verificar limites:', error);
        }
      }
    };

    checkDailyLimits();
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkDailyLimits, 30000);
    return () => clearInterval(interval);
  }, []);

  // Regeneração de energia
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => {
        const newEnergy = Math.min(prev + energyRegenRate, maxEnergy);
        return newEnergy;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [energyRegenRate, maxEnergy]);

  // Auto clickers
  useEffect(() => {
    if (autoClickers > 0) {
      const interval = setInterval(() => {
        if (energy >= 1) {
          handleClick(true); // Auto click
        }
      }, 2000 / autoClickers); // Velocidade baseada no número de auto clickers

      return () => clearInterval(interval);
    }
  }, [autoClickers, energy]);

  // Gerenciar timers dos power-ups
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    Object.entries(powerUpTimers).forEach(([powerUpId, timeLeft]) => {
      if (timeLeft > 0) {
        const interval = setInterval(() => {
          setPowerUpTimers(prev => {
            const newTime = prev[powerUpId] - 1;
            if (newTime <= 0) {
              // Power-up expirou
              setActivePowerUps(current => current.filter(id => id !== powerUpId));
              const { [powerUpId]: removed, ...rest } = prev;
              return rest;
            }
            return { ...prev, [powerUpId]: newTime };
          });
        }, 1000);
        intervals.push(interval);
      }
    });

    return () => intervals.forEach(clearInterval);
  }, [powerUpTimers]);

  // Função principal de clique
  const handleClick = useCallback((isAutoClick = false) => {
    if (energy < 1) return;

    // Calcular multiplicador dos power-ups
    let totalMultiplier = clickPower;
    activePowerUps.forEach(powerUpId => {
      const powerUp = powerUps.find(p => p.id === powerUpId);
      if (powerUp) {
        totalMultiplier *= powerUp.multiplier;
      }
    });

    // Executar clique
    const clicksToAdd = totalMultiplier;
    const energyCost = isAutoClick ? 0.5 : 1;

    setClicks(prev => prev + clicksToAdd);
    setCoins(prev => prev + clicksToAdd);
    setEnergy(prev => Math.max(prev - energyCost, 0));

    // 🆕 INTEGRAÇÃO COM SISTEMA DE PONTOS
    if (!isAutoClick && isWalletConnected && window.gameIntegration) {
      try {
        const result = window.gameIntegration.submitMeowClickerScore(
          clicksToAdd, 
          energy, 
          activePowerUps
        );

        if (result.success && result.pointsEarned) {
          setPointsEarned(prev => prev + result.pointsEarned!);
          setLastPointsAnimation(result.pointsEarned);
          
          // Mostrar notificação
          if (window.meowUI) {
            window.meowUI.showNotification(
              `🎮 +${result.pointsEarned} pontos Meow!`, 
              'success'
            );
          }

          // Verificar level up
          if (result.levelUp) {
            if (window.meowUI) {
              window.meowUI.showNotification(
                `🎉 Level Up! Agora você é nível ${result.newLevel}!`, 
                'success'
              );
            }
          }

          // Limpar animação após 2 segundos
          setTimeout(() => setLastPointsAnimation(null), 2000);

        } else if (result.error) {
          // Limite diário atingido ou outro erro
          if (window.meowUI) {
            window.meowUI.showNotification(
              `⚠️ ${result.error}`, 
              'warning'
            );
          }
        }
      } catch (error) {
        console.error('Erro ao submeter pontos:', error);
      }
    }

    // Efeito visual de clique
    if (!isAutoClick) {
      createClickEffect();
    }
  }, [energy, clickPower, activePowerUps, isWalletConnected]);

  // Ativar power-up
  const activatePowerUp = (powerUp: PowerUp) => {
    if (coins >= powerUp.cost && !activePowerUps.includes(powerUp.id)) {
      setCoins(prev => prev - powerUp.cost);
      setActivePowerUps(prev => [...prev, powerUp.id]);
      setPowerUpTimers(prev => ({ ...prev, [powerUp.id]: powerUp.duration }));

      // Aplicar efeitos especiais
      if (powerUp.id === 'energy_boost') {
        setMaxEnergy(prev => prev + 50);
        setEnergy(prev => prev + 50);
      } else if (powerUp.id === 'auto_energy') {
        setEnergyRegenRate(prev => prev * 2);
      }

      if (window.meowUI) {
        window.meowUI.showNotification(
          `${powerUp.icon} ${powerUp.name} ativado por ${powerUp.duration}s!`, 
          'info'
        );
      }
    }
  };

  // Comprar upgrade
  const buyUpgrade = (type: string, cost: number) => {
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      
      switch (type) {
        case 'clickPower':
          setClickPower(prev => prev + 1);
          break;
        case 'maxEnergy':
          setMaxEnergy(prev => prev + 25);
          break;
        case 'energyRegen':
          setEnergyRegenRate(prev => prev + 0.5);
          break;
        case 'autoClicker':
          setAutoClickers(prev => prev + 1);
          break;
      }

      if (window.meowUI) {
        window.meowUI.showNotification(
          `🛒 Upgrade comprado!`, 
          'success'
        );
      }
    }
  };

  // Criar efeito visual de clique
  const createClickEffect = () => {
    const meowButton = document.getElementById('meow-button');
    if (meowButton) {
      meowButton.style.transform = 'scale(0.95)';
      setTimeout(() => {
        meowButton.style.transform = 'scale(1)';
      }, 100);
    }
  };

  // Conectar carteira
  const connectWallet = () => {
    if (window.meowUI) {
      window.meowUI.showNotification(
        '🔗 Clique no botão "Conectar Carteira" no topo da página!', 
        'info'
      );
    }
  };

  return (
    <div className="meow-clicker-container">
      {/* Header com informações do jogo */}
      <div className="game-header">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">🖱️ Cliques</span>
            <span className="stat-value">{clicks.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">🪙 Moedas</span>
            <span className="stat-value">{coins.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">⚡ Energia</span>
            <span className="stat-value">{energy}/{maxEnergy}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">🎯 Pontos Meow</span>
            <span className="stat-value points-earned">{pointsEarned.toLocaleString()}</span>
          </div>
        </div>

        {/* Barra de energia */}
        <div className="energy-bar">
          <div 
            className="energy-fill" 
            style={{ width: `${(energy / maxEnergy) * 100}%` }}
          />
          <span className="energy-text">{energy}/{maxEnergy} Energia</span>
        </div>

        {/* Status da carteira */}
        {!isWalletConnected && (
          <div className="wallet-warning" onClick={connectWallet}>
            <span>⚠️ Conecte sua carteira para ganhar pontos Meow!</span>
          </div>
        )}

        {/* Limite diário */}
        {isWalletConnected && (
          <div className="daily-limit">
            <span>📊 Limite diário: {dailyUsed}/{dailyLimit} pontos usados</span>
            <div className="limit-bar">
              <div 
                className="limit-fill" 
                style={{ width: `${(dailyUsed / dailyLimit) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Área principal de clique */}
      <div className="click-area">
        <button
          id="meow-button"
          className={`meow-button ${energy < 1 ? 'disabled' : ''}`}
          onClick={() => handleClick()}
          disabled={energy < 1}
        >
          <div className="meow-cat">🐱</div>
          <div className="click-text">
            {energy < 1 ? 'Sem Energia!' : 'MEOW!'}
          </div>
          <div className="click-power">+{clickPower * activePowerUps.reduce((mult, id) => {
            const powerUp = powerUps.find(p => p.id === id);
            return mult * (powerUp?.multiplier || 1);
          }, 1)} por clique</div>
        </button>

        {/* Animação de pontos */}
        {lastPointsAnimation && (
          <div className="points-animation">
            +{lastPointsAnimation} pontos!
          </div>
        )}
      </div>

      {/* Power-ups ativos */}
      {activePowerUps.length > 0 && (
        <div className="active-powerups">
          <h3>🔥 Power-ups Ativos</h3>
          <div className="powerups-list">
            {activePowerUps.map(powerUpId => {
              const powerUp = powerUps.find(p => p.id === powerUpId);
              const timeLeft = powerUpTimers[powerUpId] || 0;
              
              return powerUp ? (
                <div key={powerUpId} className="active-powerup">
                  <span>{powerUp.icon} {powerUp.name}</span>
                  <span className="timer">{timeLeft}s</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Loja de power-ups */}
      <div className="powerups-shop">
        <h3>⚡ Power-ups</h3>
        <div className="powerups-grid">
          {powerUps.map(powerUp => (
            <div 
              key={powerUp.id} 
              className={`powerup-item ${
                coins < powerUp.cost ? 'disabled' : ''
              } ${
                activePowerUps.includes(powerUp.id) ? 'active' : ''
              }`}
              onClick={() => activatePowerUp(powerUp)}
            >
              <div className="powerup-icon">{powerUp.icon}</div>
              <div className="powerup-name">{powerUp.name}</div>
              <div className="powerup-effect">
                {powerUp.multiplier > 1 ? `${powerUp.multiplier}x clique` : 'Efeito especial'}
              </div>
              <div className="powerup-duration">{powerUp.duration}s</div>
              <div className="powerup-cost">🪙 {powerUp.cost}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Loja de upgrades */}
      <div className="upgrades-shop">
        <h3>🛒 Upgrades Permanentes</h3>
        <div className="upgrades-grid">
          <div 
            className={`upgrade-item ${coins < 100 ? 'disabled' : ''}`}
            onClick={() => buyUpgrade('clickPower', 100)}
          >
            <div className="upgrade-icon">💪</div>
            <div className="upgrade-name">Força do Clique</div>
            <div className="upgrade-level">Nível {clickPower}</div>
            <div className="upgrade-cost">🪙 100</div>
          </div>

          <div 
            className={`upgrade-item ${coins < 150 ? 'disabled' : ''}`}
            onClick={() => buyUpgrade('maxEnergy', 150)}
          >
            <div className="upgrade-icon">🔋</div>
            <div className="upgrade-name">Energia Máxima</div>
            <div className="upgrade-level">{maxEnergy}</div>
            <div className="upgrade-cost">🪙 150</div>
          </div>

          <div 
            className={`upgrade-item ${coins < 200 ? 'disabled' : ''}`}
            onClick={() => buyUpgrade('energyRegen', 200)}
          >
            <div className="upgrade-icon">⚡</div>
            <div className="upgrade-name">Regeneração</div>
            <div className="upgrade-level">{energyRegenRate}/s</div>
            <div className="upgrade-cost">🪙 200</div>
          </div>

          <div 
            className={`upgrade-item ${coins < 500 ? 'disabled' : ''}`}
            onClick={() => buyUpgrade('autoClicker', 500)}
          >
            <div className="upgrade-icon">🤖</div>
            <div className="upgrade-name">Auto Clicker</div>
            <div className="upgrade-level">{autoClickers}</div>
            <div className="upgrade-cost">🪙 500</div>
          </div>
        </div>
      </div>

      {/* Estilos CSS integrados */}
      <style jsx>{`
        .meow-clicker-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .game-header {
          margin-bottom: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-item {
          background: rgba(255, 255, 255, 0.05);
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-label {
          display: block;
          font-size: 0.9rem;
          color: #b0b0b0;
          margin-bottom: 5px;
        }

        .stat-value {
          display: block;
          font-size: 1.2rem;
          font-weight: bold;
          color: #ffffff;
        }

        .points-earned {
          color: #ffe118 !important;
        }

        .energy-bar {
          position: relative;
          background: rgba(255, 255, 255, 0.1);
          height: 20px;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 15px;
        }

        .energy-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #16a34a);
          transition: width 0.3s ease;
        }

        .energy-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.8rem;
          font-weight: bold;
          color: white;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
        }

        .wallet-warning {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 12px 20px;
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 15px;
        }

        .wallet-warning:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
        }

        .daily-limit {
          background: rgba(255, 255, 255, 0.05);
          padding: 12px 20px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .limit-bar {
          position: relative;
          background: rgba(255, 255, 255, 0.1);
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 8px;
        }

        .limit-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #ef4444);
          transition: width 0.3s ease;
        }

        .click-area {
          text-align: center;
          margin: 40px 0;
          position: relative;
        }

        .meow-button {
          background: linear-gradient(135deg, #9a45fc, #7c3aed);
          border: none;
          border-radius: 50%;
          width: 200px;
          height: 200px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(154, 69, 252, 0.3);
          position: relative;
          overflow: hidden;
        }

        .meow-button:hover:not(.disabled) {
          transform: scale(1.05);
          box-shadow: 0 12px 40px rgba(154, 69, 252, 0.4);
        }

        .meow-button:active:not(.disabled) {
          transform: scale(0.95);
        }

        .meow-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: linear-gradient(135deg, #6b7280, #4b5563);
        }

        .meow-cat {
          font-size: 4rem;
          margin-bottom: 10px;
        }

        .click-text {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          margin-bottom: 5px;
        }

        .click-power {
          font-size: 0.9rem;
          color: #ffe118;
          font-weight: 600;
        }

        .points-animation {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #ffe118;
          font-size: 2rem;
          font-weight: bold;
          pointer-events: none;
          animation: pointsFloat 2s ease-out forwards;
        }

        @keyframes pointsFloat {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -200%) scale(1.2);
          }
        }

        .active-powerups {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 30px;
          border: 1px solid rgba(255, 225, 24, 0.3);
        }

        .active-powerups h3 {
          color: #ffe118;
          margin-bottom: 15px;
        }

        .powerups-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .active-powerup {
          background: linear-gradient(135deg, #ffe118, #eab308);
          color: #0b0019;
          padding: 8px 15px;
          border-radius: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .timer {
          background: rgba(0, 0, 0, 0.2);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.8rem;
        }

        .powerups-shop, .upgrades-shop {
          background: rgba(255, 255, 255, 0.05);
          padding: 25px;
          border-radius: 15px;
          margin-bottom: 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .powerups-shop h3, .upgrades-shop h3 {
          color: #9a45fc;
          margin-bottom: 20px;
        }

        .powerups-grid, .upgrades-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .powerup-item, .upgrade-item {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .powerup-item:hover:not(.disabled), .upgrade-item:hover:not(.disabled) {
          transform: translateY(-3px);
          border-color: #9a45fc;
          box-shadow: 0 6px 20px rgba(154, 69, 252, 0.2);
        }

        .powerup-item.disabled, .upgrade-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .powerup-item.active {
          border-color: #ffe118;
          background: rgba(255, 225, 24, 0.1);
        }

        .powerup-icon, .upgrade-icon {
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .powerup-name, .upgrade-name {
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 5px;
        }

        .powerup-effect, .upgrade-level {
          color: #b0b0b0;
          font-size: 0.9rem;
          margin-bottom: 5px;
        }

        .powerup-duration {
          color: #2ad6d0;
          font-size: 0.8rem;
          margin-bottom: 10px;
        }

        .powerup-cost, .upgrade-cost {
          color: #ffe118;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .meow-button {
            width: 150px;
            height: 150px;
          }

          .meow-cat {
            font-size: 3rem;
          }

          .click-text {
            font-size: 1.2rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .powerups-grid, .upgrades-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MeowClicker;

