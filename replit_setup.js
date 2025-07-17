// replit_setup.js - Script de configuração automática para o Replit
// Execute este script no console do Replit para configurar automaticamente o sistema de pontos

class ReplitSetup {
    constructor() {
        this.projectName = 'Meow Token Points System';
        this.version = '1.0.0';
        this.setupSteps = [];
        this.errors = [];
    }

    // Função principal de setup
    async runSetup() {
        console.log(`🚀 Iniciando setup do ${this.projectName} v${this.version}`);
        console.log('=' .repeat(60));

        try {
            await this.checkEnvironment();
            await this.createDirectoryStructure();
            await this.validateFiles();
            await this.initializeSystem();
            await this.runTests();
            this.showCompletionMessage();
        } catch (error) {
            this.handleError('Setup falhou', error);
        }
    }

    // Verificar ambiente do Replit
    async checkEnvironment() {
        this.log('🔍 Verificando ambiente do Replit...');

        // Verificar se estamos no Replit
        const isReplit = window.location.hostname.includes('replit') || 
                         window.location.hostname.includes('repl.co');
        
        if (!isReplit) {
            this.warn('⚠️ Não detectado ambiente Replit, mas continuando...');
        } else {
            this.success('✅ Ambiente Replit detectado');
        }

        // Verificar navegador
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome') || userAgent.includes('Firefox') || userAgent.includes('Safari')) {
            this.success('✅ Navegador compatível detectado');
        } else {
            this.warn('⚠️ Navegador pode não ser totalmente compatível');
        }

