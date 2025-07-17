// ui-components.js - Componentes de interface para o sistema de pontos
class MeowUI {
  constructor() {
    this.pointsSystem = window.meowPoints;
    this.gameIntegration = window.gameIntegration;
    this.updateInterval = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startAutoUpdate();
    
    // Aguardar DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeComponents();
      });
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    this.createPointsDisplay();
    this.createRankingDisplay();
    this.createAchievementsDisplay();
    this.createGameStatsDisplay();
    this.createDailyLimitsDisplay();
  }

  // Display de pontos do usuário
  createPointsDisplay() {
    const container = document.getElementById('user-points-display');
    if (!container) return;

    const userStats = this.pointsSystem.getUserStats();
    if (!userStats || !userStats.walletAddress) {
      container.innerHTML = `
        <div class="points-card">
          <div class="connect-wallet-prompt">
            <div class="connect-icon">🔗</div>
            <h3>Conecte sua Carteira</h3>
            <p>Conecte sua carteira Solana para começar a ganhar Meow Points!</p>
            <button class="connect-wallet-btn" onclick="connectWallet()">
              Conectar Carteira
            </button>
          </div>
        </div>
      `;
      return;
    }

    const levelProgress = this.calculateLevelProgress(userStats);
    const nextLevelXP = (userStats.level * 1000) - userStats.xp;

    container.innerHTML = `
      <div class="points-card">
        <div class="points-header">
          <div class="user-info">
            <h3>Seus Meow Points</h3>
            <div class="wallet-address">${this.formatWallet(userStats.walletAddress)}</div>
          </div>
          <div class="rank-badge ${this.getRankClass(userStats.rank)}">
            ${this.getRankIcon(userStats.rank)} #${userStats.rank || '?'}
          </div>
        </div>
        
        <div class="points-stats">
          <div class="stat-item main-stat">
            <div class="stat-value">${userStats.totalPoints?.toLocaleString() || 0}</div>
            <div class="stat-label">Total de Pontos</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">${userStats.level || 1}</div>
            <div class="stat-label">Nível</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">${userStats.gamesPlayed || 0}</div>
            <div class="stat-label">Jogos</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">${userStats.achievements?.length || 0}</div>
            <div class="stat-label">Conquistas</div>
          </div>
        </div>

        <div class="level-progress">
          <div class="progress-header">
            <span class="progress-label">Progresso do Nível ${userStats.level}</span>
            <span class="progress-next">${nextLevelXP} XP para próximo nível</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${levelProgress}%"></div>
          </div>
          <div class="progress-text">${userStats.xp % 1000 || 0}/1000 XP</div>
        </div>

        <div class="user-actions">
          <button class="daily-reward-btn ${userStats.canClaimDaily ? 'available' : 'claimed'}" 
                  onclick="meowUI.claimDailyReward()" 
                  ${!userStats.canClaimDaily ? 'disabled' : ''}>
            ${userStats.canClaimDaily ? '🎁 Recompensa Diária' : '✅ Já Coletada Hoje'}
          </button>
          
          <div class="streak-info">
            <span class="streak-icon">🔥</span>
            <span class="streak-text">Sequência: ${userStats.dailyStreak || 0} dias</span>
          </div>
        </div>

        <div class="quick-stats">
          <div class="quick-stat">
            <span class="quick-label">Posição no Ranking:</span>
            <span class="quick-value">#${userStats.rank || '?'} de ${userStats.totalUsers || 0}</span>
          </div>
          <div class="quick-stat">
            <span class="quick-label">Última Atividade:</span>
            <span class="quick-value">${this.formatLastActivity(userStats.lastActivity)}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Display do ranking
  createRankingDisplay() {
    const container = document.getElementById('ranking-display');
    if (!container) return;

    const ranking = this.pointsSystem.getRanking(50);
    const userData = this.pointsSystem.getUserData();
    const totalPoints = ranking.reduce((sum, entry) => sum + entry.totalPoints, 0);

    container.innerHTML = `
      <div class="ranking-card">
        <div class="ranking-header">
          <h3>🏆 Ranking Global</h3>
          <div class="ranking-stats">
            <span class="stat-chip">${ranking.length} jogadores</span>
            <span class="stat-chip">${totalPoints.toLocaleString()} pontos totais</span>
          </div>
        </div>

        <div class="ranking-podium">
          ${this.createPodium(ranking.slice(0, 3))}
        </div>

        <div class="ranking-list">
          ${ranking.slice(3).map(entry => `
            <div class="ranking-entry ${entry.walletAddress === userData?.walletAddress ? 'current-user' : ''}">
              <div class="rank-position">
                <span class="rank-number">#${entry.rank}</span>
              </div>
              
              <div class="user-info">
                <div class="wallet-address">${this.formatWallet(entry.walletAddress)}</div>
                <div class="user-stats">
                  <span class="stat">Level ${entry.level}</span>
                  <span class="stat">${entry.gamesPlayed} jogos</span>
                  <span class="stat">${entry.achievements} conquistas</span>
                  ${entry.dailyStreak ? `<span class="stat">🔥${entry.dailyStreak}</span>` : ''}
                </div>
              </div>
              
              <div class="points-info">
                <div class="points-value">${entry.totalPoints.toLocaleString()}</div>
                <div class="points-percentage">${((entry.totalPoints / totalPoints) * 100).toFixed(1)}%</div>
                <div class="last-activity">${this.formatLastActivity(entry.lastActivity)}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="ranking-actions">
          <button class="action-btn" onclick="meowUI.exportRanking()">
            📊 Exportar CSV
          </button>
          <button class="action-btn" onclick="meowUI.refreshRanking()">
            🔄 Atualizar
          </button>
          <button class="action-btn" onclick="meowUI.createSnapshot()">
            📸 Criar Snapshot
          </button>
        </div>
      </div>
    `;
  }

  // Criar pódium para top 3
  createPodium(topThree) {
    if (topThree.length === 0) return '<div class="podium-empty">Nenhum jogador ainda</div>';

    const podiumOrder = [1, 0, 2]; // 2º, 1º, 3º para efeito visual
    const podiumHTML = podiumOrder.map(index => {
      const entry = topThree[index];
      if (!entry) return '<div class="podium-place empty"></div>';

      const height = index === 0 ? '100px' : index === 1 ? '120px' : '80px';
      const position = entry.rank;

      return `
        <div class="podium-place position-${position}" style="height: ${height}">
          <div class="podium-user">
            <div class="podium-rank">${this.getRankIcon(position)}</div>
            <div class="podium-wallet">${this.formatWallet(entry.walletAddress)}</div>
            <div class="podium-points">${entry.totalPoints.toLocaleString()}</div>
            <div class="podium-level">Nível ${entry.level}</div>
          </div>
          <div class="podium-base">
            <span class="podium-position">${position}º</span>
          </div>
        </div>
      `;
    }).join('');

    return `<div class="podium">${podiumHTML}</div>`;
  }

  // Display de conquistas
  createAchievementsDisplay() {
    const container = document.getElementById('achievements-display');
    if (!container) return;

    const userData = this.pointsSystem.getUserData();
    const userAchievements = userData?.achievements || [];

    const allAchievements = [
      { 
        id: 'first_points', 
        name: 'Primeiros Pontos', 
        description: 'Ganhe seu primeiro ponto', 
        icon: '🎯',
        rarity: 'common'
      },
      { 
        id: 'hundred_points', 
        name: '100 Pontos', 
        description: 'Acumule 100 pontos', 
        icon: '💯',
        rarity: 'common'
      },
      { 
        id: 'thousand_points', 
        name: '1000 Pontos', 
        description: 'Acumule 1000 pontos', 
        icon: '🔥',
        rarity: 'rare'
      },
      { 
        id: 'ten_games', 
        name: '10 Jogos', 
        description: 'Jogue 10 vezes', 
        icon: '🎮',
        rarity: 'common'
      },
      { 
        id: 'level_5', 
        name: 'Nível 5', 
        description: 'Alcance o nível 5', 
        icon: '⭐',
        rarity: 'rare'
      },
      { 
        id: 'level_10', 
        name: 'Nível 10', 
        description: 'Alcance o nível 10', 
        icon: '🌟',
        rarity: 'epic'
      },
      { 
        id: 'daily_streak_7', 
        name: 'Semana Completa', 
        description: 'Colete recompensas por 7 dias seguidos', 
        icon: '🔥',
        rarity: 'epic'
      }
    ];

    container.innerHTML = `
      <div class="achievements-card">
        <div class="achievements-header">
          <h3>🏆 Conquistas</h3>
          <div class="achievements-progress">
            <span class="progress-text">${userAchievements.length}/${allAchievements.length}</span>
            <div class="progress-bar small">
              <div class="progress-fill" style="width: ${(userAchievements.length / allAchievements.length) * 100}%"></div>
            </div>
          </div>
        </div>

        <div class="achievements-grid">
          ${allAchievements.map(achievement => {
            const isUnlocked = userAchievements.includes(achievement.id);
            return `
              <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'} rarity-${achievement.rarity}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                  <div class="achievement-name">${achievement.name}</div>
                  <div class="achievement-description">${achievement.description}</div>
                  <div class="achievement-rarity">${achievement.rarity}</div>
                </div>
                ${isUnlocked ? '<div class="achievement-check">✓</div>' : '<div class="achievement-lock">🔒</div>'}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Display de estatísticas de jogos
  createGameStatsDisplay() {
    const container = document.getElementById('game-stats-display');
    if (!container) return;

    const gameStats = this.gameIntegration.getGameStats();
    const dailyLimits = this.gameIntegration.getDailyLimitsRemaining();

    container.innerHTML = `
      <div class="game-stats-card">
        <div class="stats-header">
          <h3>📊 Estatísticas de Jogos</h3>
        </div>

        <div class="stats-grid">
          ${Object.entries(gameStats).map(([gameName, stats]) => `
            <div class="game-stat-item">
              <div class="game-name">${gameName}</div>
              <div class="game-stats">
                <div class="stat">
                  <span class="stat-label">Total:</span>
                  <span class="stat-value">${stats.totalPoints}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Sessões:</span>
                  <span class="stat-value">${stats.sessions}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Média:</span>
                  <span class="stat-value">${stats.averagePoints}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Display de limites diários
  createDailyLimitsDisplay() {
    const container = document.getElementById('daily-limits-display');
    if (!container) return;

    const dailyLimits = this.gameIntegration.getDailyLimitsRemaining();
    const cooldowns = this.gameIntegration.getActiveCooldowns();

    container.innerHTML = `
      <div class="daily-limits-card">
        <div class="limits-header">
          <h3>⏰ Limites Diários</h3>
          <div class="reset-info">Resetam à meia-noite</div>
        </div>

        <div class="limits-grid">
          ${Object.entries(dailyLimits).map(([gameName, limit]) => `
            <div class="limit-item">
              <div class="limit-header">
                <span class="game-name">${gameName}</span>
                <span class="limit-percentage">${limit.percentage.toFixed(0)}%</span>
              </div>
              <div class="limit-bar">
                <div class="limit-fill" style="width: ${limit.percentage}%"></div>
              </div>
              <div class="limit-text">
                ${limit.used}/${limit.limit} pontos (${limit.remaining} restantes)
              </div>
              ${cooldowns[gameName] ? `
                <div class="cooldown-info">
                  ⏳ Cooldown: ${cooldowns[gameName].minutes} min
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Calcular progresso do nível
  calculateLevelProgress(userData) {
    if (!userData) return 0;
    const currentLevelXP = userData.xp % 1000;
    return (currentLevelXP / 1000) * 100;
  }

  // Formatar endereço da carteira
  formatWallet(address) {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Formatar última atividade
  formatLastActivity(timestamp) {
    if (!timestamp) return 'Nunca';
    
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return 'Agora';
  }

  // Obter ícone do ranking
  getRankIcon(position) {
    if (!position) return '🏅';
    switch (position) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  }

  // Obter classe CSS do ranking
  getRankClass(position) {
    if (!position) return 'unranked';
    if (position <= 3) return 'top-three';
    if (position <= 10) return 'top-ten';
    if (position <= 50) return 'top-fifty';
    return 'ranked';
  }

  // Coletar recompensa diária
  claimDailyReward() {
    const result = this.pointsSystem.claimDailyReward();
    
    if (result.success) {
      this.showNotification(
        `🎁 Recompensa coletada! +${result.reward} pontos (Streak: ${result.streak} dias)`, 
        'success'
      );
      this.refreshUI();
    } else {
      this.showNotification(result.error, 'error');
    }
  }

  // Exportar ranking
  exportRanking() {
    this.pointsSystem.exportRankingCSV();
    this.showNotification('📊 Ranking exportado com sucesso!', 'success');
  }

  // Atualizar ranking
  refreshRanking() {
    this.pointsSystem.updateRanking();
    this.createRankingDisplay();
    this.showNotification('🔄 Ranking atualizado!', 'success');
  }

  // Criar snapshot TGE
  createSnapshot() {
    const snapshotName = prompt('Nome do snapshot (opcional):');
    const snapshot = this.pointsSystem.createTGESnapshot(snapshotName);
    
    this.showNotification(
      `📸 Snapshot "${snapshot.name}" criado com ${snapshot.totalUsers} usuários!`, 
      'success'
    );
  }

  // Atualizar toda a UI
  refreshUI() {
    this.initializeComponents();
  }

  // Mostrar notificação
  showNotification(message, type = 'info', duration = 3000) {
    // Remover notificações existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = {
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'info': 'ℹ️'
    }[type] || 'ℹ️';

    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover após duração especificada
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
  }

  // Mostrar modal de informações
  showInfoModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'info-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="this.closest('.info-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  // Event listeners
  setupEventListeners() {
    // Atualizar UI quando pontos mudarem
    window.addEventListener('meowPointsUpdated', () => {
      this.refreshUI();
    });

    window.addEventListener('meowPointsConnected', () => {
      this.refreshUI();
    });

    window.addEventListener('meowRankingUpdated', () => {
      this.createRankingDisplay();
    });

    // Atualizar UI quando storage mudar (múltiplas abas)
    window.addEventListener('storage', (e) => {
      if (e.key === 'meow_points_data' || e.key === 'meow_ranking_data') {
        this.refreshUI();
      }
    });

    // Detectar mudança de foco da aba
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.refreshUI();
      }
    });
  }

  // Iniciar atualização automática
  startAutoUpdate() {
    // Atualizar UI a cada 30 segundos
    this.updateInterval = setInterval(() => {
      this.refreshUI();
    }, 30000);
  }

  // Parar atualização automática
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Destruir instância
  destroy() {
    this.stopAutoUpdate();
    
    // Remover event listeners
    window.removeEventListener('meowPointsUpdated', this.refreshUI);
    window.removeEventListener('meowPointsConnected', this.refreshUI);
    window.removeEventListener('meowRankingUpdated', this.createRankingDisplay);
  }

  // Métodos utilitários para integração
  
  // Conectar carteira (deve ser implementado no projeto principal)
  connectWallet() {
    this.showNotification('Implemente a função connectWallet() no seu projeto', 'warning');
  }

  // Obter dados para dashboard administrativo
  getAdminData() {
    const ranking = this.pointsSystem.getRanking();
    const gameStats = this.gameIntegration.getGameStats();
    const snapshots = this.pointsSystem.getTGESnapshots();

    return {
      totalUsers: ranking.length,
      totalPoints: ranking.reduce((sum, entry) => sum + entry.totalPoints, 0),
      topGames: Object.entries(gameStats)
        .sort(([,a], [,b]) => b.totalPoints - a.totalPoints)
        .slice(0, 5),
      recentSnapshots: snapshots.slice(-5),
      activeUsers24h: ranking.filter(entry => {
        const lastActivity = new Date(entry.lastActivity);
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return lastActivity > yesterday;
      }).length
    };
  }
}

// Instância global
window.meowUI = new MeowUI();

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MeowUI;
}

