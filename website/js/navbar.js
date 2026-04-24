/**
 * OpenMTSciEd 统一导航组件交互功能
 * 提供移动端菜单切换、滚动效果、活动链接高亮等功能
 */

(function() {
    'use strict';

    // DOM 元素
    const navbar = document.getElementById('navbar');
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarLinks = document.getElementById('navbarLinks');

    /**
     * 初始化导航组件
     */
    function initNavbar() {
        if (!navbar) return;

        // 移动端菜单切换
        if (navbarToggle) {
            navbarToggle.addEventListener('click', toggleMobileMenu);
        }

        // 滚动效果
        window.addEventListener('scroll', handleScroll);

        // 点击导航链接后关闭移动端菜单
        if (navbarLinks) {
            const links = navbarLinks.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        closeMobileMenu();
                    }
                });
            });
        }

        // 设置当前页面的活动链接
        setActiveLink();

        // 初始检查滚动位置
        handleScroll();

        // 初始化用户登录状态
        initAuthState();
    }

    /**
     * 切换移动端菜单
     */
    function toggleMobileMenu() {
        if (!navbarToggle || !navbarLinks) return;

        navbarToggle.classList.toggle('active');
        navbarLinks.classList.toggle('active');

        // 防止背景滚动
        if (navbarLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    /**
     * 关闭移动端菜单
     */
    function closeMobileMenu() {
        if (!navbarToggle || !navbarLinks) return;

        navbarToggle.classList.remove('active');
        navbarLinks.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * 处理滚动事件
     */
    function handleScroll() {
        if (!navbar) return;

        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    /**
     * 设置当前页面的活动链接
     */
    function setActiveLink() {
        if (!navbarLinks) return;

        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        const links = navbarLinks.querySelectorAll('a');

        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // 移除所有活动状态
            link.classList.remove('active');

            // 检查是否为当前页面
            if (href && !href.startsWith('#') && !href.startsWith('http')) {
                const linkPage = href.split('#')[0];
                if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
                    link.classList.add('active');
                }
            }

            // 处理锚点链接
            if (href && href.startsWith('#') && currentPage === 'index.html') {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    // 使用 Intersection Observer 检测可见性
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                link.classList.add('active');
                            } else {
                                link.classList.remove('active');
                            }
                        });
                    }, {
                        threshold: 0.5,
                        rootMargin: '-100px 0px -50% 0px'
                    });

                    observer.observe(targetElement);
                }
            }
        });
    }

    /**
     * 平滑滚动到锚点
     */
    function smoothScrollToAnchor(e) {
        const target = e.currentTarget;
        const href = target.getAttribute('href');

        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const navHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // 更新 URL（不刷新页面）
                history.pushState(null, null, href);
            }
        }
    }

    // ==================== 用户认证功能 ====================

    /**
     * 初始化认证状态
     */
    function initAuthState() {
        const isLoggedIn = checkLoginStatus();
        updateAuthUI(isLoggedIn);
    }

    /**
     * 检查登录状态（从 localStorage 或 sessionStorage）
     */
    function checkLoginStatus() {
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        return user !== null;
    }

    /**
     * 更新认证 UI
     */
    function updateAuthUI(isLoggedIn) {
        const btnLogin = document.getElementById('btnLogin');
        const userMenu = document.getElementById('userMenu');

        if (!btnLogin || !userMenu) return;

        if (isLoggedIn) {
            // 已登录状态
            btnLogin.style.display = 'none';
            userMenu.style.display = 'block';

            // 加载用户信息
            loadUserInfo();
        } else {
            // 未登录状态
            btnLogin.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }

    /**
     * 加载用户信息
     */
    function loadUserInfo() {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!userStr) return;

        try {
            const user = JSON.parse(userStr);
            const userAvatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');

            if (userAvatar && user.name) {
                userAvatar.textContent = user.name.charAt(0).toUpperCase();
            }

            if (userName && user.name) {
                userName.textContent = user.name;
            }
        } catch (e) {
            console.error('Failed to parse user info:', e);
        }
    }

    /**
     * 处理登录
     */
    window.handleLogin = function() {
        // TODO: 实现实际的登录逻辑
        // 这里可以使用模态框、跳转到登录页或调用 API
        
        // 示例：显示登录提示
        showLoginModal();
        
        // 或者跳转到登录页
        // window.location.href = '/login.html';
    };

    /**
     * 显示登录模态框
     */
    function showLoginModal() {
        // 创建简单的登录提示（实际项目中应该使用完整的登录表单）
        const email = prompt('请输入邮箱地址（演示功能）:');
        if (!email) return;

        const password = prompt('请输入密码（演示功能）:');
        if (!password) return;

        // 模拟登录成功
        const mockUser = {
            id: 'user_' + Date.now(),
            name: email.split('@')[0],
            email: email,
            loginTime: new Date().toISOString()
        };

        // 保存用户信息到 localStorage
        localStorage.setItem('user', JSON.stringify(mockUser));

        // 更新 UI
        updateAuthUI(true);

        // 显示欢迎消息
        alert(`欢迎回来，${mockUser.name}！`);
    }

    /**
     * 处理退出登录
     */
    window.handleLogout = function() {
        if (!confirm('确定要退出登录吗？')) return;

        // 清除用户信息
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');

        // 更新 UI
        updateAuthUI(false);

        // 显示提示
        alert('已成功退出登录');
    };

    /**
     * 显示个人中心
     */
    window.showProfile = function(e) {
        if (e) e.preventDefault();
        
        // TODO: 跳转到个人中心页面
        alert('个人中心功能开发中...');
        // window.location.href = '/profile.html';
    };

    /**
     * 显示学习仪表盘
     */
    window.showDashboard = function(e) {
        if (e) e.preventDefault();
        
        // TODO: 跳转到学习仪表盘页面
        alert('学习仪表盘功能开发中...');
        // window.location.href = '/dashboard.html';
    };

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }

    // 导出函数供外部使用
    window.NavbarComponent = {
        init: initNavbar,
        closeMobileMenu: closeMobileMenu,
        smoothScrollToAnchor: smoothScrollToAnchor,
        checkLoginStatus: checkLoginStatus,
        updateAuthUI: updateAuthUI,
        handleLogin: window.handleLogin,
        handleLogout: window.handleLogout
    };

})();
