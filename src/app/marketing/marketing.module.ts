import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';

import { DisclaimerComponent } from '../components/disclaimer/disclaimer.component';

// Components
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { EducationComponent } from './education/education.component';
import { FeaturesSectionComponent } from './features-section/features-section.component';
import { MarketingHomeComponent } from './marketing-home/marketing-home.component';
import { PricingPageComponent } from './pricing-page/pricing-page.component';
import { ProductShowcaseComponent } from './product-showcase/product-showcase.component';
import { RoadmapComponent } from './roadmap/roadmap.component';
import { MarketingLayoutComponent } from './shared/marketing-layout/marketing-layout.component';
import { TechStackComponent } from './tech-stack/tech-stack.component';
import { MarketingRoutingModule } from './marketing-routing.module';

@NgModule({
  declarations: [
    // 所有营销组件都已是standalone，不需要在declarations中声明
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MarketingRoutingModule,

    // Angular Material Modules
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTabsModule,

    // Standalone组件
    MarketingHomeComponent,
    ProductShowcaseComponent,
    PricingPageComponent,
    ContactUsComponent,
    AboutUsComponent,
    FeaturesSectionComponent,
    EducationComponent,
    TechStackComponent,
    RoadmapComponent,
    DisclaimerComponent,
    MarketingLayoutComponent,
  ],
})
export class MarketingModule {}
