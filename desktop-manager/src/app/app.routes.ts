import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/setup-wizard', pathMatch: 'full' },
  {
    path: 'setup-wizard',
    loadComponent: () =>
      import('./features/setup-wizard/setup-wizard.component').then((m) => m.SetupWizardComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'tutorial-library',
    loadComponent: () =>
      import('./features/tutorial-library/tutorial-library.component').then(
        (m) => m.TutorialLibraryComponent
      ),
  },
  {
    path: 'material-library',
    loadComponent: () =>
      import('./features/material-library/material-library.component').then(
        (m) => m.MaterialLibraryComponent
      ),
  },
  {
    path: 'knowledge-graph',
    loadComponent: () =>
      import('./features/knowledge-graph/knowledge-graph.component').then(
        (m) => m.KnowledgeGraphComponent
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: 'admin/education-platforms',
    loadComponent: () =>
      import('./admin/education-platforms/admin-education-platforms.component').then(
        (m) => m.AdminEducationPlatformsComponent
      ),
  },
  {
    path: 'admin/user-management',
    loadComponent: () =>
      import('./admin/user-management/admin-user-management.component').then(
        (m) => m.AdminUserManagementComponent
      ),
  },
  { path: '**', redirectTo: '/setup-wizard' },
];
