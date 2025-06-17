/**
 * LifeManager - Sistema de Storage
 * Gerencia persistência de dados no localStorage
 */

window.Storage = {
    prefix: 'visionfin_',
    
    // Inicializar sistema de storage
    initialize() {
        try {
            // Verificar se localStorage está disponível
            if (!this.isSupported()) {
                console.warn('localStorage não suportado, dados não serão persistidos');
                return false;
            }
            
            // Migrar dados antigos se necessário
            this.migrate();
            
            // Configurar auto-save
            this.setupAutoSave();
            
            return true;
        } catch (error) {
            console.error('Erro ao inicializar storage:', error);
            return false;
        }
    },
    
    // Verificar suporte ao localStorage
    isSupported() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    // Salvar item no storage
    setItem(key, value) {
        try {
            const fullKey = this.prefix + key;
            const data = {
                value: value,
                timestamp: Date.now(),
                version: Config.version
            };
            localStorage.setItem(fullKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no storage:', error);
            return false;
        }
    },
    
    // Recuperar item do storage
    getItem(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const stored = localStorage.getItem(fullKey);
            
            if (!stored) return defaultValue;
            
            const data = JSON.parse(stored);
            return data.value || defaultValue;
        } catch (error) {
            console.error('Erro ao recuperar do storage:', error);
            return defaultValue;
        }
    },
    
    // Remover item do storage
    removeItem(key) {
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Erro ao remover do storage:', error);
            return false;
        }
    },
    
    // Limpar todos os dados
    clear() {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Erro ao limpar storage:', error);
            return false;
        }
    },
    
    // Salvar dados do usuário atual
    saveUserData() {
        if (!visionfin.currentUser) return false;
        
        const userData = {
            tasks: visionfin.userData.tasks || [],
            transactions: visionfin.userData.transactions || [],
            goals: visionfin.userData.goals || [],
            teamMembers: visionfin.userData.teamMembers || [],
            profile: visionfin.userData.profile || {},
            achievements: visionfin.userData.achievements || [],
            settings: visionfin.userData.settings || {},
            lastSaved: new Date().toISOString()
        };
        
        const userKey = `user_${visionfin.currentUser.email}`;
        return this.setItem(userKey, userData);
    },
    
    // Carregar dados do usuário
    getUserData(email) {
        const userKey = `user_${email}`;
        const defaultData = {
            tasks: [],
            transactions: [],
            goals: [],
            teamMembers: [],
            profile: {
                phone: '',
                company: '',
                avatar: '',
                theme: 'default',
                language: 'pt-BR',
                currency: 'BRL',
                notifications: true,
                emailUpdates: false,
                soundEffects: true,
                twoFactor: false
            },
            achievements: [],
            settings: {}
        };
        
        return this.getItem(userKey, defaultData);
    },
    
    // Salvar usuários
    saveUsers() {
        return this.setItem('users', visionfin.users);
    },
    
    // Carregar usuários
    getUsers() {
        return this.getItem('users', {});
    },
    
    // Salvar usuário atual
    setCurrentUser(user) {
        return this.setItem('currentUser', user);
    },
    
    // Obter usuário atual
    getCurrentUser() {
        return this.getItem('currentUser', null);
    },
    
    // Salvar contadores de ID
    saveIdCounters() {
        return this.setItem('idCounters', visionfin.idCounters);
    },
    
    // Carregar contadores de ID
    getIdCounters() {
        return this.getItem('idCounters', {
            task: 1,
            transaction: 1,
            goal: 1,
            invite: 1
        });
    },
    
    // Salvar configurações globais
    saveSettings(settings) {
        return this.setItem('settings', settings);
    },
    
    // Carregar configurações globais
    getSettings() {
        return this.getItem('settings', {});
    },
    
    // Exportar todos os dados do usuário
    exportUserData() {
        if (!visionfin.currentUser) return null;
        
        const exportData = {
            user: {
                name: visionfin.currentUser.name,
                email: visionfin.currentUser.email,
                plan: visionfin.currentUser.plan,
                createdAt: visionfin.currentUser.createdAt
            },
            data: visionfin.userData,
            metadata: {
                exportDate: new Date().toISOString(),
                version: Config.version,
                source: 'Visionfin'
            }
        };
        
        return exportData;
    },
    
    // Importar dados do usuário
    importUserData(importData) {
        try {
            if (!importData.data || !importData.metadata) {
                throw new Error('Formato de dados inválido');
            }
            
            // Validar estrutura dos dados
            const requiredFields = ['tasks', 'transactions', 'goals'];
            for (const field of requiredFields) {
                if (!Array.isArray(importData.data[field])) {
                    importData.data[field] = [];
                }
            }
            
            // Atualizar dados na memória
            Visionfin.userData = {
                ...Visionfin.userData,
                ...importData.data
            };
            
            // Salvar no storage
            this.saveUserData();
            
            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    },
    
    // Obter estatísticas de uso do storage
    getStorageStats() {
        try {
            let totalSize = 0;
            let itemCount = 0;
            
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    totalSize += localStorage.getItem(key).length;
                    itemCount++;
                }
            });
            
            return {
                totalSize: totalSize,
                itemCount: itemCount,
                formattedSize: this.formatBytes(totalSize),
                quota: this.getStorageQuota()
            };
        } catch (error) {
            return { error: error.message };
        }
    },
    
    // Obter quota de storage
    getStorageQuota() {
        try {
            // Estimar quota do localStorage (geralmente 5-10MB)
            let quota = 0;
            const test = 'x'.repeat(1024); // 1KB
            
            while (true) {
                try {
                    localStorage.setItem('__quota_test__', test.repeat(quota));
                    quota++;
                } catch (e) {
                    localStorage.removeItem('__quota_test__');
                    break;
                }
            }
            
            return {
                estimated: true,
                size: quota * 1024,
                formattedSize: this.formatBytes(quota * 1024)
            };
        } catch (error) {
            return { error: 'Não foi possível determinar a quota' };
        }
    },
    
    // Formatar bytes para leitura humana
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // Configurar auto-save
    setupAutoSave() {
        if (!Config.storage.autoSave) return;
        
        setInterval(() => {
            if (Visionfin.currentUser) {
                this.saveUserData();
                this.saveIdCounters();
                
                if (Config.debug.enabled) {
                    console.log('📄 Auto-save executado:', new Date().toLocaleTimeString());
                }
            }
        }, Config.storage.autoSaveInterval);
    },
    
    // Migrar dados de versões anteriores
    migrate() {
        try {
            const currentVersion = this.getItem('version');
            
            if (!currentVersion) {
                // Primeira instalação
                this.setItem('version', Config.version);
                this.setItem('firstInstall', new Date().toISOString());
                return;
            }
            
            if (currentVersion !== Config.version) {
                console.log(`🔄 Migrando dados da versão ${currentVersion} para ${Config.version}`);
                
                // Executar migrações específicas se necessário
                this.runMigrations(currentVersion, Config.version);
                
                // Atualizar versão
                this.setItem('version', Config.version);
                this.setItem('lastUpdate', new Date().toISOString());
            }
        } catch (error) {
            console.error('Erro na migração:', error);
        }
    },
    
    // Executar migrações específicas
    runMigrations(fromVersion, toVersion) {
        // Exemplo de migração
        if (fromVersion === '0.9.0' && toVersion === '1.0.0') {
            // Migrar estrutura de dados se necessário
            console.log('📦 Executando migração 0.9.0 → 1.0.0');
        }
    },
    
    // Backup completo
    createBackup() {
        try {
            const backup = {
                metadata: {
                    version: Config.version,
                    timestamp: new Date().toISOString(),
                    type: 'full_backup'
                },
                users: this.getUsers(),
                settings: this.getSettings(),
                currentUser: this.getCurrentUser()
            };
            
            // Adicionar dados de todos os usuários
            const users = this.getUsers();
            backup.userData = {};
            
            Object.keys(users).forEach(email => {
                backup.userData[email] = this.getUserData(email);
            });
            
            return backup;
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            return null;
        }
    },
    
    // Restaurar backup
    restoreBackup(backupData) {
        try {
            if (!backupData.metadata || !backupData.users) {
                throw new Error('Backup inválido');
            }
            
            // Limpar dados atuais
            this.clear();
            
            // Restaurar usuários
            this.setItem('users', backupData.users);
            
            // Restaurar configurações
            if (backupData.settings) {
                this.setItem('settings', backupData.settings);
            }
            
            // Restaurar dados dos usuários
            if (backupData.userData) {
                Object.keys(backupData.userData).forEach(email => {
                    const userKey = `user_${email}`;
                    this.setItem(userKey, backupData.userData[email]);
                });
            }
            
            // Restaurar usuário atual se existir
            if (backupData.currentUser) {
                this.setItem('currentUser', backupData.currentUser);
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            return false;
        }
    }
};

// Expor globalmente
window.VisionfinStorage = window.Storage;