// pointsSystem.js - Sistema principal de pontos Meow Token
class MeowPointsSystem {
  constructor() {
    this.storageKey = 'meow_points_data';
    this.rankingKey = 'meow_ranking_data';
    this.init();
  }

  // Inicializar sistema
  init() {
    if (!localStorage.getItem(this.storageKey)) {
      this.resetUserData();
    }
    this.updateRanking();
  }

  // Resetar dados do usuário
  resetUserData() {
    const userData = {
      walletAddress: null,
      totalPoints: 0,
      level: 1,
      xp: 0,
      gamesPlayed: 0,
      lastActivity: new Date().toISOString(),
      gameHistory: [],
      achievements: [],
      dailyStreak: 0,
      lastDailyReward: null
    };
    localStorage.setItem(this.storageKey, JSON.stringify(userData));
  }

  // Conectar carteira
  connectWallet(walletAddress) {
    const userData = this.getUserData();
    userData.walletAddress = walletAddress;
    userData.lastActivity = new Date().toISOString();
    this.saveUserData(userData);
    this.updateRanking();
    
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('meowPointsConnected', { 
      detail: { walletAddress, userData } 
    }));
  }

  // Obter dados do usuário
  getUserData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  // Salvar dados do usuário
  saveUserData(userData) {
    localStorage.setItem(this.storageKey, JSON.stringify(userData));
    
    // Disparar evento de atualização
    window.dispatchEvent(new CustomEvent('meowPointsUpdated', { 
      detail: userData 
    }));
  }

  // Adicionar pontos
  addPoints(gameName, pointsEarned, sessionData = {}) {
    const userData = this.getUserData();
    if (!userData || !userData.walletAddress) {
      return { success: false, error: 'Carteira não conectada' };
    }

    // Validar pontos (máximo 1000 por sessão)
    if (pointsEarned > 1000) {
      pointsEarned = 1000;
    }

    // Calcular novos valores
    const newTotalPoints = userData.totalPoints + pointsEarned;
    const newXp = userData.xp + pointsEarned;
    const oldLevel = userData.level;
    const newLevel = Math.floor(newXp / 1000) + 1;
    const newGamesPlayed = userData.gamesPlayed + 1;

    // Atualizar dados
    userData.totalPoints = newTotalPoints;
    userData.xp = newXp;
    userData.level = newLevel;
    userData.gamesPlayed = newGamesPlayed;
    userData.lastActivity = new Date().toISOString();

    // Adicionar ao histórico
    userData.gameHistory.push({
      gameName,
      pointsEarned,
      sessionData,
      timestamp: new Date().toISOString()
    });

    // Verificar conquistas
    this.checkAchievements(userData);

    // Salvar dados
    this.saveUserData(userData);
    this.updateRanking();

    const levelUp = newLevel > oldLevel;

    // Mostrar notificação de level up
    if (levelUp) {
      this.showLevelUpNotification(newLevel);
    }

    return {
      success: true,
      newTotalPoints,
      pointsEarned,
      newLevel,
      levelUp
    };
  }

  // Verificar conquistas
  checkAchievements(userData) {
    const achievements = [
      { 
        id: 'first_points', 
        name: 'Primeiros Pontos', 
        description: 'Ganhe seu primeiro ponto',
        condition: () => userData.totalPoints >= 1,
        points: 10
      },
      { 
        id: 'hundred_points', 
        name: '100 Pontos', 
        description: 'Acumule 100 pontos',
        condition: () => userData.totalPoints >= 100,
        points: 50
      },
      { 
        id: 'thousand_points', 
        name: '1000 Pontos', 
        description: 'Acumule 1000 pontos',
        condition: () => userData.totalPoints >= 1000,
        points: 100
      },
      { 
        id: 'ten_games', 
        name: '10 Jogos', 
        description: 'Jogue 10 vezes',
        condition: () => userData.gamesPlayed >= 10,
        points: 75
      },
      { 
        id: 'level_5', 
        name: 'Nível 5', 
        description: 'Alcance o nível 5',
        condition: () => userData.level >= 5,
        points: 150
      },
      { 
        id: 'level_10', 
        name: 'Nível 10', 
        description: 'Alcance o nível 10',
        condition: () => userData.level >= 10,
        points: 300
      },
      { 
        id: 'daily_streak_7', 
        name: 'Semana Completa', 
        description: 'Colete recompensas por 7 dias seguidos',
        condition: () => userData.dailyStreak >= 7,
        points: 200
      }
    ];

    achievements.forEach(achievement => {
      if (achievement.condition() && !userData.achievements.includes(achievement.id)) {
        userData.achievements.push(achievement.id);
        this.showAchievementNotification(achievement.name, achievement.description);
        
        // Adicionar pontos bônus da conquista
        userData.totalPoints += achievement.points;
        userData.xp += achievement.points;
        userData.level = Math.floor(userData.xp / 1000) + 1;
      }
    });
  }

  // Mostrar notificação de conquista
  showAchievementNotification(achievementName, description) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">🏆</div>
        <div class="achievement-text">
          <div class="achievement-title">Conquista Desbloqueada!</div>
          <div class="achievement-name">${achievementName}</div>
          <div class="achievement-desc">${description}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Adicionar som (se disponível)
    this.playAchievementSound();
    
    // Remover após 4 segundos
    setTimeout(() => {
      notification.remove();
    }, 4000);
  }

  // Mostrar notificação de level up
  showLevelUpNotification(newLevel) {
    const notification = document.createElement('div');
    notification.className = 'levelup-notification';
    notification.innerHTML = `
      <div class="levelup-content">
        <div class="levelup-icon">⭐</div>
        <div class="levelup-text">
          <div class="levelup-title">Level Up!</div>
          <div class="levelup-level">Nível ${newLevel}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Adicionar som (se disponível)
    this.playLevelUpSound();
    
    // Remover após 3 segundos
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Tocar som de conquista
  playAchievementSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignorar erros de autoplay
    } catch (e) {
      // Ignorar erros de áudio
    }
  }

  // Tocar som de level up
  playLevelUpSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.5;
      audio.play().catch(() => {}); // Ignorar erros de autoplay
    } catch (e) {
      // Ignorar erros de áudio
    }
  }

  // Atualizar ranking global
  updateRanking() {
    const userData = this.getUserData();
    if (!userData || !userData.walletAddress) return;

    // Obter ranking atual
    let ranking = JSON.parse(localStorage.getItem(this.rankingKey) || '[]');
    
    // Remover entrada anterior do usuário
    ranking = ranking.filter(entry => entry.walletAddress !== userData.walletAddress);
    
    // Adicionar entrada atual
    ranking.push({
      walletAddress: userData.walletAddress,
      totalPoints: userData.totalPoints,
      level: userData.level,
      gamesPlayed: userData.gamesPlayed,
      lastActivity: userData.lastActivity,
      achievements: userData.achievements.length,
      dailyStreak: userData.dailyStreak
    });

    // Ordenar por pontos (decrescente)
    ranking.sort((a, b) => b.totalPoints - a.totalPoints);

    // Adicionar posições
    ranking.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Salvar ranking
    localStorage.setItem(this.rankingKey, JSON.stringify(ranking));
    
    // Disparar evento de ranking atualizado
    window.dispatchEvent(new CustomEvent('meowRankingUpdated', { 
      detail: ranking 
    }));
  }

  // Obter ranking global
  getRanking(limit = 100) {
    const ranking = JSON.parse(localStorage.getItem(this.rankingKey) || '[]');
    return ranking.slice(0, limit);
  }

  // Obter posição do usuário
  getUserRank() {
    const userData = this.getUserData();
    if (!userData || !userData.walletAddress) return null;

    const ranking = this.getRanking();
    const userEntry = ranking.find(entry => entry.walletAddress === userData.walletAddress);
    return userEntry ? userEntry.rank : null;
  }

  // Recompensa diária
  claimDailyReward() {
    const userData = this.getUserData();
    if (!userData || !userData.walletAddress) {
      return { success: false, error: 'Carteira não conectada' };
    }

    const today = new Date().toDateString();
    const lastClaim = userData.lastDailyReward;

    if (lastClaim === today) {
      return { success: false, error: 'Recompensa já coletada hoje' };
    }

    // Calcular streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = lastClaim === yesterday.toDateString();
    
    userData.dailyStreak = wasYesterday ? userData.dailyStreak + 1 : 1;
    userData.lastDailyReward = today;

    // Calcular recompensa (base + bônus streak)
    const baseReward = 50;
    const streakBonus = Math.min(userData.dailyStreak * 5, 100);
    const totalReward = baseReward + streakBonus;

    // Adicionar pontos
    userData.totalPoints += totalReward;
    userData.xp += totalReward;
    userData.level = Math.floor(userData.xp / 1000) + 1;
    userData.lastActivity = new Date().toISOString();

    // Adicionar ao histórico
    userData.gameHistory.push({
      gameName: 'daily_reward',
      pointsEarned: totalReward,
      sessionData: {
        streak: userData.dailyStreak,
        baseReward,
        streakBonus
      },
      timestamp: new Date().toISOString()
    });

    // Verificar conquistas
    this.checkAchievements(userData);

    // Salvar dados
    this.saveUserData(userData);
    this.updateRanking();

    return {
      success: true,
      reward: totalReward,
      streak: userData.dailyStreak,
      baseReward,
      streakBonus
    };
  }

  // Verificar se pode coletar recompensa diária
  canClaimDailyReward() {
    const userData = this.getUserData();
    if (!userData || !userData.walletAddress) return false;

    const today = new Date().toDateString();
    return userData.lastDailyReward !== today;
  }

  // Obter estatísticas do usuário
  getUserStats() {
    const userData = this.getUserData();
    const userRank = this.getUserRank();
    const ranking = this.getRanking();
    
    return {
      ...userData,
      rank: userRank,
      totalUsers: ranking.length,
      canClaimDaily: this.canClaimDailyReward()
    };
  }

  // Exportar dados para CSV (para TGE)
  exportRankingCSV() {
    const ranking = this.getRanking();
    const totalPoints = ranking.reduce((sum, entry) => sum + entry.totalPoints, 0);

    const csvData = [
      'Posição,Wallet,Pontos,Nível,Jogos,% do Total,Última Atividade,Conquistas,Streak',
      ...ranking.map(entry => {
        const percentage = totalPoints > 0 ? ((entry.totalPoints / totalPoints) * 100).toFixed(2) : 0;
        return [
          entry.rank,
          entry.walletAddress,
          entry.totalPoints,
          entry.level,
          entry.gamesPlayed,
          percentage + '%',
          new Date(entry.lastActivity).toLocaleDateString('pt-BR'),
          entry.achievements,
          entry.dailyStreak || 0
        ].join(',');
      })
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `meow_ranking_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  // Criar snapshot para TGE
  createTGESnapshot(snapshotName) {
    const ranking = this.getRanking();
    const userData = this.getUserData();
    
    const snapshot = {
      name: snapshotName || `TGE_${new Date().toISOString().split('T')[0]}`,
      timestamp: new Date().toISOString(),
      totalUsers: ranking.length,
      totalPoints: ranking.reduce((sum, entry) => sum + entry.totalPoints, 0),
      ranking: ranking,
      metadata: {
        createdBy: userData?.walletAddress || 'admin',
        version: '1.0'
      }
    };

    // Salvar snapshot
    const snapshots = JSON.parse(localStorage.getItem('meow_tge_snapshots') || '[]');
    snapshots.push(snapshot);
    localStorage.setItem('meow_tge_snapshots', JSON.stringify(snapshots));

    return snapshot;
  }

  // Obter snapshots TGE
  getTGESnapshots() {
    return JSON.parse(localStorage.getItem('meow_tge_snapshots') || '[]');
  }

  // Limpar todos os dados (apenas para desenvolvimento)
  clearAllData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.rankingKey);
    localStorage.removeItem('meow_tge_snapshots');
    this.init();
  }

  // Obter histórico de jogos
  getGameHistory(limit = 50) {
    const userData = this.getUserData();
    if (!userData) return [];
    
    return userData.gameHistory
      .slice(-limit)
      .reverse(); // Mais recentes primeiro
  }

  // Obter estatísticas por jogo
  getGameStats() {
    const userData = this.getUserData();
    if (!userData) return {};

    const stats = {};
    userData.gameHistory.forEach(session => {
      if (!stats[session.gameName]) {
        stats[session.gameName] = {
          totalPoints: 0,
          sessions: 0,
          averagePoints: 0
        };
      }
      
      stats[session.gameName].totalPoints += session.pointsEarned;
      stats[session.gameName].sessions += 1;
      stats[session.gameName].averagePoints = Math.round(
        stats[session.gameName].totalPoints / stats[session.gameName].sessions
      );
    });

    return stats;
  }
}

// Instância global
window.meowPoints = new MeowPointsSystem();

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MeowPointsSystem;
}

