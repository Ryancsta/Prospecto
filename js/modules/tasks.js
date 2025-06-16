/**
 * LifeManager - Módulo de Tarefas
 * Gerencia sistema Kanban e operações de tarefas
 */

window.Tasks = {
    currentFilter: 'all',
    currentSort: 'created',
    
    // Inicializar módulo
    initialize() {
        this.setupDragAndDrop();
        this.setupFilters();
        this.setupKeyboardShortcuts();
        return true;
    },
    
    // Configurar drag and drop
    setupDragAndDrop() {
        // Configurar colunas como drop zones
        const columns = document.querySelectorAll('.column-content');
        columns.forEach(column => {
            column.addEventListener('dragover', this.handleDragOver);
            column.addEventListener('drop', this.handleDrop.bind(this));
        });
    },
    
    // Configurar filtros
    setupFilters() {
        // Adicionar controles de filtro se não existirem
        this.createFilterControls();
        this.createSortControls();
    },
    
    // Criar controles de filtro
    createFilterControls() {
        const header = document.querySelector('.kanban-header');
        if (!header || document.getElementById('taskFilters')) return;
        
        const filtersDiv = document.createElement('div');
        filtersDiv.id = 'taskFilters';
        filtersDiv.style.cssText = `
            display: flex;
            gap: 12px;
            align-items: center;
            margin-left: auto;
            margin-right: 12px;
        `;
        
        filtersDiv.innerHTML = `
            <select id="priorityFilter" onchange="Tasks.applyFilters()" style="
                padding: 8px 12px;
                border: 2px solid #e8eaed;
                border-radius: 8px;
                font-size: 14px;
                background: white;
            ">
                <option value="all">Todas Prioridades</option>
                <option value="high">🔴 Alta</option>
                <option value="medium">🟡 Média</option>
                <option value="low">🟢 Baixa</option>
            </select>
            
            <select id="deadlineFilter" onchange="Tasks.applyFilters()" style="
                padding: 8px 12px;
                border: 2px solid #e8eaed;
                border-radius: 8px;
                font-size: 14px;
                background: white;
            ">
                <option value="all">Todos Prazos</option>
                <option value="overdue">Atrasadas</option>
                <option value="today">Hoje</option>
                <option value="week">Esta Semana</option>
                <option value="nodate">Sem Prazo</option>
            </select>
            
            <input type="text" id="searchTasks" placeholder="Buscar tarefas..." onkeyup="Tasks.applyFilters()" style="
                padding: 8px 12px;
                border: 2px solid #e8eaed;
                border-radius: 8px;
                font-size: 14px;
                width: 200px;
            ">
        `;
        
        // Inserir antes do botão de nova tarefa
        const newTaskBtn = header.querySelector('.btn');
        header.insertBefore(filtersDiv, newTaskBtn);
    },
    
    // Criar controles de ordenação
    createSortControls() {
        const filtersDiv = document.getElementById('taskFilters');
        if (!filtersDiv) return;
        
        const sortSelect = document.createElement('select');
        sortSelect.id = 'taskSort';
        sortSelect.onchange = () => this.applySort();
        sortSelect.style.cssText = `
            padding: 8px 12px;
            border: 2px solid #e8eaed;
            border-radius: 8px;
            font-size: 14px;
            background: white;
        `;
        
        sortSelect.innerHTML = `
            <option value="created">Mais Recentes</option>
            <option value="priority">Prioridade</option>
            <option value="deadline">Prazo</option>
            <option value="title">Título</option>
        `;
        
        filtersDiv.appendChild(sortSelect);
    },
    
    // Configurar atalhos de teclado
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!currentUser) return;
            
            // Apenas quando não estiver digitando em um input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case 'f':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        document.getElementById('searchTasks')?.focus();
                    }
                    break;
                case '1':
                    this.filterByPriority('high');
                    break;
                case '2':
                    this.filterByPriority('medium');
                    break;
                case '3':
                    this.filterByPriority('low');
                    break;
                case 'Escape':
                    this.clearFilters();
                    break;
            }
        });
    },
    
    // Carregar dados do módulo
    loadData() {
        this.renderAllTasks();
        this.updateColumnCounts();
    },
    
    // Renderizar todas as tarefas
    renderAllTasks() {
        // Limpar colunas
        ['todo', 'progress', 'done'].forEach(status => {
            const column = document.getElementById(`${status}-column`);
            if (column) column.innerHTML = '';
        });
        
        // Renderizar tarefas
        const filteredTasks = this.getFilteredTasks();
        const sortedTasks = this.getSortedTasks(filteredTasks);
        
        sortedTasks.forEach(task => {
            this.renderTask(task);
        });
        
        this.updateColumnCounts();
    },
    
    // Renderizar tarefa individual
    renderTask(task) {
        const card = this.createTaskCard(task);
        const column = document.getElementById(`${task.status}-column`);
        if (column) {
            column.appendChild(card);
        }
    },
    
    // Criar card de tarefa
    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.id = `task-${task.id}`;
        card.draggable = true;
        
        // Eventos de drag
        card.ondragstart = (e) => this.handleDragStart(e);
        card.ondragend = (e) => this.handleDragEnd(e);
        
        // Verificar se está atrasada
        const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
        
        // Calcular dias restantes
        const daysUntilDeadline = task.deadline ? 
            Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
        
        const deadlineClass = isOverdue ? 'overdue' : 
                            daysUntilDeadline !== null && daysUntilDeadline <= 1 ? 'urgent' : '';
        
        const deadlineText = task.deadline ? 
            `<div class="task-deadline ${deadlineClass}" style="font-size: 0.8em; margin-top: 8px; ${
                isOverdue ? 'color: #f44336; font-weight: 600;' : 
                daysUntilDeadline <= 1 ? 'color: #ff9800; font-weight: 600;' : 'color: #666;'
            }">
                📅 ${this.formatDeadline(task.deadline, isOverdue, daysUntilDeadline)}
            </div>` : '';
        
        // Tags de status especiais
        const statusTags = this.getStatusTags(task);
        
        card.innerHTML = `
            <div class="task-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div class="task-priority priority-${task.priority}">${this.getPriorityText(task.priority)}</div>
                <div class="task-menu">
                    <button class="task-menu-btn" onclick="Tasks.showTaskMenu(${task.id})" style="
                        background: none;
                        border: none;
                        font-size: 1.2em;
                        cursor: pointer;
                        color: #999;
                        padding: 4px;
                    ">⋮</button>
                </div>
            </div>
            
            <div class="task-title" style="font-weight: 700; margin-bottom: 8px; color: #333; font-size: 1.05em;">
                ${task.title}
            </div>
            
            ${task.description ? `
                <div class="task-description" style="color: #666; font-size: 0.9em; margin-bottom: 12px; line-height: 1.4;">
                    ${this.truncateText(task.description, 80)}
                </div>
            ` : ''}
            
            ${deadlineText}
            
            ${statusTags.length > 0 ? `
                <div class="task-tags" style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px;">
                    ${statusTags.map(tag => `
                        <span class="task-tag" style="
                            font-size: 0.7em;
                            padding: 2px 6px;
                            border-radius: 4px;
                            background: ${tag.color};
                            color: white;
                            font-weight: 600;
                        ">${tag.text}</span>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="task-footer" style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div class="task-created" style="font-size: 0.75em; color: #999;">
                    Criada ${this.formatTimeAgo(task.createdAt)}
                </div>
                <div class="task-actions" style="display: flex; gap: 6px;">
                    <button class="task-btn btn-edit" onclick="editTask(${task.id})" title="Editar tarefa">
                        ✏️
                    </button>
                    <button class="task-btn btn-delete" onclick="deleteTask(${task.id})" title="Excluir tarefa">
                        🗑️
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar classe de status especial se necessário
        if (isOverdue) card.classList.add('task-overdue');
        if (daysUntilDeadline !== null && daysUntilDeadline <= 1) card.classList.add('task-urgent');
        
        return card;
    },
    
    // Obter tags de status
    getStatusTags(task) {
        const tags = [];
        const now = new Date();
        
        // Tag de nova tarefa (menos de 24h)
        const createdDate = new Date(task.createdAt);
        if (now - createdDate < 24 * 60 * 60 * 1000) {
            tags.push({ text: 'NOVA', color: '#2196f3' });
        }
        
        // Tag de alta prioridade
        if (task.priority === 'high') {
            tags.push({ text: 'URGENTE', color: '#f44336' });
        }
        
        // Tag de tarefa próxima ao prazo
        if (task.deadline) {
            const daysUntil = Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24));
            if (daysUntil <= 1 && daysUntil >= 0) {
                tags.push({ text: 'HOJE', color: '#ff9800' });
            }
        }
        
        return tags;
    },
    
    // Formatar prazo
    formatDeadline(deadline, isOverdue, daysUntil) {
        const date = new Date(deadline);
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        
        if (isOverdue) {
            const daysOverdue = Math.abs(daysUntil);
            return `Atrasada ${daysOverdue} dia${daysOverdue !== 1 ? 's' : ''}`;
        }
        
        if (date.toDateString() === today.toDateString()) {
            return 'Hoje';
        }
        
        if (date.toDateString() === tomorrow.toDateString()) {
            return 'Amanhã';
        }
        
        if (daysUntil !== null && daysUntil <= 7) {
            return `${daysUntil} dia${daysUntil !== 1 ? 's' : ''}`;
        }
        
        return date.toLocaleDateString('pt-BR');
    },
    
    // Aplicar filtros
    applyFilters() {
        this.renderAllTasks();
    },
    
    // Obter tarefas filtradas
    getFilteredTasks() {
        let tasks = [...userData.tasks];
        
        // Filtro de prioridade
        const priorityFilter = document.getElementById('priorityFilter')?.value;
        if (priorityFilter && priorityFilter !== 'all') {
            tasks = tasks.filter(task => task.priority === priorityFilter);
        }
        
        // Filtro de prazo
        const deadlineFilter = document.getElementById('deadlineFilter')?.value;
        if (deadlineFilter && deadlineFilter !== 'all') {
            tasks = this.filterByDeadline(tasks, deadlineFilter);
        }
        
        // Filtro de busca
        const searchTerm = document.getElementById('searchTasks')?.value?.toLowerCase();
        if (searchTerm) {
            tasks = tasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm)
            );
        }
        
        return tasks;
    },
    
    // Filtrar por prazo
    filterByDeadline(tasks, filter) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        switch(filter) {
            case 'overdue':
                return tasks.filter(task => 
                    task.deadline && new Date(task.deadline) < today && task.status !== 'done'
                );
            case 'today':
                return tasks.filter(task => {
                    if (!task.deadline) return false;
                    const taskDate = new Date(task.deadline);
                    return taskDate.toDateString() === today.toDateString();
                });
            case 'week':
                return tasks.filter(task => {
                    if (!task.deadline) return false;
                    const taskDate = new Date(task.deadline);
                    return taskDate >= today && taskDate <= weekFromNow;
                });
            case 'nodate':
                return tasks.filter(task => !task.deadline);
            default:
                return tasks;
        }
    },
    
    // Aplicar ordenação
    applySort() {
        this.renderAllTasks();
    },
    
    // Obter tarefas ordenadas
    getSortedTasks(tasks) {
        const sortBy = document.getElementById('taskSort')?.value || 'created';
        
        return [...tasks].sort((a, b) => {
            switch(sortBy) {
                case 'priority':
                    const priorities = { high: 3, medium: 2, low: 1 };
                    return priorities[b.priority] - priorities[a.priority];
                
                case 'deadline':
                    if (!a.deadline && !b.deadline) return 0;
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                
                case 'title':
                    return a.title.localeCompare(b.title);
                
                case 'created':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
    },
    
    // Filtrar por prioridade (atalho)
    filterByPriority(priority) {
        const priorityFilter = document.getElementById('priorityFilter');
        if (priorityFilter) {
            priorityFilter.value = priority;
            this.applyFilters();
        }
    },
    
    // Limpar filtros
    clearFilters() {
        const filters = ['priorityFilter', 'deadlineFilter', 'searchTasks'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.value = filter.tagName === 'SELECT' ? 'all' : '';
            }
        });
        this.applyFilters();
    },
    
    // Mostrar menu da tarefa
    showTaskMenu(taskId) {
        const task = userData.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const menu = this.createTaskMenu(task);
        document.body.appendChild(menu);
        
        // Fechar menu clicando fora
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 10);
    },
    
    // Criar menu da tarefa
    createTaskMenu(task) {
        const menu = document.createElement('div');
        menu.className = 'task-menu-popup';
        menu.style.cssText = `
            position: fixed;
            background: white;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            z-index: 1000;
            min-width: 150px;
            border: 1px solid #eee;
        `;
        
        const actions = [
            { icon: '✏️', text: 'Editar', action: () => editTask(task.id) },
            { icon: '📋', text: 'Duplicar', action: () => this.duplicateTask(task.id) },
            { icon: '⏰', text: 'Definir Lembrete', action: () => this.setReminder(task.id) },
            { icon: '🏷️', text: 'Adicionar Tag', action: () => this.addTag(task.id) },
            { icon: '📤', text: 'Compartilhar', action: () => this.shareTask(task.id) },
            { icon: '🗑️', text: 'Excluir', action: () => deleteTask(task.id), danger: true }
        ];
        
        menu.innerHTML = actions.map(action => `
            <div class="menu-item" onclick="${action.action.toString().replace('function() { ', '').replace(' }', '')}" style="
                padding: 12px 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.9em;
                ${action.danger ? 'color: #f44336;' : ''}
                border-bottom: 1px solid #f0f0f0;
            ">
                <span>${action.icon}</span>
                <span>${action.text}</span>
            </div>
        `).join('');
        
        // Posicionar menu próximo ao botão
        const rect = event.target.getBoundingClientRect();
        menu.style.top = (rect.bottom + 8) + 'px';
        menu.style.left = (rect.left - 100) + 'px';
        
        return menu;
    },
    
    // Duplicar tarefa
    duplicateTask(taskId) {
        const task = userData.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const newTask = {
            ...task,
            id: idCounters.task++,
            title: `${task.title} (Cópia)`,
            status: 'todo',
            createdAt: new Date().toISOString()
        };
        
        userData.tasks.push(newTask);
        this.renderTask(newTask);
        this.updateColumnCounts();
        saveData();
        
        Notifications.show('Tarefa duplicada com sucesso! 📋', 'success');
    },
    
    // Definir lembrete
    setReminder(taskId) {
        const task = userData.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const reminderTime = prompt(
            `Definir lembrete para "${task.title}"\n\nInsira data e hora (ex: 2025-07-15 14:30):`,
            task.deadline || ''
        );
        
        if (reminderTime) {
            // Em uma implementação real, aqui seria configurado um lembrete
            Notifications.show('Lembrete configurado! ⏰', 'success');
        }
    },
    
    // Adicionar tag
    addTag(taskId) {
        const task = userData.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const tag = prompt(`Adicionar tag para "${task.title}":`);
        if (tag) {
            if (!task.tags) task.tags = [];
            task.tags.push(tag.trim());
            
            this.renderAllTasks();
            saveData();
            
            Notifications.show('Tag adicionada! 🏷️', 'success');
        }
    },
    
    // Compartilhar tarefa
    shareTask(taskId) {
        const task = userData.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const shareText = `📋 Tarefa: ${task.title}\n${task.description ? task.description + '\n' : ''}Criada em: ${new Date(task.createdAt).toLocaleDateString('pt-BR')}`;
        
        if (navigator.share) {
            navigator.share({
                title: task.title,
                text: shareText
            });
        } else {
            // Fallback: copiar para clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                Notifications.show('Tarefa copiada para a área de transferência! 📤', 'success');
            });
        }
    },
    
    // Atualizar contadores das colunas
    updateColumnCounts() {
        ['todo', 'progress', 'done'].forEach(status => {
            const column = document.getElementById(`${status}-column`);
            const header = column?.parentElement.querySelector('.column-header');
            
            if (column && header) {
                const count = column.children.length;
                const statusNames = {
                    todo: 'Para Fazer',
                    progress: 'Fazendo',
                    done: 'Concluído'
                };
                
                const originalText = statusNames[status];
                header.innerHTML = `
                    📝 ${originalText}
                    <span style="opacity: 0.8; font-weight: 400; margin-left: 8px;">(${count})</span>
                `;
            }
        });
    },
    
    // Handlers de drag and drop
    handleDragStart(e) {
        e.dataTransfer.setData("text", e.target.id);
        e.target.classList.add('dragging');
        
        // Destacar áreas de drop
        document.querySelectorAll('.column-content').forEach(column => {
            column.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
        });
    },
    
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        
        // Remover destaque das áreas de drop
        document.querySelectorAll('.column-content').forEach(column => {
            column.style.backgroundColor = '';
        });
    },
    
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.2)';
    },
    
    handleDrop(e) {
        e.preventDefault();
        const data = e.dataTransfer.getData("text");
        const draggedElement = document.getElementById(data);
        
        if (!draggedElement) return;
        
        const targetColumn = e.currentTarget;
        targetColumn.appendChild(draggedElement);
        
        // Atualizar status da tarefa
        const taskId = parseInt(data.replace('task-', ''));
        const newStatus = targetColumn.id.replace('-column', '');
        
        const task = userData.tasks.find(t => t.id === taskId);
        if (task) {
            const oldStatus = task.status;
            task.status = newStatus;
            
            // Celebração quando completar
            if (newStatus === 'done' && oldStatus !== 'done') {
                Notifications.celebrate('🎉');
                Notifications.show('Tarefa concluída! Parabéns! 🎉', 'success');
                
                // Adicionar timestamp de conclusão
                task.completedAt = new Date().toISOString();
            }
            
            this.updateColumnCounts();
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
            saveData();
        }
        
        // Limpar estilo de destaque
        targetColumn.style.backgroundColor = '';
    },
    
    // Refresh do módulo
    refresh() {
        this.loadData();
    },
    
    // Estatísticas das tarefas
    getStats() {
        const now = new Date();
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        return {
            total: userData.tasks.length,
            active: userData.tasks.filter(t => t.status !== 'done').length,
            completed: userData.tasks.filter(t => t.status === 'done').length,
            completedThisWeek: userData.tasks.filter(t => 
                t.status === 'done' && new Date(t.createdAt) >= thisWeek
            ).length,
            overdue: userData.tasks.filter(t => 
                t.deadline && new Date(t.deadline) < now && t.status !== 'done'
            ).length,
            byPriority: {
                high: userData.tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
                medium: userData.tasks.filter(t => t.priority === 'medium' && t.status !== 'done').length,
                low: userData.tasks.filter(t => t.priority === 'low' && t.status !== 'done').length
            },
            byStatus: {
                todo: userData.tasks.filter(t => t.status === 'todo').length,
                progress: userData.tasks.filter(t => t.status === 'progress').length,
                done: userData.tasks.filter(t => t.status === 'done').length
            }
        };
    },
    
    // Utilitários
    getPriorityText(priority) {
        const map = { high: '🔴 Alta', medium: '🟡 Média', low: '🟢 Baixa' };
        return map[priority] || '🟡 Média';
    },
    
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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

// Adicionar estilos CSS específicos para tarefas
if (!document.getElementById('tasks-styles')) {
    const style = document.createElement('style');
    style.id = 'tasks-styles';
    style.textContent = `
        .task-overdue {
            border-left: 4px solid #f44336 !important;
            background: linear-gradient(135deg, rgba(244, 67, 54, 0.05), rgba(255, 255, 255, 0.95)) !important;
        }
        
        .task-urgent {
            border-left: 4px solid #ff9800 !important;
            background: linear-gradient(135deg, rgba(255, 152, 0, 0.05), rgba(255, 255, 255, 0.95)) !important;
        }
        
        .task-menu-btn:hover {
            background: rgba(0,0,0,0.1) !important;
            border-radius: 4px;
        }
        
        .menu-item:hover {
            background: rgba(102, 126, 234, 0.1) !important;
        }
        
        .menu-item:last-child {
            border-bottom: none !important;
        }
        
        .column-content {
            transition: background-color 0.2s ease;
        }
        
        .task-card {
            position: relative;
        }
        
        .task-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--task-priority-color, transparent);
            border-radius: 12px 12px 0 0;
        }
        
        .task-card.priority-high::before {
            background: linear-gradient(135deg, #f44336, #e91e63);
        }
        
        .task-card.priority-medium::before {
            background: linear-gradient(135deg, #ff9800, #ffc107);
        }
        
        .task-card.priority-low::before {
            background: linear-gradient(135deg, #4caf50, #8bc34a);
        }
    `;
    document.head.appendChild(style);
}