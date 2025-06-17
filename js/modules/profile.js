/**
 * LifeManager - Módulo de Perfil
 * Gerencia configurações e dados do usuário
 */

window.Profile = {
    // Inicializar módulo
    initialize() {
        this.setupEventListeners();
        return true;
    },
    
    // Configurar eventos
    setupEventListeners() {
        // Listener para mudança de tema
        document.addEventListener('change', (e) => {
            if (e.target.id === 'themeSelect') {
                this.changeTheme(e.target.value);
            }
        });
    },
    
    // Carregar dados do módulo
    loadData() {
        this.renderProfileContent();
        this.loadUserSettings();
        this.updateProfileStats();
    },
    
    // Renderizar conteúdo do perfil
    renderProfileContent() {
        const profileContainer = document.getElementById('profile');
        if (!profileContainer) return;
        
        profileContainer.innerHTML = `
            <div class="profile-header" style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 40px;
                border-radius: 20px;
                margin-bottom: 32px;
                text-align: center;
                position: relative;
                overflow: hidden;
            ">
                <div class="profile-avatar-large" style="
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3em;
                    font-weight: 700;
                    margin: 0 auto 20px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    border: 4px solid rgba(255,255,255,0.3);
                    position: relative;
                " id="profileAvatarLarge">
                    ${currentUser.name.charAt(0).toUpperCase()}
                    
                    <button class="photo-upload-btn" onclick="Profile.uploadPhoto()" style="
                        position: absolute;
                        bottom: 5px;
                        right: 5px;
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        background: #4caf50;
                        color: white;
                        border: 3px solid white;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.2em;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#45a049'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#4caf50'; this.style.transform='scale(1)'">
                        📷
                    </button>
                </div>
                
                <h1 style="margin: 0 0 8px 0; font-size: 2.2em; font-weight: 800;">${currentUser.name}</h1>
                <p style="margin: 0 0 8px 0; opacity: 0.9; font-size: 1.1em;">${currentUser.email}</p>
                <span style="
                    background: rgba(255,255,255,0.2);
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.9em;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                ">
                    ${currentUser.plan === 'pro' ? '⭐ Pro' : '🆓 Grátis'}
                </span>
                
                <div style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">
                    Membro desde ${this.formatDate(currentUser.createdAt)}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
                ${this.createPersonalInfoCard()}
                ${this.createSecurityCard()}
                ${this.createPreferencesCard()}
                ${this.createStatsCard()}
                ${this.createPlanCard()}
                ${this.createDataCard()}
            </div>
        `;
    },
    
    // Card de informações pessoais
    createPersonalInfoCard() {
        const profile = userData.profile || {};
        
        return `
            <div class="profile-card" style="background: rgba(255,255,255,0.9); border-radius: 16px; padding: 28px; border: 1px solid rgba(255,255,255,0.3);">
                <h3 style="margin-bottom: 20px; color: #333; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                    👤 Informações Pessoais
                </h3>
                
                <div class="form-group">
                    <label for="profileName">Nome Completo</label>
                    <input type="text" id="profileName" value="${currentUser.name}" onchange="Profile.updateField('name', this.value)" style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 2px solid #e8eaed;
                        border-radius: 8px;
                        font-size: 14px;
                    ">
                </div>
                
                <div class="form-group">
                    <label for="profileEmail">Email</label>
                    <input type="email" id="profileEmail" value="${currentUser.email}" disabled style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 2px solid #e8eaed;
                        border-radius: 8px;
                        font-size: 14px;
                        background: #f5f5f5;
                        color: #666;
                    ">
                    <small style="color: #666; font-size: 0.8em;">Email não pode ser alterado</small>
                </div>
                
                <div class="form-group">
                    <label for="profilePhone">Telefone</label>
                    <input type="text" id="profilePhone" value="${profile.phone || ''}" onchange="Profile.updateProfile('phone', this.value)" placeholder="(11) 99999-9999" style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 2px solid #e8eaed;
                        border-radius: 8px;
                        font-size: 14px;
                    ">
                </div>
                
                <div class="form-group">
                    <label for="profileCompany">Empresa</label>
                    <input type="text" id="profileCompany" value="${profile.company || ''}" onchange="Profile.updateProfile('company', this.value)" placeholder="Nome da empresa" style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 2px solid #e8eaed;
                        border-radius: 8px;
                        font-size: 14px;
                    ">
                </div>
            </div>
        `;
    },
    
    // Card de segurança
    createSecurityCard() {
        const profile = userData.profile || {};
        
        return `
            <div class="profile-card" style="background: rgba(255,255,255,0.9); border-radius: 16px; padding: 28px; border: 1px solid rgba(255,255,255,0.3);">
                <h3 style="margin-bottom: 20px; color: #333; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                    🛡️ Segurança
                </h3>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 12px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                        <span style="font-weight: 600;">Autenticação de 2 Fatores</span>
                        <div class="toggle-switch">
                            <input type="checkbox" ${profile.twoFactor ? 'checked' : ''} onchange="Profile.toggleTwoFactor(this.checked)">
                            <span class="toggle-slider"></span>
                        </div>
                    </label>
                    <small style="color: #666; font-size: 0.8em; margin-top: 4px; display: block;">
                        ${profile.twoFactor ? 'Proteção extra ativada ✓' : 'Adicione uma camada extra de segurança'}
                    </small>
                </div>
                
                <button class="btn" onclick="Profile.changePassword()" style="width: 100%; margin-bottom: 12px;">
                    🔐 Alterar Senha
                </button>
                
                <button class="btn btn-secondary" onclick="Profile.downloadBackup()" style="width: 100%; background: linear-gradient(135deg, #4caf50, #66bb6a);">
                    📥 Baixar Backup Completo
                </button>
                
                <div style="margin-top: 16px; padding: 12px; background: rgba(255, 193, 7, 0.1); border-radius: 8px; border-left: 4px solid #ffc107;">
                    <small style="color: #856404; font-weight: 600;">
                        💡 Dica: Faça backup dos seus dados regularmente!
                    </small>
                </div>
            </div>
        `;
    },
    
    // Card de preferências
    createPreferencesCard() {
        const profile = userData.profile || {};
        
        return `
            <div class="profile-card" style="background: rgba(255,255,255,0.9); border-radius: 16px; padding: 28px; border: 1px solid rgba(255,255,255,0.3);">
                <h3 style="margin-bottom: 20px; color: #333; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                    ⚙️ Preferências
                </h3>
                
                <div class="form-group">
                    <label for="themeSelect">Tema da Interface</label>
                    <select id="themeSelect" style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 2px solid #e8eaed;
                        border-radius: 8px;
                        font-size: 14px;
                    ">
                        <option value="default" ${(profile.theme || 'default') === 'default' ? 'selected' : ''}>🌈 Padrão</option>
                        <option value="dark" ${profile.theme === 'dark' ? 'selected' : ''}>🌙 Escuro</option>
                        <option value="light" ${profile.theme === 'light' ? 'selected' : ''}>☀️ Claro</option>
                        <option value="nature" ${profile.theme === 'nature' ? 'selected' : ''}>🌿 Natureza</option>
                        <option value="ocean" ${profile.theme === 'ocean' ? 'selected' : ''}>🌊 Oceano</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="languageSelect">Idioma</label>
                    <select id="languageSelect" onchange="Profile.updateProfile('language', this.value)" style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 2px solid #e8eaed;
                        border-radius: 8px;
                        font-size: 14px;
                    ">
                        <option value="pt-BR" ${(profile.language || 'pt-BR') === 'pt-BR' ? 'selected' : ''}>🇧🇷 Português (Brasil)</option>
                        <option value="en-US" ${profile.language === 'en-US' ? 'selected' : ''}>🇺🇸 English (US)</option>
                        <option value="es-ES" ${profile.language === 'es-ES' ? 'selected' : ''}>🇪🇸 Español</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 12px; background: rgba(76, 175, 80, 0.1); border-radius: 8px; margin-bottom: 8px;">
                        <span style="font-weight: 600;">🔔 Notificações</span>
                        <div class="toggle-switch">
                            <input type="checkbox" ${profile.notifications !== false ? 'checked' : ''} onchange="Profile.updateProfile('notifications', this.checked)">
                            <span class="toggle-slider"></span>
                        </div>
                    </label>
                    
                    <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 12px; background: rgba(33, 150, 243, 0.1); border-radius: 8px; margin-bottom: 8px;">
                        <span style="font-weight: 600;">📧 Updates por Email</span>
                        <div class="toggle-switch">
                            <input type="checkbox" ${profile.emailUpdates ? 'checked' : ''} onchange="Profile.updateProfile('emailUpdates', this.checked)">
                            <span class="toggle-slider"></span>
                        </div>
                    </label>
                    
                    <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 12px; background: rgba(255, 152, 0, 0.1); border-radius: 8px;">
                        <span style="font-weight: 600;">🔊 Efeitos Sonoros</span>
                        <div class="toggle-switch">
                            <input type="checkbox" ${profile.soundEffects !== false ? 'checked' : ''} onchange="Profile.updateProfile('soundEffects', this.checked)">
                            <span class="toggle-slider"></span>
                        </div>
                    </label>
                </div>
            </div>
        `;
    },
    
    // Card de estatísticas
    createStatsCard() {
        const stats = this.getUserStats();
        
        return `
            <div class="profile-card" style="background: rgba(255,255,255,0.9); border-radius: 16px; padding: 28px; border: 1px solid rgba(255,255,255,0.3);">
                <h3 style="margin-bottom: 20px; color: #333; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                    📊 Suas Estatísticas
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div style="text-align: center; padding: 16px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                        <div style="font-size: 2em; font-weight: 800; color: #667eea; margin-bottom: 4px;">
                            ${stats.totalTasks}
                        </div>
                        <div style="color: #666; font-size: 0.8em; font-weight: 600;">TAREFAS CRIADAS</div>
                    </div>
                    
                    <div style="text-align: center; padding: 16px; background: rgba(76, 175, 80, 0.1); border-radius: 8px;">
                        <div style="font-size: 2em; font-weight: 800; color: #4caf50; margin-bottom: 4px;">
                            ${stats.completedTasks}
                        </div>
                        <div style="color: #666; font-size: 0.8em; font-weight: 600;">CONCLUÍDAS</div>
                    </div>
                    
                    <div style="text-align: center; padding: 16px; background: rgba(255, 193, 7, 0.1); border-radius: 8px;">
                        <div style="font-size: 2em; font-weight: 800; color: #ffc107; margin-bottom: 4px;">
                            ${stats.totalGoals}
                        </div>
                        <div style="color: #666; font-size: 0.8em; font-weight: 600;">METAS CRIADAS</div>
                    </div>
                    
                    <div style="text-align: center; padding: 16px; background: rgba(156, 39, 176, 0.1); border-radius: 8px;">
                        <div style="font-size: 2em; font-weight: 800; color: #9c27b0; margin-bottom: 4px;">
                            ${stats.totalTransactions}
                        </div>
                        <div style="color: #666; font-size: 0.8em; font-weight: 600;">TRANSAÇÕES</div>
                    </div>
                </div>
                
                <div style="padding: 16px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5em; font-weight: 700; color: #667eea; margin-bottom: 4px;">
                        ${stats.productivityScore}%
                    </div>
                    <div style="color: #666; font-size: 0.9em; font-weight: 600;">ÍNDICE DE PRODUTIVIDADE</div>
                </div>
            </div>
        `;
    },
    
    // Card do plano
    createPlanCard() {
        const isPro = currentUser.plan === 'pro';
        
        return `
            <div class="profile-card" style="background: ${isPro ? 'linear-gradient(135deg, #ffd700, #ffed4e)' : 'rgba(255,255,255,0.9)'}; border-radius: 16px; padding: 28px; border: 1px solid rgba(255,255,255,0.3); ${isPro ? 'color: #8b6914;' : ''}">
                <h3 style="margin-bottom: 20px; font-weight: 700; display: flex; align-items: center; gap: 8px; ${isPro ? 'color: #8b6914;' : 'color: #333;'}">
                    ${isPro ? '⭐' : '🆓'} Plano ${isPro ? 'Pro' : 'Grátis'}
                </h3>
                
                ${isPro ? `
                    <div style="margin-bottom: 20px;">
                        <div style="font-size: 1.1em; font-weight: 600; margin-bottom: 8px;">
                            Você tem acesso a todos os recursos premium!
                        </div>
                        <div style="font-size: 0.9em; opacity: 0.8;">
                            Renovação automática em ${this.getNextBillingDate()}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h4 style="margin-bottom: 8px; color: #8b6914;">Recursos ativos:</h4>
                        <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
                            <li>✅ Equipes ilimitadas</li>
                            <li>✅ Relatórios avançados</li>
                            <li>✅ Backup na nuvem</li>
                            <li>✅ Suporte prioritário</li>
                        </ul>
                    </div>
                    
                    <button class="btn" onclick="Profile.manageBilling()" style="width: 100%; background: rgba(0,0,0,0.1); color: #8b6914; border: 2px solid rgba(0,0,0,0.1);">
                        💳 Gerenciar Cobrança
                    </button>
                ` : `
                    <div style="margin-bottom: 20px;">
                        <div style="font-size: 1.1em; font-weight: 600; margin-bottom: 8px; color: #333;">
                            Desbloqueie todo o potencial do Visionfin!
                        </div>
                        <div style="font-size: 0.9em; color: #666;">
                            Upgrade para Pro e tenha acesso a recursos exclusivos
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h4 style="margin-bottom: 8px; color: #333;">Com o Pro você ganha:</h4>
                        <ul style="margin: 0; padding-left: 20px; line-height: 1.6; color: #666;">
                            <li>🚀 Equipes ilimitadas</li>
                            <li>📊 Relatórios detalhados</li>
                            <li>☁️ Backup automático</li>
                            <li>💬 Suporte prioritário</li>
                            <li>🎨 Temas exclusivos</li>
                        </ul>
                    </div>
                    
                    <button class="btn" onclick="Profile.upgradeToPro()" style="width: 100%; background: linear-gradient(135deg, #ffd700, #ffed4e); color: #8b6914;">
                        ⭐ Fazer Upgrade - R$ 19,90/mês
                    </button>
                `}
            </div>
        `;
    },
    
    // Card de dados
    createDataCard() {
        const storageInfo = this.getStorageInfo();
        
        return `
            <div class="profile-card" style="background: rgba(255,255,255,0.9); border-radius: 16px; padding: 28px; border: 1px solid rgba(255,255,255,0.3);">
                <h3 style="margin-bottom: 20px; color: #333; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                    💾 Gerenciar Dados
                </h3>
                
                <div style="margin-bottom: 20px; padding: 16px; background: rgba(33, 150, 243, 0.1); border-radius: 8px;">
                    <h4 style="margin-bottom: 8px; color: #1976d2;">Uso de Armazenamento</h4>
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="font-size: 0.9em; color: #666;">Dados utilizados</span>
                            <span style="font-size: 0.9em; font-weight: 600;">${storageInfo.used}</span>
                        </div>
                        <div style="background: #e3f2fd; border-radius: 4px; height: 6px; overflow: hidden;">
                            <div style="height: 100%; width: ${storageInfo.percentage}%; background: linear-gradient(135deg, #2196f3, #42a5f5); border-radius: 4px;"></div>
                        </div>
                    </div>
                    <div style="font-size: 0.8em; color: #666;">
                        ${storageInfo.items} itens salvos
                    </div>
                </div>
                
                <div style="display: grid; gap: 8px;">
                    <button class="btn" onclick="Profile.exportAllData()" style="background: linear-gradient(135deg, #4caf50, #66bb6a);">
                        📤 Exportar Todos os Dados
                    </button>
                    
                    <button class="btn btn-secondary" onclick="Profile.importData()">
                        📥 Importar Dados
                    </button>
                    
                    <button class="btn" onclick="Profile.clearCache()" style="background: linear-gradient(135deg, #ff9800, #ffb74d);">
                        🧹 Limpar Cache
                    </button>
                    
                    <button class="btn" onclick="Profile.deleteAllData()" style="background: linear-gradient(135deg, #f44336, #ef5350);">
                        🗑️ Excluir Todos os Dados
                    </button>
                </div>
                
                <div style="margin-top: 16px; padding: 12px; background: rgba(244, 67, 54, 0.1); border-radius: 8px; border-left: 4px solid #f44336;">
                    <small style="color: #c62828; font-weight: 600;">
                        ⚠️ Atenção: A exclusão de dados é irreversível!
                    </small>
                </div>
            </div>
        `;
    },
    
    // Carregar configurações do usuário
    loadUserSettings() {
        const profile = userData.profile || {};
        
        // Aplicar tema
        if (profile.theme) {
            this.changeTheme(profile.theme);
        }
        
        // Atualizar configurações do Config
        if (profile.notifications !== undefined) {
            Config.notifications.enabled = profile.notifications;
        }
        
        if (profile.soundEffects !== undefined) {
            Config.notifications.sounds = profile.soundEffects;
        }
    },
    
    // Atualizar campo do usuário
    updateField(field, value) {
        if (field === 'name') {
            currentUser.name = value;
            
            // Atualizar interface
            document.getElementById('userName').textContent = value;
            document.getElementById('mainUserName').textContent = value;
            
            saveData();
            Notifications.show('Nome atualizado! 👤', 'success');
        }
    },
    
    // Atualizar perfil
    updateProfile(field, value) {
        if (!userData.profile) userData.profile = {};
        
        userData.profile[field] = value;
        
        // Aplicar mudanças imediatamente
        switch(field) {
            case 'notifications':
                Config.notifications.enabled = value;
                break;
            case 'soundEffects':
                Config.notifications.sounds = value;
                break;
        }
        
        saveData();
        Notifications.show('Configuração atualizada! ⚙️', 'success');
    },
    
    // Alterar tema
    changeTheme(theme) {
        const body = document.body;
        
        // Remover classes de tema existentes
        body.classList.remove('theme-default', 'theme-dark', 'theme-light', 'theme-nature', 'theme-ocean');
        
        // Aplicar novo tema
        body.classList.add(`theme-${theme}`);
        
        // Salvar preferência
        this.updateProfile('theme', theme);
        
        Notifications.show(`Tema ${this.getThemeName(theme)} aplicado! 🎨`, 'success');
    },
    
    // Upload de foto (simulado)
    uploadPhoto() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target.result;
                    
                    // Atualizar avatar
                    const avatars = document.querySelectorAll('#userAvatar, #mainUserAvatar, #profileAvatarLarge');
                    avatars.forEach(avatar => {
                        avatar.style.backgroundImage = `url(${imageUrl})`;
                        avatar.style.backgroundSize = 'cover';
                        avatar.style.backgroundPosition = 'center';
                        avatar.textContent = '';
                    });
                    
                    // Salvar no perfil
                    this.updateProfile('avatar', imageUrl);
                    
                    Notifications.show('Foto de perfil atualizada! 📷', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    },
    
    // Toggle 2FA
    toggleTwoFactor(enabled) {
        if (enabled) {
            const code = prompt('Digite o código de verificação do seu app autenticador:');
            if (code && code.length === 6) {
                this.updateProfile('twoFactor', true);
                Notifications.show('Autenticação de 2 fatores ativada! 🛡️', 'success');
                
                // Achievement
                if (window.Achievements) {
                    Achievements.unlock('security_pro');
                }
            } else {
                // Reverter checkbox
                event.target.checked = false;
                Notifications.show('Código inválido!', 'error');
            }
        } else {
            if (confirm('Tem certeza que deseja desativar a autenticação de 2 fatores?')) {
                this.updateProfile('twoFactor', false);
                Notifications.show('Autenticação de 2 fatores desativada!', 'success');
            } else {
                // Reverter checkbox
                event.target.checked = true;
            }
        }
        
        // Recarregar card de segurança
        setTimeout(() => this.renderProfileContent(), 500);
    },
    
    // Alterar senha
    changePassword() {
        const currentPassword = prompt('Digite sua senha atual:');
        if (!currentPassword) return;
        
        if (btoa(currentPassword) !== currentUser.password) {
            Notifications.show('Senha atual incorreta!', 'error');
            return;
        }
        
        const newPassword = prompt('Digite a nova senha (mínimo 6 caracteres):');
        if (!newPassword || newPassword.length < 6) {
            Notifications.show('Nova senha deve ter pelo menos 6 caracteres!', 'error');
            return;
        }
        
        const confirmNewPassword = prompt('Confirme a nova senha:');
        if (newPassword !== confirmNewPassword) {
            Notifications.show('Senhas não conferem!', 'error');
            return;
        }
        
        currentUser.password = btoa(newPassword);
        saveData();
        
        Notifications.show('Senha alterada com sucesso! 🔐', 'success');
    },
    
    // Download backup
    downloadBackup() {
        if (typeof exportUserData === 'function') {
            exportUserData();
        } else {
            Notifications.show('Função de backup não disponível!', 'error');
        }
    },
    
    // Gerenciar cobrança (Pro)
    manageBilling() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h2 style="margin-bottom: 24px;">💳 Gerenciar Cobrança</h2>
                
                <div style="padding: 20px; background: linear-gradient(135deg, #ffd700, #ffed4e); border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 8px; color: #8b6914;">Plano Pro Ativo</h3>
                    <p style="margin: 0; color: #8b6914;">R$ 19,90/mês • Próxima cobrança: ${this.getNextBillingDate()}</p>
                </div>
                
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 3em; margin-bottom: 16px;">🚧</div>
                    <h4>Funcionalidade em Desenvolvimento</h4>
                    <p>O gerenciamento de cobrança estará disponível em breve.</p>
                    <p style="font-size: 0.9em; margin-top: 16px;">
                        Para cancelar ou alterar seu plano, entre em contato: <br>
                        <strong>suporte@visionfin.com</strong>
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // Upgrade para Pro
    upgradeToPro() {
        if (typeof simulateUpgrade === 'function') {
            simulateUpgrade();
            setTimeout(() => this.renderProfileContent(), 1000);
        } else {
            if (typeof showUpgradeModal === 'function') {
                showUpgradeModal();
            }
        }
    },
    
    // Exportar todos os dados
    exportAllData() {
        this.downloadBackup();
    },
    
    // Importar dados
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file && typeof importUserData === 'function') {
                importUserData(e);
                setTimeout(() => this.updateProfileStats(), 1000);
            }
        };
        
        input.click();
    },
    
    // Limpar cache
    clearCache() {
        if (confirm('Isso limpará dados temporários e cache. Continuar?')) {
            // Limpar cache do navegador (simulado)
            localStorage.removeItem('Visionfin_cache');
            
            Notifications.show('Cache limpo com sucesso! 🧹', 'success');
        }
    },
    
    // Excluir todos os dados
    deleteAllData() {
        const confirmation = prompt(
            'ATENÇÃO: Isso excluirá TODOS os seus dados permanentemente!\n\n' +
            'Para confirmar, digite: EXCLUIR TUDO'
        );
        
        if (confirmation === 'EXCLUIR TUDO') {
            localStorage.clear();
            location.reload();
        } else if (confirmation !== null) {
            Notifications.show('Confirmação incorreta. Dados não foram excluídos.', 'error');
        }
    },
    
    // Atualizar estatísticas do perfil
    updateProfileStats() {
        // As estatísticas são recalculadas quando o conteúdo é renderizado
        setTimeout(() => this.renderProfileContent(), 100);
    },
    
    // Refresh do módulo
    refresh() {
        this.loadData();
    },
    
    // Utilitários
    getUserStats() {
        const completedTasks = userData.tasks.filter(t => t.status === 'done').length;
        const totalTasks = userData.tasks.length;
        const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        return {
            totalTasks,
            completedTasks,
            totalGoals: userData.goals.length,
            totalTransactions: userData.transactions.length,
            productivityScore
        };
    },
    
    getStorageInfo() {
        try {
            const data = JSON.stringify(userData);
            const sizeInBytes = new Blob([data]).size;
            const sizeInKB = (sizeInBytes / 1024).toFixed(1);
            const totalItems = userData.tasks.length + userData.transactions.length + userData.goals.length;
            
            return {
                used: `${sizeInKB} KB`,
                percentage: Math.min((sizeInBytes / (1024 * 1024)) * 100, 100), // Max 1MB
                items: totalItems
            };
        } catch (e) {
            return {
                used: 'N/A',
                percentage: 0,
                items: 0
            };
        }
    },
    
    getThemeName(theme) {
        const names = {
            default: 'Padrão',
            dark: 'Escuro',
            light: 'Claro',
            nature: 'Natureza',
            ocean: 'Oceano'
        };
        return names[theme] || 'Padrão';
    },
    
    getNextBillingDate() {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date.toLocaleDateString('pt-BR');
    },
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }
};