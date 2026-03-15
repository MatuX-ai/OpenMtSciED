/**
 * Mac 风格导航栏组件
 * Apple-inspired responsive navbar component
 */
import { Component, Input } from '@angular/core';

interface NavItem {
  label: string;
  url: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-mac-navbar',
  template: `
    <nav class="mac-navbar" [class.scrolled]="isScrolled">
      <div class="mac-navbar-container">
        <!-- Brand/Logo -->
        <a [href]="brandUrl" class="mac-navbar-brand">
          <ng-content select="[brand]"></ng-content>
          <span *ngIf="!hasBrand">{{ brandName }}</span>
        </a>
        
        <!-- Desktop Navigation -->
        <div class="mac-navbar-menu">
          <ul class="mac-navbar-list">
            <li *ngFor="let item of navItems" class="mac-navbar-item">
              <a [href]="item.url" class="mac-navbar-link">
                {{ item.label }}
              </a>
            </li>
          </ul>
        </div>
        
        <!-- Action Buttons -->
        <div class="mac-navbar-actions">
          <ng-content select="[actions]"></ng-content>
        </div>
        
        <!-- Mobile Menu Toggle -->
        <button 
          class="mac-navbar-toggle"
          (click)="toggleMobileMenu()"
          [class.active]="isMobileMenuOpen"
          aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      <!-- Mobile Menu -->
      <div class="mac-navbar-mobile-menu" *ngIf="isMobileMenuOpen">
        <ul>
          <li *ngFor="let item of navItems">
            <a [href]="item.url" (click)="closeMobileMenu()">{{ item.label }}</a>
          </li>
          <li><ng-content select="[mobile-actions]"></ng-content></li>
        </ul>
      </div>
    </nav>
  `,
  styles: [`
    .mac-navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      z-index: 1000;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &.scrolled {
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      }
    }
    
    .mac-navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 52px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    .mac-navbar-brand {
      font-size: 20px;
      font-weight: 600;
      color: #1D1D1F;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
      
      &:hover {
        color: #007AFF;
      }
    }
    
    .mac-navbar-menu {
      display: flex;
      align-items: center;
    }
    
    .mac-navbar-list {
      display: flex;
      list-style: none;
      gap: 32px;
      margin: 0;
      padding: 0;
    }
    
    .mac-navbar-link {
      font-size: 14px;
      color: #6E6E73;
      text-decoration: none;
      transition: color 0.2s;
      
      &:hover {
        color: #1D1D1F;
      }
    }
    
    .mac-navbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .mac-navbar-toggle {
      display: none;
      flex-direction: column;
      gap: 5px;
      padding: 8px;
      background: none;
      border: none;
      cursor: pointer;
      
      span {
        width: 20px;
        height: 2px;
        background: #1D1D1F;
        transition: all 0.3s;
      }
      
      &.active {
        span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        span:nth-child(2) {
          opacity: 0;
        }
        span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }
      }
    }
    
    .mac-navbar-mobile-menu {
      display: none;
      position: absolute;
      top: 52px;
      left: 0;
      right: 0;
      background: white;
      border-bottom: 1px solid #E5E5EA;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      padding: 16px 24px;
      
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        
        li {
          margin-bottom: 16px;
          
          a {
            font-size: 16px;
            color: #1D1D1F;
            text-decoration: none;
            display: block;
            padding: 8px 0;
          }
        }
      }
    }
    
    @media (max-width: 768px) {
      .mac-navbar-menu,
      .mac-navbar-actions {
        display: none;
      }
      
      .mac-navbar-toggle {
        display: flex;
      }
      
      .mac-navbar-mobile-menu {
        display: block;
      }
    }
  `]
})
export class MacNavbarComponent {
  @Input() brandName = 'iMatu';
  @Input() brandUrl = '/';
  @Input() navItems: NavItem[] = [];
  
  isScrolled = false;
  isMobileMenuOpen = false;
  hasBrand = false;
  
  constructor() {
    // Listen to scroll events
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onScroll.bind(this));
    }
  }
  
  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }
  
  private onScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
