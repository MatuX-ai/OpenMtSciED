/**
 * OpenMTSciEd 演示账号管理系统
 * 提供统一的演示模式功能，包括会话管理、过期检查、视觉标识等
 */

(function() {
    'use strict';

    // ==================== 配置常量 ====================
    const DEMO_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24小时
    const DEMO_ACCOUNT = {
        id: 0,
        username: 'demo_user',
        name: '演示用户',
        email: 'demo@openmtscied.com',
        role: 'demo',
        isDemo: true,
        avatar: '🧪'
    };

    // ==================== 核心功能 ====================

    /**
     * 进入演示模式
     */
    window.enterDemoMode = function() {
        const demoUser = {
            ...DEMO_ACCOUNT,
            expiresAt: Date.now() + DEMO_SESSION_DURATION
        };

        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('demo_session_start', Date.now().toString());
        
        // 更新UI
        if (window.NavbarComponent && window.NavbarComponent.updateAuthUI) {
            window.NavbarComponent.updateAuthUI(true);
        }
        
        // 显示友好提示
        showToast('✅ 已进入演示模式', '您现在可以体验所有功能。数据将在24小时后自动清除。', 'success');
        
        // 可选：跳转到仪表盘
        // window.location.href = '/dashboard';
    };

    /**
     * 检查是否为演示账号
     */
    window.isDemoUser = function() {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return false;
            
            const user = JSON.parse(userStr);
            return user.isDemo === true || user.role === 'demo';
        } catch (e) {
            return false;
        }
    };

    /**
     * 检查演示会话是否过期
     */
    window.checkDemoExpiry = function() {
        if (!isDemoUser()) return false;

        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            
            if (Date.now() > user.expiresAt) {
                // 会话已过期，清除数据
                logoutDemo();
                showToast('⏰ 演示会话已过期', '如需继续体验，请重新进入演示模式。', 'warning');
                return true;
            }
            
            return false;
        } catch (e) {
            return false;
        }
    };

    /**
     * 退出演示模式
     */
    window.logoutDemo = function() {
        localStorage.removeItem('user');
        localStorage.removeItem('demo_session_start');
        
        // 更新UI
        if (window.NavbarComponent && window.NavbarComponent.updateAuthUI) {
            window.NavbarComponent.updateAuthUI(false);
        }
    };

    /**
     * 获取演示剩余时间（小时）
     */
    window.getDemoRemainingHours = function() {
        if (!isDemoUser()) return 0;

        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            
            const remaining = user.expiresAt - Date.now();
            return Math.max(0, Math.floor(remaining / (60 * 60 * 1000)));
        } catch (e) {
            return 0;
        }
    };

    // ==================== UI 辅助功能 ====================

    /**
     * 显示 Toast 通知
     */
    function showToast(title, message, type = 'info') {
        // 移除已有的toast
        const existingToast = document.querySelector('.demo-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `demo-toast demo-toast-${type}`;
        
        const iconMap = {
            success: '✅',
            warning: '⚠️',
            info: 'ℹ️',
            error: '❌'
        };

        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-icon">${iconMap[type] || 'ℹ️'}</span>
                <strong>${title}</strong>
            </div>
            <div class="toast-body">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        document.body.appendChild(toast);

        // 3秒后自动消失
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 300);
            }
        }, 3000);
    }

    /**
     * 在导航栏添加演示模式提示条
     */
    window.addDemoBanner = function() {
        if (!isDemoUser()) return;

        // 检查是否已存在
        if (document.querySelector('.demo-banner')) return;

        const banner = document.createElement('div');
        banner.className = 'demo-banner';
        
        const remainingHours = getDemoRemainingHours();
        banner.innerHTML = `
            <span class="demo-banner-icon">🧪</span>
            <span class="demo-banner-text">
                演示模式 - 数据不会永久保存 
                <span class="demo-timer">(剩余 ${remainingHours} 小时)</span>
            </span>
            <button class="demo-banner-close" onclick="this.parentElement.remove()" title="关闭提示">×</button>
        `;

        // 插入到导航栏下方
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.parentNode.insertBefore(banner, navbar.nextSibling);
        } else {
            document.body.insertBefore(banner, document.body.firstChild);
        }
    };

    /**
     * 为用户头像添加DEMO标识
     */
    window.addDemoBadgeToAvatar = function() {
        if (!isDemoUser()) return;

        const avatar = document.getElementById('userAvatar');
        if (!avatar) return;

        // 添加演示样式类
        avatar.classList.add('demo-avatar');
        
        // 如果还没有角标，添加一个
        if (!avatar.querySelector('.demo-badge')) {
            const badge = document.createElement('span');
            badge.className = 'demo-badge';
            badge.textContent = 'DEMO';
            avatar.appendChild(badge);
        }
    };

    /**
     * 显示演示功能限制提示
     */
    window.showDemoLimitWarning = function(action) {
        if (!isDemoUser()) return false;

        const actionMap = {
            'save': '保存数据',
            'upload': '上传文件',
            'submit': '提交内容',
            'comment': '发表评论',
            'favorite': '收藏内容'
        };

        const actionText = actionMap[action] || '此操作';
        
        const confirmed = confirm(
            `⚠️ 演示模式提示\n\n` +
            `${actionText}在演示模式下不会永久保存。\n\n` +
            `是否注册真实账号以保存您的进度？\n\n` +
            `点击"确定"了解注册流程，或"取消"继续体验。`
        );

        if (confirmed) {
            window.location.href = '/login?register=true';
        }

        return !confirmed; // 返回false表示阻止操作
    };

    // ==================== 初始化 ====================

    /**
     * 初始化演示账号系统
     */
    function initDemoSystem() {
        // 检查会话是否过期
        checkDemoExpiry();

        // 如果是演示用户，添加视觉标识
        if (isDemoUser()) {
            // 延迟执行，等待DOM加载完成
            setTimeout(() => {
                addDemoBanner();
                addDemoBadgeToAvatar();
            }, 100);
        }
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDemoSystem);
    } else {
        initDemoSystem();
    }

    // 导出API
    window.DemoAccount = {
        enter: window.enterDemoMode,
        logout: window.logoutDemo,
        isDemo: window.isDemoUser,
        checkExpiry: window.checkDemoExpiry,
        getRemainingHours: window.getDemoRemainingHours,
        showLimitWarning: window.showDemoLimitWarning,
        addBanner: window.addDemoBanner,
        addBadgeToAvatar: window.addDemoBadgeToAvatar
    };

})();
