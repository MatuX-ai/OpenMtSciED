/**
 * Mac 风格页脚组件
 * Clean, minimal footer component
 */
import { Component, Input } from '@angular/core';

interface FooterLink {
  label: string;
  url: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

@Component({
  selector: 'app-mac-footer',
  template: `
    <footer class="mac-footer">
      <div class="mac-footer-container">
        <!-- Main Footer Content -->
        <div class="mac-footer-content">
          <div class="mac-footer-sections">
            <div 
              *ngFor="let section of sections" 
              class="mac-footer-section">
              <h4>{{ section.title }}</h4>
              <ul>
                <li *ngFor="let link of section.links">
                  <a [href]="link.url">{{ link.label }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Bottom Bar -->
        <div class="mac-footer-bottom">
          <div class="mac-footer-copyright">
            <p>&copy; {{ currentYear }} {{ companyName }}. All rights reserved.</p>
          </div>
          <div class="mac-footer-powered">
            <span>Powered by iMatu Platform</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .mac-footer {
      background: #F5F5F7;
      border-top: 1px solid #E5E5EA;
      padding: 64px 0 32px;
      margin-top: 96px;
    }
    
    .mac-footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    .mac-footer-content {
      margin-bottom: 48px;
    }
    
    .mac-footer-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 48px;
    }
    
    .mac-footer-section {
      h4 {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #86868B;
        margin-bottom: 16px;
      }
      
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        
        li {
          margin-bottom: 12px;
          
          a {
            font-size: 14px;
            color: #6E6E73;
            text-decoration: none;
            transition: color 0.2s;
            
            &:hover {
              color: #1D1D1F;
            }
          }
        }
      }
    }
    
    .mac-footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 32px;
      border-top: 1px solid #E5E5EA;
      
      p {
        font-size: 13px;
        color: #86868B;
        margin: 0;
      }
      
      span {
        font-size: 13px;
        color: #86868B;
      }
    }
    
    @media (max-width: 768px) {
      .mac-footer {
        padding: 48px 0 24px;
      }
      
      .mac-footer-sections {
        grid-template-columns: repeat(2, 1fr);
        gap: 32px;
      }
      
      .mac-footer-bottom {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
    }
  `]
})
export class MacFooterComponent {
  @Input() sections: FooterSection[] = [
    {
      title: 'Product',
      links: [
        { label: 'Features', url: '/features' },
        { label: 'Pricing', url: '/pricing' },
        { label: 'Enterprise', url: '/enterprise' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About', url: '/about' },
        { label: 'Careers', url: '/careers' },
        { label: 'Contact', url: '/contact' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', url: '/docs' },
        { label: 'Blog', url: '/blog' },
        { label: 'Support', url: '/support' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', url: '/privacy' },
        { label: 'Terms', url: '/terms' },
      ]
    },
  ];
  
  @Input() companyName = 'iMatu';
  currentYear = new Date().getFullYear();
}
