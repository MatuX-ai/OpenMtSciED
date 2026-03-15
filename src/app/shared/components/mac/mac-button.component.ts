/**
 * Mac 风格按钮组件
 * Apple-inspired button component for Angular marketing pages
 */
import { Component, Input, HostBinding } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-mac-button',
  template: `
    <button 
      [class]="buttonClasses"
      [type]="type"
      [disabled]="disabled"
      (click)="onClick($event)">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .mac-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 500;
      line-height: 1;
      text-decoration: none;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      
      &:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
      }
      
      &:active {
        transform: scale(0.98);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
    }
    
    /* Primary variant */
    .mac-btn-primary {
      background: #007AFF;
      color: #FFFFFF;
      
      &:hover:not(:disabled) {
        background: #0056CC;
        box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
      }
    }
    
    /* Secondary variant */
    .mac-btn-secondary {
      background: #F5F5F7;
      color: #1D1D1F;
      
      &:hover:not(:disabled) {
        background: #E5E5EA;
      }
    }
    
    /* Outline variant */
    .mac-btn-outline {
      background: transparent;
      color: #007AFF;
      border: 1px solid #007AFF;
      
      &:hover:not(:disabled) {
        background: rgba(0, 122, 255, 0.08);
      }
    }
    
    /* Ghost variant */
    .mac-btn-ghost {
      background: transparent;
      color: #007AFF;
      border: none;
      
      &:hover:not(:disabled) {
        background: rgba(0, 122, 255, 0.08);
      }
    }
    
    /* Sizes */
    .mac-btn-sm {
      padding: 6px 16px;
      font-size: 13px;
    }
    
    .mac-btn-md {
      padding: 10px 24px;
      font-size: 14px;
    }
    
    .mac-btn-lg {
      padding: 14px 32px;
      font-size: 16px;
    }
  `]
})
export class MacButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  
  @HostBinding('class') get buttonClasses(): string {
    return `mac-btn mac-btn-${this.variant} mac-btn-${this.size}`;
  }
  
  onClick(event: MouseEvent): void {
    if (!this.disabled) {
      // Event emission logic can be added here
    }
  }
}
