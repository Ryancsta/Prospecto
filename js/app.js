/**
 * LifeManager - Aplicação Principal
 * Sistema de dados em memória e gerenciamento central
 */

// Sistema de dados globais
let users = {};
let currentUser = null;
let userData = {
    tasks: [],
    transactions: [],
    goals: [],
    teamMembers: []
};
let idCounters = {
    task: 1,
    transaction: 1,
    goal: 1,
    invite: 1
};

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
    setupEventListeners();
    setupDemoUser();
});

function initializeSystem() {
    // Carregar dados salvos se existirem
    const savedData = localStorage.getItem('lifemanager_data');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            users = data.users || {};
            if (data.currentUser && users[data.currentUser.email]) {
                currentUser = users[data.currentUser.email];
                userData = data.userData || userData;
                idCounters = data.idCounters || idCounters;
                showApp();
            }
        } catch (e) {
            console.log('Erro ao carregar dados salvos');
        }
    }
}

function setupDemoUser() {
    // Criar usuário demo
    const demoEmail = 'demo@lifecontrol.com';
    users[demoEmail] = {
        name: 'Usuário Demo',
        email: demoEmail,
        password: btoa('demo123'),
        plan: 'pro',
        createdAt: new Date().toISOString()
    };
    
    // Pré-preencher campos de login com demo
    document.getElementById('loginEmail').value = demoEmail;
    document.getElementById('loginPassword').value = 'demo123';
}

function setupEventListeners() {
    // Formulário de login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Formulários principais
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
    document.getElementById('incomeForm').addEventListener('submit', handleIncomeSubmit);
    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);
    document.getElementById('goalForm').addEventListener('submit', handleGoalSubmit);
    document.getElementById('inviteForm').addEventListener('submit', handleInviteSubmit);
    
    // Fechar modais clicando fora
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Atalhos de teclado
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
        
        if (currentUser && (event.ctrlKey || event.metaKey)) {
            switch(event.key) {
                case 'n':
                    event.preventDefault();
                    openModal('taskModal');
                    break;
                case 'e':
                    event.preventDefault();
                    openModal('expenseModal');
                    break;
                case 'r':
                    event.preventDefault();
                    openModal('incomeModal');
                    break;
            }
        }
    });
    
    // Auto-save a cada 30 segundos
    setInterval(saveData, 30000);
}

// Autenticação
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.toLowerCase().trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!users[email]) {
        showAlert('Email não encontrado. Verifique ou crie uma conta.', 'error');
        return;
    }
    
    if (users[email].password !== btoa(password)) {
        showAlert('Senha incorreta. Tente novamente.', 'error');
        return;
    }
    
    currentUser = users[email];
    loadUserData(email);
    showApp();
    showNotification(`Bem-vindo(a), ${currentUser.name}! 🎉`);
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.toLowerCase().trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validações
    if (!name || name.length < 2) {
        showAlert('Nome deve ter pelo menos 2 caracteres.', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showAlert('Email inválido.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Senha deve ter pelo menos 6 caracteres.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Senhas não conferem.', 'error');
        return;
    }
    
    if (users[email]) {
        showAlert('Este email já está cadastrado. Faça login.', 'error');
        return;
    }
    
    // Criar usuário
    users[email] = {
        name: name,
        email: email,
        password: btoa(password),
        plan: 'free',
        createdAt: new Date().toISOString()
    };
    
    currentUser = users[email];
    userData = { tasks: [], transactions: [], goals: [], teamMembers: [] };
    idCounters = { task: 1, transaction: 1, goal: 1, invite: 1 };
    
    showApp();
    showNotification(`Conta criada! Bem-vindo(a), ${name}! 🎉`);
    
    // Limpar formulário
    document.getElementById('registerForm').reset();
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function loadUserData(email) {
    const savedUserData = localStorage.getItem(`lifemanager_user_${email}`);
    if (savedUserData) {
        try {
            const data = JSON.parse(savedUserData);
            userData = data.userData || userData;
            idCounters = data.idCounters || idCounters;
        } catch (e) {
            console.log('Erro ao carregar dados do usuário');
        }
    }
}

function showApp() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('appSection').style.display = 'block';
    
    updateUserInterface();
    loadAllData();
    updateDashboard();
    saveData();
    
    // Adicionar funcionalidades extras
    setTimeout(() => {
        addBackupButtons();
        showDailyTip();
    }, 1000);
}

