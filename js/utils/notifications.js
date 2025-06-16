/**
 * LifeManager - Sistema de Notificações
 * Gerencia notificações, alertas e efeitos visuais
 */

window.Notifications = {
    queue: [],
    isShowing: false,
    sounds: {
        success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUN',
        error: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUN',
        achievement: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUN'
    },
    
    // Inicializar sistema
    initialize() {
        this.createContainer();
        this.setupKeyboardShortcuts();
        return true;
    },
    
    // Criar container das notificações
    createContainer() {
        if (document.getElementById('notificationsContainer')) return;
        
        const container = document.createElement('div');
        container.id = 'notificationsContainer';
        container.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 1001;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        `;
        
        document.body.appendChild(container);
    },
    
    // Mostrar notificação
    show(message, type = 'success', duration = 4000) {
        const notification = this.createNotification(message, type);
        this.displayNotification(notification, duration);
        
        // Reproduzir som
        if (Config.notifications.sounds) {
            this.playSound(type);
        }
        
        // Log para debug
        if (Config.debug.enabled) {
            console.log(`🔔 Notificação ${type}:`, message);
        }
    },
    
    // Criar elemento de notificação
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: 'linear-gradient(135deg, #4caf50, #66bb6a)',
            error: 'linear-gradient(135deg, #f44336, #ef5350)',
            warning: 'linear-gradient(135deg, #ff9800, #ffb74d)',
            info: 'linear-gradient(135deg, #2196f3, #42a5f5)'
        };
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.style.cssText = `
            background: ${colors[type] || colors.success};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            animation: slideInRight 0.4s ease;
            pointer-events: auto;
            cursor: pointer;
            min-width: 300px;
            max-width: 400px;
            display: flex;
            align-items: center;
            gap: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        notification.innerHTML = `
            <span style="font-size: 1.2em;">${icons[type] || icons.success}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                font-size: 1.2em;
                cursor: pointer;
                opacity: 0.8;
                transition: opacity 0.3s ease;
            " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">×</button>
        `;
        
        // Fechar ao clicar
        notification.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                this.dismiss(notification);
            }
        });
        
        return notification;
    },
    
    // Exibir notificação
    displayNotification(notification, duration) {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;
        
        container.appendChild(notification);
        
        // Auto-remover após duração especificada
        setTimeout(() => {
            this.dismiss(notification);
        }, duration);
    },
    
    // Remover notificação com animação
    dismiss(notification) {
        if (!notification || !notification.parentElement) return;
        
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    },
    
    // Mostrar notificação de achievement
    showAchievement(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 24px;
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #8b6914;
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(255, 215, 0, 0.4);
            z-index: 1002;
            animation: achievementBounce 0.6s ease;
            max-width: 320px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            pointer-events: auto;
            cursor: pointer;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                <div style="font-size: 2em;">${achievement.icon}</div>
                <div>
                    <h4 style="margin: 0; font-weight: 800;">🏆 Achievement Desbloqueado!</h4>
                    <h3 style="margin: 4px 0; color: #8b6914; font-weight: 700;">${achievement.title}</h3>
                </div>
            </div>
            <p style="margin: 0; font-size: 0.9em; opacity: 0.9;">${achievement.description}</p>
            <div style="margin-top: 8px; font-size: 0.8em; font-weight: 600;">
                +${achievement.points} pontos
            </div>
        `;
        
        // Fechar ao clicar
        notification.addEventListener('click', () => {
            this.dismiss(notification);
        });
        
        document.body.appendChild(notification);
        
        // Reproduzir som de achievement
        if (Config.notifications.sounds) {
            this.playSound('achievement');
        }
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            this.dismiss(notification);
        }, 5000);
    },
    
    // Celebração visual
    celebrate(emoji = '🎉') {
        // Criar elemento de celebração
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
        
        // Remover após animação
        setTimeout(() => {
            celebration.remove();
        }, 1000);
        
        // Confetti effect
        this.createConfetti();
    },
    
    // Criar efeito confetti
    createConfetti() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: 50%;
                left: 50%;
                z-index: 1001;
                pointer-events: none;
                border-radius: 50%;
                animation: confettiFall ${2 + Math.random() * 2}s ease-out forwards;
                transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
            `;
            
            confetti.style.setProperty('--random-x', (Math.random() - 0.5) * 1000 + 'px');
            confetti.style.setProperty('--random-rotation', Math.random() * 720 + 'deg');
            
            document.body.appendChild(confetti);
            
            // Remover após animação
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }
    },
    
    // Reproduzir som
    playSound(type) {
        try {
            const audio = new Audio(this.sounds[type] || this.sounds.success);
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Ignorar erros de áudio silenciosamente
            });
        } catch (error) {
            // Silenciosamente ignorar erros de áudio
        }
    },
    
    // Configurar atalhos de teclado
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + N = Limpar todas as notificações
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                this.clearAll();
            }
        });
    },
    
    // Limpar todas as notificações
    clearAll() {
        const container = document.getElementById('notificationsContainer');
        if (container) {
            container.innerHTML = '';
        }
        
        // Limpar achievements também
        document.querySelectorAll('.achievement-notification').forEach(elem => {
            elem.remove();
        });
        
        this.show('Todas as notificações foram limpas', 'info', 2000);
    },
    
    // Notificação de progresso (para uploads, etc.)
    showProgress(message, progress = 0) {
        const id = 'progress-notification';
        let notification = document.getElementById(id);
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = id;
            notification.style.cssText = `
                position: fixed;
                top: 24px;
                right: 24px;
                background: linear-gradient(135deg, #2196f3, #42a5f5);
                color: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(33, 150, 243, 0.3);
                z-index: 1001;
                min-width: 300px;
                pointer-events: auto;
            `;
            
            document.body.appendChild(notification);
        }
        
        notification.innerHTML = `
            <div style="margin-bottom: 12px; font-weight: 600;">${message}</div>
            <div style="background: rgba(255,255,255,0.3); border-radius: 8px; height: 8px; overflow: hidden;">
                <div style="
                    background: white;
                    height: 100%;
                    width: ${progress}%;
                    border-radius: 8px;
                    transition: width 0.3s ease;
                "></div>
            </div>
            <div style="margin-top: 8px; font-size: 0.9em; opacity: 0.9;">${progress.toFixed(1)}%</div>
        `;
        
        // Remover quando completo
        if (progress >= 100) {
            setTimeout(() => {
                notification.remove();
            }, 1000);
        }
    },
    
    // Pedir confirmação com notificação estilizada
    confirm(message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1010;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 32px;
            border-radius: 16px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            text-align: center;
        `;
        
        modal.innerHTML = `
            <div style="font-size: 3em; margin-bottom: 16px;">❓</div>
            <h3 style="margin-bottom: 16px; color: #333;">Confirmação</h3>
            <p style="margin-bottom: 24px; color: #666; line-height: 1.5;">${message}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="confirmBtn" style="
                    background: linear-gradient(135deg, #4caf50, #66bb6a);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">Confirmar</button>
                <button id="cancelBtn" style="
                    background: linear-gradient(135deg, #f44336, #ef5350);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">Cancelar</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Eventos
        modal.querySelector('#confirmBtn').addEventListener('click', () => {
            overlay.remove();
            if (onConfirm) onConfirm();
        });
        
        modal.querySelector('#cancelBtn').addEventListener('click', () => {
            overlay.remove();
            if (onCancel) onCancel();
        });
        
        // Fechar clicando fora
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                if (onCancel) onCancel();
            }
        });
    },
    
    // Toast rápido (mini notificação)
    toast(message, duration = 2000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 24px;
            font-size: 0.9em;
            font-weight: 600;
            z-index: 1001;
            animation: fadeInUp 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// Adicionar estilos CSS das animações
if (!document.getElementById('notifications-styles')) {
    const style = document.createElement('style');
    style.id = 'notifications-styles';
    style.textContent = `
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
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        @keyframes achievementBounce {
            0% { transform: translateX(100%) scale(0.8); opacity: 0; }
            50% { transform: translateX(-10px) scale(1.05); opacity: 1; }
            100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        
        @keyframes celebrate {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        
        @keyframes confettiFall {
            0% {
                transform: translate(-50%, -50%) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translate(calc(-50% + var(--random-x)), calc(-50% + 500px)) rotate(var(--random-rotation));
                opacity: 0;
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translate(-50%, 20px);
            }
            to {
                opacity: 1;
                transform: translate(-50%, 0);
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Funções globais para compatibilidade
window.showNotification = function(message, type, duration) {
    Notifications.show(message, type, duration);
};

window.showToast = function(message, duration) {
    Notifications.toast(message, duration);
};