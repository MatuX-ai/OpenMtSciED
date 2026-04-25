import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'admin/user-management',
        loadComponent: () =>
          import('./admin/user-management/admin-user-management.component').then(
            (m) => m.AdminUserManagementComponent
          ),
      },
      {
        path: 'admin/education-platforms',
        loadComponent: () =>
          import('./admin/education-platforms/admin-education-platforms.component').then(
            (m) => m.AdminEducationPlatformsComponent
          ),
      },
      {
        path: 'admin/settings',
        loadComponent: () =>
          import('./admin/settings/admin-settings.component').then(
            (m) => m.AdminSettingsComponent
          ),
      },
      {
        path: 'admin/courses',
        loadComponent: () =>
          import('./admin/courses/admin-courses.component').then(
            (m) => m.AdminCoursesComponent
          ),
      },
      {
        path: 'admin/tutorials',
        loadComponent: () =>
          import('./admin/tutorials/admin-tutorials.component').then(
            (m) => m.AdminTutorialsComponent
          ),
      },
      {
        path: 'admin/materials',
        loadComponent: () =>
          import('./admin/materials/admin-materials.component').then(
            (m) => m.AdminMaterialsComponent
          ),
      },
      {
        path: 'admin/crawlers',
        loadComponent: () =>
          import('./admin/crawlers/admin-crawlers.component').then(
            (m) => m.AdminCrawlersComponent
          ),
      },
      {
        path: 'admin/knowledge-graph',
        loadComponent: () =>
          import('./admin/knowledge-graph/knowledge-graph-admin.component').then(
            (m) => m.KnowledgeGraphAdminComponent
          ),
      },
      {
        path: 'admin/resource-associations',
        loadComponent: () =>
          import('./admin/resource-associations/resource-associations.component').then(
            (m) => m.ResourceAssociationsComponent
          ),
      },
      {
        path: 'admin/question-bank',
        loadComponent: () =>
          import('./admin/question-bank/admin-question-bank.component').then(
            (m) => m.AdminQuestionBankComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
