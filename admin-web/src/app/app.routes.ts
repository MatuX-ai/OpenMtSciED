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
        path: 'admin/crawlers',
        loadComponent: () =>
          import('./admin/crawlers/admin-crawlers.component').then(
            (m) => m.AdminCrawlersComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
