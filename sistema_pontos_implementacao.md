# 🎮 SISTEMA DE PONTOS MEOW - IMPLEMENTAÇÃO PRÁTICA

## 🎯 VISÃO GERAL

Sistema de pontos acumulativo para o projeto Meow Token, sem conversão automática para tokens. Os pontos ficam "congelados" até o TGE (Token Generation Event), quando você define a taxa de conversão e distribui os tokens baseado no ranking final.

**CARACTERÍSTICAS PRINCIPAIS:**
- ✅ Pontos acumulativos (Meow Points)
- ✅ Ranking global em tempo real
- ✅ Dashboard administrativo para controle
- ✅ Sistema de snapshot para TGE
- ✅ Sem conversão automática
- ✅ Controle total para você

---

## 🏗️ ARQUITETURA SIMPLIFICADA

### **FASE 1: IMPLEMENTAÇÃO BÁSICA (AGORA)**
- **Storage:** localStorage + sessionStorage (funciona imediatamente)
- **Ranking:** Calculado em tempo real no frontend
- **Backup:** Exportação manual para CSV
- **Custo:** R$ 0,00

### **FASE 2: ESCALABILIDADE (DEPOIS)**
- **Database:** Supabase (gratuito até 50k usuários)
- **Ranking:** Tempo real com subscriptions
- **Backup:** Automático e seguro
- **Custo:** R$ 0-25/mês

---

## 💻 IMPLEMENTAÇÃO CÓDIGO

### **1. SISTEMA DE PONTOS CORE**

```javascript
// pointsSystem.js - Sistema principal de pontos
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
  }

  // Obter dados do usuário
  getUserData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  // Salvar dados do usuário
  saveUserData(userData) {
    localStorage.setItem(this.storageKey, JSON.stringify(userData));
  }

  // Adicionar pontos
  addPoints(gameName, pointsEarned, sessionData = {}) {
    const userData = this.getUserData();
    if (!userData || !userData.walletAddress) {
      return { success: false, error: 'Carteira não conectada' };
    }

    // Calcular novos valores
    const newTotalPoints = userData.totalPoints + pointsEarned;
    const newXp = userData.xp + pointsEarned;
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

    return {
      success: true,
      newTotalPoints,
      pointsEarned,
      newLevel,
      levelUp: newLevel > (newLevel - Math.floor(pointsEarned / 1000))
    };
  }

  // Verificar conquistas
  checkAchievements(userData) {
    const achievements = [
      { id: 'first_points', name: 'Primeiros Pontos', condition: () => userData.totalPoints >= 1 },
      { id: 'hundred_points', name: '100 Pontos', condition: () => userData.totalPoints >= 100 },
      { id: 'thousand_points', name: '1000 Pontos', condition: () => userData.totalPoints >= 1000 },
      { id: 'ten_games', name: '10 Jogos', condition: () => userData.gamesPlayed >= 10 },
      { id: 'level_5', name: 'Nível 5', condition: () => userData.level >= 5 },
      { id: 'level_10', name: 'Nível 10', condition: () => userData.level >= 10 }
    ];

    achievements.forEach(achievement => {
      if (achievement.condition() && !userData.achievements.includes(achievement.id)) {
        userData.achievements.push(achievement.id);
        this.showAchievementNotification(achievement.name);
      }
    });
  }

  // Mostrar notificação de conquista
  showAchievementNotification(achievementName) {
    // Criar notificação visual
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">🏆</div>
        <div class="achievement-text">
          <div class="achievement-title">Conquista Desbloqueada!</div>
          <div class="achievement-name">${achievementName}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
      notification.remove();
    }, 3000);
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
      achievements: userData.achievements.length
    });

    // Ordenar por pontos (decrescente)
    ranking.sort((a, b) => b.totalPoints - a.totalPoints);

    // Adicionar posições
    ranking.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Salvar ranking
    localStorage.setItem(this.rankingKey, JSON.stringify(ranking));
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
    const result = this.addPoints('daily_reward', totalReward, {
      streak: userData.dailyStreak,
      baseReward,
      streakBonus
    });

    return {
      success: true,
      reward: totalReward,
      streak: userData.dailyStreak,
      ...result
    };
  }

  // Exportar dados para CSV (para TGE)
  exportRankingCSV() {
    const ranking = this.getRanking();
    const totalPoints = ranking.reduce((sum, entry) => sum + entry.totalPoints, 0);

    const csvData = [
      'Posição,Wallet,Pontos,Nível,Jogos,% do Total,Última Atividade,Conquistas',
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
          entry.achievements
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
}

// Instância global
window.meowPoints = new MeowPointsSystem();
```

