/**
 * LifeManager - Sistema de Navegação (Força Recriação)
 * Versão que sempre recria o conteúdo das abas
 */

window.Navigation = {
    currentTab: 'dashboard',
    
    // Inicializar sistema de navegação
    initialize() {
        console.log('🚀 Inicializando Navigation...');
        this.setupTabEvents();
        this.loadInitialTab();
        this.initializeModules();
        return true;
    },
    
    // Inicializar módulos
    initializeModules() {
        const modules = ['Dashboard', 'Tasks', 'Finances', 'Goals', 'Team', 'Profile', 'Notifications', 'Achievements'];
        
        modules.forEach(moduleName => {
            try {
                if (window[moduleName] && typeof window[moduleName].initialize === 'function') {
                    window[moduleName].initialize();
                    console.log(`✅ ${moduleName} inicializado`);
                }
            } catch (error) {
                console.warn(`⚠️ Erro ao inicializar ${moduleName}:`, error.message);
            }
        });
    },
    
    // Configurar eventos das abas
    setupTabEvents() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('onclick')?.match(/switchTab\('(.+?)'\)/)?.[1];
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });
    },
    
    // Trocar de aba
    switchTab(tabName) {
        if (!tabName || this.currentTab === tabName) return;
        
        try {
            console.log(`📍 Navegando para: ${tabName}`);
            
            // Remover classes ativas
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Ativar nova aba
            const tabContent = document.getElementById(tabName);
            const tabBtn = document.querySelector(`[onclick*="switchTab('${tabName}')"]`);
            
            if (tabContent && tabBtn) {
                console.log(`🟢 Ativando aba: ${tabName}`);
                
                tabContent.classList.add('active');
                tabBtn.classList.add('active');
                this.currentTab = tabName;
                
                // SEMPRE recriar conteúdo (ignorar conteúdo existente)
                this.forceRecreateContent(tabName, tabContent);
                
                // Atualizar URL
                if (window.history && window.history.pushState) {
                    window.history.pushState({tab: tabName}, '', `#${tabName}`);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao trocar de aba:', error);
        }
    },
    
    // Forçar recriação de conteúdo
    forceRecreateContent(tabName, container) {
        console.log(`🔥 FORÇANDO recriação de: ${tabName}`);
        console.log(`📊 HTML antes: ${container.innerHTML.length} chars`);
        
        // LIMPAR COMPLETAMENTE o container
        container.innerHTML = '';
        
        // Aguardar limpeza e recriar
        setTimeout(() => {
            this.createTabContent(tabName, container);
        }, 50);
    },
    
    // Criar conteúdo da aba
    createTabContent(tabName, container) {
        console.log(`🏗️ Criando conteúdo para: ${tabName}`);
        
        switch(tabName) {
            case 'dashboard':
                this.createDashboard(container);
                break;
            case 'tasks':
                this.createTasks(container);
                break;
            case 'finances':
                this.createFinances(container);
                break;
            case 'goals':
                this.createGoals(container);
                break;
            case 'team':
                this.createTeam(container);
                break;
            case 'profile':
                this.createProfile(container);
                break;
        }
        
        // Verificar resultado
        setTimeout(() => {
            console.log(`✅ ${tabName} criado, novo HTML: ${container.innerHTML.length} chars`);
            console.log(`📄 Primeiro trecho: ${container.innerHTML.substring(0, 100)}...`);
        }, 100);
    },
    
    // Criar Dashboard
    createDashboard(container) {
        const html = `
            <h2 style="margin-bottom: 24px; color: #333; font-weight: 800; font-size: 2em;">📊 Dashboard</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                
                <div style="background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,240,255,0.8)); padding: 30px; border-radius: 16px; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border: 1px solid rgba(102,126,234,0.2);">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 1.8em;">📋</div>
                    <div style="font-size: 2.5em; font-weight: 800; color: #333; margin-bottom: 8px;" id="activeTasks">0</div>
                    <div style="color: #666; font-weight: 600; text-transform: uppercase; font-size: 0.9em;">Tarefas Ativas</div>
                </div>
                
                <div style="background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,255,240,0.8)); padding: 30px; border-radius: 16px; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border: 1px solid rgba(76,175,80,0.2);">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #4caf50, #66bb6a); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 1.8em;">💰</div>
                    <div style="font-size: 2.5em; font-weight: 800; color: #333; margin-bottom: 8px;" id="currentBalance">R$ 0</div>
                    <div style="color: #666; font-weight: 600; text-transform: uppercase; font-size: 0.9em;">Saldo Atual</div>
                </div>
                
                <div style="background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,245,240,0.8)); padding: 30px; border-radius: 16px; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border: 1px solid rgba(255,152,0,0.2);">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #ff9800, #ffb74d); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 1.8em;">🎯</div>
                    <div style="font-size: 2.5em; font-weight: 800; color: #333; margin-bottom: 8px;" id="goalsProgress">0%</div>
                    <div style="color: #666; font-weight: 600; text-transform: uppercase; font-size: 0.9em;">Progresso Metas</div>
                </div>
                
                <div style="background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(250,240,255,0.8)); padding: 30px; border-radius: 16px; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border: 1px solid rgba(156,39,176,0.2);">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #9c27b0, #ba68c8); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 1.8em;">⭐</div>
                    <div style="font-size: 2.5em; font-weight: 800; color: #333; margin-bottom: 8px;" id="weekScore">0</div>
                    <div style="color: #666; font-weight: 600; text-transform: uppercase; font-size: 0.9em;">Score Semana</div>
                </div>
                
            </div>
            
            <div style="background: rgba(255,255,255,0.95); padding: 30px; border-radius: 16px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px; color: #333; font-weight: 700; font-size: 1.3em;">📈 Atividade Recente</h3>
                <div id="recentActivity">
                    <div style="text-align: center; padding: 50px; color: #666;">
                        <div style="font-size: 4em; margin-bottom: 20px;">🎯</div>
                        <h4 style="color: #333; margin-bottom: 12px; font-size: 1.2em;">Comece sua jornada!</h4>
                        <p style="font-size: 1.1em; line-height: 1.6;">Suas atividades aparecerão aqui conforme você usar o sistema</p>
                        <button onclick="showWelcomeDemo()" style="margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">✨ Ver Demonstração</button>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Atualizar dados do dashboard
        setTimeout(() => {
            try {
                if (typeof updateDashboard === 'function') {
                    updateDashboard();
                }
            } catch (error) {
                console.warn('Erro ao atualizar dashboard:', error);
            }
        }, 200);
    },
    
    // Criar Tasks
    createTasks(container) {
        const html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <h2 style="color: #333; font-weight: 800; font-size: 2em; margin: 0;">📋 Gerenciar Tarefas</h2>
                <button onclick="openModal('taskModal')" style="padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 1em;">✨ Nova Tarefa</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
                <div style="background: rgba(255,255,255,0.9); border-radius: 16px; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 20px; font-weight: 700; text-transform: uppercase;">📝 Para Fazer</div>
                    <div id="todo-column" style="min-height: 300px; border: 2px dashed #e0e0e0; border-radius: 8px; padding: 20px;">
                        <div style="text-align: center; color: #999; padding: 40px 20px;">
                            <div style="font-size: 3em; margin-bottom: 16px;">📝</div>
                            <p>Arraste tarefas aqui ou clique em "Nova Tarefa"</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.9); border-radius: 16px; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #4ecdc4, #44a08d); color: white; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 20px; font-weight: 700; text-transform: uppercase;">⚡ Em Progresso</div>
                    <div id="progress-column" style="min-height: 300px; border: 2px dashed #e0e0e0; border-radius: 8px; padding: 20px;">
                        <div style="text-align: center; color: #999; padding: 40px 20px;">
                            <div style="font-size: 3em; margin-bottom: 16px;">⚡</div>
                            <p>Tarefas em andamento</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.9); border-radius: 16px; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #45b7d1, #96c93d); color: white; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 20px; font-weight: 700; text-transform: uppercase;">✅ Concluído</div>
                    <div id="done-column" style="min-height: 300px; border: 2px dashed #e0e0e0; border-radius: 8px; padding: 20px;">
                        <div style="text-align: center; color: #999; padding: 40px 20px;">
                            <div style="font-size: 3em; margin-bottom: 16px;">🏆</div>
                            <p>Tarefas concluídas</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Carregar tarefas existentes
        setTimeout(() => {
            try {
                if (window.Tasks && typeof Tasks.loadData === 'function') {
                    Tasks.loadData();
                } else if (typeof loadAllData === 'function') {
                    loadAllData();
                }
            } catch (error) {
                console.warn('Erro ao carregar tarefas:', error);
            }
        }, 200);
    },
    
    // Criar Finances
    createFinances(container) {
        const html = `
            <h2 style="margin-bottom: 24px; color: #333; font-weight: 800; font-size: 2em;">💰 Controle Financeiro</h2>
            
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 40px; border-radius: 20px; text-align: center; margin-bottom: 32px; box-shadow: 0 12px 40px rgba(102,126,234,0.3);">
                <div style="font-size: 3.2em; font-weight: 900; margin-bottom: 8px;" id="mainBalance">R$ 0,00</div>
                <div style="font-size: 1.1em; opacity: 0.9;">Saldo atual</div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 32px;">
                <div style="background: rgba(255,255,255,0.9); border-radius: 16px; padding: 28px;">
                    <div style="display: flex; align-items: center; margin-bottom: 20px;">
                        <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #4caf50, #66bb6a); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-right: 16px; font-size: 1.6em;">💰</div>
                        <div>
                            <h3 style="color: #333; margin: 0;">Receitas</h3>
                            <div id="totalIncome" style="font-size: 1.5em; font-weight: 700; color: #4caf50;">R$ 0,00</div>
                        </div>
                    </div>
                    <button onclick="openModal('incomeModal')" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #4caf50, #66bb6a); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">➕ Adicionar Receita</button>
                </div>
                
                <div style="background: rgba(255,255,255,0.9); border-radius: 16px; padding: 28px;">
                    <div style="display: flex; align-items: center; margin-bottom: 20px;">
                        <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #f44336, #ef5350); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-right: 16px; font-size: 1.6em;">💸</div>
                        <div>
                            <h3 style="color: #333; margin: 0;">Gastos</h3>
                            <div id="totalExpenses" style="font-size: 1.5em; font-weight: 700; color: #f44336;">R$ 0,00</div>
                        </div>
                    </div>
                    <button onclick="openModal('expenseModal')" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #f44336, #ef5350); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">➖ Adicionar Gasto</button>
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.9); border-radius: 16px; padding: 28px;">
                <h3 style="margin-bottom: 20px; color: #333; font-weight: 700;">📊 Transações Recentes</h3>
                <div id="transactionsList">
                    <div style="text-align: center; padding: 40px; color: #666;">
                        <div style="font-size: 2.5em; margin-bottom: 16px;">💳</div>
                        <p>Suas transações aparecerão aqui</p>
                        <button onclick="openModal('incomeModal')" style="margin-top: 16px; padding: 10px 20px; background: linear-gradient(135deg, #4caf50, #66bb6a); color: white; border: none; border-radius: 8px; cursor: pointer;">Adicionar Primeira Receita</button>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Carregar dados financeiros
        setTimeout(() => {
            try {
                if (window.Finances && typeof Finances.loadData === 'function') {
                    Finances.loadData();
                } else if (typeof updateFinancialDisplay === 'function') {
                    updateFinancialDisplay();
                }
            } catch (error) {
                console.warn('Erro ao carregar finanças:', error);
            }
        }, 200);
    },
    
    // Criar Goals
    createGoals(container) {
        const html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <h2 style="color: #333; font-weight: 800; font-size: 2em; margin: 0;">🎯 Minhas Metas</h2>
                <button onclick="openModal('goalModal')" style="padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">🌟 Nova Meta</button>
            </div>
            
            <div id="goalsList">
                <div style="text-align: center; padding: 60px; color: #666;">
                    <div style="font-size: 4em; margin-bottom: 24px;">🎯</div>
                    <h3 style="color: #333; margin-bottom: 12px; font-size: 1.5em;">Defina suas metas!</h3>
                    <p style="margin-bottom: 24px; font-size: 1.1em; line-height: 1.6;">Transforme seus sonhos em objetivos concretos</p>
                    <button onclick="openModal('goalModal')" style="padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Criar Primeira Meta</button>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Carregar metas
        setTimeout(() => {
            try {
                if (window.Goals && typeof Goals.loadData === 'function') {
                    Goals.loadData();
                }
            } catch (error) {
                console.warn('Erro ao carregar metas:', error);
            }
        }, 200);
    },
    
    // Criar Team
    createTeam(container) {
        const html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <h2 style="color: #333; font-weight: 800; font-size: 2em; margin: 0;">👥 Minha Equipe</h2>
                <button onclick="openModal('inviteModal')" style="padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">➕ Convidar Membro</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
                <div>
                    <h3 style="margin-bottom: 16px; color: #333; font-weight: 700;">👥 Membros da Equipe</h3>
                    <div id="teamMembers">
                        <div onclick="openModal('inviteModal')" style="background: rgba(255,255,255,0.7); border: 2px dashed #ccc; border-radius: 16px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.borderColor='#667eea'; this.style.background='rgba(255,255,255,0.9)'" onmouseout="this.style.borderColor='#ccc'; this.style.background='rgba(255,255,255,0.7)'">
                            <div style="font-size: 3em; margin-bottom: 16px; color: #ccc;">➕</div>
                            <h4 style="color: #666; margin-bottom: 8px;">Convide sua primeira pessoa</h4>
                            <p style="color: #999; font-size: 0.9em;">Colabore em equipe para alcançar metas juntos</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Carregar equipe
        setTimeout(() => {
            try {
                if (window.Team && typeof Team.loadData === 'function') {
                    Team.loadData();
                }
            } catch (error) {
                console.warn('Erro ao carregar equipe:', error);
            }
        }, 200);
    },
    
    // Criar Profile
    createProfile(container) {
        const html = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 3em; margin-bottom: 16px;">👤</div>
                <h3>Carregando perfil...</h3>
                <p>O sistema de perfil está sendo inicializado</p>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Carregar perfil
        setTimeout(() => {
            try {
                if (window.Profile && typeof Profile.loadData === 'function') {
                    Profile.loadData();
                } else {
                    container.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #666;">
                            <div style="font-size: 3em; margin-bottom: 16px;">⚠️</div>
                            <h3>Módulo de perfil não encontrado</h3>
                            <p>Verifique se o profile.js está carregado corretamente</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #f44336;">
                        <div style="font-size: 3em; margin-bottom: 16px;">❌</div>
                        <h3>Erro ao carregar perfil</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }, 200);
    },
    
    // Carregar aba inicial
    loadInitialTab() {
        const hash = window.location.hash.substring(1);
        const validTabs = ['dashboard', 'tasks', 'finances', 'goals', 'team', 'profile'];
        
        if (hash && validTabs.includes(hash)) {
            this.switchTab(hash);
        } else {
            this.switchTab('dashboard');
        }
    }
};

// Função global para compatibilidade
window.switchTab = function(tabName) {
    Navigation.switchTab(tabName);
};

// Listener para navegação do browser
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.tab) {
        Navigation.switchTab(event.state.tab);
    }
});

// CSS para garantir visibilidade
const forceVisibilityStyle = document.createElement('style');
forceVisibilityStyle.textContent = `
    .tab-content {
        display: none !important;
    }
    
    .tab-content.active {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
    }
`;
document.head.appendChild(forceVisibilityStyle);

console.log('🎨 CSS de força aplicado');