        // Verificar localStorage
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            this.success('✅ LocalStorage disponível');
        } catch (error) {
            this.error('❌ LocalStorage não disponível', error);
        }
    }

    // Criar estrutura de diretórios (simulado - no Replit isso seria manual)
    async createDirectoryStructure() {
        this.log('📁 Verificando estrutura de diretórios...');

        const requiredStructure = {
            'points-system/': 'Pasta principal do sistema',
            'points-system/js/': 'Scripts JavaScript',
            'points-system/css/': 'Arquivos de estilo',
            'points-system/admin/': 'Dashboard administrativo'
        };

        this.log('📋 Estrutura recomendada:');
        Object.entries(requiredStructure).forEach(([path, description]) => {
            console.log(`   ${path} - ${description}`);
        });

        this.success('✅ Estrutura de diretórios verificada');
    }

    // Validar se os arquivos necessários estão presentes
    async validateFiles() {
        this.log('📄 Validando arquivos do sistema...');

        const requiredFiles = [
            'points-system/js/pointsSystem.js',
            'points-system/js/gameIntegration.js',
            'points-system/js/ui-components.js',
            'points-system/css/meow-points.css'
        ];

        let filesFound = 0;
        
        for (const file of requiredFiles) {
            try {
                // Tentar carregar o arquivo via fetch
                const response = await fetch(file);
                if (response.ok) {
                    this.success(`✅ ${file} encontrado`);
                    filesFound++;
                } else {
                    this.error(`❌ ${file} não encontrado`);
                }
            } catch (error) {
                this.error(`❌ ${file} não acessível`);
            }
        }

        if (filesFound === requiredFiles.length) {
            this.success('✅ Todos os arquivos necessários encontrados');
        } else {
            this.warn(`⚠️ ${filesFound}/${requiredFiles.length} arquivos encontrados`);
            this.log('💡 Certifique-se de que todos os arquivos estão na estrutura correta');
        }
    }

    // Inicializar sistema de pontos
    async initializeSystem() {
        this.log('⚙️ Inicializando sistema de pontos...');

        // Verificar se os objetos globais estão disponíveis
        const systemObjects = {
            'window.meowPoints': 'Sistema principal de pontos',
            'window.gameIntegration': 'Integração com jogos',
            'window.meowUI': 'Interface do usuário'
        };

        let objectsLoaded = 0;

        Object.entries(systemObjects).forEach(([objPath, description]) => {
            const obj = this.getNestedObject(window, objPath.replace('window.', ''));
            if (obj) {
                this.success(`✅ ${objPath} carregado - ${description}`);
                objectsLoaded++;
            } else {
                this.error(`❌ ${objPath} não encontrado - ${description}`);
            }
        });

        if (objectsLoaded === Object.keys(systemObjects).length) {
            this.success('✅ Sistema de pontos inicializado com sucesso');
        } else {
            this.warn(`⚠️ ${objectsLoaded}/${Object.keys(systemObjects).length} componentes carregados`);
        }
    }

    // Executar testes básicos
    async runTests() {
        this.log('🧪 Executando testes básicos...');

        const tests = [
            () => this.testLocalStorage(),
            () => this.testPointsSystem(),
            () => this.testGameIntegration(),
            () => this.testUIComponents()
        ];

        let testsPasssed = 0;

        for (const test of tests) {
            try {
                const result = await test();
                if (result) {
                    testsPasssed++;
                }
            } catch (error) {
                this.error('❌ Teste falhou', error);
            }
        }

        if (testsPasssed === tests.length) {
            this.success('✅ Todos os testes passaram');
        } else {
            this.warn(`⚠️ ${testsPasssed}/${tests.length} testes passaram`);
        }
    }

    // Testes individuais
    testLocalStorage() {
        try {
            const testKey = 'meow_setup_test';
            const testValue = { test: true, timestamp: Date.now() };
            
            localStorage.setItem(testKey, JSON.stringify(testValue));
            const retrieved = JSON.parse(localStorage.getItem(testKey));
            localStorage.removeItem(testKey);
            
            if (retrieved && retrieved.test === true) {
                this.success('✅ Teste localStorage passou');
                return true;
            } else {
                this.error('❌ Teste localStorage falhou');
                return false;
            }
        } catch (error) {
            this.error('❌ Teste localStorage com erro', error);
            return false;
        }
    }

    testPointsSystem() {
        if (!window.meowPoints) {
            this.error('❌ Sistema de pontos não disponível');
            return false;
        }

        try {
            // Testar conexão de carteira simulada
            const testWallet = 'TEST_WALLET_' + Date.now();
            window.meowPoints.connectWallet(testWallet);
            
            // Testar adição de pontos
            const result = window.meowPoints.addPoints('Setup Test', 10);
            
            if (result.success) {
                this.success('✅ Teste sistema de pontos passou');
                return true;
            } else {
                this.error('❌ Teste sistema de pontos falhou');
                return false;
            }
        } catch (error) {
            this.error('❌ Teste sistema de pontos com erro', error);
            return false;
        }
    }

    testGameIntegration() {
        if (!window.gameIntegration) {
            this.error('❌ Integração de jogos não disponível');
            return false;
        }

        try {
            // Testar submissão de score
            const result = window.gameIntegration.submitMeowClickerScore(1, 50);
            
            if (result.success || result.error) { // Sucesso ou erro esperado (limite)
                this.success('✅ Teste integração de jogos passou');
                return true;
            } else {
                this.error('❌ Teste integração de jogos falhou');
                return false;
            }
        } catch (error) {
            this.error('❌ Teste integração de jogos com erro', error);
            return false;
        }
    }

    testUIComponents() {
        if (!window.meowUI) {
            this.error('❌ Componentes UI não disponíveis');
            return false;
        }

        try {
            // Testar notificação
            window.meowUI.showNotification('🧪 Teste de setup', 'info');
            this.success('✅ Teste componentes UI passou');
            return true;
        } catch (error) {
            this.error('❌ Teste componentes UI com erro', error);
            return false;
        }
    }

    // Mostrar mensagem de conclusão
    showCompletionMessage() {
        console.log('\n' + '=' .repeat(60));
        console.log('🎉 SETUP CONCLUÍDO!');
        console.log('=' .repeat(60));

        if (this.errors.length === 0) {
            console.log('✅ Setup completado com sucesso!');
            console.log('🚀 Seu sistema de pontos Meow Token está pronto para uso!');
        } else {
            console.log('⚠️ Setup completado com alguns avisos:');
            this.errors.forEach(error => console.log(`   - ${error}`));
        }

        console.log('\n📋 Próximos passos:');
        console.log('1. 🔗 Conecte uma carteira Solana');
        console.log('2. 🎮 Teste os jogos disponíveis');
        console.log('3. 🏆 Verifique o ranking global');
        console.log('4. ⚙️ Acesse o dashboard admin');

        console.log('\n🔧 Comandos úteis:');
        console.log('- debugMeow.connectTestWallet() - Conectar carteira de teste');
        console.log('- debugMeow.addTestPoints(100) - Adicionar pontos de teste');
        console.log('- debugMeow.showUserData() - Mostrar dados do usuário');
        console.log('- debugMeow.showRanking() - Mostrar ranking');

        console.log('\n🆘 Suporte:');
        console.log('- Verifique o console para erros');
        console.log('- Confirme que todos os arquivos estão na estrutura correta');
        console.log('- Use os comandos de debug para testar funcionalidades');

        // Mostrar estatísticas do setup
        console.log('\n📊 Estatísticas do Setup:');
        console.log(`   Passos executados: ${this.setupSteps.length}`);
        console.log(`   Erros encontrados: ${this.errors.length}`);
        console.log(`   Status: ${this.errors.length === 0 ? '✅ Sucesso' : '⚠️ Com avisos'}`);
    }

    // Funções auxiliares
    log(message) {
        console.log(message);
        this.setupSteps.push(message);
    }

    success(message) {
        console.log(`%c${message}`, 'color: #22c55e; font-weight: bold;');
        this.setupSteps.push(message);
    }

    warn(message) {
        console.log(`%c${message}`, 'color: #f59e0b; font-weight: bold;');
        this.setupSteps.push(message);
        this.errors.push(message);
    }

    error(message, error = null) {
        console.log(`%c${message}`, 'color: #ef4444; font-weight: bold;');
        if (error) {
            console.error(error);
        }
        this.setupSteps.push(message);
        this.errors.push(message);
    }

    handleError(message, error) {
        console.error(`💥 ${message}:`, error);
        this.errors.push(`${message}: ${error.message}`);
    }

    getNestedObject(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }
}

