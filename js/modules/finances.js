/**
 * LifeManager - Módulo Financeiro
 * Gerencia receitas, despesas e análises financeiras
 */

window.Finances = {
    currentPeriod: 'month',
    currentView: 'transactions',
    
    // Inicializar módulo
    initialize() {
        this.setupControls();
        this.setupCharts();
        return true;
    },
    
    // Configurar controles
    setupControls() {
        this.createPeriodSelector();
        this.createViewSelector();
        this.createFilterControls();
    },
    
    // Criar seletor de período
    createPeriodSelector() {
        const header = document.querySelector('#finances .tab-content > h2');
        if (!header || document.getElementById('periodSelector')) return;
        
        const controlsDiv = document.createElement('div');
        controlsDiv.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        `;
        
        controlsDiv.innerHTML = `
            <div id="periodSelector" style="display: flex; gap: 8px;">
                <button class="period-btn active" onclick="Finances.setPeriod('week')" data-period="week">Semana</button>
                <button class="period-btn" onclick="Finances.setPeriod('month')" data-period="month">Mês</button>
                <button class="period-btn" onclick="Finances.setPeriod('year')" data-period="year">Ano</button>
                <button class="period-btn" onclick="Finances.setPeriod('all')" data-period="all">Tudo</button>
            </div>
            
            <div style="display: flex; gap: 12px; align-items: center;">
                <select id="categoryFilter" onchange="Finances.applyFilters()" style="
                    padding: 8px 12px;
                    border: 2px solid #e8eaed;
                    border-radius: 8px;
                    font-size: 14px;
                ">
                    <option value="all">Todas Categorias</option>
                    <option value="food">🍔 Alimentação</option>
                    <option value="transport">🚗 Transporte</option>
                    <option value="housing">🏠 Moradia</option>
                    <option value="health">🏥 Saúde</option>
                    <option value="entertainment">🎬 Lazer</option>
                    <option value="salary">💼 Salário</option>
                    <option value="freelance">💻 Freelance</option>
                </select>
                
                <button class="btn" onclick="Finances.exportReport()" style="padding: 8px 16px; font-size: 14px;">
                    📊 Relatório
                </button>
            </div>
        `;
        
        header.parentNode.insertBefore(controlsDiv, header.nextSibling);
        
        // Estilizar botões de período
        const style = document.createElement('style');
        style.textContent = `
            .period-btn {
                padding: 8px 16px;
                border: 2px solid #e8eaed;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            .period-btn:hover {
                border-color: #667eea;
                background: rgba(102, 126, 234, 0.1);
            }
            .period-btn.active {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-color: #667eea;
            }
        `;
        document.head.appendChild(style);
    },
    
    // Carregar dados do módulo
    loadData() {
        this.updateFinancialSummary();
        this.renderTransactions();
        this.updateCharts();
    },
    
    // Definir período
    setPeriod(period) {
        this.currentPeriod = period;
        
        // Atualizar botões
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
        
        this.loadData();
    },
    
    // Obter transações do período
    getTransactionsForPeriod() {
        const now = new Date();
        let startDate;
        
        switch(this.currentPeriod) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'all':
            default:
                return userData.transactions;
        }
        
        return userData.transactions.filter(t => new Date(t.date) >= startDate);
    },
    
    // Atualizar resumo financeiro
    updateFinancialSummary() {
        const transactions = this.getTransactionsForPeriod();
        
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const balance = income - expenses;
        
        // Atualizar cards principais
        this.updateElement('mainBalance', this.formatCurrency(balance));
        this.updateElement('totalIncome', this.formatCurrency(income));
        this.updateElement('totalExpenses', this.formatCurrency(expenses));
        
        // Atualizar cor do saldo
        const balanceCard = document.querySelector('.balance-card');
        if (balanceCard) {
            if (balance < 0) {
                balanceCard.style.background = 'linear-gradient(135deg, #f44336, #e91e63)';
            } else if (balance < income * 0.2) {
                balanceCard.style.background = 'linear-gradient(135deg, #ff9800, #ffc107)';
            } else {
                balanceCard.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            }
        }
        
        // Adicionar estatísticas extras
        this.updatePeriodStats(transactions, income, expenses, balance);
    },
    
    // Atualizar estatísticas do período
    updatePeriodStats(transactions, income, expenses, balance) {
        const balanceSubtitle = document.querySelector('.balance-subtitle');
        if (balanceSubtitle) {
            const periodNames = {
                week: 'na semana',
                month: 'no mês',
                year: 'no ano',
                all: 'no total'
            };
            
            const avgDaily = this.currentPeriod === 'week' ? expenses / 7 :
                           this.currentPeriod === 'month' ? expenses / 30 :
                           this.currentPeriod === 'year' ? expenses / 365 : 0;
            
            balanceSubtitle.innerHTML = `
                Receitas: ${this.formatCurrency(income)} • 
                Gastos: ${this.formatCurrency(expenses)}
                ${avgDaily > 0 ? `<br><small>Média diária: ${this.formatCurrency(avgDaily)}</small>` : ''}
            `;
        }
    },
    
    // Renderizar transações
    renderTransactions() {
        const list = document.getElementById('transactionsList');
        if (!list) return;
        
        const transactions = this.getFilteredTransactions();
        
        if (transactions.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 2.5em; margin-bottom: 16px;">💳</div>
                    <p>Nenhuma movimentação encontrada para este período</p>
                    <button class="btn" style="margin-top: 16px;" onclick="openModal('incomeModal')">
                        Adicionar Primeira Receita
                    </button>
                </div>
            `;
            return;
        }
        
        // Agrupar transações por data
        const groupedTransactions = this.groupTransactionsByDate(transactions);
        
        list.innerHTML = Object.entries(groupedTransactions)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, dayTransactions]) => `
                <div class="transaction-group" style="margin-bottom: 24px;">
                    <div class="transaction-date-header" style="
                        font-weight: 700;
                        color: #667eea;
                        margin-bottom: 12px;
                        padding-bottom: 8px;
                        border-bottom: 2px solid #f0f0f0;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <span>${this.formatDateHeader(date)}</span>
                        <span style="font-size: 0.9em; font-weight: 600;">
                            ${this.getDayBalance(dayTransactions)}
                        </span>
                    </div>
                    
                    ${dayTransactions.map(transaction => this.createTransactionHTML(transaction)).join('')}
                </div>
            `).join('');
    },
    
    // Agrupar transações por data
    groupTransactionsByDate(transactions) {
        return transactions.reduce((groups, transaction) => {
            const date = new Date(transaction.date).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(transaction);
            return groups;
        }, {});
    },
    
    // Obter saldo do dia
    getDayBalance(dayTransactions) {
        const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expenses;
        
        const color = balance >= 0 ? '#4caf50' : '#f44336';
        const sign = balance >= 0 ? '+' : '';
        
        return `<span style="color: ${color};">${sign}${this.formatCurrency(balance)}</span>`;
    },
    
    // Criar HTML da transação
    createTransactionHTML(transaction) {
        const icon = transaction.type === 'income' ? '💰' : '💸';
        const sign = transaction.type === 'income' ? '+' : '-';
        const color = transaction.type === 'income' ? '#4caf50' : '#f44336';
        
        return `
            <div class="transaction-item transaction-${transaction.type}" style="position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <div style="font-weight: 700; margin-bottom: 4px;">
                            ${icon} ${transaction.description}
                        </div>
                        <div style="color: #666; font-size: 0.9em;">
                            ${this.getCategoryText(transaction.category)} • ${this.formatTime(transaction.date)}
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="font-weight: 700; color: ${color}; font-size: 1.1em;">
                            ${sign}${this.formatCurrency(transaction.amount)}
                        </div>
                        <div class="transaction-actions">
                            <button class="task-btn btn-edit" onclick="Finances.editTransaction(${transaction.id})" title="Editar">
                                ✏️
                            </button>
                            <button class="task-btn btn-delete" onclick="Finances.deleteTransaction(${transaction.id})" title="Excluir">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Obter transações filtradas
    getFilteredTransactions() {
        let transactions = this.getTransactionsForPeriod();
        
        // Filtro por categoria
        const categoryFilter = document.getElementById('categoryFilter')?.value;
        if (categoryFilter && categoryFilter !== 'all') {
            transactions = transactions.filter(t => t.category === categoryFilter);
        }
        
        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    
    // Aplicar filtros
    applyFilters() {
        this.renderTransactions();
        this.updateCharts();
    },
    
    // Editar transação
    editTransaction(transactionId) {
        const transaction = userData.transactions.find(t => t.id === transactionId);
        if (!transaction) return;
        
        const modalId = transaction.type === 'income' ? 'incomeModal' : 'expenseModal';
        const form = document.getElementById(transaction.type === 'income' ? 'incomeForm' : 'expenseForm');
        
        // Preencher formulário
        document.getElementById(`${transaction.type}Description`).value = transaction.description;
        document.getElementById(`${transaction.type}Amount`).value = transaction.amount;
        document.getElementById(`${transaction.type}Category`).value = transaction.category;
        
        // Configurar para modo edição
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Atualizar ' + (transaction.type === 'income' ? 'Receita' : 'Gasto');
        
        const originalSubmit = form.onsubmit;
        form.onsubmit = (e) => {
            e.preventDefault();
            
            transaction.description = document.getElementById(`${transaction.type}Description`).value.trim();
            transaction.amount = parseFloat(document.getElementById(`${transaction.type}Amount`).value);
            transaction.category = document.getElementById(`${transaction.type}Category`).value;
            
            this.loadData();
            if (typeof updateDashboard === 'function') updateDashboard();
            saveData();
            
            closeModal(modalId);
            Notifications.show('Transação atualizada! ✏️', 'success');
            
            // Restaurar formulário
            submitBtn.textContent = originalText;
            form.onsubmit = originalSubmit;
        };
        
        openModal(modalId);
    },
    
    // Excluir transação
    deleteTransaction(transactionId) {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            userData.transactions = userData.transactions.filter(t => t.id !== transactionId);
            
            this.loadData();
            if (typeof updateDashboard === 'function') updateDashboard();
            saveData();
            
            Notifications.show('Transação excluída!', 'success');
        }
    },
    
    // Atualizar gráficos
    updateCharts() {
        this.updateCategoryChart();
        this.updateTrendChart();
        this.updateBalanceChart();
    },
    
    // Gráfico de categorias
    updateCategoryChart() {
        const chartContainer = document.getElementById('financialCategoryChart');
        if (!chartContainer) return;
        
        const transactions = this.getFilteredTransactions();
        const expenses = transactions.filter(t => t.type === 'expense');
        
        const categoryData = this.getCategoryExpenses(expenses);
        const total = categoryData.reduce((sum, cat) => sum + cat.amount, 0);
        
        if (categoryData.length === 0) {
            chartContainer.innerHTML = '<p style="text-align: center; color: #666;">Nenhum gasto neste período</p>';
            return;
        }
        
        chartContainer.innerHTML = categoryData.map(category => `
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <div style="width: 100px; font-size: 0.9em;">${category.icon} ${category.name}</div>
                <div style="flex: 1; margin: 0 12px;">
                    <div style="height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden;">
                        <div style="
                            height: 100%;
                            width: ${(category.amount / total * 100)}%;
                            background: ${category.color};
                            border-radius: 4px;
                            transition: width 0.6s ease;
                        "></div>
                    </div>
                </div>
                <div style="width: 80px; text-align: right; font-size: 0.9em; font-weight: 600;">
                    ${this.formatCurrency(category.amount)}
                </div>
                <div style="width: 50px; text-align: right; font-size: 0.8em; color: #666;">
                    ${(category.amount / total * 100).toFixed(1)}%
                </div>
            </div>
        `).join('');
    },
    
    // Obter gastos por categoria
    getCategoryExpenses(expenses) {
        const categories = {};
        
        expenses.forEach(expense => {
            if (!categories[expense.category]) {
                categories[expense.category] = 0;
            }
            categories[expense.category] += expense.amount;
        });
        
        const colors = [
            'linear-gradient(135deg, #ff6b6b, #ee5a52)',
            'linear-gradient(135deg, #4ecdc4, #44a08d)',
            'linear-gradient(135deg, #45b7d1, #96c93d)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #a8edea, #fed6e3)',
            'linear-gradient(135deg, #ffecd2, #fcb69f)'
        ];
        
        const categoryInfo = {
            food: { name: 'Alimentação', icon: '🍔' },
            transport: { name: 'Transporte', icon: '🚗' },
            housing: { name: 'Moradia', icon: '🏠' },
            health: { name: 'Saúde', icon: '🏥' },
            entertainment: { name: 'Lazer', icon: '🎬' },
            education: { name: 'Educação', icon: '📚' },
            shopping: { name: 'Compras', icon: '🛍️' },
            bills: { name: 'Contas', icon: '📄' },
            other: { name: 'Outros', icon: '📦' }
        };
        
        return Object.entries(categories)
            .map(([category, amount], index) => ({
                category,
                name: categoryInfo[category]?.name || 'Outros',
                icon: categoryInfo[category]?.icon || '📦',
                amount,
                color: colors[index % colors.length]
            }))
            .sort((a, b) => b.amount - a.amount);
    },
    
    // Gráfico de tendência (últimos 30 dias)
    updateTrendChart() {
        const chartContainer = document.getElementById('financialTrendChart');
        if (!chartContainer) return;
        
        const last30Days = this.getLast30DaysData();
        const maxValue = Math.max(...last30Days.map(d => Math.max(d.income, d.expense)));
        
        chartContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                <h4>Últimos 30 dias</h4>
                <div style="display: flex; gap: 16px; font-size: 0.8em;">
                    <span style="color: #4caf50;">● Receitas</span>
                    <span style="color: #f44336;">● Gastos</span>
                </div>
            </div>
            <div style="display: flex; align-items: end; gap: 2px; height: 120px;">
                ${last30Days.map((day, index) => `
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                        <div style="display: flex; flex-direction: column; justify-content: end; height: 100px; gap: 1px;">
                            <div style="
                                width: 100%;
                                height: ${maxValue > 0 ? (day.income / maxValue * 80) : 0}px;
                                background: #4caf50;
                                border-radius: 2px 2px 0 0;
                            " title="Receita: ${this.formatCurrency(day.income)}"></div>
                            <div style="
                                width: 100%;
                                height: ${maxValue > 0 ? (day.expense / maxValue * 80) : 0}px;
                                background: #f44336;
                                border-radius: 0 0 2px 2px;
                            " title="Gasto: ${this.formatCurrency(day.expense)}"></div>
                        </div>
                        ${index % 5 === 0 ? `<div style="font-size: 0.7em; color: #666; margin-top: 4px;">${day.day}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    // Obter dados dos últimos 30 dias
    getLast30DaysData() {
        const data = [];
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dayTransactions = userData.transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.toDateString() === date.toDateString();
            });
            
            const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            
            data.push({
                date: date.toISOString(),
                day: date.getDate(),
                income,
                expense,
                balance: income - expense
            });
        }
        
        return data;
    },
    
    // Exportar relatório
    exportReport() {
        const transactions = this.getFilteredTransactions();
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expenses;
        
        const periodNames = {
            week: 'Semanal',
            month: 'Mensal',
            year: 'Anual',
            all: 'Completo'
        };
        
        const reportData = {
            periodo: periodNames[this.currentPeriod],
            geradoEm: new Date().toISOString(),
            usuario: currentUser.name,
            resumo: {
                totalReceitas: income,
                totalGastos: expenses,
                saldoLiquido: balance,
                numeroTransacoes: transactions.length
            },
            transacoes: transactions.map(t => ({
                data: new Date(t.date).toLocaleDateString('pt-BR'),
                tipo: t.type === 'income' ? 'Receita' : 'Gasto',
                descricao: t.description,
                categoria: this.getCategoryText(t.category),
                valor: t.amount
            })),
            categorias: this.getCategoryExpenses(transactions.filter(t => t.type === 'expense'))
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-financeiro-${this.currentPeriod}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        Notifications.show('Relatório exportado com sucesso! 📊', 'success');
    },
    
    // Refresh do módulo
    refresh() {
        this.loadData();
    },
    
    // Obter estatísticas financeiras
    getStats() {
        const transactions = this.getTransactionsForPeriod();
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        return {
            balance: income - expenses,
            totalIncome: income,
            totalExpenses: expenses,
            transactionCount: transactions.length,
            avgTransaction: transactions.length > 0 ? (income + expenses) / transactions.length : 0,
            biggestExpense: Math.max(...transactions.filter(t => t.type === 'expense').map(t => t.amount), 0),
            biggestIncome: Math.max(...transactions.filter(t => t.type === 'income').map(t => t.amount), 0),
            categorySummary: this.getCategoryExpenses(transactions.filter(t => t.type === 'expense'))
        };
    },
    
    // Utilitários
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    },
    
    formatDateHeader(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Hoje';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Ontem';
        } else {
            return date.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    },
    
    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    getCategoryText(category) {
        const categories = {
            salary: '💼 Salário', freelance: '💻 Freelance', business: '🏢 Negócio',
            investment: '📈 Investimento', food: '🍔 Alimentação', transport: '🚗 Transporte',
            housing: '🏠 Moradia', health: '🏥 Saúde', entertainment: '🎬 Lazer',
            education: '📚 Educação', shopping: '🛍️ Compras', bills: '📄 Contas',
            other: '📦 Outros'
        };
        return categories[category] || '📦 Outros';
    }
};