import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { ProfileComponent } from './auth/profile/profile.component';
import { RegisterComponent } from './auth/register/register.component';
import { DownloadComponent } from './download/download.component';
import { FeatureAiPathComponent } from './feature-ai-path/feature-ai-path.component';
import { FeatureHardwareComponent } from './feature-hardware/feature-hardware.component';
import { FeatureKnowledgeGraphComponent } from './feature-knowledge-graph/feature-knowledge-graph.component';
import { FeatureLearningPathComponent } from './feature-learning-path/feature-learning-path.component';
import { LearningPathVisualizerComponent } from './feature-learning-path/learning-path-visualizer/learning-path-visualizer.component';
import { MarketingHomeComponent } from './marketing-home/marketing-home.component';
import { AuthGuard } from './shared/auth.guard';

export const routes: Routes = [
  { path: '', component: MarketingHomeComponent },
  { path: 'feature/knowledge-graph', component: FeatureKnowledgeGraphComponent },
  { path: 'feature/ai-path', component: FeatureAiPathComponent },
  { path: 'feature/hardware', component: FeatureHardwareComponent },
  { path: 'feature/learning-path', component: FeatureLearningPathComponent },
  { path: 'learning-path/visualizer', component: LearningPathVisualizerComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'download', component: DownloadComponent },
  { path: '**', redirectTo: '' },
];
