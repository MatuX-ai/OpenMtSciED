/**
 * Mac 风格组件模块
 * Shared module for Mac-style UI components
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MacButtonComponent } from './mac-button.component';
import { MacNavbarComponent } from './mac-navbar.component';
import { MacCardComponent } from './mac-card.component';
import { MacFooterComponent } from './mac-footer.component';

const COMPONENTS = [
  MacButtonComponent,
  MacNavbarComponent,
  MacCardComponent,
  MacFooterComponent,
];

@NgModule({
  declarations: [
    ...COMPONENTS,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ...COMPONENTS,
  ]
})
export class MacComponentsModule { }
