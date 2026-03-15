import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./marketing-home/marketing-home-mac.component').then(
        (m) => m.MarketingHomeMacComponent
      ),
    data: { preload: true }, // 首页优先加载
  },
  {
    path: 'pricing',
    loadComponent: () =>
      import('./pricing-page/pricing-page-mac.component').then((m) => m.PricingPageMacComponent),
  },
  {
    path: 'features',
    loadComponent: () =>
      import('./features-section/features-page-mac.component').then(
        (m) => m.FeaturesPageMacComponent
      ),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./about-us/about-page-mac.component').then((m) => m.AboutPageMacComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./contact-us/contact-page-mac.component').then((m) => m.ContactPageMacComponent),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarketingRoutingModule {}
