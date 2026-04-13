/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as echarts from 'echarts';

interface GraphNode {
  id: string;
  name: string;
  symbolSize?: number;
  category?: number;
  [key: string]: unknown;
}

interface GraphLink {
  source: string;
  target: string;
  [key: string]: unknown;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

@Component({
  selector: 'app-path-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div #chartContainer class="path-map-container"></div>`,
  styleUrls: ['./path-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PathMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @Input() graphData: GraphData | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private chartInstance: any = null;

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
  }

  private initChart(): void {
    if (!this.chartContainer || !this.graphData) return;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.chartInstance = echarts.init(this.chartContainer.nativeElement);

    const option: echarts.EChartsOption = {
      tooltip: {},
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'force',
          symbolSize: 50,
          roam: true,
          label: {
            show: true,
          },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          edgeLabel: {
            fontSize: 20,
          },
          data: this.graphData.nodes,
          links: this.graphData.links,
          categories: [{ name: '教程' }, { name: '课件' }, { name: '硬件项目' }],
          force: {
            repulsion: 100,
            edgeLength: 150,
          },
          lineStyle: {
            color: 'source',
            curveness: 0.3,
          },
        },
      ],
    };

    this.chartInstance.setOption(option);

    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = (): void => {
    this.chartInstance?.resize();
  };
}
