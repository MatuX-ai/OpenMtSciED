import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MarketingNavComponent } from './shared/marketing-nav/marketing-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MarketingNavComponent],
  template: `
    <app-marketing-nav></app-marketing-nav>
    <router-outlet></router-outlet>
  `,
  styles: [],
})
export class AppComponent {
  title = 'OpenMTSciEd Desktop Manager';
}