function updateUserInterface() {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('mainUserAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('mainUserName').textContent = currentUser.name;
    
    const planText = currentUser.plan === 'pro' ? 'Pro' : 'Grátis';
    document.getElementById('userPlan').textContent = planText;
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        saveData();
        currentUser = null;
        userData = { tasks: [], transactions: [], goals: [], teamMembers: [] };
        
        document.getElementById('authSection').style.display = 'flex';
        document.getElementById('appSection').style.display = 'none';
        
        // Limpar formulários
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        
        showNotification('Logout realizado com sucesso!');
    }
}

// Navegação entre abas
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Sistema de modais
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    
    // Focar no primeiro input
    setTimeout(() => {
        const firstInput = document.querySelector(`#${modalId} input`);
        if (firstInput) firstInput.focus();
    }, 100);
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    // Limpar formulários
    const form = document.querySelector(`#${modalId} form`);
    if (form) form.reset();
}

// Sistema de Tarefas
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const task = {
        id: idCounters.task++,
        title: document.getElementById('taskTitle').value.trim(),
        description: document.getElementById('taskDescription').value.trim(),
        priority: document.getElementById('taskPriority').value,
        deadline: document.getElementById('taskDeadline').value,
        status: 'todo',
        createdAt: new Date().toISOString(),
        userId: currentUser.email
    };
    
    userData.tasks.push(task);
    addTaskToBoard(task);
    updateDashboard();
    saveData();
    
    closeModal('taskModal');
    showNotification('Tarefa criada com sucesso! 📋');
}

function addTaskToBoard(task) {
    const card = createTaskCard(task);
    const column = document.getElementById(`${task.status}-column`);
    column.appendChild(card);
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.id = `task-${task.id}`;
    card.draggable = true;
    card.ondragstart = dragStart;
    
    const deadlineText = task.deadline ? 
        `<div style="font-size: 0.8em; color: #666; margin-top: 8px;">📅 ${formatDate(task.deadline)}</div>` : '';
    
    card.innerHTML = `
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description}</div>
        ${deadlineText}
        <div class="task-meta">
            <div class="task-priority priority-${task.priority}">${getPriorityText(task.priority)}</div>
        </div>
        <div class="task-actions">
            <button class="task-btn btn-edit" onclick="editTask(${task.id})">✏️</button>
            <button class="task-btn btn-delete" onclick="deleteTask(${task.id})">🗑️</button>
        </div>
    `;
    
    return card;
}

function getPriorityText(priority) {
    const map = { high: '🔴 Alta', medium: '🟡 Média', low: '🟢 Baixa' };
    return map[priority] || '🟡 Média';
}

// Drag and Drop para tarefas
function allowDrop(ev) {
    ev.preventDefault();
}

function dragStart(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.target.classList.add('dragging');
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    
    if (!draggedElement) return;
    
    const targetColumn = ev.target.closest('.column-content');
    if (targetColumn && draggedElement) {
        targetColumn.appendChild(draggedElement);
        
        // Atualizar status da tarefa
        const taskId = parseInt(data.replace('task-', ''));
        const newStatus = targetColumn.id.replace('-column', '');
        
        const task = userData.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            
            // Celebração quando completar tarefa
            if (newStatus === 'done') {
                showCelebration('🎉');
                showNotification('Tarefa concluída! Parabéns! 🎉');
            }
            
            updateDashboard();
            saveData();
        }
    }
    
    draggedElement.classList.remove('dragging');
}

function editTask(taskId) {
    const task = userData.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDeadline').value = task.deadline;
    
    // Mudar para modo edição
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    submitBtn.textContent = 'Atualizar Tarefa';
    
    const originalSubmit = form.onsubmit;
    form.onsubmit = function(e) {
        e.preventDefault();
        
        task.title = document.getElementById('taskTitle').value.trim();
        task.description = document.getElementById('taskDescription').value.trim();
        task.priority = document.getElementById('taskPriority').value;
        task.deadline = document.getElementById('taskDeadline').value;
        
        // Atualizar card visual
        const card = document.getElementById(`task-${taskId}`);
        if (card) {
            card.remove();
            addTaskToBoard(task);
        }
        
        updateDashboard();
        saveData();
        closeModal('taskModal');
        showNotification('Tarefa atualizada! ✏️');
        
        // Restaurar formulário
        submitBtn.textContent = 'Criar Tarefa';
        form.onsubmit = originalSubmit;
    };
    
    openModal('taskModal');
}

