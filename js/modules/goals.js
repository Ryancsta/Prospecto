/**
 * LifeManager - Módulo de Metas
 * Gerencia metas pessoais e financeiras
 */

window.Goals = {
    currentFilter: 'all',
    currentSort: 'deadline',
    
    // Inicializar módulo
    initialize() {
        this.setupControls();
        this.setupProgressTracking();
        return true;
    },
    
    // Configurar controles
    setupControls() {
        this.createFilterControls();
        this.setupGoalTypeToggle();
    },
    
    // Criar controles de filtro
    createFilterControls() {
        const header = document.querySelector('.kanban-header');
        if (!header || document.getElementById('goalFilters')) return;
        
        const filtersDiv = document.createElement('div');
        filtersDiv.id = 'goalFilters';
        filtersDiv.style.cssText = `
            display: flex;
            gap: 12px;
            align-items: center;
            margin-left: auto;
            margin-right: 12px;
        `;
        
        filtersDiv.innerHTML = `
            <select id="goalTypeFilter" onchange="Goals.applyFilters()" style="
                padding: 8px 12px;
                border: 2px solid #e8eaed;
                border-radius: 8px;
                font-size: 14px;
                background: white;
            ">
                <option value="all">Todos os Tipos</option>
                <option value="financial">💰 Financeiras</option>
                <option value="personal">🎯 Pessoais</option>
            </select>
            
            <select id="goalStatusFilter" onchange="Goals.applyFilters()" style="
                padding: 8px 12px;
                border: 2px solid #e8eaed;
                border-radius: 8px;
                font-size: 14px;
                background: white;
            ">
                <option value="all">Todos os Status</option>
                <option value="active">Em Andamento</option>
                <option value="completed">Concluídas</option>
                <option value="overdue">Atrasadas</option>
            </select>
            
            <select id="goalSort" onchange="Goals.applySort()" style="
                padding: 8px 12px;
                border: 2px solid #e8eaed;
                border-radius: 8px;
                font-size: 14px;
                background: white;
            ">
                <option value="deadline">Prazo</option>
                <option value="progress">Progresso</option>
                <option value="created">Mais Recentes</option>
                <option value="name">Nome</option>
            </select>
        `;
        
        const newGoalBtn = header.querySelector('.btn');
        header.insertBefore(filtersDiv, newGoalBtn);
    },
    
    // Configurar toggle do tipo de meta no modal
    setupGoalTypeToggle() {
        const goalTypeSelect = document.getElementById('goalType');
        if (goalTypeSelect && !goalTypeSelect.hasAttribute('data-configured')) {
            goalTypeSelect.setAttribute('data-configured', 'true');
            goalTypeSelect.addEventListener('change', this.toggleGoalFields);
        }
    },
    
    // Alternar campos baseado no tipo de meta
    toggleGoalFields() {
        const type = document.getElementById('goalType').value;
        const amountGroup = document.getElementById('goalAmountGroup');
        const amountInput = document.getElementById('goalAmount');
        
        if (type === 'financial') {
            amountGroup.style.display = 'block';
            amountInput.required = true;
        } else {
            amountGroup.style.display = 'none';
            amountInput.required = false;
        }
    },
    
    // Carregar dados do módulo
    loadData() {
        this.renderGoals();
        this.updateGoalsStats();
    },
    
    // Renderizar metas
    renderGoals() {
        const list = document.getElementById('goalsList');
        if (!list) return;
        
        const goals = this.getFilteredAndSortedGoals();
        
        if (goals.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 60px; color: #666;">
                    <div style="font-size: 4em; margin-bottom: 24px;">🎯</div>
                    <h3 style="color: #333; margin-bottom: 12px;">Defina suas metas!</h3>
                    <p style="margin-bottom: 24px;">Transforme seus sonhos em objetivos concretos</p>
                    <button class="btn" onclick="openModal('goalModal')">Criar Primeira Meta</button>
                </div>
            `;
            return;
        }
        
        list.innerHTML = goals.map(goal => this.createGoalHTML(goal)).join('');
    },
    
    // Criar HTML da meta
    createGoalHTML(goal) {
        const isFinancial = goal.type === 'financial';
        const progress = this.calculateProgress(goal);
        const status = this.getGoalStatus(goal);
        const timeInfo = this.getTimeInfo(goal);
        
        return `
            <div class="goal-item ${status.class}" data-goal-id="${goal.id}" style="position: relative;">
                ${status.badge ? `
                    <div class="goal-status-badge" style="
                        position: absolute;
                        top: 16px;
                        right: 16px;
                        background: ${status.badge.color};
                        color: white;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 0.7em;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    ">${status.badge.text}</div>
                ` : ''}
                
                <div class="goal-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px; padding-right: ${status.badge ? '80px' : '0'};">
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 8px 0; color: #333; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                            ${isFinancial ? '💰' : '🎯'} ${goal.name}
                            ${progress >= 100 ? '<span style="font-size: 0.8em;">🏆</span>' : ''}
                        </h3>
                        <p style="margin: 0; color: #666; line-height: 1.4;">
                            ${goal.description || 'Sem descrição'}
                        </p>
                    </div>
                </div>
                
                ${isFinancial ? `
                    <div class="goal-financial-info" style="display: flex; justify-content: space-between; margin-bottom: 12px; padding: 12px; background: rgba(102, 126, 234, 0.05); border-radius: 8px;">
                        <div>
                            <div style="font-size: 0.8em; color: #666; margin-bottom: 2px;">Valor Atual</div>
                            <div style="font-weight: 700; color: #4caf50; font-size: 1.1em;">
                                ${this.formatCurrency(goal.currentAmount)}
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 0.8em; color: #666; margin-bottom: 2px;">Restante</div>
                            <div style="font-weight: 700; color: #ff9800;">
                                ${this.formatCurrency(Math.max(0, goal.amount - goal.currentAmount))}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.8em; color: #666; margin-bottom: 2px;">Meta</div>
                            <div style="font-weight: 700; color: #667eea;">
                                ${this.formatCurrency(goal.amount)}
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <div class="goal-progress-section" style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 600; color: #333;">Progresso</span>
                        <span style="font-weight: 700; color: ${progress >= 100 ? '#4caf50' : '#667eea'}; font-size: 1.1em;">
                            ${progress.toFixed(1)}%
                        </span>
                    </div>
                    
                    <div class="goal-progress" style="background: #f0f0f0; border-radius: 12px; height: 12px; overflow: hidden; position: relative;">
                        <div class="goal-progress-bar" style="
                            height: 100%;
                            width: ${Math.min(progress, 100)}%;
                            background: ${progress >= 100 ? 
                                'linear-gradient(135deg, #4caf50, #66bb6a)' : 
                                'linear-gradient(135deg, #667eea, #764ba2)'};
                            border-radius: 12px;
                            transition: width 0.6s ease;
                            position: relative;
                        ">
                            ${progress >= 100 ? `
                                <div style="
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                                    animation: shimmer 2s infinite;
                                "></div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="goal-time-info" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 8px 12px; background: ${timeInfo.bgColor}; border-radius: 8px; border-left: 4px solid ${timeInfo.borderColor};">
                    <div>
                        <div style="font-size: 0.8em; color: #666;">Prazo</div>
                        <div style="font-weight: 600; color: ${timeInfo.textColor};">
                            ${timeInfo.text}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.8em; color: #666;">Data</div>
                        <div style="font-weight: 600;">
                            ${this.formatDate(goal.deadline)}
                        </div>
                    </div>
                </div>
                
                <div class="goal-actions" style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="goal-meta" style="font-size: 0.8em; color: #999;">
                        Criada ${this.formatTimeAgo(goal.createdAt)}
                    </div>
                    
                    <div style="display: flex; gap: 8px;">
                        <button class="task-btn btn-edit" onclick="Goals.updateProgress(${goal.id})" title="${isFinancial ? 'Atualizar valor' : 'Atualizar progresso'}" style="background: linear-gradient(135deg, #4caf50, #66bb6a);">
                            ${isFinancial ? '💰' : '📈'}
                        </button>
                        <button class="task-btn btn-edit" onclick="Goals.editGoal(${goal.id})" title="Editar meta">
                            ✏️
                        </button>
                        <button class="task-btn btn-delete" onclick="deleteGoal(${goal.id})" title="Excluir meta">
                            🗑️
                        </button>
                    </div>
                </div>
                
                ${progress >= 100 ? `
                    <div class="goal-celebration" style="
                        margin-top: 12px;
                        padding: 12px;
                        background: linear-gradient(135deg, #ffd700, #ffed4e);
                        color: #8b6914;
                        border-radius: 8px;
                        text-align: center;
                        font-weight: 600;
                    ">
                        🎉 Parabéns! Meta alcançada! 🏆
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    // Calcular progresso da meta
    calculateProgress(goal) {
        if (goal.type === 'financial') {
            return goal.amount > 0 ? (goal.currentAmount / goal.amount * 100) : 0;
        }
        return goal.progress || 0;
    },
    
    // Obter status da meta
    getGoalStatus(goal) {
        const progress = this.calculateProgress(goal);
        const deadline = new Date(goal.deadline);
        const now = new Date();
        
        if (progress >= 100) {
            return {
                class: 'goal-completed',
                badge: { text: 'Concluída', color: '#4caf50' }
            };
        }
        
        if (deadline < now) {
            return {
                class: 'goal-overdue',
                badge: { text: 'Atrasada', color: '#f44336' }
            };
        }
        
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 7) {
            return {
                class: 'goal-urgent',
                badge: { text: 'Urgente', color: '#ff9800' }
            };
        }
        
        if (progress > 0) {
            return {
                class: 'goal-active',
                badge: { text: 'Ativa', color: '#2196f3' }
            };
        }
        
        return {
            class: 'goal-pending',
            badge: null
        };
    },
    
    // Obter informações de tempo
    getTimeInfo(goal) {
        const deadline = new Date(goal.deadline);
        const now = new Date();
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        
        if (daysLeft < 0) {
            const daysOverdue = Math.abs(daysLeft);
            return {
                text: `Atrasada ${daysOverdue} dia${daysOverdue !== 1 ? 's' : ''}`,
                textColor: '#f44336',
                bgColor: 'rgba(244, 67, 54, 0.1)',
                borderColor: '#f44336'
            };
        }
        
        if (daysLeft === 0) {
            return {
                text: 'Prazo hoje!',
                textColor: '#ff9800',
                bgColor: 'rgba(255, 152, 0, 0.1)',
                borderColor: '#ff9800'
            };
        }
        
        if (daysLeft === 1) {
            return {
                text: 'Prazo amanhã',
                textColor: '#ff9800',
                bgColor: 'rgba(255, 152, 0, 0.1)',
                borderColor: '#ff9800'
            };
        }
        
        if (daysLeft <= 7) {
            return {
                text: `${daysLeft} dias restantes`,
                textColor: '#ff9800',
                bgColor: 'rgba(255, 152, 0, 0.1)',
                borderColor: '#ff9800'
            };
        }
        
        if (daysLeft <= 30) {
            return {
                text: `${daysLeft} dias restantes`,
                textColor: '#2196f3',
                bgColor: 'rgba(33, 150, 243, 0.1)',
                borderColor: '#2196f3'
            };
        }
        
        return {
            text: `${Math.ceil(daysLeft / 30)} meses restantes`,
            textColor: '#4caf50',
            bgColor: 'rgba(76, 175, 80, 0.1)',
            borderColor: '#4caf50'
        };
    },
    
    // Obter metas filtradas e ordenadas
    getFilteredAndSortedGoals() {
        let goals = [...userData.goals];
        
        // Aplicar filtros
        const typeFilter = document.getElementById('goalTypeFilter')?.value;
        if (typeFilter && typeFilter !== 'all') {
            goals = goals.filter(goal => goal.type === typeFilter);
        }
        
        const statusFilter = document.getElementById('goalStatusFilter')?.value;
        if (statusFilter && statusFilter !== 'all') {
            goals = this.filterByStatus(goals, statusFilter);
        }
        
        // Aplicar ordenação
        const sortBy = document.getElementById('goalSort')?.value || 'deadline';
        goals = this.sortGoals(goals, sortBy);
        
        return goals;
    },
    
    // Filtrar por status
    filterByStatus(goals, status) {
        const now = new Date();
        
        switch(status) {
            case 'active':
                return goals.filter(goal => {
                    const progress = this.calculateProgress(goal);
                    return progress < 100 && new Date(goal.deadline) >= now;
                });
            case 'completed':
                return goals.filter(goal => this.calculateProgress(goal) >= 100);
            case 'overdue':
                return goals.filter(goal => {
                    const progress = this.calculateProgress(goal);
                    return progress < 100 && new Date(goal.deadline) < now;
                });
            default:
                return goals;
        }
    },
    
    // Ordenar metas
    sortGoals(goals, sortBy) {
        return goals.sort((a, b) => {
            switch(sortBy) {
                case 'progress':
                    return this.calculateProgress(b) - this.calculateProgress(a);
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'deadline':
                default:
                    return new Date(a.deadline) - new Date(b.deadline);
            }
        });
    },
    
    // Aplicar filtros
    applyFilters() {
        this.renderGoals();
    },
    
    // Aplicar ordenação
    applySort() {
        this.renderGoals();
    },
    
    // Atualizar progresso da meta
    updateProgress(goalId) {
        const goal = userData.goals.find(g => g.id === goalId);
        if (!goal) return;
        
        if (goal.type === 'financial') {
            this.updateFinancialProgress(goal);
        } else {
            this.updatePersonalProgress(goal);
        }
    },
    
    // Atualizar progresso financeiro
    updateFinancialProgress(goal) {
        const currentFormatted = this.formatCurrency(goal.currentAmount);
        const targetFormatted = this.formatCurrency(goal.amount);
        
        const newAmount = prompt(
            `💰 Atualizar progresso: "${goal.name}"\n\n` +
            `Meta: ${targetFormatted}\n` +
            `Atual: ${currentFormatted}\n\n` +
            `Quanto você já juntou?`,
            goal.currentAmount.toFixed(2)
        );
        
        if (newAmount !== null && !isNaN(newAmount)) {
            const amount = parseFloat(newAmount);
            if (amount >= 0) {
                goal.currentAmount = amount;
                
                // Verificar se atingiu a meta
                if (amount >= goal.amount) {
                    this.celebrateGoalCompletion(goal);
                }
                
                this.saveAndRefresh();
            } else {
                Notifications.show('Valor deve ser positivo!', 'error');
            }
        }
    },
    
    // Atualizar progresso pessoal
    updatePersonalProgress(goal) {
        const newProgress = prompt(
            `🎯 Atualizar progresso: "${goal.name}"\n\n` +
            `Progresso atual: ${goal.progress.toFixed(1)}%\n\n` +
            `Qual o novo progresso? (0-100)`,
            goal.progress.toString()
        );
        
        if (newProgress !== null && !isNaN(newProgress)) {
            const progress = Math.min(Math.max(parseFloat(newProgress), 0), 100);
            goal.progress = progress;
            
            // Verificar se atingiu a meta
            if (progress >= 100) {
                this.celebrateGoalCompletion(goal);
            }
            
            this.saveAndRefresh();
        }
    },
    
    // Celebrar conclusão da meta
    celebrateGoalCompletion(goal) {
        // Marcar como concluída
        if (!goal.completedAt) {
            goal.completedAt = new Date().toISOString();
        }
        
        // Efeitos visuais
        Notifications.celebrate('🎉🎯');
        Notifications.show(`🏆 Parabéns! Meta "${goal.name}" alcançada! 🎉`, 'success');
        
        // Achievement
        if (window.Achievements) {
            Achievements.unlock('goal_achiever');
        }
        
        // Som de celebração
        if (Notifications.playSound) {
            Notifications.playSound('achievement');
        }
    },
    
    // Editar meta
    editGoal(goalId) {
        const goal = userData.goals.find(g => g.id === goalId);
        if (!goal) return;
        
        // Preencher formulário
        document.getElementById('goalName').value = goal.name;
        document.getElementById('goalType').value = goal.type;
        document.getElementById('goalDeadline').value = goal.deadline;
        document.getElementById('goalDescription').value = goal.description || '';
        
        if (goal.type === 'financial') {
            document.getElementById('goalAmount').value = goal.amount;
        }
        
        // Atualizar campos baseado no tipo
        this.toggleGoalFields();
        
        // Configurar para modo edição
        const form = document.getElementById('goalForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Atualizar Meta';
        
        const originalSubmit = form.onsubmit;
        form.onsubmit = (e) => {
            e.preventDefault();
            
            // Validar dados
            const goalData = {
                name: document.getElementById('goalName').value.trim(),
                type: document.getElementById('goalType').value,
                deadline: document.getElementById('goalDeadline').value,
                description: document.getElementById('goalDescription').value.trim()
            };
            
            if (goalData.type === 'financial') {
                goalData.amount = parseFloat(document.getElementById('goalAmount').value);
            }
            
            if (window.Validation) {
                const validation = Validation.goal(goalData);
                if (!validation.valid) {
                    Notifications.show(validation.message, 'error');
                    return;
                }
            }
            
            // Atualizar meta
            goal.name = goalData.name;
            goal.type = goalData.type;
            goal.deadline = goalData.deadline;
            goal.description = goalData.description;
            
            if (goalData.type === 'financial') {
                goal.amount = goalData.amount;
            }
            
            this.saveAndRefresh();
            closeModal('goalModal');
            Notifications.show('Meta atualizada! ✏️', 'success');
            
            // Restaurar formulário
            submitBtn.textContent = originalText;
            form.onsubmit = originalSubmit;
        };
        
        openModal('goalModal');
    },
    
    // Salvar e atualizar
    saveAndRefresh() {
        this.renderGoals();
        this.updateGoalsStats();
        
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        
        saveData();
    },
    
    // Atualizar estatísticas das metas
    updateGoalsStats() {
        // Adicionar estatísticas no final da lista se não existir
        let statsContainer = document.getElementById('goalsStats');
        
        if (!statsContainer) {
            statsContainer = document.createElement('div');
            statsContainer.id = 'goalsStats';
            statsContainer.style.cssText = `
                margin-top: 32px;
                padding: 24px;
                background: rgba(255,255,255,0.9);
                border-radius: 16px;
                border: 1px solid rgba(255,255,255,0.3);
            `;
            
            const goalsList = document.getElementById('goalsList');
            if (goalsList && goalsList.parentNode) {
                goalsList.parentNode.appendChild(statsContainer);
            }
        }
        
        const stats = this.getGoalStats();
        
        statsContainer.innerHTML = `
            <h3 style="margin-bottom: 20px; color: #333; font-weight: 700;">📊 Estatísticas das Metas</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div style="text-align: center; padding: 16px;">
                    <div style="font-size: 2em; font-weight: 800; color: #667eea; margin-bottom: 4px;">
                        ${stats.total}
                    </div>
                    <div style="color: #666; font-weight: 600; text-transform: uppercase; font-size: 0.8em;">
                        Total de Metas
                    </div>
                </div>
                
                <div style="text-align: center; padding: 16px;">
                    <div style="font-size: 2em; font-weight: 800; color: #4caf50; margin-bottom: 4px;">
                        ${stats.completed}
                    </div>
                    <div style="color: #666; font-weight: 600; text-transform: uppercase; font-size: 0.8em;">
                        Concluídas
                    </div>
                </div>
                
                <div style="text-align: center; padding: 16px;">
                    <div style="font-size: 2em; font-weight: 800; color: #2196f3; margin-bottom: 4px;">
                        ${stats.inProgress}
                    </div>
                    <div style="color: #666; font-weight: 600; text-transform: uppercase; font-size: 0.8em;">
                        Em Andamento
                    </div>
                </div>
                
                <div style="text-align: center; padding: 16px;">
                    <div style="font-size: 2em; font-weight: 800; color: ${stats.overdue > 0 ? '#f44336' : '#999'}; margin-bottom: 4px;">
                        ${stats.overdue}
                    </div>
                    <div style="color: #666; font-weight: 600; text-transform: uppercase; font-size: 0.8em;">
                        Atrasadas
                    </div>
                </div>
            </div>
            
            ${stats.total > 0 ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 600;">Taxa de Conclusão</span>
                        <span style="font-weight: 700; color: #4caf50;">${stats.completionRate.toFixed(1)}%</span>
                    </div>
                    <div style="background: #f0f0f0; border-radius: 8px; height: 8px; overflow: hidden;">
                        <div style="
                            height: 100%;
                            width: ${stats.completionRate}%;
                            background: linear-gradient(135deg, #4caf50, #66bb6a);
                            border-radius: 8px;
                            transition: width 0.6s ease;
                        "></div>
                    </div>
                </div>
            ` : ''}
        `;
    },
    
    // Obter estatísticas das metas
    getGoalStats() {
        const now = new Date();
        
        const completed = userData.goals.filter(goal => this.calculateProgress(goal) >= 100).length;
        const overdue = userData.goals.filter(goal => {
            const progress = this.calculateProgress(goal);
            return progress < 100 && new Date(goal.deadline) < now;
        }).length;
        const inProgress = userData.goals.filter(goal => {
            const progress = this.calculateProgress(goal);
            return progress > 0 && progress < 100 && new Date(goal.deadline) >= now;
        }).length;
        
        return {
            total: userData.goals.length,
            completed,
            inProgress,
            overdue,
            completionRate: userData.goals.length > 0 ? (completed / userData.goals.length * 100) : 0,
            averageProgress: userData.goals.length > 0 ? 
                userData.goals.reduce((sum, goal) => sum + this.calculateProgress(goal), 0) / userData.goals.length : 0
        };
    },
    
    // Refresh do módulo
    refresh() {
        this.loadData();
    },
    
    // Utilitários
    formatCurrency(amount) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    },
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    },
    
    formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'agora';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
        return date.toLocaleDateString('pt-BR');
    }
};

// Função global para compatibilidade
window.toggleGoalFields = function() {
    Goals.toggleGoalFields();
};

window.updateGoalProgress = function(goalId) {
    Goals.updateProgress(goalId);
};

// Adicionar estilos CSS específicos para metas
if (!document.getElementById('goals-styles')) {
    const style = document.createElement('style');
    style.id = 'goals-styles';
    style.textContent = `
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .goal-completed {
            border-left: 4px solid #4caf50 !important;
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.05), rgba(255, 255, 255, 0.95)) !important;
        }
        
        .goal-overdue {
            border-left: 4px solid #f44336 !important;
            background: linear-gradient(135deg, rgba(244, 67, 54, 0.05), rgba(255, 255, 255, 0.95)) !important;
        }
        
        .goal-urgent {
            border-left: 4px solid #ff9800 !important;
            background: linear-gradient(135deg, rgba(255, 152, 0, 0.05), rgba(255, 255, 255, 0.95)) !important;
        }
        
        .goal-active {
            border-left: 4px solid #2196f3 !important;
        }
        
        .goal-item {
            transition: all 0.3s ease;
        }
        
        .goal-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(style);
}