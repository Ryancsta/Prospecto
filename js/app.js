/**
 * LifeManager - Aplicação Principal Corrigida
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
    console.log('🚀 Inicializando LifeManager...');
    
    // Aguardar um pouco para garantir que tudo carregou
    setTimeout(() => {
        initializeSystem();
        setupEventListeners();
        setupDemoUser();
        
        // Forçar layout correto
        document.body.style.opacity = '1';
        console.log('✅ LifeManager inicializado com sucesso');
    }, 100);
});

function initializeSystem() {
    try {
        // Carregar dados salvos se existirem
        const savedData = localStorage.getItem('lifemanager_data');
        if (savedData) {
            const data = JSON.parse(savedData);
            users = data.users || {};
            if (data.currentUser && users[data.currentUser.email]) {
                currentUser = users[data.currentUser.email];
                userData = data.userData || userData;
                idCounters = data.idCounters || idCounters;
                showApp();
            }
        }
    } catch (e) {
        console.log('Erro ao carregar dados salvos:', e);
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
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    if (loginEmail) loginEmail.value = demoEmail;
    if (loginPassword) loginPassword.value = 'demo123';
}

function setupEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    // Event listeners de formulários
    setupFormListeners();
    
    // Event listeners de navegação
    setupNavigationListeners();
    
    // Event listeners de modais
    setupModalListeners();
    
    // Atalhos de teclado
    setupKeyboardShortcuts();
    
    // Auto-save
    setInterval(saveData, 30000);
}

function setupFormListeners() {
    // Formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Formulário de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Aguardar modals serem criados para adicionar listeners
    document.addEventListener('modalCreated', setupModalFormListeners);
}

function setupModalFormListeners() {
    // Task form
    const taskForm = document.getElementById('taskForm');
    if (taskForm && !taskForm.dataset.listenerAdded) {
        taskForm.addEventListener('submit', handleTaskSubmit);
        taskForm.dataset.listenerAdded = 'true';
    }
    
    // Income form
    const incomeForm = document.getElementById('incomeForm');
    if (incomeForm && !incomeForm.dataset.listenerAdded) {
        incomeForm.addEventListener('submit', handleIncomeSubmit);
        incomeForm.dataset.listenerAdded = 'true';
    }
    
    // Expense form
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm && !expenseForm.dataset.listenerAdded) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
        expenseForm.dataset.listenerAdded = 'true';
    }
    
    // Goal form
    const goalForm = document.getElementById('goalForm');
    if (goalForm && !goalForm.dataset.listenerAdded) {
        goalForm.addEventListener('submit', handleGoalSubmit);
        goalForm.dataset.listenerAdded = 'true';
    }
    
    // Invite form
    const inviteForm = document.getElementById('inviteForm');
    if (inviteForm && !inviteForm.dataset.listenerAdded) {
        inviteForm.addEventListener('submit', handleInviteSubmit);
        inviteForm.dataset.listenerAdded = 'true';
    }
}

function setupNavigationListeners() {
    // Navegação entre abas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const onclick = this.getAttribute('onclick');
            if (onclick && onclick.includes('switchTab')) {
                const tabName = onclick.match(/switchTab\('(.+?)'\)/)?.[1];
                if (tabName) {
                    switchTab(tabName);
                }
            }
        });
    });
}

function setupModalListeners() {
    // Fechar modais clicando fora
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Fechar modais com botão X
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('close')) {
            const modal = event.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    });
}

function setupKeyboardShortcuts() {
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
}

// Funções de Autenticação
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
    
    // Aguardar um frame antes de carregar dados para evitar problemas de layout
    requestAnimationFrame(() => {
        loadAllData();
        updateDashboard();
        createModals(); // Criar modals depois que a interface estiver pronta
        saveData();
    });
}

function updateUserInterface() {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
    
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

// Navegação entre abas - CORRIGIDA
function switchTab(tabName) {
    console.log(`🎯 Navegando para: ${tabName}`);
    
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
        tabContent.classList.add('active');
        tabBtn.classList.add('active');
        
        // Carregar conteúdo específico da aba
        loadTabContent(tabName);
    }
}

function loadTabContent(tabName) {
    switch(tabName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'tasks':
            renderAllTasks();
            break;
        case 'finances':
            updateFinancialDisplay();
            break;
        case 'goals':
            renderAllGoals();
            break;
        case 'team':
            loadTeamMembers();
            break;
    }
}

// Sistema de modais - CORRIGIDO
function createModals() {
    const modalsContainer = document.getElementById('modalsContainer') || document.body;
    
    const modalsHTML = `
        <!-- Task Modal -->
        <div id="taskModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Nova Tarefa</h2>
                <form id="taskForm">
                    <div class="form-group">
                        <label for="taskTitle">Título</label>
                        <input type="text" id="taskTitle" required>
                    </div>
                    <div class="form-group">
                        <label for="taskDescription">Descrição</label>
                        <textarea id="taskDescription" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="taskPriority">Prioridade</label>
                        <select id="taskPriority">
                            <option value="low">🟢 Baixa</option>
                            <option value="medium" selected>🟡 Média</option>
                            <option value="high">🔴 Alta</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="taskDeadline">Prazo</label>
                        <input type="date" id="taskDeadline">
                    </div>
                    <button type="submit" class="btn">Criar Tarefa</button>
                </form>
            </div>
        </div>

        <!-- Income Modal -->
        <div id="incomeModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Nova Receita</h2>
                <form id="incomeForm">
                    <div class="form-group">
                        <label for="incomeDescription">Descrição</label>
                        <input type="text" id="incomeDescription" required>
                    </div>
                    <div class="form-group">
                        <label for="incomeAmount">Valor (R$)</label>
                        <input type="number" id="incomeAmount" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="incomeCategory">Categoria</label>
                        <select id="incomeCategory">
                            <option value="salary">💼 Salário</option>
                            <option value="freelance">💻 Freelance</option>
                            <option value="business">🏢 Negócio</option>
                            <option value="investment">📈 Investimento</option>
                            <option value="other">📦 Outros</option>
                        </select>
                    </div>
                    <button type="submit" class="btn">Adicionar Receita</button>
                </form>
            </div>
        </div>

        <!-- Expense Modal -->
        <div id="expenseModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Novo Gasto</h2>
                <form id="expenseForm">
                    <div class="form-group">
                        <label for="expenseDescription">Descrição</label>
                        <input type="text" id="expenseDescription" required>
                    </div>
                    <div class="form-group">
                        <label for="expenseAmount">Valor (R$)</label>
                        <input type="number" id="expenseAmount" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="expenseCategory">Categoria</label>
                        <select id="expenseCategory">
                            <option value="food">🍔 Alimentação</option>
                            <option value="transport">🚗 Transporte</option>
                            <option value="housing">🏠 Moradia</option>
                            <option value="health">🏥 Saúde</option>
                            <option value="entertainment">🎬 Lazer</option>
                            <option value="education">📚 Educação</option>
                            <option value="shopping">🛍️ Compras</option>
                            <option value="bills">📄 Contas</option>
                            <option value="other">📦 Outros</option>
                        </select>
                    </div>
                    <button type="submit" class="btn">Adicionar Gasto</button>
                </form>
            </div>
        </div>

        <!-- Goal Modal -->
        <div id="goalModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Nova Meta</h2>
                <form id="goalForm">
                    <div class="form-group">
                        <label for="goalName">Nome da Meta</label>
                        <input type="text" id="goalName" required>
                    </div>
                    <div class="form-group">
                        <label for="goalType">Tipo</label>
                        <select id="goalType" onchange="toggleGoalFields()">
                            <option value="financial">💰 Financeira</option>
                            <option value="personal">🎯 Pessoal</option>
                        </select>
                    </div>
                    <div class="form-group" id="goalAmountGroup">
                        <label for="goalAmount">Valor Objetivo (R$)</label>
                        <input type="number" id="goalAmount" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label for="goalDeadline">Prazo</label>
                        <input type="date" id="goalDeadline" required>
                    </div>
                    <div class="form-group">
                        <label for="goalDescription">Descrição</label>
                        <textarea id="goalDescription" rows="3"></textarea>
                    </div>
                    <button type="submit" class="btn">Criar Meta</button>
                </form>
            </div>
        </div>

        <!-- Invite Modal -->
        <div id="inviteModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Convidar Membro</h2>
                <form id="inviteForm">
                    <div class="form-group">
                        <label for="inviteEmail">Email</label>
                        <input type="email" id="inviteEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="inviteRole">Função</label>
                        <select id="inviteRole">
                            <option value="member">👤 Membro</option>
                            <option value="admin">⚡ Administrador</option>
                            <option value="viewer">👁️ Visualizador</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="inviteMessage">Mensagem (opcional)</label>
                        <textarea id="inviteMessage" rows="3" placeholder="Convite para colaborar..."></textarea>
                    </div>
                    <button type="submit" class="btn">Enviar Convite</button>
                </form>
            </div>
        </div>
    `;
    
    // Remover modals existentes
    document.querySelectorAll('.modal').forEach(modal => modal.remove());
    
    // Adicionar novos modals
    modalsContainer.insertAdjacentHTML('beforeend', modalsHTML);
    
    // Disparar evento para configurar listeners
    document.dispatchEvent(new CustomEvent('modalCreated'));
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        
        // Focar no primeiro input
        setTimeout(() => {
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Limpar formulário
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// Função para alternar campos de meta
function toggleGoalFields() {
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
}

// Handlers de formulários - CORRIGIDOS
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
    
    // Simular envio de convite
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

// Sistema de Tarefas - CORRIGIDO
function addTaskToBoard(task) {
    const card = createTaskCard(task);
    const column = document.getElementById(`${task.status}-column`);
    if (column) {
        column.appendChild(card);
    }
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.id = `task-${task.id}`;
    card.draggable = true;
    card.ondragstart = dragStart;
    
    const deadlineText = task.deadline ? 
        `<div style="font-size: 0.8em; color: #666; margin-top: 8px;">📅 ${formatDate(task.deadline)}</div>` : '';
    
    // Criar botões de status baseado no status atual
    const statusButtons = createStatusButtons(task);
    
    card.innerHTML = `
        <div class="task-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div class="task-priority priority-${task.priority}">${getPriorityText(task.priority)}</div>
            <div class="task-status-indicator" style="
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.7em;
                font-weight: 700;
                text-transform: uppercase;
                background: ${getStatusColor(task.status)};
                color: white;
            ">${getStatusText(task.status)}</div>
        </div>
        
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description}</div>
        ${deadlineText}
        
        <div class="task-status-controls" style="margin: 16px 0;">
            ${statusButtons}
        </div>
        
        <div class="task-actions" style="display: flex; justify-content: space-between; align-items: center;">
            <div class="task-drag-hint" style="font-size: 0.7em; color: #999; display: flex; align-items: center; gap: 4px;">
                <span>⇄</span> Arraste para mover
            </div>
            <div style="display: flex; gap: 6px;">
                <button class="task-btn btn-edit" onclick="editTask(${task.id})" title="Editar tarefa">✏️</button>
                <button class="task-btn btn-delete" onclick="deleteTask(${task.id})" title="Excluir tarefa">🗑️</button>
            </div>
        </div>
    `;
    
    return card;
}

function createStatusButtons(task) {
    const statusConfig = {
        todo: {
            next: 'progress',
            nextText: '▶️ Iniciar',
            nextColor: 'linear-gradient(135deg, #4ecdc4, #44a08d)'
        },
        progress: {
            prev: 'todo',
            prevText: '◀️ Voltar',
            prevColor: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
            next: 'done',
            nextText: '✅ Concluir',
            nextColor: 'linear-gradient(135deg, #45b7d1, #96c93d)'
        },
        done: {
            prev: 'progress',
            prevText: '◀️ Reabrir',
            prevColor: 'linear-gradient(135deg, #4ecdc4, #44a08d)'
        }
    };
    
    const config = statusConfig[task.status];
    let buttons = '';
    
    if (config.prev) {
        buttons += `
            <button class="status-btn" onclick="changeTaskStatus(${task.id}, '${config.prev}')" style="
                background: ${config.prevColor};
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.8em;
                font-weight: 600;
                cursor: pointer;
                margin-right: 8px;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
                ${config.prevText}
            </button>
        `;
    }
    
    if (config.next) {
        buttons += `
            <button class="status-btn" onclick="changeTaskStatus(${task.id}, '${config.next}')" style="
                background: ${config.nextColor};
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.8em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
                ${config.nextText}
            </button>
        `;
    }
    
    return `<div style="display: flex; align-items: center;">${buttons}</div>`;
}

function getStatusColor(status) {
    const colors = {
        todo: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
        progress: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
        done: 'linear-gradient(135deg, #45b7d1, #96c93d)'
    };
    return colors[status] || colors.todo;
}

function getStatusText(status) {
    const texts = {
        todo: 'A Fazer',
        progress: 'Fazendo',
        done: 'Concluído'
    };
    return texts[status] || 'A Fazer';
}

function changeTaskStatus(taskId, newStatus) {
    const task = userData.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const oldStatus = task.status;
    task.status = newStatus;
    
    // Mover card visualmente
    const card = document.getElementById(`task-${taskId}`);
    if (card) {
        // Remover da coluna atual
        card.remove();
        
        // Recriar e adicionar na nova coluna
        const newCard = createTaskCard(task);
        const targetColumn = document.getElementById(`${newStatus}-column`);
        if (targetColumn) {
            targetColumn.appendChild(newCard);
        }
    }
    
    // Efeitos especiais
    if (newStatus === 'done' && oldStatus !== 'done') {
        showCelebration('🎉');
        showNotification('Tarefa concluída! Parabéns! 🎉');
        task.completedAt = new Date().toISOString();
    } else if (newStatus === 'progress' && oldStatus === 'todo') {
        showNotification('Tarefa iniciada! Vamos lá! 💪', 'success');
        task.startedAt = new Date().toISOString();
    } else if (newStatus === 'todo' && oldStatus !== 'todo') {
        showNotification('Tarefa reaberta! 🔄', 'success');
    }
    
    updateDashboard();
    saveData();
}

function renderAllTasks() {
    // Limpar colunas
    ['todo', 'progress', 'done'].forEach(status => {
        const column = document.getElementById(`${status}-column`);
        if (column) column.innerHTML = '';
    });
    
    // Renderizar todas as tarefas
    userData.tasks.forEach(task => {
        addTaskToBoard(task);
    });
}

function getPriorityText(priority) {
    const map = { high: '🔴 Alta', medium: '🟡 Média', low: '🟢 Baixa' };
    return map[priority] || '🟡 Média';
}

// Drag and Drop para tarefas - MELHORADO
function dragStart(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.target.classList.add('dragging');
    
    // Destacar todas as colunas como possíveis destinos
    document.querySelectorAll('.kanban-column').forEach(column => {
        column.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
        column.style.borderColor = '#667eea';
        column.style.borderStyle = 'dashed';
    });
    
    // Adicionar indicador visual
    const indicator = document.createElement('div');
    indicator.id = 'drop-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.9em;
        font-weight: 600;
        z-index: 1000;
        animation: pulse 1s infinite;
    `;
    indicator.textContent = '📋 Arraste para a coluna desejada';
    document.body.appendChild(indicator);
}

function dragEnd(ev) {
    ev.target.classList.remove('dragging');
    
    // Remover destaque das colunas
    document.querySelectorAll('.kanban-column').forEach(column => {
        column.style.backgroundColor = '';
        column.style.borderColor = '';
        column.style.borderStyle = '';
    });
    
    // Remover indicador
    const indicator = document.getElementById('drop-indicator');
    if (indicator) indicator.remove();
}

function allowDrop(ev) {
    ev.preventDefault();
    
    // Destacar a coluna específica quando hover
    const column = ev.target.closest('.kanban-column');
    if (column) {
        column.style.backgroundColor = 'rgba(102, 126, 234, 0.2)';
        column.style.transform = 'scale(1.02)';
    }
}

function dragLeave(ev) {
    const column = ev.target.closest('.kanban-column');
    if (column) {
        column.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
        column.style.transform = 'scale(1)';
    }
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    
    if (!draggedElement) return;
    
    // Encontrar a coluna de destino
    let targetColumn = ev.target;
    while (targetColumn && !targetColumn.id.includes('-column')) {
        targetColumn = targetColumn.parentElement;
    }
    
    if (targetColumn && draggedElement) {
        // Adicionar elemento à nova coluna
        targetColumn.appendChild(draggedElement);
        
        // Atualizar status da tarefa
        const taskId = parseInt(data.replace('task-', ''));
        const newStatus = targetColumn.id.replace('-column', '');
        
        const task = userData.tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            const oldStatus = task.status;
            task.status = newStatus;
            
            // Recriar o card com os novos botões de status
            draggedElement.remove();
            const newCard = createTaskCard(task);
            targetColumn.appendChild(newCard);
            
            // Efeitos e notificações
            if (newStatus === 'done' && oldStatus !== 'done') {
                showCelebration('🎉');
                showNotification('Tarefa concluída! Parabéns! 🎉');
                task.completedAt = new Date().toISOString();
            } else if (newStatus === 'progress' && oldStatus === 'todo') {
                showNotification('Tarefa iniciada! Vamos lá! 💪');
                task.startedAt = new Date().toISOString();
            } else if (newStatus === 'todo' && oldStatus !== 'todo') {
                showNotification('Tarefa reaberta! 🔄');
            }
            
            updateDashboard();
            saveData();
        }
    }
    
    // Limpar efeitos visuais
    dragEnd({ target: draggedElement });
}

// Funções de edição - CORRIGIDAS
function editTask(taskId) {
    const task = userData.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Preencher formulário
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDeadline').value = task.deadline;
    
    // Abrir modal
    openModal('taskModal');
    
    // Configurar para modo edição
    const form = document.getElementById('taskForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Atualizar Tarefa';
    
    // Substituir o handler do form temporariamente
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Atualizar task
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
        
        // Restaurar formulário original
        const originalForm = document.getElementById('taskForm');
        if (originalForm) {
            const newOriginalForm = originalForm.cloneNode(true);
            originalForm.parentNode.replaceChild(newOriginalForm, originalForm);
            newOriginalForm.addEventListener('submit', handleTaskSubmit);
            newOriginalForm.querySelector('button[type="submit"]').textContent = originalText;
        }
    });
}

function deleteTask(taskId) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        userData.tasks = userData.tasks.filter(t => t.id !== taskId);
        const taskElement = document.getElementById(`task-${taskId}`);
        if (taskElement) taskElement.remove();
        updateDashboard();
        saveData();
        showNotification('Tarefa excluída!');
    }
}

// Sistema Financeiro - CORRIGIDO
function addTransactionToList(transaction) {
    const list = document.getElementById('transactionsList');
    if (!list) return;
    
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
    
    // Atualizar elementos se existirem
    const mainBalance = document.getElementById('mainBalance');
    const totalIncome = document.getElementById('totalIncome');
    const totalExpenses = document.getElementById('totalExpenses');
    
    if (mainBalance) mainBalance.textContent = `R$ ${balance.toFixed(2)}`;
    if (totalIncome) totalIncome.textContent = `R$ ${income.toFixed(2)}`;
    if (totalExpenses) totalExpenses.textContent = `R$ ${expenses.toFixed(2)}`;
}

// Sistema de Metas - CORRIGIDO
function addGoalToList(goal) {
    const list = document.getElementById('goalsList');
    if (!list) return;
    
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

function renderAllGoals() {
    const list = document.getElementById('goalsList');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (userData.goals.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #666;">
                <div style="font-size: 4em; margin-bottom: 24px;">🎯</div>
                <h3 style="color: #333; margin-bottom: 12px;">Defina suas metas!</h3>
                <p style="margin-bottom: 24px;">Transforme seus sonhos em objetivos concretos</p>
                <button class="btn" onclick="openModal('goalModal')">Criar Primeira Meta</button>
            </div>
        `;
    } else {
        userData.goals.forEach(goal => addGoalToList(goal));
    }
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
    renderAllGoals();
    updateDashboard();
    saveData();
}

function deleteGoal(goalId) {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
        userData.goals = userData.goals.filter(g => g.id !== goalId);
        renderAllGoals();
        updateDashboard();
        saveData();
        showNotification('Meta excluída!');
    }
}

// Sistema de Equipe - CORRIGIDO
function loadTeamMembers() {
    const container = document.getElementById('teamMembers');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (userData.teamMembers.length === 0) {
        container.innerHTML = `
            <div onclick="openModal('inviteModal')" style="
                background: rgba(255,255,255,0.7); 
                border: 2px dashed #ccc; 
                border-radius: 16px; 
                padding: 40px; 
                text-align: center; 
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.borderColor='#667eea'; this.style.background='rgba(255,255,255,0.9)'" onmouseout="this.style.borderColor='#ccc'; this.style.background='rgba(255,255,255,0.7)'">
                <div style="font-size: 3em; margin-bottom: 16px; color: #ccc;">➕</div>
                <h4 style="color: #666; margin-bottom: 8px;">Convide sua primeira pessoa</h4>
                <p style="color: #999; font-size: 0.9em;">Colabore em equipe para alcançar metas juntos</p>
            </div>
        `;
        return;
    }
    
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

// Dashboard e Estatísticas - CORRIGIDO
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
    
    // Atualizar interface - verificar se elementos existem
    const activeTasksEl = document.getElementById('activeTasks');
    const currentBalanceEl = document.getElementById('currentBalance');
    const goalsProgressEl = document.getElementById('goalsProgress');
    const weekScoreEl = document.getElementById('weekScore');
    
    if (activeTasksEl) activeTasksEl.textContent = activeTasks;
    if (currentBalanceEl) currentBalanceEl.textContent = `R$ ${Math.abs(balance).toFixed(0)}`;
    if (goalsProgressEl) goalsProgressEl.textContent = `${goalsProgress.toFixed(0)}%`;
    if (weekScoreEl) weekScoreEl.textContent = weekScore;
    
    updateRecentActivity();
}

function updateRecentActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
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
    renderAllTasks();
    
    // Renderizar transações se a lista existe
    const transactionsList = document.getElementById('transactionsList');
    if (transactionsList) {
        transactionsList.innerHTML = '';
        userData.transactions.forEach(addTransactionToList);
    }
    
    updateFinancialDisplay();
    renderAllGoals();
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
            type: 'expense',
            description: 'Supermercado - Compras da semana',
            amount: 320.50,
            category: 'food',
            date: new Date(Date.now() - 3600000).toISOString(),
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
        }
    ];

    // Adicionar aos dados do usuário
    userData.tasks.push(...demoTasks);
    userData.transactions.push(...demoTransactions);
    userData.goals.push(...demoGoals);

    // Recarregar interface
    loadAllData();
    updateDashboard();
    saveData();
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
    if (!alertContainer) {
        console.log(`Alert: ${message}`);
        return;
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentNode) alert.remove();
    }, 5000);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        background: ${type === 'success' ? 'linear-gradient(135deg, #4caf50, #66bb6a)' : 'linear-gradient(135deg, #f44336, #ef5350)'};
        animation: slideInRight 0.4s ease;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 4000);
}

function showCelebration(emoji) {
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4em;
        z-index: 1002;
        animation: celebrate 1s ease;
        pointer-events: none;
    `;
    celebration.textContent = emoji;
    
    document.body.appendChild(celebration);
    
    setTimeout(() => {
        if (celebration.parentNode) celebration.remove();
    }, 1000);
}

// Sistema de persistência de dados
function saveData() {
    if (!currentUser) return;
    
    try {
        // Salvar dados globais
        const globalData = {
            users: users,
            currentUser: currentUser,
            userData: userData,
            idCounters: idCounters
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

// Adicionar estilos CSS necessários
function addRequiredStyles() {
    if (document.getElementById('lifemanager-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'lifemanager-styles';
    style.textContent = `
        /* Estilos dos modais */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
        }
        
        .modal-content {
            background: white;
            margin: 5% auto;
            padding: 40px;
            border-radius: 20px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
            position: relative;
        }
        
        .close {
            position: absolute;
            right: 20px;
            top: 20px;
            color: #aaa;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            transition: color 0.3s ease;
        }
        
        .close:hover {
            color: #667eea;
        }
        
        /* Estilos dos botões e formulários */
        .btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 700;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
            font-size: 0.95em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            width: 100%;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.6);
        }
        
        .form-group {
            margin-bottom: 24px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #444;
            font-size: 0.95em;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 16px 20px;
            border: 2px solid #e8eaed;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #fafbfc;
            font-weight: 500;
            box-sizing: border-box;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
            transform: translateY(-1px);
        }
        
        /* Estilos das tarefas */
        .task-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
            cursor: grab;
            transition: all 0.3s ease;
            border: 1px solid rgba(0, 0, 0, 0.05);
            position: relative;
        }
        
        .task-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        }
        
        .task-card.dragging {
            opacity: 0.6;
            transform: rotate(2deg) scale(1.05);
            z-index: 1000;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }
        
        .task-card:active {
            cursor: grabbing;
        }
        
        /* Melhorias nos status buttons */
        .status-btn {
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .status-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }
        
        .status-btn:active {
            transform: translateY(0) !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .task-title {
            font-weight: 700;
            margin-bottom: 8px;
            color: #333;
            font-size: 1.05em;
        }
        
        .task-description {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 16px;
            line-height: 1.5;
        }
        
        .task-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .task-priority {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .priority-high { 
            background: linear-gradient(135deg, #ffebee, #fce4ec); 
            color: #c62828; 
            border: 1px solid #ffcdd2;
        }
        
        .priority-medium { 
            background: linear-gradient(135deg, #fff3e0, #fce4ec); 
            color: #ef6c00; 
            border: 1px solid #ffcc02;
        }
        
        .priority-low { 
            background: linear-gradient(135deg, #e8f5e8, #f1f8e9); 
            color: #2e7d32; 
            border: 1px solid #c8e6c9;
        }
        
        .task-actions {
            display: flex;
            gap: 8px;
        }
        
        .task-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.8em;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-edit {
            background: linear-gradient(135deg, #2196f3, #21cbf3);
            color: white;
        }
        
        .btn-delete {
            background: linear-gradient(135deg, #f44336, #ff5722);
            color: white;
        }
        
        .task-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        /* Estilos das colunas Kanban */
        .kanban-column {
            background: rgba(255, 255, 255, 0.7);
            border-radius: 16px;
            padding: 24px;
            min-height: 500px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .column-header {
            font-size: 1.1em;
            font-weight: 700;
            margin-bottom: 20px;
            padding: 16px;
            border-radius: 12px;
            text-align: center;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
        }
        
        #todo-column { min-height: 400px; }
        #progress-column { min-height: 400px; }
        #done-column { min-height: 400px; }
        
        /* Estilos das transações */
        .transaction-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 12px;
            margin-bottom: 12px;
            transition: all 0.3s ease;
            border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .transaction-item:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .transaction-income { 
            border-left: 4px solid #4caf50; 
        }
        
        .transaction-expense { 
            border-left: 4px solid #f44336; 
        }
        
        /* Estilos das metas */
        .goal-item {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 16px;
            padding: 28px;
            margin-bottom: 24px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
        }
        
        .goal-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
        }
        
        .goal-progress {
            background: #f0f0f0;
            border-radius: 12px;
            height: 12px;
            overflow: hidden;
            margin: 16px 0;
            position: relative;
        }
        
        .goal-progress-bar {
            height: 100%;
            background: linear-gradient(135deg, #4caf50, #66bb6a);
            border-radius: 12px;
            transition: width 0.6s ease;
            position: relative;
        }
        
        /* Alertas */
        .alert {
            padding: 16px 20px;
            margin-bottom: 20px;
            border-radius: 12px;
            font-weight: 600;
        }
        
        .alert-success {
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert-error {
            background: linear-gradient(135deg, #f8d7da, #f5c6cb);
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        /* Animações */
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes celebrate {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        
        @keyframes pulse {
            0% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(1.05); }
            100% { transform: translateX(-50%) scale(1); }
        }
        
        @keyframes upgradeSuccess {
            0% { 
                transform: translate(-50%, -50%) scale(0.5);
                opacity: 0;
            }
            20% { 
                transform: translate(-50%, -50%) scale(1.1);
                opacity: 1;
            }
            80% { 
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            100% { 
                transform: translate(-50%, -50%) scale(0.9);
                opacity: 0;
            }
        }
        
        /* Melhorias nas colunas Kanban */
        .kanban-column {
            transition: all 0.3s ease;
        }
        
        .kanban-column.drag-over {
            background: rgba(102, 126, 234, 0.2) !important;
            border: 2px dashed #667eea !important;
            transform: scale(1.02);
        }
        
        /* Layout fixes */
        body {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        body.loaded {
            opacity: 1;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
            .modal-content {
                margin: 10% auto;
                padding: 24px;
                width: 95%;
            }
            
            .task-card {
                padding: 16px;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                padding: 12px 16px;
                font-size: 14px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Inicializar estilos quando documento carregar
document.addEventListener('DOMContentLoaded', function() {
    addRequiredStyles();
    
    // Aplicar classe loaded após um pequeno delay
    setTimeout(() => {
        document.body.classList.add('loaded');
        document.body.style.opacity = '1';
    }, 200);
});

// Garantir que modals sejam recriados quando necessário
document.addEventListener('click', function(e) {
    // Se clicou em um botão que deveria abrir modal mas modal não existe
    const onclick = e.target.getAttribute('onclick');
    if (onclick && onclick.includes('openModal') && !document.querySelector('.modal')) {
        createModals();
        
        // Reexecutar o clique após criar os modals
        setTimeout(() => {
            const modalId = onclick.match(/openModal\('(.+?)'\)/)?.[1];
            if (modalId) openModal(modalId);
        }, 100);
    }
});

// Funções globais para compatibilidade
window.switchAuthTab = function(tab) {
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
};

// Exportar funções principais para o escopo global
window.switchTab = switchTab;
window.openModal = openModal;
window.closeModal = closeModal;
window.logout = logout;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.updateGoalProgress = updateGoalProgress;
window.deleteGoal = deleteGoal;
window.showWelcomeDemo = showWelcomeDemo;
window.toggleGoalFields = toggleGoalFields;
window.allowDrop = allowDrop;
window.drop = drop;
window.changeTaskStatus = changeTaskStatus;
window.exportUserData = exportUserData; // Backup
window.importUserData = importUserData; // Restore
window.showUpgradeModal = showUpgradeModal; // Upgrade Pro
window.simulateUpgrade = simulateUpgrade; // Simular upgrade

console.log('✅ LifeManager carregado e pronto para uso!');