function deleteTask(taskId) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        userData.tasks = userData.tasks.filter(t => t.id !== taskId);
        document.getElementById(`task-${taskId}`).remove();
        updateDashboard();
        saveData();
        showNotification('Tarefa excluída!');
    }
}

// Sistema Financeiro
function handleIncomeSubmit(e) {
    e.preventDefault();
    
    const transaction = {
        id: idCounters.transaction++,
        type: 'income',
        description: document.getElementById('incomeDescription').value.trim(),
        amount: parseFloat(document.getElementById('incomeAmount').value),
        category: document.getElementById('incomeCategory').value,
        date: new Date().toISOString(),
        userId: currentUser.email
    };
    
    userData.transactions.push(transaction);
    addTransactionToList(transaction);
    updateFinancialDisplay();
    updateDashboard();
    saveData();
    
    closeModal('incomeModal');
    showNotification(`Receita de R$ ${transaction.amount.toFixed(2)} adicionada! 💰`);
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const transaction = {
        id: idCounters.transaction++,
        type: 'expense',
        description: document.getElementById('expenseDescription').value.trim(),
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        date: new Date().toISOString(),
        userId: currentUser.email
    };
    
    userData.transactions.push(transaction);
    addTransactionToList(transaction);
    updateFinancialDisplay();
    updateDashboard();
    saveData();
    
    closeModal('expenseModal');
    showNotification(`Gasto de R$ ${transaction.amount.toFixed(2)} registrado! 💸`);
}

function addTransactionToList(transaction) {
    const list = document.getElementById('transactionsList');
    
    // Remover mensagem de lista vazia se existir
    const emptyMessage = list.querySelector('div[style*="text-align: center"]');
    if (emptyMessage) emptyMessage.remove();
    
    const item = document.createElement('div');
    item.className = `transaction-item transaction-${transaction.type}`;
    
    const icon = transaction.type === 'income' ? '💰' : '💸';
    const sign = transaction.type === 'income' ? '+' : '-';
    const color = transaction.type === 'income' ? '#4caf50' : '#f44336';
    
    item.innerHTML = `
        <div>
            <div style="font-weight: 700; margin-bottom: 4px;">
                ${icon} ${transaction.description}
            </div>
            <div style="color: #666; font-size: 0.9em;">
                ${getCategoryText(transaction.category)} • ${formatDateTime(transaction.date)}
            </div>
        </div>
        <div style="font-weight: 700; color: ${color}; font-size: 1.1em;">
            ${sign}R$ ${transaction.amount.toFixed(2)}
        </div>
    `;
    
    list.insertBefore(item, list.firstChild);
}

