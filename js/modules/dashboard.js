/**
 * LifeManager - Módulo Dashboard
 * Gerencia estatísticas e visão geral do sistema
 */

window.Dashboard = {
    // Dados de cache
    cache: {
        stats: null,
        lastUpdate: null
    },
    
    // Inicializar dashboard
    initialize() {
        this.setupEventListeners();
        return true;
    },
    
    // Configurar eventos
    setupEventListeners() {
        // Atualizar dashboard quando dados mudarem
        document.addEventListener('dataUpdated', () => {
            this.refresh();
        });
        
        // Clique no card de tarefas
        const tasksCard = document.querySelector('[onclick*="switchTab(\'tasks\')"]');
        if (tasksCard) {
            tasksCard.style.cursor = 'pointer';
        }
    },
    
    // Carregar dados do dashboard
    loadData() {
        if (!currentUser) return;
        
        this.updateStats();
        this.updateCharts();
        this.updateActivity();
        
        this.cache.lastUpdate = new Date();
    },
    
    // Atualizar estatísticas
    updateStats() {
        const stats = this.calculateStats();
        
        // Atualizar cards do dashboard
        this.updateStatsCards(stats);
        
        // Salvar no cache
        this.cache.stats = stats;
    },
    
    // Calcular estatísticas
    calculateStats() {
        if (!userData) return null;
        
        const now = new Date();
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Estatísticas de tarefas
        const tasks = {
            total: userData.tasks.length,
            active: userData.tasks.filter(t => t.status !== 'done').length,
            completed: userData.tasks.filter(t => t.status === 'done').length,
            completedThisWeek: userData.tasks.filter(t => 
                t.status === 'done' && new Date(t.createdAt) >= thisWeek
            ).length,
            overdue: userData.tasks.filter(t => 
                t.deadline && new Date(t.deadline) < now && t.status !== 'done'
            ).length
        };
        
        // Estatísticas financeiras
        const thisMonthTransactions = userData.transactions.filter(t => 
            new Date(t.date) >= thisMonth
        );
        
        const income = userData.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const expenses = userData.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const thisMonthIncome = thisMonthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const thisMonthExpenses = thisMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const finances = {
            balance: income - expenses,
            totalIncome: income,
            totalExpenses: expenses,
            monthlyIncome: thisMonthIncome,
            monthlyExpenses: thisMonthExpenses,
            monthlyBalance: thisMonthIncome - thisMonthExpenses,
            transactions: userData.transactions.length
        };
        
        // Estatísticas de metas
        const completedGoals = userData.goals.filter(g => {
            if (g.type === 'financial') {
                return g.currentAmount >= g.amount;
            }
            return g.progress >= 100;
        });
        
        const goals = {
            total: userData.goals.length,
            completed: completedGoals.length,
            inProgress: userData.goals.filter(g => {
                if (g.type === 'financial') {
                    return g.currentAmount > 0 && g.currentAmount < g.amount;
                }
                return g.progress > 0 && g.progress < 100;
            }).length,
            overdue: userData.goals.filter(g => 
                new Date(g.deadline) < now && (
                    g.type === 'financial' ? g.currentAmount < g.amount : g.progress < 100
                )
            ).length
        };
        
        // Score da semana (0-100)
        const weekScore = Math.min(tasks.completedThisWeek * 10 + completedGoals.length * 5, 100);
        
        // Tendências
        const trends = this.calculateTrends();
        
        return {
            tasks,
            finances,
            goals,
            weekScore,
            trends,
            lastUpdate: new Date().toISOString()
        };
    },
    
    // Calcular tendências
    calculateTrends() {
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        // Tarefas concluídas: semana atual vs anterior
        const thisWeekTasks = userData.tasks.filter(t => 
            t.status === 'done' && new Date(t.createdAt) >= lastWeek
        ).length;
        
        const lastWeekTasks = userData.tasks.filter(t => 
            t.status === 'done' && 
            new Date(t.createdAt) >= twoWeeksAgo && 
            new Date(t.createdAt) < lastWeek
        ).length;
        
        // Gastos: semana atual vs anterior
        const thisWeekExpenses = userData.transactions
            .filter(t => t.type === 'expense' && new Date(t.date) >= lastWeek)
            .reduce((sum, t) => sum + t.amount, 0);
            
        const lastWeekExpenses = userData.transactions
            .filter(t => 
                t.type === 'expense' && 
                new Date(t.date) >= twoWeeksAgo && 
                new Date(t.date) < lastWeek
            )
            .reduce((sum, t) => sum + t.amount, 0);
        
        return {
            tasks: this.calculateTrend(thisWeekTasks, lastWeekTasks),
            expenses: this.calculateTrend(lastWeekExpenses, thisWeekExpenses), // Invertido: menos gasto é melhor
            productivity: this.calculateProductivityTrend()
        };
    },
    
    // Calcular tendência individual
    calculateTrend(current, previous) {
        if (previous === 0) {
            return current > 0 ? 'up' : 'stable';
        }
        
        const change = ((current - previous) / previous) * 100;
        
        if (change > 5) return 'up';
        if (change < -5) return 'down';
        return 'stable';
    },
    
    // Calcular tendência de produtividade
    calculateProductivityTrend() {
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const recentTasks = userData.tasks.filter(t => new Date(t.createdAt) >= lastWeek);
        const completedRecent = recentTasks.filter(t => t.status === 'done').length;
        
        if (recentTasks.length === 0) return 'stable';
        
        const completionRate = completedRecent / recentTasks.length;
        
        if (completionRate >= 0.8) return 'up';
        if (completionRate <= 0.4) return 'down';
        return 'stable';
    },
    
    // Atualizar cards de estatísticas
    updateStatsCards(stats) {
        // Card de tarefas ativas
        this.updateCard('activeTasks', stats.tasks.active, {
            trend: stats.trends.tasks,
            subtitle: `${stats.tasks.completed} concluídas`
        });
        
        // Card de saldo
        this.updateCard('currentBalance', this.formatCurrency(stats.finances.balance), {
            subtitle: stats.finances.balance >= 0 ? 'Saldo positivo' : 'Saldo negativo',
            color: stats.finances.balance >= 0 ? 'success' : 'danger'
        });
        
        // Card de metas
        const goalsProgress = stats.goals.total > 0 ? 
            (stats.goals.completed / stats.goals.total * 100) : 0;
        this.updateCard('goalsProgress', `${goalsProgress.toFixed(0)}%`, {
            subtitle: `${stats.goals.completed}/${stats.goals.total} metas`
        });
        
        // Card de score
        this.updateCard('weekScore', stats.weekScore, {
            subtitle: 'Score da semana',
            trend: stats.trends.productivity
        });
    },
    
    // Atualizar card individual
    updateCard(elementId, value, options = {}) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.textContent = value;
        
        // Atualizar cor se especificada
        if (options.color) {
            const card = element.closest('.dashboard-card');
            if (card) {
                const icon = card.querySelector('.card-icon');
                if (icon) {
                    switch(options.color) {
                        case 'success':
                            icon.style.background = 'linear-gradient(135deg, #4caf50, #66bb6a)';
                            break;
                        case 'danger':
                            icon.style.background = 'linear-gradient(135deg, #f44336, #ef5350)';
                            break;
                        case 'warning':
                            icon.style.background = 'linear-gradient(135deg, #ff9800, #ffb74d)';
                            break;
                    }
                }
            }
        }
        
        // Adicionar indicador de tendência
        if (options.trend) {
            this.addTrendIndicator(element, options.trend);
        }
    },
    
    // Adicionar indicador de tendência
    addTrendIndicator(element, trend) {
        const card = element.closest('.dashboard-card');
        if (!card) return;
        
        // Remover indicador existente
        const existingTrend = card.querySelector('.trend-indicator');
        if (existingTrend) existingTrend.remove();
        
        if (trend === 'stable') return;
        
        const indicator = document.createElement('div');
        indicator.className = 'trend-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            font-size: 1.2em;
            opacity: 0.7;
        `;
        
        switch(trend) {
            case 'up':
                indicator.textContent = '📈';
                indicator.title = 'Tendência positiva';
                break;
            case 'down':
                indicator.textContent = '📉';
                indicator.title = 'Tendência negativa';
                break;
        }
        
        card.appendChild(indicator);
    },
    
    // Atualizar gráficos
    updateCharts() {
        this.updateWeeklyChart();
        this.updateCategoryChart();
    },
    
    // Gráfico semanal (simulado com barras CSS)
    updateWeeklyChart() {
        const chartContainer = document.getElementById('weeklyChart');
        if (!chartContainer) return;
        
        const weekData = this.getWeeklyData();
        
        chartContainer.innerHTML = weekData.map((day, index) => `
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                <div style="
                    width: 20px;
                    height: ${day.value * 2}px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 4px 4px 0 0;
                    margin-bottom: 8px;
                    transition: all 0.3s ease;
                " title="${day.value} tarefas concluídas"></div>
                <div style="font-size: 0.8em; color: #666;">${day.label}</div>
            </div>
        `).join('');
    },
    
    // Obter dados da semana
    getWeeklyData() {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dayTasks = userData.tasks.filter(t => {
                if (t.status !== 'done') return false;
                const taskDate = new Date(t.createdAt);
                return taskDate.toDateString() === date.toDateString();
            }).length;
            
            data.push({
                label: days[date.getDay()],
                value: dayTasks,
                date: date.toISOString()
            });
        }
        
        return data;
    },
    
    // Atualizar gráfico de categorias
    updateCategoryChart() {
        const chartContainer = document.getElementById('categoryChart');
        if (!chartContainer) return;
        
        const categoryData = this.getCategoryData();
        const maxValue = Math.max(...categoryData.map(c => c.value));
        
        chartContainer.innerHTML = categoryData.map(category => `
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <div style="width: 80px; font-size: 0.9em; color: #666;">${category.name}</div>
                <div style="flex: 1; margin: 0 12px;">
                    <div style="
                        height: 8px;
                        background: #f0f0f0;
                        border-radius: 4px;
                        overflow: hidden;
                    ">
                        <div style="
                            height: 100%;
                            width: ${(category.value / maxValue * 100)}%;
                            background: ${category.color};
                            border-radius: 4px;
                            transition: width 0.6s ease;
                        "></div>
                    </div>
                </div>
                <div style="width: 60px; text-align: right; font-size: 0.9em; font-weight: 600;">
                    ${this.formatCurrency(category.value)}
                </div>
            </div>
        `).join('');
    },
    
    // Obter dados por categoria
    getCategoryData() {
        const categories = {};
        
        userData.transactions.forEach(t => {
            if (t.type === 'expense') {
                if (!categories[t.category]) {
                    categories[t.category] = 0;
                }
                categories[t.category] += t.amount;
            }
        });
        
        const colors = [
            'linear-gradient(135deg, #ff6b6b, #ee5a52)',
            'linear-gradient(135deg, #4ecdc4, #44a08d)',
            'linear-gradient(135deg, #45b7d1, #96c93d)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)'
        ];
        
        return Object.entries(categories)
            .map(([category, value], index) => ({
                name: this.getCategoryName(category),
                value,
                color: colors[index % colors.length]
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    },
    
    // Obter nome da categoria
    getCategoryName(category) {
        const names = {
            food: 'Alimentação',
            transport: 'Transporte',
            housing: 'Moradia',
            health: 'Saúde',
            entertainment: 'Lazer',
            education: 'Educação',
            shopping: 'Compras',
            bills: 'Contas',
            other: 'Outros'
        };
        return names[category] || 'Outros';
    },
    
    // Atualizar atividade recente
    updateActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;
        
        const activities = this.getRecentActivities();
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 3em; margin-bottom: 16px;">🎯</div>
                    <h4>Comece sua jornada!</h4>
                    <p>Suas atividades aparecerão aqui conforme você usar o sistema</p>
                    <button class="btn" style="margin-top: 16px;" onclick="showWelcomeDemo()">Ver Demonstração</button>
                </div>
            `;
        } else {
            container.innerHTML = activities.map(activity => `
                <div class="transaction-item" style="border-left: 4px solid ${activity.color};">
                    <div>
                        <div style="font-weight: 600; margin-bottom: 4px;">
                            ${activity.icon} ${activity.text}
                        </div>
                        <div style="color: #666; font-size: 0.9em;">
                            ${activity.time}
                        </div>
                    </div>
                    ${activity.value ? `<div style="font-weight: 600; color: ${activity.color};">${activity.value}</div>` : ''}
                </div>
            `).join('');
        }
    },
    
    // Obter atividades recentes
    getRecentActivities() {
        const activities = [];
        
        // Últimas tarefas
        userData.tasks
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3)
            .forEach(task => {
                activities.push({
                    icon: task.status === 'done' ? '✅' : '📋',
                    text: `${task.status === 'done' ? 'Concluiu' : 'Criou'} tarefa: ${task.title}`,
                    time: this.formatTimeAgo(task.createdAt),
                    color: task.status === 'done' ? '#4caf50' : '#667eea',
                    timestamp: new Date(task.createdAt)
                });
            });
        
        // Últimas transações
        userData.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3)
            .forEach(transaction => {
                activities.push({
                    icon: transaction.type === 'income' ? '💰' : '💸',
                    text: `${transaction.type === 'income' ? 'Receita' : 'Gasto'}: ${transaction.description}`,
                    time: this.formatTimeAgo(transaction.date),
                    value: `${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}`,
                    color: transaction.type === 'income' ? '#4caf50' : '#f44336',
                    timestamp: new Date(transaction.date)
                });
            });
        
        // Últimas metas
        userData.goals
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 2)
            .forEach(goal => {
                activities.push({
                    icon: '🎯',
                    text: `Criou meta: ${goal.name}`,
                    time: this.formatTimeAgo(goal.createdAt),
                    color: '#2196f3',
                    timestamp: new Date(goal.createdAt)
                });
            });
        
        return activities
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 6);
    },
    
    // Refresh do dashboard
    refresh() {
        this.loadData();
    },
    
    // Formatação
    formatCurrency(amount) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    },
    
    formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Agora há pouco';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
        return date.toLocaleDateString('pt-BR');
    },
    
    // Obter estatísticas para outros módulos
    getStats() {
        return this.cache.stats;
    },
    
    // Verificar se precisa atualizar
    needsUpdate() {
        if (!this.cache.lastUpdate) return true;
        
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return this.cache.lastUpdate < fiveMinutesAgo;
    }
};