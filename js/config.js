/**
 * LifeManager - Configurações Globais
 */

window.VisionfinConfig = {
    version: '1.0.0',
    buildDate: '2025-01-15',
    
    // Configurações da aplicação
    app: {
        name: 'Visionfin',
        description: 'Organize sua vida, alcance suas metas',
        author: 'Visionfin Team',
        website: 'https://visionfin.com',
        support: 'suporte@visionfin.com'
    },
    
    // Configurações de usuário demo
    demo: {
        email: 'demo@visionfin.com',
        password: 'demo123',
        name: 'Usuário Demo',
        plan: 'pro'
    },
    
    // Configurações de planos
    plans: {
        free: {
            name: 'Grátis',
            price: 0,
            features: ['Tarefas ilimitadas', 'Financeiro básico', 'Até 3 metas', '1 usuário'],
            limits: {
                users: 1,
                goals: 3,
                teamMembers: 0,
                storage: '10MB'
            }
        },
        pro: {
            name: 'Pro',
            price: 19.90,
            features: ['Tudo do Grátis', 'Equipes ilimitadas', 'Relatórios avançados', 'Backup na nuvem', 'Suporte prioritário'],
            limits: {
                users: 'unlimited',
                goals: 'unlimited',
                teamMembers: 'unlimited',
                storage: '1GB'
            }
        }
    },
    
    // Configurações de localização
    locale: {
        default: 'pt-BR',
        currency: 'BRL',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
    },
    
    // Configurações de temas
    themes: {
        default: {
            name: 'Padrão',
            icon: '🌈',
            primary: '#667eea',
            secondary: '#764ba2'
        },
        dark: {
            name: 'Escuro',
            icon: '🌙',
            primary: '#4a90e2',
            secondary: '#357abd'
        },
        light: {
            name: 'Claro',
            icon: '☀️',
            primary: '#3498db',
            secondary: '#2980b9'
        },
        nature: {
            name: 'Natureza',
            icon: '🌿',
            primary: '#00b894',
            secondary: '#0984e3'
        },
        ocean: {
            name: 'Oceano',
            icon: '🌊',
            primary: '#6c5ce7',
            secondary: '#a29bfe'
        }
    },
    
    // Configurações de notificações
    notifications: {
        duration: 4000,
        position: 'top-right',
        sounds: true,
        types: {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        }
    },
    
    // Configurações de achievements
    achievements: {
        enabled: true,
        soundEnabled: true,
        definitions: {
            'first_task': {
                title: 'Primeira Tarefa',
                description: 'Criou sua primeira tarefa',
                icon: '📋',
                points: 10
            },
            'first_income': {
                title: 'Primeiro Ganho',
                description: 'Registrou sua primeira receita',
                icon: '💰',
                points: 10
            },
            'first_goal': {
                title: 'Primeira Meta',
                description: 'Definiu sua primeira meta',
                icon: '🎯',
                points: 15
            },
            'task_master': {
                title: 'Mestre das Tarefas',
                description: 'Concluiu 10 tarefas',
                icon: '🏆',
                points: 50
            },
            'money_saver': {
                title: 'Poupador',
                description: 'Manteve saldo positivo acima de R$ 1.000',
                icon: '💎',
                points: 100
            },
            'goal_achiever': {
                title: 'Conquistador',
                description: 'Alcançou sua primeira meta',
                icon: '⭐',
                points: 75
            },
            'team_builder': {
                title: 'Construtor de Equipe',
                description: 'Convidou alguém para sua equipe',
                icon: '👥',
                points: 25
            },
            'profile_complete': {
                title: 'Perfil Completo',
                description: 'Preencheu todas as informações do perfil',
                icon: '👤',
                points: 20
            },
            'security_pro': {
                title: 'Segurança Pro',
                description: 'Ativou autenticação de 2 fatores',
                icon: '🛡️',
                points: 30
            },
            'early_adopter': {
                title: 'Pioneiro',
                description: 'Um dos primeiros usuários do Visionfin',
                icon: '🚀',
                points: 200
            }
        }
    },
    
    // Configurações de storage
    storage: {
        prefix: 'visionfin_',
        compression: false,
        encryption: false,
        autoSave: true,
        autoSaveInterval: 30000 // 30 segundos
    },
    
    // Configurações de backup
    backup: {
        enabled: true,
        autoExport: false,
        filename: 'visionfin-backup-{name}-{date}.json',
        includeSettings: true,
        compression: true
    },
    
    // Configurações de desenvolvimento
    debug: {
        enabled: window.location.search.includes('debug=true'),
        logLevel: 'info', // error, warn, info, debug
        showPerformance: false,
        mockApi: false
    },
    
    // URLs e endpoints (para futuras integrações)
    api: {
        baseUrl: 'https://api.visionfin.com',
        version: 'v1',
        timeout: 10000,
        endpoints: {
            auth: '/auth',
            users: '/users',
            backup: '/backup',
            sync: '/sync',
            payments: '/payments'
        }
    },
    
    // Configurações de categorias
    categories: {
        income: [
            { id: 'salary', name: 'Salário', icon: '💼' },
            { id: 'freelance', name: 'Freelance', icon: '💻' },
            { id: 'business', name: 'Negócio', icon: '🏢' },
            { id: 'investment', name: 'Investimento', icon: '📈' },
            { id: 'gift', name: 'Presente', icon: '🎁' },
            { id: 'other', name: 'Outros', icon: '📦' }
        ],
        expense: [
            { id: 'food', name: 'Alimentação', icon: '🍔' },
            { id: 'transport', name: 'Transporte', icon: '🚗' },
            { id: 'housing', name: 'Moradia', icon: '🏠' },
            { id: 'health', name: 'Saúde', icon: '🏥' },
            { id: 'entertainment', name: 'Lazer', icon: '🎬' },
            { id: 'education', name: 'Educação', icon: '📚' },
            { id: 'shopping', name: 'Compras', icon: '🛍️' },
            { id: 'bills', name: 'Contas', icon: '📄' },
            { id: 'other', name: 'Outros', icon: '📦' }
        ]
    },
    
    // Dicas e mensagens
    tips: [
        "💡 Use Ctrl+N para criar tarefas rapidamente!",
        "📊 Revise seu dashboard diariamente para manter o foco",
        "💰 Registre gastos na hora - não deixe acumular!",
        "🎯 Defina metas pequenas e alcançáveis para manter a motivação",
        "⚡ Complete pelo menos uma tarefa importante por dia",
        "📱 Use o sistema pelo celular - é super prático!",
        "🔄 Faça backup dos seus dados regularmente",
        "👥 Convide pessoas para colaborar em projetos",
        "📈 Comemore suas conquistas - você merece!",
        "🎨 Personalize o sistema da forma que funciona melhor para você",
        "🔍 Use os filtros para encontrar tarefas rapidamente",
        "⏰ Defina prazos realistas para suas tarefas",
        "💎 Invista em sua educação financeira",
        "🎵 Ative os efeitos sonoros para uma experiência mais divertida"
    ],
    
    // Configurações de validação
    validation: {
        password: {
            minLength: 6,
            requireNumbers: false,
            requireSymbols: false,
            requireUppercase: false
        },
        email: {
            allowPlus: true,
            allowSubdomains: true
        },
        names: {
            minLength: 2,
            maxLength: 50,
            allowNumbers: false
        }
    },
    
    // Configurações de performance
    performance: {
        animationDuration: 300,
        debounceTime: 300,
        throttleTime: 100,
        lazyLoadThreshold: 1000
    }
};

// Fazer configurações disponíveis globalmente
window.Config = window.VisionfinConfig;

// Função para obter configuração aninhada
window.Config.get = function(path, defaultValue = null) {
    const keys = path.split('.');
    let current = this;
    
    for (const key of keys) {
        if (current[key] === undefined) {
            return defaultValue;
        }
        current = current[key];
    }
    
    return current;
};

// Função para definir configuração
window.Config.set = function(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = this;
    
    for (const key of keys) {
        if (current[key] === undefined) {
            current[key] = {};
        }
        current = current[key];
    }
    
    current[lastKey] = value;
    return this;
};

// Log de inicialização
if (Config.debug.enabled) {
    console.log('🔧 Configurações carregadas:', Config);
}