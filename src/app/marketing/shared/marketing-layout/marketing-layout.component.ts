import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-marketing-layout',
  template: `
    <div class="marketing-page">
      <!-- Header Navigation -->
      <header class="marketing-header">
        <div class="container">
          <nav class="header-nav" role="navigation" aria-label="主导航">
            <div
              class="logo"
              (click)="navigateTo('/marketing')"
              style="cursor: pointer;"
              tabindex="0"
              role="link"
              aria-label="返回首页"
            >
              <span class="logo-text">MatuX</span>
            </div>

            <!-- Hamburger Menu Button -->
            <button
              class="mobile-menu-toggle"
              (click)="toggleMobileMenu()"
              [attr.aria-expanded]="isMobileMenuOpen"
              aria-label="切换导航菜单"
              aria-controls="mobile-nav-menu"
            >
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </button>

            <ul class="nav-menu" [class.open]="isMobileMenuOpen" id="mobile-nav-menu">
              <li>
                <a
                  routerLink="/marketing"
                  class="nav-link"
                  [attr.aria-current]="isActive('/marketing') ? 'page' : null"
                  (keydown)="handleKeydown($event, '/marketing')"
                  >首页</a
                >
              </li>
              <li>
                <a
                  routerLink="/marketing/product"
                  class="nav-link"
                  [attr.aria-current]="isActive('/marketing/product') ? 'page' : null"
                  (keydown)="handleKeydown($event, '/marketing/product')"
                  >产品特性</a
                >
              </li>
              <li>
                <a
                  routerLink="/marketing/education"
                  class="nav-link"
                  [attr.aria-current]="isActive('/marketing/education') ? 'page' : null"
                  (keydown)="handleKeydown($event, '/marketing/education')"
                  >教育</a
                >
              </li>
              <li>
                <a
                  routerLink="/marketing/pricing"
                  class="nav-link"
                  [attr.aria-current]="isActive('/marketing/pricing') ? 'page' : null"
                  (keydown)="handleKeydown($event, '/marketing/pricing')"
                  >定价</a
                >
              </li>
              <li>
                <a
                  routerLink="/marketing/roadmap"
                  class="nav-link"
                  [attr.aria-current]="isActive('/marketing/roadmap') ? 'page' : null"
                  (keydown)="handleKeydown($event, '/marketing/roadmap')"
                  >路线图</a
                >
              </li>
              <li>
                <a
                  routerLink="/marketing/tech-stack"
                  class="nav-link"
                  [attr.aria-current]="isActive('/marketing/tech-stack') ? 'page' : null"
                  (keydown)="handleKeydown($event, '/marketing/tech-stack')"
                  >技术</a
                >
              </li>
              <li>
                <a
                  routerLink="/marketing/contact"
                  class="nav-link"
                  [attr.aria-current]="isActive('/marketing/contact') ? 'page' : null"
                  (keydown)="handleKeydown($event, '/marketing/contact')"
                  >联系我们</a
                >
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="marketing-main">
        <ng-content></ng-content>
      </main>

      <!-- Footer Navigation -->
      <footer class="marketing-footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-section">
              <h3>MatuX</h3>
              <p>开源教育生态系统</p>
              <p>GPL-3.0 开源协议</p>
            </div>
            <div class="footer-section">
              <h4>产品</h4>
              <ul>
                <li><a routerLink="/marketing/product">产品特性</a></li>
                <li><a routerLink="/marketing/pricing">定价方案</a></li>
                <li><a routerLink="/marketing/tech-stack">技术栈</a></li>
                <li><a routerLink="/marketing/roadmap">开发路线图</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>教育</h4>
              <ul>
                <li><a routerLink="/marketing/education">课程体系</a></li>
                <li><a routerLink="/marketing/education">学习路径</a></li>
                <li><a routerLink="/marketing/education">实战项目</a></li>
                <li><a routerLink="/marketing/education">学员成果</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>支持</h4>
              <ul>
                <li><a routerLink="/marketing/about">关于我们</a></li>
                <li><a routerLink="/marketing/contact">联系我们</a></li>
                <li><a href="https://github.com/imatuproject/imato" target="_blank">GitHub</a></li>
                <li><a routerLink="/marketing/contact">技术支持</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2024 MatuX. All rights reserved. | GPL-3.0 License</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      .marketing-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .marketing-main {
        flex: 1;
      }

      /* Header Styles */
      .marketing-header {
        position: sticky;
        top: 0;
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        backdrop-filter: blur(10px);
        z-index: 1000;
        padding: 16px 0;
        box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
      }

      .header-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .logo-text {
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
        text-decoration: none;
        transition: opacity 0.3s ease;

        &:hover {
          opacity: 0.9;
        }
      }

      .nav-menu {
        display: flex;
        list-style: none;
        gap: 32px;
        margin: 0;
        padding: 0;
      }

      .nav-link {
        color: rgba(255, 255, 255, 0.9);
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s ease;
        position: relative;

        &:hover {
          color: #60a5fa; // 亮藏青 hover 色
        }

        &[aria-current='page'] {
          color: #60a5fa; // 当前页面激活状态 - 亮藏青
          font-weight: 600;

          &::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            right: 0;
            height: 2px;
            background: #60a5fa; // 亮藏青下划线
            border-radius: 2px;
          }
        }
      }

      /* Hamburger Menu Button */
      .mobile-menu-toggle {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        z-index: 1001;
      }

      .hamburger-line {
        display: block;
        width: 24px;
        height: 2px;
        background-color: white;
        margin: 5px 0;
        transition: all 0.3s ease;
      }

      /* Mobile Styles */
      @media (max-width: 768px) {
        .mobile-menu-toggle {
          display: block;
        }

        .nav-menu {
          position: fixed;
          top: 70px;
          left: -100%;
          width: 80%;
          height: calc(100vh - 70px);
          background: linear-gradient(180deg, #1e3a8a 0%, #2563eb 100%);
          flex-direction: column;
          padding: 24px;
          gap: 0;
          transition: left 0.3s ease;
          margin: 0;
          box-shadow: 4px 0 12px rgba(30, 58, 138, 0.4);
        }

        .nav-menu.open {
          left: 0;
        }

        .nav-menu li {
          margin-bottom: 16px;
        }

        .nav-link {
          display: block;
          padding: 12px 0;
          font-size: 1.1rem;

          &:hover,
          &[aria-current='page'] {
            color: #60a5fa; // 亮藏青
            font-weight: 600;
          }
        }
      }

      /* Footer Styles */
      .marketing-footer {
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
        color: white;
        padding: 60px 0 30px;
        margin-top: auto;
      }

      .footer-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 40px;
        margin-bottom: 40px;
      }

      .footer-section h3 {
        font-size: 1.5rem;
        margin-bottom: 16px;
        color: white;
      }

      .footer-section h4 {
        font-size: 1.2rem;
        margin-bottom: 16px;
        color: white;
      }

      .footer-section p {
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 8px;
      }

      .footer-section ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .footer-section ul li {
        margin-bottom: 12px;
      }

      .footer-section ul li a {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        transition: color 0.3s ease;
      }

      .footer-section ul li a:hover {
        color: white;
      }

      .footer-bottom {
        border-top: 1px solid rgba(72, 253, 0, 0.2);
        padding-top: 20px;
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
      }

      @media (max-width: 768px) {
        .nav-menu {
          gap: 16px;
        }

        .nav-link {
          font-size: 0.9rem;
        }
      }
    `,
  ],
  imports: [CommonModule, RouterLink],
})
export class MarketingLayoutComponent implements OnInit {
  currentRoute = '';
  isMobileMenuOpen = false;

