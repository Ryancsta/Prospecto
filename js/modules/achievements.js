/**
 * LifeManager - Sistema Completo de Conquistas
 * Gerencia achievements, gamificação, pontuação e progressão
 */

window.Achievements = {
    unlockedAchievements: [],
    totalPoints: 0,
    currentLevel: 1,
    streaks: {
        daily: 0,
        weekly: 0,
        lastActivity: null
    },
    
    // Inicializar sistema
    initialize() {
        this.loadAchievements();
        this.calculateLevel();
        this.setupPeriodicChecks();
        this.createAchievementsUI();
        return true;
    },
    
    // Carregar conquistas salvas
    loadAchievements() {
        if (userData.achievements) {
            this.unlockedAchievements = userData.achievements.unlocked || [];
            this.totalPoints = userData.achievements.totalPoints || 0;
            this.currentLevel = userData.achievements.currentLevel || 1;
            this.streaks = userData.achievements.streaks || this.streaks;
        }
    },
    
    // Salvar dados de achievements
    saveAchievements() {
        if (!userData.achievements) userData.achievements = {};
        
        userData.achievements = {
            unlocked: this.unlockedAchievements,
            totalPoints: this.totalPoints,
            currentLevel: this.currentLevel,
            streaks: this.streaks,
            lastUpdated: new Date().toISOString()
        };
        
        if (typeof saveData === 'function') {
            saveData();
        }
    },
    
    // Desbloquear conquista
    unlock(achievementId) {
        if (this.unlockedAchievements.includes(achievementId)) {
            return false; // Já desbloqueada
        }
        
        const achievement = Config.achievements.definitions[achievementId];
        if (!achievement) {
            console.warn('Achievement não encontrado:', achievementId);
            return false;
        }
        
        // Adicionar à lista
        this.unlockedAchievements.push(achievementId);
        
        // Adicionar pontos
        this.totalPoints += achievement.points;
        
        // Verificar mudança de nível
        const oldLevel = this.currentLevel;
        this.calculateLevel();
        
        // Mostrar notificação
        if (window.Notifications) {
            Notifications.showAchievement(achievement);
            
            // Se subiu de nível, mostrar também
            if (this.currentLevel > oldLevel) {
                setTimeout(() => {
                    Notifications.show(`🎉 Nível ${this.currentLevel} alcançado!`, 'success');
                }, 1500);
            }
        }
        
        // Salvar dados
        this.saveAchievements();
        
        // Atualizar UI
        this.updateAchievementsDisplay();
        
        if (Config.debug.enabled) {
            console.log(`🏆 Achievement desbloqueado: ${achievement.title} (+${achievement.points} pts)`);
        }
        
        return true;
    },
    
    // Calcular nível baseado nos pontos
    calculateLevel() {
        // Fórmula: Level = 1 + floor(sqrt(points / 100))
        // Níveis: 1=0pts, 2=100pts, 3=400pts, 4=900pts, etc.
        const newLevel = Math.floor(Math.sqrt(this.totalPoints / 100)) + 1;
        this.currentLevel = Math.max(1, newLevel);
        return this.currentLevel;
    },
    
    // Pontos necessários para próximo nível
    getPointsForNextLevel() {
        const nextLevel = this.currentLevel + 1;
        return Math.pow(nextLevel - 1, 2) * 100;
    },
    
    // Progresso para próximo nível (0-100%)
    getLevelProgress() {
        const currentLevelPoints = Math.pow(this.currentLevel - 1, 2) * 100;
        const nextLevelPoints = this.getPointsForNextLevel();
        const progress = ((this.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
        return Math.max(0, Math.min(100, progress));
    },
    
    // Verificar todas as conquistas
    checkAll() {
        this.updateStreaks();
        this.checkTaskAchievements();
        this.checkFinancialAchievements();
        this.checkGoalAchievements();
        this.checkProfileAchievements();
        this.checkTeamAchievements();
        this.checkUsageAchievements();
        this.checkSpecialAchievements();
    },
    
    // Atualizar streaks diários
    updateStreaks() {
        const today = new Date().toDateString();
        const lastActivity = this.streaks.lastActivity;
        
        if (!lastActivity) {
            this.streaks.daily = 1;
            this.streaks.lastActivity = today;
        } else if (lastActivity !== today) {
            const lastDate = new Date(lastActivity);
            const todayDate = new Date(today);
            const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                // Sequência continua
                this.streaks.daily++;
            } else if (daysDiff > 1) {
                // Sequência quebrada
                this.streaks.daily = 1;
            }
            
            this.streaks.lastActivity = today;
        }
        
        // Verificar achievements de streak
        this.checkStreakAchievements();
    },
    
    // Verificar conquistas de tarefas
    checkTaskAchievements() {
        const tasks = userData.tasks || [];
        const completedTasks = tasks.filter(t => t.status === 'done');
        const completedCount = completedTasks.length;
        
        // Primeira tarefa
        if (tasks.length > 0 && !this.isUnlocked('first_task')) {
            this.unlock('first_task');
        }
        
        // Mestre das tarefas
        if (completedCount >= 10 && !this.isUnlocked('task_master')) {
            this.unlock('task_master');
        }
        
        // Conquistas adicionais
        if (completedCount >= 50 && !this.isUnlocked('task_veteran')) {
            this.unlock('task_veteran');
        }
        
        if (completedCount >= 100 && !this.isUnlocked('task_legend')) {
            this.unlock('task_legend');
        }
        
        // Tarefas urgentes
        const urgentCompleted = completedTasks.filter(t => t.priority === 'high').length;
        if (urgentCompleted >= 5 && !this.isUnlocked('urgent_solver')) {
            this.unlock('urgent_solver');
        }
        
        // Completar tarefas no prazo
        const onTimeCompleted = completedTasks.filter(t => {
            return t.deadline && t.completedAt && 
                   new Date(t.completedAt) <= new Date(t.deadline);
        }).length;
        
        if (onTimeCompleted >= 10 && !this.isUnlocked('punctual_performer')) {
            this.unlock('punctual_performer');
        }
    },
    
    // Verificar conquistas financeiras
    checkFinancialAchievements() {
        const transactions = userData.transactions || [];
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expenses;
        
        // Primeira receita
        if (transactions.some(t => t.type === 'income') && !this.isUnlocked('first_income')) {
            this.unlock('first_income');
        }
        
        // Poupador
        if (balance >= 1000 && !this.isUnlocked('money_saver')) {
            this.unlock('money_saver');
        }
        
        // Conquistas de saldo
        if (balance >= 5000 && !this.isUnlocked('wealthy_saver')) {
            this.unlock('wealthy_saver');
        }
        
        if (balance >= 10000 && !this.isUnlocked('financial_master')) {
            this.unlock('financial_master');
        }
        
        // Muitas transações
        if (transactions.length >= 50 && !this.isUnlocked('transaction_tracker')) {
            this.unlock('transaction_tracker');
        }
        
        // Mês sem gastos desnecessários (só essenciais)
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const essentialCategories = ['housing', 'health', 'food', 'bills'];
        
        const monthlyExpenses = transactions.filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && 
                   date.getMonth() === thisMonth && 
                   date.getFullYear() === thisYear;
        });
        
        const nonEssentialExpenses = monthlyExpenses.filter(t => 
            !essentialCategories.includes(t.category)
        );
        
        if (monthlyExpenses.length > 0 && nonEssentialExpenses.length === 0 && 
            !this.isUnlocked('frugal_month')) {
            this.unlock('frugal_month');
        }
    },
    
    // Verificar conquistas de metas
    checkGoalAchievements() {
        const goals = userData.goals || [];
        
        // Primeira meta
        if (goals.length > 0 && !this.isUnlocked('first_goal')) {
            this.unlock('first_goal');
        }
        
        // Meta alcançada
        const completedGoals = goals.filter(g => {
            if (g.type === 'financial') {
                return g.currentAmount >= g.amount;
            }
            return g.progress >= 100;
        });
        
        if (completedGoals.length > 0 && !this.isUnlocked('goal_achiever')) {
            this.unlock('goal_achiever');
        }
        
        // Múltiplas metas
        if (completedGoals.length >= 5 && !this.isUnlocked('goal_crusher')) {
            this.unlock('goal_crusher');
        }
        
        // Meta financeira grande
        const bigFinancialGoals = completedGoals.filter(g => 
            g.type === 'financial' && g.amount >= 10000
        );
        
        if (bigFinancialGoals.length > 0 && !this.isUnlocked('big_dreamer')) {
            this.unlock('big_dreamer');
        }
    },
    
    // Verificar conquistas de perfil
    checkProfileAchievements() {
        const profile = userData.profile || {};
        
        // Perfil completo
        const requiredFields = ['phone', 'company'];
        const completedFields = requiredFields.filter(field => profile[field]);
        
        if (completedFields.length === requiredFields.length && !this.isUnlocked('profile_complete')) {
            this.unlock('profile_complete');
        }
        
        // 2FA ativado
        if (profile.twoFactor && !this.isUnlocked('security_pro')) {
            this.unlock('security_pro');
        }
        
        // Tema personalizado
        if (profile.theme && profile.theme !== 'default' && !this.isUnlocked('style_master')) {
            this.unlock('style_master');
        }
    },
    
    // Verificar conquistas de equipe
    checkTeamAchievements() {
        const teamMembers = userData.teamMembers || [];
        
        // Primeira pessoa na equipe
        if (teamMembers.length > 0 && !this.isUnlocked('team_builder')) {
            this.unlock('team_builder');
        }
        
        // Equipe grande
        if (teamMembers.length >= 5 && !this.isUnlocked('team_leader')) {
            this.unlock('team_leader');
        }
    },
    
    // Verificar conquistas de uso
    checkUsageAchievements() {
        const user = currentUser;
        if (!user) return;
        
        // Usuário antigo (mais de 30 dias)
        const joinDate = new Date(user.createdAt);
        const daysSinceJoin = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceJoin >= 7 && !this.isUnlocked('week_veteran')) {
            this.unlock('week_veteran');
        }
        
        if (daysSinceJoin >= 30 && !this.isUnlocked('month_veteran')) {
            this.unlock('month_veteran');
        }
        
        // Early adopter (um dos primeiros usuários)
        if (!this.isUnlocked('early_adopter')) {
            this.unlock('early_adopter');
        }
    },
    
    // Verificar conquistas de streak
    checkStreakAchievements() {
        if (this.streaks.daily >= 3 && !this.isUnlocked('daily_streak_3')) {
            this.unlock('daily_streak_3');
        }
        
        if (this.streaks.daily >= 7 && !this.isUnlocked('daily_streak_7')) {
            this.unlock('daily_streak_7');
        }
        
        if (this.streaks.daily >= 30 && !this.isUnlocked('daily_streak_30')) {
            this.unlock('daily_streak_30');
        }
    },
    
    // Verificar conquistas especiais
    checkSpecialAchievements() {
        const now = new Date();
        
        // Conquista de aniversário do usuário (se tiver data de nascimento)
        // Conquista de feriados
        // Conquista de midnight warrior (usar após meia-noite)
        if (now.getHours() >= 0 && now.getHours() < 6 && !this.isUnlocked('night_owl')) {
            this.unlock('night_owl');
        }
        
        // Weekend warrior (usar no fim de semana)
        if ((now.getDay() === 0 || now.getDay() === 6) && !this.isUnlocked('weekend_warrior')) {
            this.unlock('weekend_warrior');
        }
    },
    
    // Verificar se achievement está desbloqueado
    isUnlocked(achievementId) {
        return this.unlockedAchievements.includes(achievementId);
    },
    
    // Obter estatísticas
    getStats() {
        const totalAchievements = Object.keys(Config.achievements.definitions).length;
        const unlockedCount = this.unlockedAchievements.length;
        
        return {
            totalPoints: this.totalPoints,
            currentLevel: this.currentLevel,
            levelProgress: this.getLevelProgress(),
            pointsForNextLevel: this.getPointsForNextLevel(),
            unlockedCount: unlockedCount,
            totalAchievements: totalAchievements,
            completionPercentage: (unlockedCount / totalAchievements) * 100,
            streaks: this.streaks
        };
    },
    
    // Criar interface de achievements
    createAchievementsUI() {
        // Adicionar botão no perfil para abrir achievements
        this.addAchievementsButton();
    },
    
    // Adicionar botão de achievements
    addAchievementsButton() {
        // Será adicionado quando o perfil for carregado
        document.addEventListener('profileLoaded', () => {
            this.insertAchievementsSection();
        });
    },
    
    // Inserir seção de achievements no perfil
    insertAchievementsSection() {
        const profileContainer = document.getElementById('profile');
        if (!profileContainer) return;
        
        const achievementsSection = this.createAchievementsSection();
        
        // Inserir após a primeira div (header do perfil)
        const firstCard = profileContainer.querySelector('.profile-card');
        if (firstCard) {
            firstCard.parentNode.insertBefore(achievementsSection, firstCard);
        }
    },
    
    // Criar seção de achievements
    createAchievementsSection() {
        const section = document.createElement('div');
        section.className = 'achievements-section';
        section.style.cssText = `
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #8b6914;
            padding: 28px;
            border-radius: 16px;
            margin-bottom: 24px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid rgba(255, 255, 255, 0.3);
        `;
        
        const stats = this.getStats();
        
        section.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                    🏆 Conquistas
                </h3>
                <div style="font-size: 2em;">${stats.currentLevel}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-bottom: 16px;">
                <div style="text-align: center;">
                    <div style="font-size: 1.5em; font-weight: 800;">${stats.totalPoints}</div>
                    <div style="font-size: 0.8em; opacity: 0.8;">Pontos</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.5em; font-weight: 800;">${stats.unlockedCount}/${stats.totalAchievements}</div>
                    <div style="font-size: 0.8em; opacity: 0.8;">Desbloqueadas</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.5em; font-weight: 800;">${stats.streaks.daily}</div>
                    <div style="font-size: 0.8em; opacity: 0.8;">Dias seguidos</div>
                </div>
            </div>
            
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-size: 0.9em; font-weight: 600;">Nível ${stats.currentLevel}</span>
                    <span style="font-size: 0.9em;">Nível ${stats.currentLevel + 1}</span>
                </div>
                <div style="background: rgba(0,0,0,0.2); border-radius: 8px; height: 8px; overflow: hidden;">
                    <div style="
                        background: linear-gradient(135deg, #4caf50, #66bb6a);
                        height: 100%;
                        width: ${stats.levelProgress}%;
                        border-radius: 8px;
                        transition: width 0.6s ease;
                    "></div>
                </div>
            </div>
            
            <div style="text-align: center; font-size: 0.9em; opacity: 0.8;">
                Clique para ver todas as conquistas
            </div>
        `;
        
        // Evento de clique
        section.addEventListener('click', () => {
            this.showAchievementsModal();
        });
        
        // Hover effect
        section.addEventListener('mouseenter', () => {
            section.style.transform = 'translateY(-4px)';
            section.style.boxShadow = '0 12px 40px rgba(255, 215, 0, 0.3)';
        });
        
        section.addEventListener('mouseleave', () => {
            section.style.transform = 'translateY(0)';
            section.style.boxShadow = 'none';
        });
        
        return section;
    },
    
    // Mostrar modal de achievements
    showAchievementsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const stats = this.getStats();
        const achievements = Config.achievements.definitions;
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                
                <div style="text-align: center; margin-bottom: 32px;">
                    <h2 style="margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 12px;">
                        🏆 Suas Conquistas
                    </h2>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
                        <div style="padding: 16px; background: linear-gradient(135deg, #ffd700, #ffed4e); border-radius: 12px;">
                            <div style="font-size: 2em; font-weight: 800; color: #8b6914;">${stats.totalPoints}</div>
                            <div style="color: #8b6914; font-weight: 600;">Total de Pontos</div>
                        </div>
                        <div style="padding: 16px; background: linear-gradient(135deg, #4caf50, #66bb6a); border-radius: 12px; color: white;">
                            <div style="font-size: 2em; font-weight: 800;">Nível ${stats.currentLevel}</div>
                            <div style="font-weight: 600;">${stats.levelProgress.toFixed(1)}% para próximo</div>
                        </div>
                        <div style="padding: 16px; background: linear-gradient(135deg, #2196f3, #42a5f5); border-radius: 12px; color: white;">
                            <div style="font-size: 2em; font-weight: 800;">${stats.unlockedCount}/${stats.totalAchievements}</div>
                            <div style="font-weight: 600;">Desbloqueadas</div>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                    ${Object.entries(achievements).map(([id, achievement]) => {
                        const isUnlocked = this.isUnlocked(id);
                        return `
                            <div style="
                                padding: 20px;
                                border-radius: 12px;
                                border: 2px solid ${isUnlocked ? '#4caf50' : '#e0e0e0'};
                                background: ${isUnlocked ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(255, 255, 255, 0.9))' : 'rgba(240, 240, 240, 0.5)'};
                                transition: all 0.3s ease;
                                ${!isUnlocked ? 'opacity: 0.6;' : ''}
                            ">
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                    <div style="font-size: 2em;">${achievement.icon}</div>
                                    <div>
                                        <h4 style="margin: 0; color: ${isUnlocked ? '#4caf50' : '#666'}; font-weight: 700;">
                                            ${achievement.title}
                                            ${isUnlocked ? ' ✅' : ' 🔒'}
                                        </h4>
                                        <div style="color: #666; font-size: 0.9em;">+${achievement.points} pontos</div>
                                    </div>
                                </div>
                                <p style="margin: 0; color: #666; line-height: 1.4;">
                                    ${achievement.description}
                                </p>
                                ${isUnlocked ? `
                                    <div style="margin-top: 8px; font-size: 0.8em; color: #4caf50; font-weight: 600;">
                                        🎉 Desbloqueado!
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // Atualizar display de achievements
    updateAchievementsDisplay() {
        const section = document.querySelector('.achievements-section');
        if (section) {
            // Recriar a seção com dados atualizados
            const newSection = this.createAchievementsSection();
            section.parentNode.replaceChild(newSection, section);
        }
    },
    
    // Configurar verificações periódicas
    setupPeriodicChecks() {
        // Verificar achievements a cada 30 segundos
        setInterval(() => {
            this.checkAll();
        }, 30000);
        
        // Verificar ao carregar dados
        document.addEventListener('dataLoaded', () => {
            setTimeout(() => this.checkAll(), 1000);
        });
    },
    
    // Verificar conquistas específicas baseadas em ações
    checkAction(action, data = {}) {
        switch(action) {
            case 'task_created':
                this.checkTaskAchievements();
                break;
            case 'task_completed':
                this.checkTaskAchievements();
                this.updateStreaks();
                break;
            case 'transaction_added':
                this.checkFinancialAchievements();
                break;
            case 'goal_created':
                this.checkGoalAchievements();
                break;
            case 'goal_completed':
                this.checkGoalAchievements();
                break;
            case 'profile_updated':
                this.checkProfileAchievements();
                break;
            case 'team_member_added':
                this.checkTeamAchievements();
                break;
            case 'login':
                this.updateStreaks();
                this.checkUsageAchievements();
                break;
        }
    },
    
    // Obter próximas conquistas sugeridas
    getSuggestedAchievements() {
        const suggestions = [];
        const achievements = Config.achievements.definitions;
        
        Object.entries(achievements).forEach(([id, achievement]) => {
            if (!this.isUnlocked(id)) {
                const progress = this.getAchievementProgress(id);
                if (progress > 0) {
                    suggestions.push({
                        id,
                        achievement,
                        progress
                    });
                }
            }
        });
        
        return suggestions.sort((a, b) => b.progress - a.progress).slice(0, 3);
    },
    
    // Calcular progresso de uma conquista específica
    getAchievementProgress(achievementId) {
        const tasks = userData.tasks || [];
        const transactions = userData.transactions || [];
        const goals = userData.goals || [];
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        
        switch(achievementId) {
            case 'task_master':
                return Math.min((completedTasks / 10) * 100, 100);
            case 'task_veteran':
                return Math.min((completedTasks / 50) * 100, 100);
            case 'task_legend':
                return Math.min((completedTasks / 100) * 100, 100);
            case 'money_saver':
                const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                const balance = income - expenses;
                return Math.min((balance / 1000) * 100, 100);
            case 'goal_crusher':
                const completedGoals = goals.filter(g => {
                    if (g.type === 'financial') return g.currentAmount >= g.amount;
                    return g.progress >= 100;
                }).length;
                return Math.min((completedGoals / 5) * 100, 100);
            case 'daily_streak_7':
                return Math.min((this.streaks.daily / 7) * 100, 100);
            case 'daily_streak_30':
                return Math.min((this.streaks.daily / 30) * 100, 100);
            default:
                return 0;
        }
    },
    
    // Exportar dados de achievements
    exportAchievements() {
        const stats = this.getStats();
        const exportData = {
            achievements: {
                unlocked: this.unlockedAchievements,
                stats: stats,
                exportDate: new Date().toISOString(),
                version: Config.version
            }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `VisionFin-achievements-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        if (window.Notifications) {
            Notifications.show('Conquistas exportadas! 📥', 'success');
        }
    },
    
    // Resetar achievements (para debug)
    reset() {
        if (Config.debug.enabled) {
            this.unlockedAchievements = [];
            this.totalPoints = 0;
            this.currentLevel = 1;
            this.streaks = { daily: 0, weekly: 0, lastActivity: null };
            this.saveAchievements();
            this.updateAchievementsDisplay();
            console.log('🔄 Achievements resetados');
        }
    },
    
    // Desbloquear todas (para debug)
    unlockAll() {
        if (Config.debug.enabled) {
            Object.keys(Config.achievements.definitions).forEach(id => {
                if (!this.isUnlocked(id)) {
                    this.unlock(id);
                }
            });
            console.log('🏆 Todas as conquistas desbloqueadas');
        }
    }
};

// Expandir definições de achievements no Config
if (Config.achievements && Config.achievements.definitions) {
    // Adicionar conquistas extras que estavam faltando
    Object.assign(Config.achievements.definitions, {
        'task_veteran': {
            title: 'Veterano das Tarefas',
            description: 'Concluiu 50 tarefas',
            icon: '🎖️',
            points: 100
        },
        'task_legend': {
            title: 'Lenda das Tarefas',
            description: 'Concluiu 100 tarefas',
            icon: '👑',
            points: 200
        },
        'urgent_solver': {
            title: 'Solucionador Urgente',
            description: 'Concluiu 5 tarefas de alta prioridade',
            icon: '🚨',
            points: 50
        },
        'punctual_performer': {
            title: 'Sempre no Prazo',
            description: 'Concluiu 10 tarefas dentro do prazo',
            icon: '⏰',
            points: 75
        },
        'wealthy_saver': {
            title: 'Poupador Rico',
            description: 'Manteve saldo positivo acima de R$ 5.000',
            icon: '💎',
            points: 150
        },
        'financial_master': {
            title: 'Mestre Financeiro',
            description: 'Manteve saldo positivo acima de R$ 10.000',
            icon: '🏦',
            points: 250
        },
        'transaction_tracker': {
            title: 'Rastreador de Gastos',
            description: 'Registrou 50 transações',
            icon: '📊',
            points: 60
        },
        'frugal_month': {
            title: 'Mês Frugal',
            description: 'Passou um mês gastando apenas com itens essenciais',
            icon: '🎯',
            points: 100
        },
        'goal_crusher': {
            title: 'Destruidor de Metas',
            description: 'Alcançou 5 metas',
            icon: '💪',
            points: 150
        },
        'big_dreamer': {
            title: 'Grande Sonhador',
            description: 'Alcançou uma meta financeira de R$ 10.000+',
            icon: '🌟',
            points: 200
        },
        'style_master': {
            title: 'Mestre do Estilo',
            description: 'Personalizou o tema da interface',
            icon: '🎨',
            points: 25
        },
        'team_leader': {
            title: 'Líder de Equipe',
            description: 'Possui uma equipe de 5+ membros',
            icon: '👨‍💼',
            points: 100
        },
        'week_veteran': {
            title: 'Veterano de Uma Semana',
            description: 'Usou o Visionfin por 7 dias',
            icon: '📅',
            points: 30
        },
        'month_veteran': {
            title: 'Veterano de Um Mês',
            description: 'Usou o Visionfin por 30 dias',
            icon: '🗓️',
            points: 100
        },
        'daily_streak_3': {
            title: 'Sequência de 3 Dias',
            description: 'Usou o sistema 3 dias seguidos',
            icon: '🔥',
            points: 25
        },
        'daily_streak_7': {
            title: 'Sequência de 1 Semana',
            description: 'Usou o sistema 7 dias seguidos',
            icon: '🔥🔥',
            points: 75
        },
        'daily_streak_30': {
            title: 'Sequência de 1 Mês',
            description: 'Usou o sistema 30 dias seguidos',
            icon: '🔥🔥🔥',
            points: 200
        },
        'night_owl': {
            title: 'Coruja Noturna',
            description: 'Usou o sistema durante a madrugada',
            icon: '🦉',
            points: 20
        },
        'weekend_warrior': {
            title: 'Guerreiro de Fim de Semana',
            description: 'Usou o sistema no fim de semana',
            icon: '⚔️',
            points: 15
        }
    });
}

// Integração automática com eventos do sistema
if (typeof window !== 'undefined') {
    // Escutar eventos globais para verificar achievements automaticamente
    const originalSaveData = window.saveData;
    window.saveData = function() {
        if (originalSaveData) originalSaveData();
        if (window.Achievements && typeof Achievements.checkAll === 'function') {
            setTimeout(() => Achievements.checkAll(), 100);
        }
    };
}

// Debug functions (apenas em modo debug)
if (Config.debug.enabled) {
    window.AchievementsDebug = {
        unlock: (id) => Achievements.unlock(id),
        unlockAll: () => Achievements.unlockAll(),
        reset: () => Achievements.reset(),
        getStats: () => Achievements.getStats(),
        checkAll: () => Achievements.checkAll(),
        exportData: () => Achievements.exportAchievements()
    };
    console.log('🐛 Debug de Achievements ativo. Use AchievementsDebug no console.');
}