function updateFinancialDisplay() {
    const income = userData.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = userData.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    
    document.getElementById('mainBalance').textContent = `R$ ${balance.toFixed(2)}`;
    document.getElementById('totalIncome').textContent = `R$ ${income.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `R$ ${expenses.toFixed(2)}`;
}

// Sistema de Metas
function toggleGoalFields() {
    const type = document.getElementById('goalType').value;
    const amountGroup = document.getElementById('goalAmountGroup');
    
    if (type === 'financial') {
        amountGroup.style.display = 'block';
        document.getElementById('goalAmount').required = true;
    } else {
        amountGroup.style.display = 'none';
        document.getElementById('goalAmount').required = false;
    }
}

function handleGoalSubmit(e) {
    e.preventDefault();
    
    const goal = {
        id: idCounters.goal++,
        name: document.getElementById('goalName').value.trim(),
        type: document.getElementById('goalType').value,
        amount: document.getElementById('goalType').value === 'financial' ? 
            parseFloat(document.getElementById('goalAmount').value) : null,
        deadline: document.getElementById('goalDeadline').value,
        description: document.getElementById('goalDescription').value.trim(),
        currentAmount: 0,
        progress: 0,
        createdAt: new Date().toISOString(),
        userId: currentUser.email
    };
    
    userData.goals.push(goal);
    addGoalToList(goal);
    updateDashboard();
    saveData();
    
    closeModal('goalModal');
    showNotification('Meta criada! Vamos alcançá-la! 🎯');
}

function addGoalToList(goal) {
    const list = document.getElementById('goalsList');
    
    // Remover mensagem de lista vazia
    const emptyMessage = list.querySelector('div[style*="text-align: center"]');
    if (emptyMessage) emptyMessage.remove();
    
    const item = document.createElement('div');
    item.className = 'goal-item';
    
    const isFinancial = goal.type === 'financial';
    const progress = isFinancial ? 
        (goal.currentAmount / goal.amount * 100) : goal.progress;
    
    const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    const daysText = daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo vencido';
    const daysColor = daysLeft > 7 ? '#4caf50' : daysLeft > 0 ? '#ff9800' : '#f44336';
    
    item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
            <div>
                <h3 style="margin: 0 0 8px 0; color: #333; font-weight: 700;">
                    ${isFinancial ? '💰' : '🎯'} ${goal.name}
                </h3>
                <p style="margin: 0; color: #666;">
                    ${goal.description || 'Sem descrição'}
                </p>
            </div>
            <div style="text-align: right;">
                <div style="color: ${daysColor}; font-weight: 600; font-size: 0.9em;">
                    ${daysText}
                </div>
                <div style="color: #999; font-size: 0.8em; margin-top: 4px;">
                    ${formatDate(goal.deadline)}
                </div>
            </div>
        </div>
        
        ${isFinancial ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-weight: 600;">R$ ${goal.currentAmount.toFixed(2)}</span>
                <span style="color: #666;">R$ ${goal.amount.toFixed(2)}</span>
            </div>
        ` : ''}
        
        <div class="goal-progress">
            <div class="goal-progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
            <span style="font-weight: 600; color: #333;">${progress.toFixed(1)}% concluído</span>
            <div>
                ${isFinancial ? `
                    <button class="task-btn btn-edit" onclick="updateGoalProgress(${goal.id})" style="margin-right: 8px;">💰 Atualizar</button>
                ` : `
                    <button class="task-btn btn-edit" onclick="updateGoalProgress(${goal.id})" style="margin-right: 8px;">📈 Progresso</button>
                `}
                <button class="task-btn btn-delete" onclick="deleteGoal(${goal.id})">🗑️</button>
            </div>
        </div>
    `;
    
    list.appendChild(item);
}

function updateGoalProgress(goalId) {
    const goal = userData.goals.find(g => g.id === goalId);
    if (!goal) return;
    
    if (goal.type === 'financial') {
        const newAmount = prompt(
            `Quanto você já juntou para "${goal.name}"?\n\nMeta: R$ ${goal.amount.toFixed(2)}\nAtual: R$ ${goal.currentAmount.toFixed(2)}`,
            goal.currentAmount.toFixed(2)
        );
        
        if (newAmount !== null && !isNaN(newAmount)) {
            goal.currentAmount = parseFloat(newAmount);
            const progress = (goal.currentAmount / goal.amount) * 100;
            
            if (progress >= 100) {
                showCelebration('🎉🎯');
                showNotification('Parabéns! Meta financeira alcançada! 🎉💰');
            }
        }
    } else {
        const newProgress = prompt(
            `Qual o progresso atual de "${goal.name}"?\n\nInsira um valor de 0 a 100:`,
            goal.progress.toString()
        );
        
        if (newProgress !== null && !isNaN(newProgress)) {
            goal.progress = Math.min(Math.max(parseFloat(newProgress), 0), 100);
            
            if (goal.progress >= 100) {
                showCelebration('🎉🎯');
                showNotification('Parabéns! Meta pessoal alcançada! 🎉🎯');
            }
        }
    }
    
    // Recarregar lista de metas
    document.getElementById('goalsList').innerHTML = '';
    userData.goals.forEach(addGoalToList);
    updateDashboard();
    saveData();
}

function deleteGoal(goalId) {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
        userData.goals = userData.goals.filter(g => g.id !== goalId);
        
        // Recarregar lista
        document.getElementById('goalsList').innerHTML = '';
        if (userData.goals.length === 0) {
            document.getElementById('goalsList').innerHTML = `
                <div style="text-align: center; padding: 60px; color: #666;">
                    <div style="font-size: 4em; margin-bottom: 24px;">🎯</div>
                    <h3 style="color: #333; margin-bottom: 12px;">Defina suas metas!</h3>
                    <p style="margin-bottom: 24px;">Transforme seus sonhos em objetivos concretos</p>
                    <button class="btn" onclick="openModal('goalModal')">Criar Primeira Meta</button>
                </div>
            `;
        } else {
            userData.goals.forEach(addGoalToList);
        }
        
        updateDashboard();
        saveData();
        showNotification('Meta excluída!');
    }
}

// Sistema de Equipe
function handleInviteSubmit(e) {
    e.preventDefault();
    
    const invite = {
        id: idCounters.invite++,
        email: document.getElementById('inviteEmail').value.toLowerCase().trim(),
        role: document.getElementById('inviteRole').value,
        message: document.getElementById('inviteMessage').value.trim(),
        invitedBy: currentUser.email,
        invitedAt: new Date().toISOString(),
        status: 'pending'
    };
    
    // Simular envio de convite (em produção seria email real)
    userData.teamMembers.push({
        email: invite.email,
        role: invite.role,
        joinedAt: new Date().toISOString(),
        status: 'active'
    });
    
    loadTeamMembers();
    closeModal('inviteModal');
    showNotification(`Convite enviado para ${invite.email}! 📧`);
    saveData();
}

function loadTeamMembers() {
    const container = document.getElementById('teamMembers');
    container.innerHTML = '';
    
    userData.teamMembers.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.style.cssText = `
            background: rgba(255,255,255,0.9); 
            border-radius: 16px; 
            padding: 28px; 
            text-align: center; 
            border: 1px solid rgba(255,255,255,0.3);
        `;
        
        const roleIcons = {
            admin: '⚡',
            member: '👤',
            viewer: '👁️'
        };
        
        const roleTexts = {
            admin: 'Administrador',
            member: 'Membro',
            viewer: 'Visualizador'
        };
        
        memberDiv.innerHTML = `
            <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #4caf50, #66bb6a); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5em; font-weight: 700;">
                ${member.email.charAt(0).toUpperCase()}
            </div>
            <h4 style="margin-bottom: 8px; color: #333;">${member.email}</h4>
            <p style="color: #666; margin-bottom: 12px; font-size: 0.9em;">
                ${roleIcons[member.role]} ${roleTexts[member.role]}
            </p>
            <span style="background: linear-gradient(135deg, #4caf50, #66bb6a); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 600;">
                Online
            </span>
        `;
        
        container.appendChild(memberDiv);
    });
}

// Dashboard e Estatísticas
function updateDashboard() {
    const activeTasks = userData.tasks.filter(t => t.status !== 'done').length;
    const completedGoals = userData.goals.filter(g => {
        if (g.type === 'financial') {
            return g.currentAmount >= g.amount;
        } else {
            return g.progress >= 100;
        }
    }).length;
    
    const totalGoals = userData.goals.length;
    const goalsProgress = totalGoals > 0 ? (completedGoals / totalGoals * 100) : 0;
    
    const income = userData.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = userData.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    
    // Calcular score da semana (0-100)
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const weekTasks = userData.tasks.filter(t => 
        new Date(t.createdAt) >= thisWeek && t.status === 'done'
    ).length;
    
    const weekScore = Math.min(weekTasks * 10, 100);
    
    // Atualizar interface
    document.getElementById('activeTasks').textContent = activeTasks;
    document.getElementById('currentBalance').textContent = `R$ ${Math.abs(balance).toFixed(0)}`;
    document.getElementById('goalsProgress').textContent = `${goalsProgress.toFixed(0)}%`;
    document.getElementById('weekScore').textContent = weekScore;
    
    // Atualizar cor do saldo
    const balanceCard = document.getElementById('currentBalance').closest('.dashboard-card');
    if (balance < 0) {
        balanceCard.querySelector('.card-icon').style.background = 'linear-gradient(135deg, #f44336, #ef5350)';
    }
    
    updateRecentActivity();
}

function updateRecentActivity() {
    const container = document.getElementById('recentActivity');
    const activities = [];
    
    // Últimas tarefas
    userData.tasks.slice(-3).forEach(task => {
        activities.push({
            icon: task.status === 'done' ? '✅' : '📋',
            text: `${task.status === 'done' ? 'Concluiu' : 'Criou'} tarefa: ${task.title}`,
            time: formatTimeAgo(task.createdAt),
            type: 'task'
        });
    });
    
    // Últimas transações
    userData.transactions.slice(-3).forEach(transaction => {
        activities.push({
            icon: transaction.type === 'income' ? '💰' : '💸',
            text: `${transaction.type === 'income' ? 'Receita' : 'Gasto'}: ${transaction.description}`,
            time: formatTimeAgo(transaction.date),
            type: 'financial'
        });
    });
    
    // Últimas metas
    userData.goals.slice(-2).forEach(goal => {
        activities.push({
            icon: '🎯',
            text: `Criou meta: ${goal.name}`,
            time: formatTimeAgo(goal.createdAt),
            type: 'goal'
        });
    });
    
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
        container.innerHTML = activities
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 5)
            .map(activity => `
                <div class="transaction-item" style="border-left: 4px solid #667eea;">
                    <div>
                        <div style="font-weight: 600; margin-bottom: 4px;">
                            ${activity.icon} ${activity.text}
                        </div>
                        <div style="color: #666; font-size: 0.9em;">
                            ${activity.time}
                        </div>
                    </div>
                </div>
            `).join('');
    }
}

// Carregar todos os dados na interface
function loadAllData() {
    // Carregar tarefas
    userData.tasks.forEach(addTaskToBoard);
    
    // Carregar transações
    userData.transactions.forEach(addTransactionToList);
    updateFinancialDisplay();
    
    // Carregar metas
    if (userData.goals.length > 0) {
        document.getElementById('goalsList').innerHTML = '';
        userData.goals.forEach(addGoalToList);
    }
    
    // Carregar equipe
    loadTeamMembers();
}

// Demonstração com dados de exemplo
function showWelcomeDemo() {
    if (confirm('Quer adicionar alguns dados de exemplo para explorar o sistema?')) {
        addDemoData();
        showNotification('Dados de exemplo adicionados! Explore as funcionalidades! 🚀');
    }
}

function addDemoData() {
    // Tarefas demo
    const demoTasks = [
        {
            id: idCounters.task++,
            title: 'Organizar documentos pessoais',
            description: 'Digitalizar e organizar RG, CPF, comprovantes e contratos importantes',
            priority: 'medium',
            deadline: '2025-07-15',
            status: 'todo',
            createdAt: new Date().toISOString(),
            userId: currentUser.email
        },
        {
            id: idCounters.task++,
            title: 'Planejar férias de final de ano',
            description: 'Pesquisar destinos, comparar preços e fazer reservas',
            priority: 'low',
            deadline: '2025-08-30',
            status: 'progress',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            userId: currentUser.email
        },
        {
            id: idCounters.task++,
            title: 'Revisar orçamento mensal',
            description: 'Analisar gastos do mês e ajustar planejamento financeiro',
            priority: 'high',
            deadline: '',
            status: 'done',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            userId: currentUser.email
        }
    ];

    // Transações demo
    const demoTransactions = [
        {
            id: idCounters.transaction++,
            type: 'income',
            description: 'Salário do mês',
            amount: 4500.00,
            category: 'salary',
            date: new Date(Date.now() - 86400000).toISOString(),
            userId: currentUser.email
        },
        {
            id: idCounters.transaction++,
            type: 'income',
            description: 'Freelance - Design de logo',
            amount: 800.00,
            category: 'freelance',
            date: new Date(Date.now() - 172800000).toISOString(),
            userId: currentUser.email
        },
        {
            id: idCounters.transaction++,
            type: 'expense',
            description: 'Supermercado - Compras da semana',
            amount: 320.50,
            category: 'food',
            date: new Date(Date.now() - 3600000).toISOString(),
            userId: currentUser.email
        },
        {
            id: idCounters.transaction++,
            type: 'expense',
            description: 'Combustível',
            amount: 120.00,
            category: 'transport',
            date: new Date(Date.now() - 7200000).toISOString(),
            userId: currentUser.email
        },
        {
            id: idCounters.transaction++,
            type: 'expense',
            description: 'Netflix - Assinatura mensal',
            amount: 29.90,
            category: 'entertainment',
            date: new Date(Date.now() - 259200000).toISOString(),
            userId: currentUser.email
        }
    ];

    // Metas demo
    const demoGoals = [
        {
            id: idCounters.goal++,
            name: 'Reserva de emergência',
            type: 'financial',
            amount: 15000.00,
            deadline: '2025-12-31',
            description: 'Guardar 6 meses de gastos para emergências',
            currentAmount: 4200.00,
            progress: 0,
            createdAt: new Date(Date.now() - 604800000).toISOString(),
            userId: currentUser.email
        },
        {
            id: idCounters.goal++,
            name: 'Aprender inglês fluente',
            type: 'personal',
            amount: null,
            deadline: '2025-09-30',
            description: 'Conseguir conversar fluentemente em inglês para oportunidades de trabalho',
            currentAmount: 0,
            progress: 35,
            createdAt: new Date(Date.now() - 1209600000).toISOString(),
            userId: currentUser.email
        },
        {
            id: idCounters.goal++,
            name: 'Viagem para Europa',
            type: 'financial',
            amount: 8000.00,
            deadline: '2025-11-15',
            description: 'Realizar sonho de conhecer Paris, Roma e Barcelona',
            currentAmount: 1850.00,
            progress: 0,
            createdAt: new Date(Date.now() - 432000000).toISOString(),
            userId: currentUser.email
        }
    ];

    // Adicionar aos dados do usuário
    userData.tasks.push(...demoTasks);
    userData.transactions.push(...demoTransactions);
    userData.goals.push(...demoGoals);

    // Recarregar interface
    clearInterface();
    loadAllData();
    updateDashboard();
    saveData();
}

function clearInterface() {
    // Limpar tarefas
    document.getElementById('todo-column').innerHTML = '';
    document.getElementById('progress-column').innerHTML = '';
    document.getElementById('done-column').innerHTML = '';
    
    // Limpar transações
    document.getElementById('transactionsList').innerHTML = '';
    
    // Limpar metas
    document.getElementById('goalsList').innerHTML = '';
}

// Funções utilitárias
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Agora há pouco';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
    return formatDate(dateString);
}

function getCategoryText(category) {
    const categories = {
        // Income
        salary: '💼 Salário',
        freelance: '💻 Freelance',
        business: '🏢 Negócio',
        investment: '📈 Investimento',
        // Expenses
        food: '🍔 Alimentação',
        transport: '🚗 Transporte',
        housing: '🏠 Casa',
        health: '🏥 Saúde',
        entertainment: '🎬 Lazer',
        education: '📚 Educação',
        shopping: '🛍️ Compras',
        bills: '📄 Contas',
        other: '📦 Outros'
    };
    return categories[category] || '📦 Outros';
}

// Sistema de notificações e alertas
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

function showCelebration(emoji) {
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.textContent = emoji;
    
    document.body.appendChild(celebration);
    
    setTimeout(() => {
        celebration.remove();
    }, 1000);
}

// Sistema de persistência de dados
function saveData() {
    if (!currentUser) return;
    
    try {
        // Salvar dados globais
        const globalData = {
            users: users,
            currentUser: currentUser
        };
        localStorage.setItem('lifemanager_data', JSON.stringify(globalData));
        
        // Salvar dados específicos do usuário
        const userSpecificData = {
            userData: userData,
            idCounters: idCounters,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem(`lifemanager_user_${currentUser.email}`, JSON.stringify(userSpecificData));
        
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

// Sistema de backup e importação
function exportUserData() {
    if (!currentUser) return;
    
    const exportData = {
        user: {
            name: currentUser.name,
            email: currentUser.email,
            plan: currentUser.plan
        },
        data: userData,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileName = `lifecontrol-backup-${currentUser.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showNotification('Backup exportado com sucesso! 📥');
}

