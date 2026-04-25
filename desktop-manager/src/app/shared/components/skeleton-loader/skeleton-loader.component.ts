import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container" [ngStyle]="{ 'gap': gap + 'px' }">
      <div
        *ngFor="let item of items; let i = index"
        class="skeleton-item"
        [ngClass]="item.type"
        [ngStyle]="getItemStyle(item)"
      >
        <div class="skeleton-animation"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-container {
      display: flex;
      flex-direction: column;
      padding: 16px;
    }

    .skeleton-item {
      position: relative;
      overflow: hidden;
      background: var(--bg-secondary, #e0e0e0);
      border-radius: 8px;
    }

    .skeleton-animation {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      );
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    /* 不同类型样式 */
    .text {
      height: 16px;
      width: 100%;
    }

    .text-short {
      height: 16px;
      width: 60%;
    }

    .text-medium {
      height: 16px;
      width: 80%;
    }

    .title {
      height: 24px;
      width: 70%;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .card {
      height: 200px;
      width: 100%;
    }

    .list-item {
      height: 60px;
      width: 100%;
    }

    .button {
      height: 36px;
      width: 120px;
      border-radius: 4px;
    }

    .image {
      height: 150px;
      width: 100%;
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() count: number = 5;
  @Input() type: 'text' | 'title' | 'avatar' | 'card' | 'list-item' | 'button' | 'image' = 'text';
  @Input() gap: number = 12;

  get items(): Array<{ type: string; width?: string; height?: string }> {
    return Array(this.count).fill({ type: this.type });
  }

  getItemStyle(item: { type: string; width?: string; height?: string }) {
    // 可以根据需要自定义每个骨架项的样式
    return {};
  }
}
