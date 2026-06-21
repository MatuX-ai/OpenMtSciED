import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/auth/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'topic-studio',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/topic-studio/topic-studio.component').then((m) => m.TopicStudioComponent),
      },
      {
        path: 'topic-studio/:draftId',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/topic-studio/topic-studio.component').then((m) => m.TopicStudioComponent),
      },
      {
        path: 'creator-center',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/creator-center/creator-center.component').then(
            (m) => m.CreatorCenterComponent
          ),
      },
      {
        path: 'public-library',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/public-library/public-library.component').then(
            (m) => m.PublicLibraryComponent
          ),
      },
      {
        path: 'tutorial-library',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./core/components/resource-redirect.component').then((m) => m.ResourceRedirectComponent),
        data: { extraParams: { type: 'tutorial' } },
      },
      {
        path: 'my-projects',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/my-projects/my-projects.component').then((m) => m.MyProjectsComponent),
      },
      {
        path: 'material-library',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./core/components/resource-redirect.component').then((m) => m.ResourceRedirectComponent),
        data: { extraParams: { type: 'material' } },
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
          import('./core/components/knowledge-graph-redirect.component').then(
            (m) => m.KnowledgeGraphRedirectComponent
          ),
        data: { tab: 'path' },
      },
      {
        path: 'hardware-projects/:projectId/editor',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./core/components/route-redirect.component').then((m) => m.RouteRedirectComponent),
        data: { redirectTo: '/hardware-projects' },
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
        path: 'resource-explorer',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/unified-resource-browser/unified-resource-browser.component').then(
            (m) => m.UnifiedResourceBrowserComponent
          ),
      },
      {
        path: 'resource-browser',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./core/components/resource-redirect.component').then((m) => m.ResourceRedirectComponent),
      },
      {
        path: 'search-map',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./core/components/knowledge-graph-redirect.component').then(
            (m) => m.KnowledgeGraphRedirectComponent
          ),
        data: { tab: 'search' },
      },
      {
        path: 'question-practice',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/learning/question-practice.component').then(
            (m) => m.QuestionPracticeComponent
          ),
      },
      {
        path: 'question-stats',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/learning/question-stats.component').then((m) => m.QuestionStatsComponent),
      },
      {
        path: 'settings',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
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
        path: 'setup-wizard',
        loadComponent: () =>
          import('./features/setup-wizard/setup-wizard.component').then(
            (m) => m.SetupWizardComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