  constructor(
    private router: Router,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    // Set default title
    this.titleService.setTitle('MatuX 欢迎来到机器人的世界！');

    // Update title and track current route on route change
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.titleService.setTitle('MatuX 欢迎来到机器人的世界！');
        this.currentRoute = event.urlAfterRedirects;
        this.isMobileMenuOpen = false; // Close mobile menu on route change
      });

    // Initialize current route
    this.currentRoute = this.router.url;
  }

  /**
   * 切换移动端菜单状态
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  navigateTo = (path: string): void => {
    void this.router.navigateByUrl(path);
  };

  /**
   * 检查链接是否为当前激活路由
   * @param link 链接路径
   * @returns 是否为当前路由
   */
  isActive(link: string): boolean {
    // 精确匹配当前路由
    if (this.currentRoute === link) {
      return true;
    }

    // 特殊处理 /marketing 首页，只匹配 exact 路径
    if (link === '/marketing') {
      return this.currentRoute === '/marketing' || this.currentRoute === '/marketing/';
    }

    // 其他路由允许匹配子路径（如 /marketing/product 匹配 /marketing/product/*）
    return this.currentRoute.startsWith(link + '/') && link !== '/marketing';
  }

  /**
   * 处理键盘导航事件
   * @param event 键盘事件
   * @param path 导航路径
   */
  handleKeydown(event: KeyboardEvent, path: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.navigateTo(path);
    }
  }
}