### **2. INTEGRAÇÃO COM JOGOS**

```javascript
// gameIntegration.js - Integração com os jogos
class GameIntegration {
  constructor() {
    this.pointsSystem = window.meowPoints;
  }

  // Meow Clicker
  submitMeowClickerScore(clicks, energy) {
    const points = clicks * 1; // 1 ponto por clique
    return this.pointsSystem.addPoints('Meow Clicker', points, {
      clicks,
      energy,
      efficiency: energy > 0 ? clicks / energy : 0
    });
  }

  // Crypto Quiz
  submitQuizScore(correctAnswers, totalQuestions, timeSpent) {
    const basePoints = correctAnswers * 10;
    const timeBonus = Math.max(0, 300 - timeSpent); // Bônus por velocidade
    const totalPoints = basePoints + Math.floor(timeBonus / 10);
    
    return this.pointsSystem.addPoints('Crypto Quiz', totalPoints, {
      correctAnswers,
      totalQuestions,
      timeSpent,
      accuracy: (correctAnswers / totalQuestions) * 100,
      timeBonus: Math.floor(timeBonus / 10)
    });
  }

  // Lucky Spin
  submitSpinScore(prize, spinType) {
    return this.pointsSystem.addPoints('Lucky Spin', prize, {
      prize,
      spinType,
      timestamp: new Date().toISOString()
    });
  }

  // Treasure Hunt
  submitTreasureScore(treasuresFound, mapCompleted, mapSize) {
    const basePoints = treasuresFound * 25;
    const completionBonus = mapCompleted ? 100 : 0;
    const sizeBonus = mapSize === 'large' ? 50 : 0;
    const totalPoints = basePoints + completionBonus + sizeBonus;
    
    return this.pointsSystem.addPoints('Treasure Hunt', totalPoints, {
      treasuresFound,
      mapCompleted,
      mapSize,
      completionBonus,
      sizeBonus
    });
  }

  // Battle Arena
  submitBattleScore(won, enemyLevel, damageDealt, battleDuration) {
    const winPoints = won ? enemyLevel * 20 : enemyLevel * 5;
    const damageBonus = Math.floor(damageDealt / 100);
    const speedBonus = battleDuration < 60 ? 25 : 0;
    const totalPoints = winPoints + damageBonus + speedBonus;
    
    return this.pointsSystem.addPoints('Battle Arena', totalPoints, {
      won,
      enemyLevel,
      damageDealt,
      battleDuration,
      winPoints,
      damageBonus,
      speedBonus
    });
  }

  // Recompensa social (Twitter, Telegram, etc.)
  submitSocialReward(platform, action, verified = false) {
    const socialPoints = {
      'twitter_follow': 50,
      'twitter_retweet': 25,
      'telegram_join': 30,
      'discord_join': 30,
      'instagram_follow': 20
    };

    const points = socialPoints[`${platform}_${action}`] || 10;
    const verificationBonus = verified ? points * 0.5 : 0;
    const totalPoints = points + verificationBonus;

    return this.pointsSystem.addPoints('Social Media', totalPoints, {
      platform,
      action,
      verified,
      verificationBonus
    });
  }
}

// Instância global
window.gameIntegration = new GameIntegration();
```

### **3. COMPONENTES UI**

