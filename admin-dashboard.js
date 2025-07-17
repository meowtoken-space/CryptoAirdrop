// admin-dashboard.js - JavaScript para o dashboard administrativo
class AdminDashboard {
  constructor() {
    this.pointsSystem = window.meowPoints;
    this.gameIntegration = window.gameIntegration;
    this.settings = this.loadSettings();
    this.init();
  }

  init() {
    this.loadDashboardData();
    this.setupEventListeners();
    this.startAutoRefresh();
  }

  // Carregar dados do dashboard
  loadDashboardData() {
    this.updateOverviewStats();
    this.loadTopUsers();
    this.loadGameStats();
    this.loadRecentActivity();
    this.loadSnapshots();
  }

  // Atualizar estatísticas gerais
  updateOverviewStats() {
    const ranking = this.pointsSystem.getRanking();
    const gameStats = this.gameIntegration.getGameStats();
    
    const totalUsers = ranking.length;
    const totalPoints = ranking.reduce((sum, entry) => sum + entry.totalPoints, 0);
    const totalGames = Object.values(gameStats).reduce((sum, stat) => sum + stat.sessions, 0);
    
    // Usuários ativos nas últimas 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = ranking.filter(entry => {
      const lastActivity = new Date(entry.lastActivity);
      return lastActivity > yesterday;
    }).length;

    document.getElementById('total-users').textContent = totalUsers.toLocaleString();
    document.getElementById('total-points').textContent = totalPoints.toLocaleString();
    document.getElementById('active-users').textContent = activeUsers.toLocaleString();
    document.getElementById('total-games').textContent = totalGames.toLocaleString();
  }

  // Carregar top usuários
  loadTopUsers() {
    const ranking = this.pointsSystem.getRanking(10);
    const container = document.getElementById('top-users-table');
    
    if (ranking.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhum usuário encontrado</p>';
      return;
    }

    const tableHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Posição</th>
            <th>Carteira</th>
            <th>Pontos</th>
            <th>Nível</th>
            <th>Jogos</th>
            <th>Última Atividade</th>
          </tr>
        </thead>
        <tbody>
          ${ranking.map(entry => `
            <tr>
              <td>${this.getRankIcon(entry.rank)} #${entry.rank}</td>
              <td>${this.formatWallet(entry.walletAddress)}</td>
              <td>${entry.totalPoints.toLocaleString()}</td>
              <td>${entry.level}</td>
              <td>${entry.gamesPlayed}</td>
              <td>${this.formatLastActivity(entry.lastActivity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = tableHTML;
  }

  // Carregar estatísticas de jogos
  loadGameStats() {
    const gameStats = this.gameIntegration.getGameStats();
    const container = document.getElementById('game-stats-table');
    
    if (Object.keys(gameStats).length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhum jogo jogado ainda</p>';
      return;
    }

    const tableHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Jogo</th>
            <th>Sessões</th>
            <th>Pontos Totais</th>
            <th>Média por Sessão</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(gameStats).map(([gameName, stats]) => `
            <tr>
              <td>${gameName}</td>
              <td>${stats.sessions}</td>
              <td>${stats.totalPoints.toLocaleString()}</td>
              <td>${stats.averagePoints}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = tableHTML;
  }

  // Carregar atividade recente
  loadRecentActivity() {
    const userData = this.pointsSystem.getUserData();
    const container = document.getElementById('recent-activity');
    
    if (!userData || !userData.gameHistory || userData.gameHistory.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhuma atividade recente</p>';
      return;
    }

    const recentActivities = userData.gameHistory
      .slice(-10)
      .reverse()
      .map(activity => `
        <div class="snapshot-item">
          <div class="snapshot-header">
            <span class="snapshot-name">${activity.gameName}</span>
            <span class="snapshot-date">${this.formatDateTime(activity.timestamp)}</span>
          </div>
          <div class="snapshot-stats">
            <span>+${activity.pointsEarned} pontos</span>
            <span>Carteira: ${this.formatWallet(userData.walletAddress)}</span>
          </div>
        </div>
      `).join('');

    container.innerHTML = recentActivities;
  }

  // Carregar snapshots
  loadSnapshots() {
    const snapshots = this.pointsSystem.getTGESnapshots();
    const container = document.getElementById('snapshots-list');
    
    if (snapshots.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Nenhum snapshot criado</p>';
      return;
    }

    const snapshotsHTML = snapshots
      .slice(-5)
      .reverse()
      .map(snapshot => `
        <div class="snapshot-item">
          <div class="snapshot-header">
            <span class="snapshot-name">${snapshot.name}</span>
            <span class="snapshot-date">${this.formatDateTime(snapshot.timestamp)}</span>
          </div>
          <div class="snapshot-stats">
            <span>${snapshot.totalUsers} usuários</span>
            <span>${snapshot.totalPoints.toLocaleString()} pontos</span>
            <button class="admin-btn secondary" onclick="adminDashboard.downloadSnapshot('${snapshot.name}')">
              📥 Download
            </button>
          </div>
        </div>
      `).join('');

    container.innerHTML = snapshotsHTML;
  }

  // Event listeners
  setupEventListeners() {
    // Auto-refresh quando dados mudarem
    window.addEventListener('meowPointsUpdated', () => {
      this.loadDashboardData();
    });

    window.addEventListener('meowRankingUpdated', () => {
      this.loadDashboardData();
    });
  }

  // Auto-refresh
  startAutoRefresh() {
    setInterval(() => {
      this.loadDashboardData();
    }, 30000); // A cada 30 segundos
  }

  // Funções de controle

  // Atualizar ranking
  refreshRanking() {
    this.pointsSystem.updateRanking();
    this.showNotification('🔄 Ranking atualizado com sucesso!', 'success');
    this.loadDashboardData();
  }

  // Exportar ranking
  exportRanking() {
    this.pointsSystem.exportRankingCSV();
    this.showNotification('📊 Ranking exportado com sucesso!', 'success');
  }

  // Mostrar modal de criar snapshot
  showCreateSnapshotModal() {
    const modal = document.getElementById('createSnapshotModal');
    modal.classList.add('active');
    
    // Sugerir nome automático
    const now = new Date();
    const suggestedName = `TGE_${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}`;
    document.getElementById('snapshot-name').value = suggestedName;
  }

  // Criar snapshot
  createSnapshot() {
    const name = document.getElementById('snapshot-name').value.trim();
    const description = document.getElementById('snapshot-description').value.trim();
    
    if (!name) {
      this.showNotification('❌ Nome do snapshot é obrigatório!', 'error');
      return;
    }

    try {
      const snapshot = this.pointsSystem.createTGESnapshot(name);
      
      // Adicionar descrição se fornecida
      if (description) {
        snapshot.description = description;
        const snapshots = this.pointsSystem.getTGESnapshots();
        const updatedSnapshots = snapshots.map(s => 
          s.name === name ? { ...s, description } : s
        );
        localStorage.setItem('meow_tge_snapshots', JSON.stringify(updatedSnapshots));
      }

      this.showNotification(`📸 Snapshot "${name}" criado com sucesso!`, 'success');
      this.closeModal('createSnapshotModal');
      this.loadSnapshots();
    } catch (error) {
      this.showNotification('❌ Erro ao criar snapshot: ' + error.message, 'error');
    }
  }

  // Mostrar calculadora TGE
  showTGECalculatorModal() {
    const modal = document.getElementById('tgeCalculatorModal');
    const content = document.getElementById('tge-calculator-content');
    
    const ranking = this.pointsSystem.getRanking();
    const totalPoints = ranking.reduce((sum, entry) => sum + entry.totalPoints, 0);
    const tgeRate = parseFloat(document.getElementById('tge-rate').value) || 1;
    const totalTokens = parseInt(document.getElementById('total-tokens').value) || 1000000;
    
    const calculatorHTML = `
      <div class="form-group">
        <label class="form-label">Taxa de Conversão Atual</label>
        <input type="number" class="form-input" id="calc-tge-rate" value="${tgeRate}" step="0.01" min="0">
        <small style="color: var(--text-secondary);">Tokens por ponto</small>
      </div>
      
      <div class="form-group">
        <label class="form-label">Total de Tokens Disponíveis</label>
        <input type="number" class="form-input" id="calc-total-tokens" value="${totalTokens}" step="1000">
      </div>
      
      <div class="alert warning">
        <strong>📊 Estatísticas Atuais:</strong><br>
        • Total de usuários: ${ranking.length}<br>
        • Total de pontos: ${totalPoints.toLocaleString()}<br>
        • Tokens necessários: ${(totalPoints * tgeRate).toLocaleString()}<br>
        • Tokens restantes: ${Math.max(0, totalTokens - (totalPoints * tgeRate)).toLocaleString()}
      </div>
      
      <div id="tge-preview"></div>
      
      <div class="admin-actions">
        <button class="admin-btn primary" onclick="adminDashboard.calculateTGE()">
          💰 Calcular Distribuição
        </button>
        <button class="admin-btn success" onclick="adminDashboard.exportTGECalculation()">
          📊 Exportar Cálculo
        </button>
      </div>
    `;
    
    content.innerHTML = calculatorHTML;
    modal.classList.add('active');
  }

  // Calcular TGE
  calculateTGE() {
    const tgeRate = parseFloat(document.getElementById('calc-tge-rate').value) || 1;
    const totalTokens = parseInt(document.getElementById('calc-total-tokens').value) || 1000000;
    const ranking = this.pointsSystem.getRanking();
    
    const totalPoints = ranking.reduce((sum, entry) => sum + entry.totalPoints, 0);
    const tokensNeeded = totalPoints * tgeRate;
    
    if (tokensNeeded > totalTokens) {
      this.showNotification('⚠️ Tokens insuficientes! Ajuste a taxa de conversão.', 'warning');
      return;
    }

    const preview = document.getElementById('tge-preview');
    const topUsers = ranking.slice(0, 10);
    
    const previewHTML = `
      <h4 style="color: var(--text-primary); margin-bottom: 16px;">Preview da Distribuição (Top 10)</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>Posição</th>
            <th>Carteira</th>
            <th>Pontos</th>
            <th>Tokens</th>
            <th>% do Total</th>
          </tr>
        </thead>
        <tbody>
          ${topUsers.map(entry => {
            const tokens = entry.totalPoints * tgeRate;
            const percentage = ((tokens / tokensNeeded) * 100).toFixed(2);
            return `
              <tr>
                <td>#${entry.rank}</td>
                <td>${this.formatWallet(entry.walletAddress)}</td>
                <td>${entry.totalPoints.toLocaleString()}</td>
                <td>${tokens.toLocaleString()}</td>
                <td>${percentage}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      <div class="alert success" style="margin-top: 16px;">
        <strong>✅ Distribuição Válida:</strong><br>
        • Tokens a distribuir: ${tokensNeeded.toLocaleString()}<br>
        • Tokens restantes: ${(totalTokens - tokensNeeded).toLocaleString()}<br>
        • Taxa efetiva: ${tgeRate} tokens por ponto
      </div>
    `;
    
    preview.innerHTML = previewHTML;
  }

  // Exportar cálculo TGE
  exportTGECalculation() {
    const tgeRate = parseFloat(document.getElementById('calc-tge-rate').value) || 1;
    const totalTokens = parseInt(document.getElementById('calc-total-tokens').value) || 1000000;
    const ranking = this.pointsSystem.getRanking();
    
    const csvData = [
      'Posição,Carteira,Pontos,Tokens,Porcentagem',
      ...ranking.map(entry => {
        const tokens = entry.totalPoints * tgeRate;
        const totalTokensDistributed = ranking.reduce((sum, e) => sum + (e.totalPoints * tgeRate), 0);
        const percentage = ((tokens / totalTokensDistributed) * 100).toFixed(2);
        return [
          entry.rank,
          entry.walletAddress,
          entry.totalPoints,
          tokens,
          percentage + '%'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tge_calculation_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    this.showNotification('📊 Cálculo TGE exportado com sucesso!', 'success');
  }

  // Mostrar informações do sistema
  showSystemInfoModal() {
    const modal = document.getElementById('systemInfoModal');
    const content = document.getElementById('system-info-content');
    
    const ranking = this.pointsSystem.getRanking();
    const gameStats = this.gameIntegration.getGameStats();
    const snapshots = this.pointsSystem.getTGESnapshots();
    const dailyLimits = this.gameIntegration.getDailyLimitsRemaining();
    
    const systemInfo = `
      <div class="alert success">
        <strong>🟢 Sistema Operacional</strong><br>
        Versão: 1.0.0<br>
        Última atualização: ${new Date().toLocaleString('pt-BR')}
      </div>
      
      <h4 style="color: var(--text-primary); margin: 20px 0 12px 0;">📊 Estatísticas do Sistema</h4>
      <table class="data-table">
        <tr><td>Total de usuários</td><td>${ranking.length}</td></tr>
        <tr><td>Total de pontos</td><td>${ranking.reduce((sum, entry) => sum + entry.totalPoints, 0).toLocaleString()}</td></tr>
        <tr><td>Jogos disponíveis</td><td>${Object.keys(gameStats).length}</td></tr>
        <tr><td>Snapshots criados</td><td>${snapshots.length}</td></tr>
        <tr><td>Limites diários configurados</td><td>${Object.keys(dailyLimits).length}</td></tr>
      </table>
      
      <h4 style="color: var(--text-primary); margin: 20px 0 12px 0;">💾 Armazenamento</h4>
      <table class="data-table">
        <tr><td>Tipo de storage</td><td>localStorage (Browser)</td></tr>
        <tr><td>Dados de usuários</td><td>${this.getStorageSize('meow_points_data')} KB</td></tr>
        <tr><td>Dados de ranking</td><td>${this.getStorageSize('meow_ranking_data')} KB</td></tr>
        <tr><td>Snapshots TGE</td><td>${this.getStorageSize('meow_tge_snapshots')} KB</td></tr>
      </table>
      
      <div class="alert warning" style="margin-top: 20px;">
        <strong>⚠️ Recomendação:</strong> Para produção, migre para um banco de dados como Supabase para maior segurança e escalabilidade.
      </div>
    `;
    
    content.innerHTML = systemInfo;
    modal.classList.add('active');
  }

  // Mostrar modal de backup
  showBackupModal() {
    const modal = document.getElementById('backupModal');
    modal.classList.add('active');
  }

  // Download backup completo
  downloadBackup() {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      userData: this.pointsSystem.getUserData(),
      ranking: this.pointsSystem.getRanking(),
      snapshots: this.pointsSystem.getTGESnapshots(),
      settings: this.settings
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `meow_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showNotification('💾 Backup completo baixado com sucesso!', 'success');
  }

  // Download backup apenas ranking
  downloadRankingBackup() {
    const ranking = this.pointsSystem.getRanking();
    const blob = new Blob([JSON.stringify(ranking, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `meow_ranking_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showNotification('📊 Backup do ranking baixado com sucesso!', 'success');
  }

  // Download snapshot específico
  downloadSnapshot(snapshotName) {
    const snapshots = this.pointsSystem.getTGESnapshots();
    const snapshot = snapshots.find(s => s.name === snapshotName);
    
    if (!snapshot) {
      this.showNotification('❌ Snapshot não encontrado!', 'error');
      return;
    }

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${snapshotName}.json`;
    link.click();
    
    this.showNotification(`📥 Snapshot "${snapshotName}" baixado com sucesso!`, 'success');
  }

  // Mostrar modal de reset
  showResetModal() {
    const modal = document.getElementById('resetModal');
    modal.classList.add('active');
    document.getElementById('reset-confirmation').value = '';
  }

  // Confirmar reset
  confirmReset() {
    const confirmation = document.getElementById('reset-confirmation').value;
    
    if (confirmation !== 'CONFIRMAR RESET') {
      this.showNotification('❌ Confirmação incorreta!', 'error');
      return;
    }

    if (confirm('⚠️ ÚLTIMA CHANCE: Tem certeza que deseja resetar TODOS os dados? Esta ação é irreversível!')) {
      this.pointsSystem.clearAllData();
      localStorage.removeItem('meow_admin_settings');
      
      this.showNotification('🗑️ Sistema resetado com sucesso!', 'success');
      this.closeModal('resetModal');
      
      // Recarregar página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  // Salvar configurações
  saveSettings() {
    const tgeRate = parseFloat(document.getElementById('tge-rate').value) || 1;
    const totalTokens = parseInt(document.getElementById('total-tokens').value) || 1000000;
    
    this.settings = {
      tgeRate,
      totalTokens,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('meow_admin_settings', JSON.stringify(this.settings));
    this.showNotification('💾 Configurações salvas com sucesso!', 'success');
  }

  // Carregar configurações
  loadSettings() {
    const saved = localStorage.getItem('meow_admin_settings');
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      tgeRate: 1,
      totalTokens: 1000000,
      lastUpdated: new Date().toISOString()
    };
  }

  // Funções utilitárias

  // Fechar modal
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
  }

  // Mostrar notificação
  showNotification(message, type = 'info') {
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
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Formatar carteira
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

  // Formatar data e hora
  formatDateTime(timestamp) {
    return new Date(timestamp).toLocaleString('pt-BR');
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

  // Obter tamanho do storage
  getStorageSize(key) {
    const data = localStorage.getItem(key);
    if (!data) return 0;
    return Math.round(new Blob([data]).size / 1024);
  }
}

// Funções globais para os botões
function refreshRanking() {
  adminDashboard.refreshRanking();
}

function exportRanking() {
  adminDashboard.exportRanking();
}

function showCreateSnapshotModal() {
  adminDashboard.showCreateSnapshotModal();
}

function createSnapshot() {
  adminDashboard.createSnapshot();
}

function loadSnapshots() {
  adminDashboard.loadSnapshots();
}

function showTGECalculatorModal() {
  adminDashboard.showTGECalculatorModal();
}

function showSystemInfoModal() {
  adminDashboard.showSystemInfoModal();
}

function showBackupModal() {
  adminDashboard.showBackupModal();
}

function downloadBackup() {
  adminDashboard.downloadBackup();
}

function downloadRankingBackup() {
  adminDashboard.downloadRankingBackup();
}

function showResetModal() {
  adminDashboard.showResetModal();
}

function confirmReset() {
  adminDashboard.confirmReset();
}

function saveSettings() {
  adminDashboard.saveSettings();
}

function closeModal(modalId) {
  adminDashboard.closeModal(modalId);
}

// Inicializar dashboard quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.adminDashboard = new AdminDashboard();
});

// Fechar modais clicando no overlay
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// Fechar modais com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) {
      activeModal.classList.remove('active');
    }
  }
});

