import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService, UserInfo } from '../auth.service';

@Component({
  selector: 'app-marketing-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" [class.navbar-dark]="theme === 'dark'">
      <div class="nav-content">
        <a
          routerLink="/"
          class="logo"
          [routerLinkActive]="'active'"
          [routerLinkActiveOptions]="{ exact: true }"
        >
          OpenMTSciEd
        </a>
        <ul class="nav-links">
          <li>
            <a
              [href]="'/' + (isHomePage ? '#features' : '')"
              [class.active]="isHomePage && activeSection === 'features'"
              (click)="scrollToSection('features')"
            >
              核心特性
            </a>
          </li>
          <li>
            <a
              [href]="'/' + (isHomePage ? '#path' : '')"
              [class.active]="isHomePage && activeSection === 'path'"
              (click)="scrollToSection('path')"
            >
              学习路径
            </a>
          </li>
          <li>
            <a
              [href]="'/' + (isHomePage ? '#hardware' : '')"
              [class.active]="isHomePage && activeSection === 'hardware'"
              (click)="scrollToSection('hardware')"
            >
              硬件项目
            </a>
          </li>
          <li><a href="https://github.com/iMato/OpenMTSciEd" target="_blank">GitHub</a></li>
          <li>
            <a routerLink="/download" class="btn-download">下载桌面端</a>
          </li>
          
          <!-- 未登录状态 -->
          <li *ngIf="!currentUser">
            <a routerLink="/auth/login" class="btn-login">登录</a>
          </li>
          <li *ngIf="!currentUser">
            <a routerLink="/auth/register" class="btn-register">注册</a>
          </li>
          
          <!-- 已登录状态 -->
          <li *ngIf="currentUser" class="user-menu">
            <span class="username">{{ currentUser.username }}</span>
            <a routerLink="/auth/profile">个人资料</a>
            <a (click)="onLogout()" class="btn-logout">退出</a>
          </li>
        </ul>
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(10px);
        padding: 1rem 2rem;
        position: fixed;
        width: 100%;
        top: 0;
        z-index: 1000;
        border-bottom: 1px solid rgba(99, 102, 241, 0.2);
      }

      .nav-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .logo {
        font-size: 1.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, #6366f1, #06b6d4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-decoration: none;
      }

      .logo.active {
        text-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
      }

      .nav-links {
        display: flex;
        gap: 2rem;
        list-style: none;
        margin: 0;
        padding: 0;
        align-items: center;
      }

      .nav-links a {
        color: #94a3b8;
        text-decoration: none;
        transition: all 0.3s;
        padding: 0.5rem 0;
        position: relative;
      }

      .nav-links a::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(90deg, #6366f1, #06b6d4);
        transition: width 0.3s;
      }

      .nav-links a:hover {
        color: #f8fafc;
      }

      .nav-links a:hover::after {
        width: 100%;
      }

      .nav-links a.active {
        color: #f8fafc;
      }

      .nav-links a.active::after {
        width: 100%;
      }

      /* 登录/注册按钮 */
      .btn-login {
        color: #6366f1 !important;
        font-weight: 600;
      }

      .btn-login:hover {
        color: #8b5cf6 !important;
      }

      .btn-register {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white !important;
        padding: 0.5rem 1.5rem !important;
        border-radius: 8px;
        font-weight: 600;
      }

      .btn-register:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);
      }

      .btn-register::after {
        display: none !important;
      }

      /* 下载按钮 */
      .btn-download {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white !important;
        padding: 0.5rem 1.5rem !important;
        border-radius: 8px;
        font-weight: 600;
      }

      .btn-download:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
      }

      .btn-download::after {
        display: none !important;
      }

      /* 用户菜单 */
      .user-menu {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .username {
        color: #f8fafc;
        font-weight: 600;
        padding: 0.5rem 1rem;
        background: rgba(99, 102, 241, 0.1);
        border-radius: 8px;
      }

      .btn-logout {
        color: #ef4444 !important;
        cursor: pointer;
      }

      .btn-logout:hover {
        color: #dc2626 !important;
      }

      @media (max-width: 768px) {
        .nav-links {
          display: none;
        }
      }
    `,
  ],
})
export class MarketingNavComponent implements OnInit, OnDestroy {
  @Input() theme: 'default' | 'dark' = 'default';
  @Input() isHomePage: boolean = false;
  @Input() activeSection: string = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser: UserInfo | null = null;
  private subscription: Subscription = new Subscription();

  constructor() {}

  ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUser$.subscribe((user: UserInfo | null) => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  scrollToSection(sectionId: string): void {
    if (this.isHomePage) {
      // 如果在首页，直接滚动到对应区域
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // 如果在子页面，先跳转到首页再滚动
      window.location.href = '/#' + sectionId;
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