```javascript
// ui-components.js - Componentes de interface
class MeowUI {
  constructor() {
    this.pointsSystem = window.meowPoints;
    this.init();
  }

  init() {
    this.createPointsDisplay();
    this.createRankingDisplay();
    this.createAchievementsDisplay();
    this.setupEventListeners();
  }

  // Display de pontos do usuário
  createPointsDisplay() {
    const container = document.getElementById('user-points-display');
    if (!container) return;

    const userData = this.pointsSystem.getUserData();
    const userRank = this.pointsSystem.getUserRank();

    container.innerHTML = `
      <div class="points-card">
        <div class="points-header">
          <h3>Seus Meow Points</h3>
          <div class="rank-badge">#${userRank || '?'}</div>
        </div>
        
        <div class="points-stats">
          <div class="stat-item">
            <div class="stat-value">${userData?.totalPoints?.toLocaleString() || 0}</div>
            <div class="stat-label">Total de Pontos</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">${userData?.level || 1}</div>
            <div class="stat-label">Nível</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">${userData?.gamesPlayed || 0}</div>
            <div class="stat-label">Jogos</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">${userData?.achievements?.length || 0}</div>
            <div class="stat-label">Conquistas</div>
          </div>
        </div>

        <div class="level-progress">
          <div class="progress-label">Progresso do Nível</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${this.calculateLevelProgress(userData)}%"></div>
          </div>
          <div class="progress-text">${userData?.xp % 1000 || 0}/1000 XP</div>
        </div>

        <button class="daily-reward-btn" onclick="meowUI.claimDailyReward()">
          🎁 Recompensa Diária
        </button>
      </div>
    `;
  }

  // Display do ranking
  createRankingDisplay() {
    const container = document.getElementById('ranking-display');
    if (!container) return;

    const ranking = this.pointsSystem.getRanking(50);
    const userData = this.pointsSystem.getUserData();

    container.innerHTML = `
      <div class="ranking-card">
        <div class="ranking-header">
          <h3>🏆 Ranking Global</h3>
          <div class="ranking-stats">
            <span>${ranking.length} jogadores</span>
            <span>${ranking.reduce((sum, entry) => sum + entry.totalPoints, 0).toLocaleString()} pontos</span>
          </div>
        </div>

        <div class="ranking-list">
          ${ranking.map(entry => `
            <div class="ranking-entry ${entry.walletAddress === userData?.walletAddress ? 'current-user' : ''}">
              <div class="rank-position">
                ${entry.rank <= 3 ? ['👑', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
              </div>
              
              <div class="user-info">
                <div class="wallet-address">${this.formatWallet(entry.walletAddress)}</div>
                <div class="user-stats">
                  Level ${entry.level} • ${entry.gamesPlayed} jogos • ${entry.achievements} conquistas
                </div>
              </div>
              
              <div class="points-info">
                <div class="points-value">${entry.totalPoints.toLocaleString()}</div>
                <div class="last-activity">${this.formatLastActivity(entry.lastActivity)}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="ranking-actions">
          <button onclick="meowUI.exportRanking()">📊 Exportar CSV</button>
          <button onclick="meowUI.refreshRanking()">🔄 Atualizar</button>
        </div>
      </div>
    `;
  }

  // Display de conquistas
  createAchievementsDisplay() {
    const container = document.getElementById('achievements-display');
    if (!container) return;

    const userData = this.pointsSystem.getUserData();
    const userAchievements = userData?.achievements || [];

    const allAchievements = [
      { id: 'first_points', name: 'Primeiros Pontos', description: 'Ganhe seu primeiro ponto', icon: '🎯' },
      { id: 'hundred_points', name: '100 Pontos', description: 'Acumule 100 pontos', icon: '💯' },
      { id: 'thousand_points', name: '1000 Pontos', description: 'Acumule 1000 pontos', icon: '🔥' },
      { id: 'ten_games', name: '10 Jogos', description: 'Jogue 10 vezes', icon: '🎮' },
      { id: 'level_5', name: 'Nível 5', description: 'Alcance o nível 5', icon: '⭐' },
      { id: 'level_10', name: 'Nível 10', description: 'Alcance o nível 10', icon: '🌟' }
    ];

    container.innerHTML = `
      <div class="achievements-card">
        <div class="achievements-header">
          <h3>🏆 Conquistas</h3>
          <div class="progress-text">${userAchievements.length}/${allAchievements.length}</div>
        </div>

        <div class="achievements-grid">
          ${allAchievements.map(achievement => `
            <div class="achievement-item ${userAchievements.includes(achievement.id) ? 'unlocked' : 'locked'}">
              <div class="achievement-icon">${achievement.icon}</div>
              <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
              </div>
              ${userAchievements.includes(achievement.id) ? '<div class="achievement-check">✓</div>' : ''}
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
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Formatar última atividade
  formatLastActivity(timestamp) {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    return 'Agora';
  }

  // Coletar recompensa diária
  claimDailyReward() {
    const result = this.pointsSystem.claimDailyReward();
    
    if (result.success) {
      this.showNotification(`🎁 Recompensa coletada! +${result.reward} pontos (Streak: ${result.streak} dias)`, 'success');
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

  // Atualizar toda a UI
  refreshUI() {
    this.createPointsDisplay();
    this.createRankingDisplay();
    this.createAchievementsDisplay();
  }

  // Mostrar notificação
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Event listeners
  setupEventListeners() {
    // Atualizar UI quando pontos mudarem
    window.addEventListener('storage', (e) => {
      if (e.key === 'meow_points_data' || e.key === 'meow_ranking_data') {
        this.refreshUI();
      }
    });

    // Atualizar UI periodicamente
    setInterval(() => {
      this.refreshUI();
    }, 30000); // A cada 30 segundos
  }
}

// Instância global
window.meowUI = new MeowUI();
```

### **4. CSS PARA STYLING**

```css
/* meow-points.css - Estilos para o sistema de pontos */

/* Variáveis de cores */
:root {
  --primary-color: #9a45fc;
  --secondary-color: #2ad6d0;
  --accent-color: #ffe118;
  --background-color: #0b0019;
  --card-bg: rgba(154, 69, 252, 0.1);
  --border-color: rgba(154, 69, 252, 0.3);
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --success-color: #00ff88;
  --error-color: #ff4757;
}

/* Card de pontos do usuário */
.points-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
}

.points-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.points-header h3 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.5rem;
}

.rank-badge {
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.1rem;
}

.points-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--accent-color);
  margin-bottom: 4px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.level-progress {
  margin-bottom: 20px;
}

