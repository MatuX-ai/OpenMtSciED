import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme());

  public theme$: Observable<Theme> = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.getValue());
  }

  /**
   * 获取当前主题
   */
  getTheme(): Theme {
    return this.themeSubject.getValue();
  }

  /**
   * 切换主题
   */
  toggleTheme(): void {
    const current = this.themeSubject.getValue();
    const next = current === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  /**
   * 设置主题
   */
  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  /**
   * 应用主题到DOM
   */
  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      // 使用 data-theme 属性而不是 CSS 类
      document.documentElement.setAttribute('data-theme', theme);
      
      // 更新meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a2e' : '#ffffff');
      }
    }
  }

  /**
   * 获取初始主题
   */
  private getInitialTheme(): Theme {
    // 优先从localStorage读取
    const saved = localStorage.getItem(this.THEME_KEY) as Theme;
    if (saved) {
      return saved;
    }

    // 其次检测系统偏好
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return 'light';
  }
}
