import * as echarts from 'echarts';
import React, { useEffect, useRef } from 'react';

const PathMap: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const myChart = echarts.init(chartRef.current) as echarts.ECharts;
      const option = {
        title: { text: 'STEM Knowledge Graph' },
        tooltip: {},
        series: [
          {
            type: 'graph',
            layout: 'force',
            symbolSize: 45,
            roam: true,
            label: { show: true },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
            data: [
              { name: 'Ecosystems', category: 0 },
              { name: 'Photosynthesis', category: 1 },
              { name: 'Energy Flow', category: 1 },
            ],
            links: [
              { source: 'Ecosystems', target: 'Photosynthesis' },
              { source: 'Ecosystems', target: 'Energy Flow' },
            ],
            categories: [{ name: 'Unit' }, { name: 'Concept' }],
          },
        ],
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      myChart.setOption(option);
    }
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '600px' }} />;
};

export default PathMap;
