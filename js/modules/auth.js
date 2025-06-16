/**
 * LifeManager - Sistema de Autenticação
 * Gerencia login, registro e sessões de usuário
 */

window.Auth = {
    // Trocar entre abas de autenticação
    switchTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(tab + 'Form').classList.add('active');
    },
    
    // Processar login
    async login(email, password) {
        try {
            email = email.toLowerCase().trim();
            
            if (!users[email]) {
                throw new Error('Email não encontrado. Verifique ou crie uma conta.');
            }
            
            if (users[email].password !== btoa(password)) {
                throw new Error('Senha incorreta. Tente novamente.');
            }
            
            currentUser = users[email];
            loadUserData(email);
            this.showApp();
            
            if (window.Notifications) {
                Notifications.show(`Bem-vindo(a), ${currentUser.name}! 🎉`, 'success');
            }
            
            return true;
        } catch (error) {
            if (window.Notifications) {
                Notifications.show(error.message, 'error');
            } else {
                this.showAlert(error.message, 'error');
            }
            return false;
        }
    },
    
    // Processar registro
    async register(userData) {
        try {
            const { name, email, password, confirmPassword } = userData;
            
            // Validações
            if (!this.validateName(name)) {
                throw new Error('Nome deve ter pelo menos 2 caracteres.');
            }
            
            if (!this.validateEmail(email)) {
                throw new Error('Email inválido.');
            }
            
            if (!this.validatePassword(password)) {
                throw new Error('Senha deve ter pelo menos 6 caracteres.');
            }
            
            if (password !== confirmPassword) {
                throw new Error('Senhas não conferem.');
            }
            
            if (users[email.toLowerCase()]) {
                throw new Error('Este email já está cadastrado. Faça login.');
            }
            
            // Criar usuário
            const newUser = {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: btoa(password),
                plan: 'free',
                createdAt: new Date().toISOString()
            };
            
            users[newUser.email] = newUser;
            currentUser = newUser;
            userData = { tasks: [], transactions: [], goals: [], teamMembers: [] };
            idCounters = { task: 1, transaction: 1, goal: 1, invite: 1 };
            
            this.showApp();
            
            if (window.Notifications) {
                Notifications.show(`Conta criada! Bem-vindo(a), ${name}! 🎉`, 'success');
            }
            
            return true;
        } catch (error) {
            if (window.Notifications) {
                Notifications.show(error.message, 'error');
            } else {
                this.showAlert(error.message, 'error');
            }
            return false;
        }
    },
    
    // Fazer logout
    logout() {
        if (confirm('Tem certeza que deseja sair?')) {
            if (typeof saveData === 'function') {
                saveData();
            }
            
            currentUser = null;
            userData = { tasks: [], transactions: [], goals: [], teamMembers: [] };
            
            this.showAuth();
            
            // Limpar formulários
            this.clearAuthForms();
            
            if (window.Notifications) {
                Notifications.show('Logout realizado com sucesso!', 'success');
            }
        }
    },
    
    // Mostrar tela de autenticação
    showAuth() {
        document.getElementById('authSection').style.display = 'flex';
        document.getElementById('appSection').style.display = 'none';
    },
    
    // Mostrar aplicação principal
    showApp() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('appSection').style.display = 'block';
        
        this.updateUserInterface();
        
        if (typeof loadAllData === 'function') {
            loadAllData();
        }
        
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        
        if (typeof saveData === 'function') {
            saveData();
        }
    },
    
    // Atualizar interface do usuário
    updateUserInterface() {
        if (!currentUser) return;
        
        const elements = {
            userName: document.getElementById('userName'),
            userEmail: document.getElementById('userEmail'),
            userAvatar: document.getElementById('userAvatar'),
            mainUserAvatar: document.getElementById('mainUserAvatar'),
            mainUserName: document.getElementById('mainUserName'),
            userPlan: document.getElementById('userPlan')
        };
        
        if (elements.userName) elements.userName.textContent = currentUser.name;
        if (elements.userEmail) elements.userEmail.textContent = currentUser.email;
        if (elements.userAvatar) elements.userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        if (elements.mainUserAvatar) elements.mainUserAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        if (elements.mainUserName) elements.mainUserName.textContent = currentUser.name;
        
        const planText = currentUser.plan === 'pro' ? 'Pro' : 'Grátis';
        if (elements.userPlan) elements.userPlan.textContent = planText;
    },
    
    // Limpar formulários de autenticação
    clearAuthForms() {
        const forms = ['loginForm', 'registerForm'];
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) form.reset();
        });
    },
    
    // Validações
    validateName(name) {
        return name && name.trim().length >= 2;
    },
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    validatePassword(password) {
        return password && password.length >= 6;
    },
    
    // Mostrar alerta (fallback)
    showAlert(message, type = 'success') {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        alertContainer.innerHTML = '';
        alertContainer.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    },
    
    // Verificar se usuário está logado
    isAuthenticated() {
        return currentUser !== null;
    },
    
    // Obter usuário atual
    getCurrentUser() {
        return currentUser;
    },
    
    // Inicializar usuário demo
    setupDemoUser() {
        const demoEmail = 'demo@lifecontrol.com';
        users[demoEmail] = {
            name: 'Usuário Demo',
            email: demoEmail,
            password: btoa('demo123'),
            plan: 'pro',
            createdAt: new Date().toISOString()
        };
        
        // Pré-preencher campos de login
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');
        
        if (loginEmail) loginEmail.value = demoEmail;
        if (loginPassword) loginPassword.value = 'demo123';
    }
};

// Funções globais para compatibilidade
window.switchAuthTab = function(tab) {
    Auth.switchTab(tab);
};

window.logout = function() {
    Auth.logout();
};