import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `<div class="auth-layout"><router-outlet></router-outlet></div>`,
  styles: [
    `
      .auth-layout {
        height: 100vh;
        overflow: auto;
      }
    `,
  ],
})
export class AuthLayoutComponent {}