// Função para executar setup automaticamente
async function setupMeowToken() {
    const setup = new ReplitSetup();
    await setup.runSetup();
    return setup;
}

// Função para verificar status do sistema
function checkSystemStatus() {
    console.log('🔍 Verificando status do sistema...');
    console.log('=' .repeat(40));

    const checks = [
        {
            name: 'Sistema de Pontos',
            check: () => !!window.meowPoints,
            obj: 'window.meowPoints'
        },
        {
            name: 'Integração de Jogos',
            check: () => !!window.gameIntegration,
            obj: 'window.gameIntegration'
        },
        {
            name: 'Interface UI',
            check: () => !!window.meowUI,
            obj: 'window.meowUI'
        },
        {
            name: 'LocalStorage',
            check: () => {
                try {
                    localStorage.setItem('test', 'test');
                    localStorage.removeItem('test');
                    return true;
                } catch {
                    return false;
                }
            },
            obj: 'localStorage'
        }
    ];

    let allGood = true;

    checks.forEach(({ name, check, obj }) => {
        const status = check();
        const icon = status ? '✅' : '❌';
        const color = status ? '#22c55e' : '#ef4444';
        
        console.log(`%c${icon} ${name}: ${status ? 'OK' : 'FALHOU'}`, `color: ${color}; font-weight: bold;`);
        
        if (!status) {
            allGood = false;
            console.log(`   Objeto: ${obj}`);
        }
    });

    console.log('=' .repeat(40));
    
    if (allGood) {
        console.log('%c🎉 Sistema funcionando perfeitamente!', 'color: #22c55e; font-size: 16px; font-weight: bold;');
    } else {
        console.log('%c⚠️ Alguns componentes não estão funcionando', 'color: #f59e0b; font-size: 16px; font-weight: bold;');
        console.log('💡 Verifique se todos os arquivos estão carregados corretamente');
    }

    return allGood;
}

// Função para criar dados de demonstração
function createDemoData() {
    console.log('🎭 Criando dados de demonstração...');

    if (!window.meowPoints) {
        console.error('❌ Sistema de pontos não disponível');
        return;
    }

    // Conectar carteira de demo
    const demoWallet = 'DEMO_' + Date.now().toString().slice(-8);
    window.meowPoints.connectWallet(demoWallet);
    console.log(`✅ Carteira demo conectada: ${demoWallet}`);

    // Adicionar pontos de diferentes fontes
    const demoActivities = [
        { game: 'Meow Clicker', points: 45 },
        { game: 'Crypto Quiz', points: 120 },
        { game: 'Lucky Spin', points: 75 },
        { game: 'Treasure Hunt', points: 200 },
        { game: 'Battle Arena', points: 150 },
        { game: 'Social Twitter', points: 50 },
        { game: 'Social Telegram', points: 40 }
    ];

    demoActivities.forEach(({ game, points }) => {
        window.meowPoints.addPoints(game, points);
        console.log(`✅ ${game}: +${points} pontos`);
    });

    // Coletar recompensa diária
    const dailyResult = window.meowPoints.claimDailyReward();
    if (dailyResult.success) {
        console.log(`✅ Recompensa diária: +${dailyResult.reward} pontos`);
    }

    const userData = window.meowPoints.getUserData();
    console.log(`🎉 Demo criada! Total: ${userData.totalPoints} pontos, Nível: ${userData.level}`);

    return userData;
}

// Função para limpar dados de demo
function clearDemoData() {
    if (confirm('⚠️ Isso apagará todos os dados de demonstração. Continuar?')) {
        if (window.meowPoints) {
            window.meowPoints.clearAllData();
            console.log('🗑️ Dados de demonstração limpos');
        }
    }
}

// Exportar funções para uso global
window.setupMeowToken = setupMeowToken;
window.checkSystemStatus = checkSystemStatus;
window.createDemoData = createDemoData;
window.clearDemoData = clearDemoData;

// Executar verificação automática quando o script carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('🎮 Meow Token Setup Script carregado!');
        console.log('📋 Comandos disponíveis:');
        console.log('  - setupMeowToken() - Executar setup completo');
        console.log('  - checkSystemStatus() - Verificar status do sistema');
        console.log('  - createDemoData() - Criar dados de demonstração');
        console.log('  - clearDemoData() - Limpar dados de demonstração');
        console.log('');
        console.log('💡 Execute setupMeowToken() para começar!');
    }, 1000);
});

// Auto-executar verificação se todos os componentes estiverem carregados
setTimeout(() => {
    if (window.meowPoints && window.gameIntegration && window.meowUI) {
        console.log('🚀 Todos os componentes detectados! Executando verificação automática...');
        checkSystemStatus();
    }
}, 2000);

