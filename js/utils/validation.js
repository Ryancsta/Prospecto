/**
 * LifeManager - Sistema de Validação
 * Funções de validação para formulários e dados
 */

window.Validation = {
    
    // Validar email
    email(email) {
        if (!email || typeof email !== 'string') {
            return { valid: false, message: 'Email é obrigatório' };
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email.trim())) {
            return { valid: false, message: 'Email inválido' };
        }
        
        return { valid: true, message: '' };
    },
    
    // Validar senha
    password(password, confirmPassword = null) {
        if (!password) {
            return { valid: false, message: 'Senha é obrigatória' };
        }
        
        if (password.length < Config.validation.password.minLength) {
            return { valid: false, message: `Senha deve ter pelo menos ${Config.validation.password.minLength} caracteres` };
        }
        
        if (Config.validation.password.requireNumbers && !/\d/.test(password)) {
            return { valid: false, message: 'Senha deve conter pelo menos um número' };
        }
        
        if (Config.validation.password.requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return { valid: false, message: 'Senha deve conter pelo menos um símbolo' };
        }
        
        if (Config.validation.password.requireUppercase && !/[A-Z]/.test(password)) {
            return { valid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
        }
        
        if (confirmPassword !== null && password !== confirmPassword) {
            return { valid: false, message: 'Senhas não conferem' };
        }
        
        return { valid: true, message: '' };
    },
    
    // Validar nome
    name(name) {
        if (!name || typeof name !== 'string') {
            return { valid: false, message: 'Nome é obrigatório' };
        }
        
        const trimmedName = name.trim();
        
        if (trimmedName.length < Config.validation.names.minLength) {
            return { valid: false, message: `Nome deve ter pelo menos ${Config.validation.names.minLength} caracteres` };
        }
        
        if (trimmedName.length > Config.validation.names.maxLength) {
            return { valid: false, message: `Nome deve ter no máximo ${Config.validation.names.maxLength} caracteres` };
        }
        
        if (!Config.validation.names.allowNumbers && /\d/.test(trimmedName)) {
            return { valid: false, message: 'Nome não pode conter números' };
        }
        
        return { valid: true, message: '' };
    },
    
    // Validar número/valor monetário
    currency(value) {
        if (value === '' || value === null || value === undefined) {
            return { valid: false, message: 'Valor é obrigatório' };
        }
        
        const numValue = parseFloat(value);
        
        if (isNaN(numValue)) {
            return { valid: false, message: 'Valor deve ser um número válido' };
        }
        
        if (numValue < 0) {
            return { valid: false, message: 'Valor não pode ser negativo' };
        }
        
        if (numValue > 999999999) {
            return { valid: false, message: 'Valor muito alto' };
        }
        
        return { valid: true, message: '', value: numValue };
    },
    
    // Validar data
    date(dateString, options = {}) {
        if (!dateString) {
            return { valid: false, message: 'Data é obrigatória' };
        }
        
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return { valid: false, message: 'Data inválida' };
        }
        
        const now = new Date();
        
        if (options.futureOnly && date <= now) {
            return { valid: false, message: 'Data deve ser no futuro' };
        }
        
        if (options.pastOnly && date >= now) {
            return { valid: false, message: 'Data deve ser no passado' };
        }
        
        if (options.minDate && date < new Date(options.minDate)) {
            return { valid: false, message: `Data deve ser posterior a ${new Date(options.minDate).toLocaleDateString('pt-BR')}` };
        }
        
        if (options.maxDate && date > new Date(options.maxDate)) {
            return { valid: false, message: `Data deve ser anterior a ${new Date(options.maxDate).toLocaleDateString('pt-BR')}` };
        }
        
        return { valid: true, message: '', value: date };
    },
    
    // Validar texto obrigatório
    required(value, fieldName = 'Campo') {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return { valid: false, message: `${fieldName} é obrigatório` };
        }
        
        return { valid: true, message: '' };
    },
    
    // Validar comprimento de texto
    length(text, min = 0, max = Infinity, fieldName = 'Campo') {
        if (!text) text = '';
        
        const length = text.trim().length;
        
        if (length < min) {
            return { valid: false, message: `${fieldName} deve ter pelo menos ${min} caracteres` };
        }
        
        if (length > max) {
            return { valid: false, message: `${fieldName} deve ter no máximo ${max} caracteres` };
        }
        
        return { valid: true, message: '' };
    },
    
    // Validar tarefas
    task(taskData) {
        const errors = [];
        
        // Validar título
        const titleValidation = this.required(taskData.title, 'Título');
        if (!titleValidation.valid) {
            errors.push(titleValidation.message);
        } else {
            const lengthValidation = this.length(taskData.title, 2, 100, 'Título');
            if (!lengthValidation.valid) {
                errors.push(lengthValidation.message);
            }
        }
        
        // Validar descrição (opcional, mas se preenchida deve ter tamanho mínimo)
        if (taskData.description && taskData.description.trim()) {
            const descValidation = this.length(taskData.description, 5, 500, 'Descrição');
            if (!descValidation.valid) {
                errors.push(descValidation.message);
            }
        }
        
        // Validar prioridade
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(taskData.priority)) {
            errors.push('Prioridade inválida');
        }
        
        // Validar deadline (se fornecida)
        if (taskData.deadline) {
            const dateValidation = this.date(taskData.deadline, { futureOnly: false });
            if (!dateValidation.valid) {
                errors.push(`Prazo: ${dateValidation.message}`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            message: errors.join(', ')
        };
    },
    
    // Validar transação financeira
    transaction(transactionData) {
        const errors = [];
        
        // Validar descrição
        const descValidation = this.required(transactionData.description, 'Descrição');
        if (!descValidation.valid) {
            errors.push(descValidation.message);
        } else {
            const lengthValidation = this.length(transactionData.description, 2, 100, 'Descrição');
            if (!lengthValidation.valid) {
                errors.push(lengthValidation.message);
            }
        }
        
        // Validar valor
        const amountValidation = this.currency(transactionData.amount);
        if (!amountValidation.valid) {
            errors.push(`Valor: ${amountValidation.message}`);
        } else if (amountValidation.value === 0) {
            errors.push('Valor deve ser maior que zero');
        }
        
        // Validar tipo
        const validTypes = ['income', 'expense'];
        if (!validTypes.includes(transactionData.type)) {
            errors.push('Tipo de transação inválido');
        }
        
        // Validar categoria
        const validCategories = [
            // Income
            'salary', 'freelance', 'business', 'investment', 'gift', 'other',
            // Expense
            'food', 'transport', 'housing', 'health', 'entertainment', 
            'education', 'shopping', 'bills'
        ];
        
        if (!validCategories.includes(transactionData.category)) {
            errors.push('Categoria inválida');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            message: errors.join(', ')
        };
    },
    
    // Validar meta
    goal(goalData) {
        const errors = [];
        
        // Validar nome
        const nameValidation = this.required(goalData.name, 'Nome da meta');
        if (!nameValidation.valid) {
            errors.push(nameValidation.message);
        } else {
            const lengthValidation = this.length(goalData.name, 3, 80, 'Nome da meta');
            if (!lengthValidation.valid) {
                errors.push(lengthValidation.message);
            }
        }
        
        // Validar tipo
        const validTypes = ['financial', 'personal'];
        if (!validTypes.includes(goalData.type)) {
            errors.push('Tipo de meta inválido');
        }
        
        // Validar valor (para metas financeiras)
        if (goalData.type === 'financial') {
            const amountValidation = this.currency(goalData.amount);
            if (!amountValidation.valid) {
                errors.push(`Valor objetivo: ${amountValidation.message}`);
            } else if (amountValidation.value === 0) {
                errors.push('Valor objetivo deve ser maior que zero');
            }
        }
        
        // Validar prazo
        const deadlineValidation = this.date(goalData.deadline, { futureOnly: true });
        if (!deadlineValidation.valid) {
            errors.push(`Prazo: ${deadlineValidation.message}`);
        }
        
        // Validar descrição (opcional)
        if (goalData.description && goalData.description.trim()) {
            const descValidation = this.length(goalData.description, 10, 300, 'Descrição');
            if (!descValidation.valid) {
                errors.push(descValidation.message);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            message: errors.join(', ')
        };
    },
    
    // Validar convite de equipe
    invite(inviteData) {
        const errors = [];
        
        // Validar email
        const emailValidation = this.email(inviteData.email);
        if (!emailValidation.valid) {
            errors.push(`Email: ${emailValidation.message}`);
        }
        
        // Validar função
        const validRoles = ['admin', 'member', 'viewer'];
        if (!validRoles.includes(inviteData.role)) {
            errors.push('Função inválida');
        }
        
        // Validar mensagem (opcional)
        if (inviteData.message && inviteData.message.trim()) {
            const messageValidation = this.length(inviteData.message, 10, 500, 'Mensagem');
            if (!messageValidation.valid) {
                errors.push(messageValidation.message);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            message: errors.join(', ')
        };
    },
    
    // Validar formulário completo
    form(formElement) {
        const errors = [];
        const formData = new FormData(formElement);
        const fields = {};
        
        // Extrair dados do formulário
        for (let [key, value] of formData.entries()) {
            fields[key] = value;
        }
        
        // Validar cada campo com atributos required
        const requiredFields = formElement.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            const validation = this.required(field.value, field.getAttribute('data-label') || field.name);
            if (!validation.valid) {
                errors.push(validation.message);
                this.showFieldError(field, validation.message);
            } else {
                this.clearFieldError(field);
            }
        });
        
        // Validar campos com validação específica
        const emailFields = formElement.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value) {
                const validation = this.email(field.value);
                if (!validation.valid) {
                    errors.push(validation.message);
                    this.showFieldError(field, validation.message);
                }
            }
        });
        
        const passwordFields = formElement.querySelectorAll('input[type="password"]');
        if (passwordFields.length === 2) {
            // Validar confirmação de senha
            const password = passwordFields[0].value;
            const confirmPassword = passwordFields[1].value;
            
            if (password && confirmPassword) {
                const validation = this.password(password, confirmPassword);
                if (!validation.valid) {
                    errors.push(validation.message);
                    this.showFieldError(passwordFields[1], validation.message);
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            data: fields
        };
    },
    
    // Mostrar erro no campo
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.style.borderColor = '#f44336';
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
            color: #f44336;
            font-size: 0.8em;
            margin-top: 4px;
            font-weight: 500;
        `;
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
        
        // Remover erro quando campo for modificado
        const removeError = () => {
            this.clearFieldError(field);
            field.removeEventListener('input', removeError);
        };
        
        field.addEventListener('input', removeError);
    },
    
    // Limpar erro do campo
    clearFieldError(field) {
        field.style.borderColor = '';
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    },
    
    // Sanitizar entrada de texto
    sanitizeText(text) {
        if (typeof text !== 'string') return '';
        
        return text
            .trim()
            .replace(/[<>]/g, '') // Remover caracteres perigosos
            .substring(0, 1000); // Limitar tamanho
    },
    
    // Sanitizar entrada HTML
    sanitizeHTML(html) {
        const tempDiv = document.createElement('div');
        tempDiv.textContent = html;
        return tempDiv.innerHTML;
    },
    
    // Validar URL
    url(url) {
        if (!url) {
            return { valid: false, message: 'URL é obrigatória' };
        }
        
        try {
            new URL(url);
            return { valid: true, message: '' };
        } catch (e) {
            return { valid: false, message: 'URL inválida' };
        }
    },
    
    // Validar número de telefone (formato brasileiro)
    phone(phone) {
        if (!phone) {
            return { valid: false, message: 'Telefone é obrigatório' };
        }
        
        // Remover caracteres não numéricos
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Validar formato brasileiro (10 ou 11 dígitos)
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            return { valid: false, message: 'Telefone deve ter 10 ou 11 dígitos' };
        }
        
        return { valid: true, message: '', value: cleanPhone };
    }
};

// Funções globais para compatibilidade
window.validateEmail = function(email) {
    return Validation.email(email).valid;
};

window.validateForm = function(formElement) {
    return Validation.form(formElement);
};