function importUserData(event) {
    const file = event.target.files[0];
    if (file && currentUser) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (importData.data && importData.version) {
                    // Confirmar importação
                    if (confirm(`Importar dados de backup?\n\nIsso substituirá todos os seus dados atuais.\n\nData do backup: ${new Date(importData.exportDate).toLocaleDateString('pt-BR')}`)) {
                        userData = importData.data;
                        
                        // Recarregar interface
                        clearInterface();
                        loadAllData();
                        updateDashboard();
                        saveData();
                        
                        showNotification('Dados importados com sucesso! 📤');
                    }
                } else {
                    throw new Error('Formato de arquivo inválido');
                }
            } catch (error) {
                showNotification('Erro ao importar arquivo. Verifique se é um backup válido.', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Funcionalidades extras
function addBackupButtons() {
    const backupDiv = document.createElement('div');
    backupDiv.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999;
        display: flex;
        flex-direction: column;
        gap: 12px;
    `;
    
    backupDiv.innerHTML = `
        <div style="background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 16px; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.2);">
            <button onclick="exportUserData()" style="width: 100%; margin-bottom: 8px; padding: 8px 16px; background: linear-gradient(135deg, #4caf50, #66bb6a); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85em;">
                📥 Backup
            </button>
            <input type="file" id="importFileInput" accept=".json" style="display: none;" onchange="importUserData(event)">
            <button onclick="document.getElementById('importFileInput').click()" style="width: 100%; padding: 8px 16px; background: linear-gradient(135deg, #2196f3, #42a5f5); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85em;">
                📤 Restaurar
            </button>
        </div>
    `;
    
    document.body.appendChild(backupDiv);
}

function showDailyTip() {
    const tips = [
        "💡 Use Ctrl+N para criar tarefas rapidamente!",
        "📊 Revise seu dashboard diariamente para manter o foco",
        "💰 Registre gastos na hora - não deixe acumular!",
        "🎯 Defina metas pequenas e alcançáveis para manter a motivação",
        "⚡ Complete pelo menos uma tarefa importante por dia",
        "📱 Use o sistema pelo celular - é super prático!",
        "🔄 Faça backup dos seus dados regularmente",
        "👥 Convite pessoas para colaborar em projetos",
        "📈 Comemore suas conquistas - você merece!",
        "🎨 Personalize o sistema da forma que funciona melhor para você"
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    setTimeout(() => {
        if (Math.random() < 0.3) { // 30% de chance de mostrar dica
            showNotification(randomTip);
        }
    }, 5000);
}

// Modal de upgrade para Pro
function showUpgradeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 4em; margin-bottom: 20px;">⭐</div>
                <h2 style="margin-bottom: 16px; color: #333;">Upgrade para Pro</h2>
                <p style="color: #666; margin-bottom: 32px; font-size: 1.1em;">
                    Desbloqueie recursos avançados e organize sua vida sem limites
                </p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px;">
                    <div style="text-align: left;">
                        <h4 style="color: #333; margin-bottom: 12px;">🚀 Recursos Pro</h4>
                        <ul style="color: #666; line-height: 1.8;">
                            <li>✅ Equipes ilimitadas</li>
                            <li>📊 Relatórios avançados</li>
                            <li>🔄 Sincronização automática</li>
                            <li>📱 App mobile dedicado</li>
                            <li>🛡️ Backup na nuvem</li>
                            <li>🎯 Metas avançadas</li>
                        </ul>
                    </div>
                    <div style="text-align: left;">
                        <h4 style="color: #333; margin-bottom: 12px;">💎 Exclusivo Pro</h4>
                        <ul style="color: #666; line-height: 1.8;">
                            <li>🤖 Assistente IA</li>
                            <li>📈 Analytics preditivos</li>
                            <li>🔗 Integrações avançadas</li>
                            <li>💬 Suporte prioritário</li>
                            <li>🎨 Personalização total</li>
                            <li>📤 Export ilimitado</li>
                        </ul>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 24px; border-radius: 16px; margin-bottom: 24px;">
                    <h3 style="margin-bottom: 8px;">Apenas R$ 19,90/mês</h3>
                    <p style="opacity: 0.9; margin: 0;">ou R$ 199,90/ano (2 meses grátis!)</p>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button class="btn" onclick="simulateUpgrade(); this.parentElement.parentElement.parentElement.parentElement.remove();">
                        Fazer Upgrade Agora
                    </button>
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.parentElement.remove();" style="background: #95a5a6; color: white; border: none; padding: 14px 28px; border-radius: 12px; cursor: pointer; font-weight: 700;">
                        Continuar Grátis
                    </button>
                </div>
                
                <p style="color: #999; font-size: 0.9em; margin-top: 16px;">
                    💳 Pagamento seguro • ❌ Cancele quando quiser • 🔒 Seus dados protegidos
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function simulateUpgrade() {
    currentUser.plan = 'pro';
    document.getElementById('userPlan').textContent = 'Pro';
    saveData();
    showCelebration('⭐');
    showNotification('Parabéns! Você agora é Pro! Aproveite todos os recursos! ⭐');
}

// Funcionalidades de debug
if (window.location.search.includes('debug=true')) {
    window.lifeManagerDebug = {
        currentUser: () => currentUser,
        userData: () => userData,
        clearData: () => {
            localStorage.clear();
            location.reload();
        },
        addDemoData: addDemoData,
        exportData: exportUserData,
        stats: () => ({
            tasks: userData.tasks.length,
            transactions: userData.transactions.length,
            goals: userData.goals.length,
            teamMembers: userData.teamMembers.length
        })
    };
    console.log('🔧 Debug mode ativado. Use window.lifeManagerDebug');
}

// Inicialização final - verificar upgrade
setTimeout(() => {
    if (currentUser && currentUser.plan === 'free' && Math.random() < 0.2) {
        setTimeout(showUpgradeModal, 30000); // Mostrar upgrade após 30s
    }
}, 5000);