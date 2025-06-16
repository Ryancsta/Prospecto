/**
 * LifeManager - Módulo de Equipe
 * Gerencia colaboradores e trabalho em equipe
 */

window.Team = {
    // Inicializar módulo
    initialize() {
        this.setupEventListeners();
        return true;
    },
    
    // Configurar eventos
    setupEventListeners() {
        // Eventos específicos da equipe podem ser adicionados aqui
    },
    
    // Carregar dados do módulo
    loadData() {
        this.renderTeamMembers();
        this.updateTeamStats();
    },
    
    // Renderizar membros da equipe
    renderTeamMembers() {
        const container = document.getElementById('teamMembers');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (userData.teamMembers.length === 0) {
            container.innerHTML = `
                <div style="
                    background: rgba(255,255,255,0.7); 
                    border: 2px dashed #ccc; 
                    border-radius: 16px; 
                    padding: 40px; 
                    text-align: center; 
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onclick="openModal('inviteModal')" onmouseover="this.style.borderColor='#667eea'; this.style.background='rgba(255,255,255,0.9)'" onmouseout="this.style.borderColor='#ccc'; this.style.background='rgba(255,255,255,0.7)'">
                    <div style="font-size: 3em; margin-bottom: 16px; color: #ccc;">➕</div>
                    <h4 style="color: #666; margin-bottom: 8px;">Convide sua primeira pessoa</h4>
                    <p style="color: #999; font-size: 0.9em;">Colabore em equipe para alcançar metas juntos</p>
                </div>
            `;
            return;
        }
        
        userData.teamMembers.forEach(member => {
            const memberDiv = this.createMemberCard(member);
            container.appendChild(memberDiv);
        });
    },
    
    // Criar card do membro
    createMemberCard(member) {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'team-member-card';
        memberDiv.style.cssText = `
            background: rgba(255,255,255,0.9); 
            border-radius: 16px; 
            padding: 28px; 
            text-align: center; 
            border: 1px solid rgba(255,255,255,0.3);
            transition: all 0.3s ease;
            position: relative;
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
        
        const roleColors = {
            admin: 'linear-gradient(135deg, #f44336, #e91e63)',
            member: 'linear-gradient(135deg, #4caf50, #66bb6a)',
            viewer: 'linear-gradient(135deg, #2196f3, #42a5f5)'
        };
        
        memberDiv.innerHTML = `
            <div class="member-menu" style="position: absolute; top: 12px; right: 12px;">
                <button onclick="Team.showMemberMenu('${member.email}')" style="
                    background: none;
                    border: none;
                    font-size: 1.2em;
                    cursor: pointer;
                    color: #999;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(0,0,0,0.1)'" onmouseout="this.style.background='none'">⋮</button>
            </div>
            
            <div class="team-member-avatar" style="
                width: 60px; 
                height: 60px; 
                border-radius: 50%; 
                background: ${roleColors[member.role]}; 
                margin: 0 auto 16px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                font-size: 1.5em; 
                font-weight: 700;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            ">
                ${member.email.charAt(0).toUpperCase()}
            </div>
            
            <h4 style="margin-bottom: 8px; color: #333; font-weight: 700;">
                ${member.name || member.email.split('@')[0]}
            </h4>
            
            <p style="color: #666; margin-bottom: 12px; font-size: 0.9em;">
                ${roleIcons[member.role]} ${roleTexts[member.role]}
            </p>
            
            <div style="margin-bottom: 12px;">
                <span style="
                    background: ${member.status === 'active' ? 'linear-gradient(135deg, #4caf50, #66bb6a)' : 'linear-gradient(135deg, #95a5a6, #7f8c8d)'}; 
                    color: white; 
                    padding: 4px 12px; 
                    border-radius: 20px; 
                    font-size: 0.8em; 
                    font-weight: 600;
                ">
                    ${member.status === 'active' ? '🟢 Online' : '⚫ Offline'}
                </span>
            </div>
            
            <div style="font-size: 0.8em; color: #999;">
                Entrou em ${this.formatDate(member.joinedAt)}
            </div>
        `;
        
        // Hover effect
        memberDiv.onmouseover = () => {
            memberDiv.style.transform = 'translateY(-4px)';
            memberDiv.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
        };
        
        memberDiv.onmouseout = () => {
            memberDiv.style.transform = 'translateY(0)';
            memberDiv.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        };
        
        return memberDiv;
    },
    
    // Mostrar menu do membro
    showMemberMenu(email) {
        const member = userData.teamMembers.find(m => m.email === email);
        if (!member) return;
        
        const menu = document.createElement('div');
        menu.className = 'member-menu-popup';
        menu.style.cssText = `
            position: fixed;
            background: white;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            z-index: 1000;
            min-width: 180px;
            border: 1px solid #eee;
        `;
        
        const actions = [
            { icon: '👤', text: 'Ver Perfil', action: () => this.viewMemberProfile(member) },
            { icon: '💬', text: 'Enviar Mensagem', action: () => this.sendMessage(member) },
            { icon: '⚙️', text: 'Alterar Permissões', action: () => this.changePermissions(member) },
            { icon: '📊', text: 'Ver Atividades', action: () => this.viewMemberActivity(member) },
            { icon: '🚫', text: 'Remover da Equipe', action: () => this.removeMember(member), danger: true }
        ];
        
        menu.innerHTML = actions.map(action => `
            <div class="menu-item" style="
                padding: 12px 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.9em;
                transition: background 0.2s ease;
                ${action.danger ? 'color: #f44336;' : ''}
                border-bottom: 1px solid #f0f0f0;
            " onmouseover="this.style.background='rgba(102, 126, 234, 0.1)'" onmouseout="this.style.background=''" onclick="${action.action.toString().replace('function() { ', '').replace(' }', '')}">
                <span>${action.icon}</span>
                <span>${action.text}</span>
            </div>
        `).join('');
        
        // Remover border da última opção
        const lastItem = menu.querySelector('.menu-item:last-child');
        if (lastItem) lastItem.style.borderBottom = 'none';
        
        // Posicionar menu
        const rect = event.target.getBoundingClientRect();
        menu.style.top = (rect.bottom + 8) + 'px';
        menu.style.left = Math.max(rect.left - 140, 10) + 'px';
        
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
    
    // Ver perfil do membro
    viewMemberProfile(member) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <div style="text-align: center; padding: 20px;">
                    <div style="
                        width: 80px; 
                        height: 80px; 
                        border-radius: 50%; 
                        background: linear-gradient(135deg, #4caf50, #66bb6a); 
                        margin: 0 auto 20px; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        color: white; 
                        font-size: 2em; 
                        font-weight: 700;
                    ">
                        ${member.email.charAt(0).toUpperCase()}
                    </div>
                    
                    <h2 style="margin-bottom: 8px; color: #333;">
                        ${member.name || member.email.split('@')[0]}
                    </h2>
                    
                    <p style="color: #666; margin-bottom: 20px;">${member.email}</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; text-align: left;">
                        <div>
                            <strong>Função:</strong><br>
                            <span style="color: #666;">${this.getRoleText(member.role)}</span>
                        </div>
                        <div>
                            <strong>Status:</strong><br>
                            <span style="color: ${member.status === 'active' ? '#4caf50' : '#999'};">
                                ${member.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                        <div>
                            <strong>Entrou em:</strong><br>
                            <span style="color: #666;">${this.formatDate(member.joinedAt)}</span>
                        </div>
                        <div>
                            <strong>Última atividade:</strong><br>
                            <span style="color: #666;">Hoje</span>
                        </div>
                    </div>
                    
                    <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #eee;">
                        <h4 style="margin-bottom: 12px;">Estatísticas</h4>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center;">
                            <div>
                                <div style="font-size: 1.5em; font-weight: 700; color: #667eea;">0</div>
                                <div style="font-size: 0.8em; color: #666;">Tarefas</div>
                            </div>
                            <div>
                                <div style="font-size: 1.5em; font-weight: 700; color: #4caf50;">0</div>
                                <div style="font-size: 0.8em; color: #666;">Concluídas</div>
                            </div>
                            <div>
                                <div style="font-size: 1.5em; font-weight: 700; color: #ff9800;">0</div>
                                <div style="font-size: 0.8em; color: #666;">Pendentes</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // Enviar mensagem (simulado)
    sendMessage(member) {
        const message = prompt(`Enviar mensagem para ${member.name || member.email}:`);
        if (message) {
            Notifications.show(`Mensagem enviada para ${member.name || member.email}! 💬`, 'success');
        }
    },
    
    // Alterar permissões
    changePermissions(member) {
        const newRole = prompt(
            `Alterar permissões de ${member.name || member.email}\n\nOpções:\n- admin (Administrador)\n- member (Membro)\n- viewer (Visualizador)\n\nPermissão atual: ${member.role}`,
            member.role
        );
        
        if (newRole && ['admin', 'member', 'viewer'].includes(newRole)) {
            member.role = newRole;
            this.renderTeamMembers();
            saveData();
            Notifications.show('Permissões atualizadas! ⚙️', 'success');
        }
    },
    
    // Ver atividades do membro
    viewMemberActivity(member) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h2 style="margin-bottom: 24px;">📊 Atividades de ${member.name || member.email}</h2>
                
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 3em; margin-bottom: 16px;">📈</div>
                    <h4>Nenhuma atividade registrada</h4>
                    <p>As atividades deste membro aparecerão aqui</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // Remover membro
    removeMember(member) {
        if (confirm(`Tem certeza que deseja remover ${member.name || member.email} da equipe?`)) {
            userData.teamMembers = userData.teamMembers.filter(m => m.email !== member.email);
            this.renderTeamMembers();
            this.updateTeamStats();
            saveData();
            Notifications.show('Membro removido da equipe!', 'success');
        }
    },
    
    // Atualizar estatísticas da equipe
    updateTeamStats() {
        const activityContainer = document.getElementById('teamActivity');
        if (!activityContainer) return;
        
        if (userData.teamMembers.length === 0) {
            activityContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 2.5em; margin-bottom: 16px;">👥</div>
                    <p>A atividade da equipe aparecerá aqui quando houver colaboradores</p>
                </div>
            `;
            return;
        }
        
        // Simular algumas atividades da equipe
        const activities = [
            {
                user: userData.teamMembers[0].name || userData.teamMembers[0].email,
                action: 'foi convidado(a) para a equipe',
                time: this.formatTimeAgo(userData.teamMembers[0].joinedAt),
                icon: '👋'
            }
        ];
        
        activityContainer.innerHTML = `
            <div style="max-height: 300px; overflow-y: auto;">
                ${activities.map(activity => `
                    <div style="display: flex; align-items: center; padding: 12px; background: rgba(255,255,255,0.7); border-radius: 8px; margin-bottom: 8px;">
                        <div style="font-size: 1.5em; margin-right: 12px;">${activity.icon}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; margin-bottom: 2px;">
                                ${activity.user} ${activity.action}
                            </div>
                            <div style="font-size: 0.9em; color: #666;">
                                ${activity.time}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 20px; padding: 16px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                <h4 style="margin-bottom: 12px; color: #333;">📊 Resumo da Equipe</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; text-align: center;">
                    <div>
                        <div style="font-size: 1.5em; font-weight: 700; color: #667eea;">${userData.teamMembers.length}</div>
                        <div style="font-size: 0.8em; color: #666;">Membros</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5em; font-weight: 700; color: #4caf50;">${userData.teamMembers.filter(m => m.status === 'active').length}</div>
                        <div style="font-size: 0.8em; color: #666;">Ativos</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5em; font-weight: 700; color: #ff9800;">${userData.teamMembers.filter(m => m.role === 'admin').length}</div>
                        <div style="font-size: 0.8em; color: #666;">Admins</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Refresh do módulo
    refresh() {
        this.loadData();
    },
    
    // Utilitários
    getRoleText(role) {
        const roles = {
            admin: '⚡ Administrador',
            member: '👤 Membro',
            viewer: '👁️ Visualizador'
        };
        return roles[role] || '👤 Membro';
    },
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    },
    
    formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'agora há pouco';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
        return this.formatDate(dateString);
    }
};