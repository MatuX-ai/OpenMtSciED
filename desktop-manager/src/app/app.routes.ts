import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 公开页面
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  // 认证相关
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/auth/profile/profile.component').then((m) => m.ProfileComponent),
  },
  // 初始化向导
  {
    path: 'setup-wizard',
    loadComponent: () =>
      import('./features/setup-wizard/setup-wizard.component').then((m) => m.SetupWizardComponent),
  },
  // 主要功能
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'tutorial-library',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/tutorial-library/tutorial-library.component').then(
        (m) => m.TutorialLibraryComponent
      ),
  },
  {
    path: 'my-projects',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/my-projects/my-projects.component').then(
        (m) => m.MyProjectsComponent
      ),
  },
  {
    path: 'material-library',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/material-library/material-library.component').then(
        (m) => m.MaterialLibraryComponent
      ),
  },
  {
    path: 'knowledge-graph',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/knowledge-graph/knowledge-graph.component').then(
        (m) => m.KnowledgeGraphComponent
      ),
  },
  {
    path: 'path-visualization',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/path-visualization/path-visualization.component').then(
        (m) => m.PathVisualizationComponent
      ),
  },


  {
    path: 'hardware-projects',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/hardware-projects/hardware-project-list/hardware-project-list.component').then(
        (m) => m.HardwareProjectListComponent
      ),
  },
  {
    path: 'resource-browser',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/resource-browser/resource-browser.component').then(
        (m) => m.ResourceBrowserComponent
      ),
  },
  {
    path: 'search-map',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/search-map/search-map.component').then((m) => m.SearchMapComponent),
  },
  {
    path: 'question-practice',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/learning/question-practice.component').then((m) => m.QuestionPracticeComponent),
  },
  {
    path: 'question-stats',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/learning/question-stats.component').then((m) => m.QuestionStatsComponent),
  },

  // 设置
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
  },

  // 通配符路由
  { path: '**', redirectTo: '/dashboard' },
];
