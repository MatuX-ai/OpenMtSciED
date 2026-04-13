import { Routes } from '@angular/router';

import { FeatureAiPathComponent } from './feature-ai-path/feature-ai-path.component';
import { FeatureHardwareComponent } from './feature-hardware/feature-hardware.component';
import { FeatureKnowledgeGraphComponent } from './feature-knowledge-graph/feature-knowledge-graph.component';
import { FeatureLearningPathComponent } from './feature-learning-path/feature-learning-path.component';
import { MarketingHomeComponent } from './marketing-home/marketing-home.component';

export const routes: Routes = [
  { path: '', component: MarketingHomeComponent },
  { path: 'feature/knowledge-graph', component: FeatureKnowledgeGraphComponent },
  { path: 'feature/ai-path', component: FeatureAiPathComponent },
  { path: 'feature/hardware', component: FeatureHardwareComponent },
  { path: 'feature/learning-path', component: FeatureLearningPathComponent },
  { path: '**', redirectTo: '' },
];
