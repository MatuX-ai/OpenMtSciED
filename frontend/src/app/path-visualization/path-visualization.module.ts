import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PathVisualizationComponent } from './path-visualization.component';

@NgModule({
  declarations: [PathVisualizationComponent],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [PathVisualizationComponent]
})
export class PathVisualizationModule { }