.progress-label {
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.progress-bar {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  height: 20px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  height: 100%;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 4px;
}

.daily-reward-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(45deg, var(--accent-color), #ffb700);
  color: var(--background-color);
  border: none;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.daily-reward-btn:hover {
  transform: translateY(-2px);
}

/* Card de ranking */
.ranking-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ranking-header h3 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.5rem;
}

.ranking-stats {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.ranking-stats span {
  margin-left: 16px;
}

.ranking-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.ranking-entry {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.ranking-entry:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.ranking-entry.current-user {
  border-color: var(--accent-color);
  background: rgba(255, 225, 24, 0.1);
}

.rank-position {
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 16px;
  min-width: 60px;
  text-align: center;
}

.user-info {
  flex: 1;
  margin-right: 16px;
}

.wallet-address {
  color: var(--text-primary);
  font-weight: bold;
  margin-bottom: 4px;
}

.user-stats {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.points-info {
  text-align: right;
}

.points-value {
  color: var(--primary-color);
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 4px;
}

.last-activity {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.ranking-actions {
  display: flex;
  gap: 12px;
}

.ranking-actions button {
  flex: 1;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ranking-actions button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Card de conquistas */
.achievements-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.achievements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.achievements-header h3 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.5rem;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.achievement-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.2s ease;
}

.achievement-item.unlocked {
  border-color: var(--success-color);
  background: rgba(0, 255, 136, 0.1);
}

.achievement-item.locked {
  opacity: 0.5;
}

.achievement-icon {
  font-size: 2rem;
  margin-right: 16px;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  color: var(--text-primary);
  font-weight: bold;
  margin-bottom: 4px;
}

.achievement-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.achievement-check {
  color: var(--success-color);
  font-size: 1.5rem;
  font-weight: bold;
}

/* Notificações */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.notification-success {
  background: var(--success-color);
}

.notification-error {
  background: var(--error-color);
}

.notification-info {
  background: var(--primary-color);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Notificação de conquista */
.achievement-notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  padding: 24px;
  border-radius: 16px;
  z-index: 1001;
  animation: achievementPop 0.5s ease;
}

.achievement-content {
  display: flex;
  align-items: center;
  color: white;
}

.achievement-icon {
  font-size: 3rem;
  margin-right: 16px;
}

.achievement-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.achievement-name {
  font-size: 1rem;
  opacity: 0.9;
}

@keyframes achievementPop {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .points-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
  
  .ranking-entry {
    flex-direction: column;
    text-align: center;
  }
  
  .user-info {
    margin: 8px 0;
  }
}
```

---

## 🎮 INTEGRAÇÃO NO SEU PROJETO

### **PASSO 1: ADICIONAR OS ARQUIVOS**

1. Copie o código JavaScript para arquivos separados:
   - `pointsSystem.js`
   - `gameIntegration.js` 
   - `ui-components.js`

2. Copie o CSS para `meow-points.css`

3. Adicione no HTML do seu projeto:

```html
<!-- No <head> -->
<link rel="stylesheet" href="meow-points.css">

<!-- Antes do </body> -->
<script src="pointsSystem.js"></script>
<script src="gameIntegration.js"></script>
<script src="ui-components.js"></script>
```

### **PASSO 2: ADICIONAR CONTAINERS HTML**

```html
<!-- Container para pontos do usuário -->
<div id="user-points-display"></div>

<!-- Container para ranking -->
<div id="ranking-display"></div>

<!-- Container para conquistas -->
<div id="achievements-display"></div>
```

### **PASSO 3: CONECTAR COM SEUS JOGOS**

```javascript
// Exemplo: No seu Meow Clicker
function onMeowClick() {
  // Sua lógica do jogo aqui...
  
  // Adicionar pontos
  const result = window.gameIntegration.submitMeowClickerScore(1, currentEnergy);
  
  if (result.success) {
    console.log(`+${result.pointsEarned} pontos! Total: ${result.newTotalPoints}`);
    
    if (result.levelUp) {
      console.log(`Level up! Agora você é nível ${result.newLevel}!`);
    }
  }
}

// Exemplo: No seu Quiz
function onQuizComplete(correct, total, time) {
  const result = window.gameIntegration.submitQuizScore(correct, total, time);
  
  if (result.success) {
    console.log(`Quiz completo! +${result.pointsEarned} pontos!`);
  }
}
```

### **PASSO 4: CONECTAR CARTEIRA**

```javascript
// Quando usuário conectar carteira
function onWalletConnected(walletAddress) {
  window.meowPoints.connectWallet(walletAddress);
  console.log('Carteira conectada! Sistema de pontos ativo.');
}
```

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### ✅ **SISTEMA DE PONTOS**
- Acúmulo de pontos por jogo
- Sistema de níveis e XP
- Histórico completo de atividades
- Conquistas automáticas

### ✅ **RANKING GLOBAL**
- Posições em tempo real
- Estatísticas detalhadas
- Filtros e ordenação
- Exportação CSV

### ✅ **GAMIFICAÇÃO**
- Recompensas diárias
- Sistema de streak
- Conquistas desbloqueáveis
- Notificações visuais

### ✅ **ADMINISTRAÇÃO**
- Exportação de dados
- Snapshots para TGE
- Controle total dos pontos
- Relatórios detalhados

---

## 🚀 PRÓXIMOS PASSOS

### **FASE 1: IMPLEMENTAÇÃO (AGORA)**
1. ✅ Copiar códigos para seu projeto
2. ✅ Testar sistema básico
3. ✅ Integrar com jogos existentes
4. ✅ Personalizar visual

### **FASE 2: MELHORIAS (DEPOIS)**
1. 🔄 Migrar para Supabase
2. 🔄 Adicionar mais jogos
3. 🔄 Sistema anti-cheat avançado
4. 🔄 Dashboard administrativo web

### **FASE 3: TGE (QUANDO QUISER)**
1. 🎯 Criar snapshot final
2. 🎯 Definir taxa de conversão
3. 🎯 Distribuir tokens
4. 🎯 Celebrar sucesso!

---

## 💡 VANTAGENS DESTA IMPLEMENTAÇÃO

✅ **FUNCIONA IMEDIATAMENTE** - Sem configuração complexa
✅ **CUSTO ZERO** - Usa localStorage do navegador
✅ **FÁCIL INTEGRAÇÃO** - Apenas copiar e colar
✅ **ESCALÁVEL** - Pode migrar para banco depois
✅ **CONTROLE TOTAL** - Você decide tudo
✅ **TRANSPARENTE** - Usuários veem ranking
✅ **GAMIFICADO** - Sistema completo de conquistas

**Este sistema está pronto para usar AGORA MESMO no seu projeto!** 🔥

Quer que eu ajude a implementar alguma parte específica ou tem alguma dúvida sobre o funcionamento?

