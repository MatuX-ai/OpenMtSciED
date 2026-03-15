/**
 * Mac 风格卡片组件
 * Versatile card component for marketing pages
 */
import { Component, Input } from '@angular/core';

export type CardVariant = 'default' | 'elevated' | 'outlined';

@Component({
  selector: 'app-mac-card',
  template: `
    <div 
      class="mac-card"
      [class]="'mac-card-' + variant"
      [class.clickable]="clickable">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .mac-card {
      background: #FFFFFF;
      border-radius: 14px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      
      &.mac-card-default {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
      }
      
      &.mac-card-elevated {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        
        &:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
        }
      }
      
      &.mac-card-outlined {
        border: 1px solid #E5E5EA;
        box-shadow: none;
        
        &:hover {
          border-color: #007AFF;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.1);
        }
      }
      
      &.clickable {
        cursor: pointer;
      }
    }
  `]
})
export class MacCardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() clickable = false;
}
