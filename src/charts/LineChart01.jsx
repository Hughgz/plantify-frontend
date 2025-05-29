import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';

import { chartColors } from './ChartjsConfig';
import {
  Chart, LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip, CategoryScale
} from 'chart.js';
import 'chartjs-adapter-moment';

// Import utilities
import { formatValue } from '../utils/Utils';

Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, CategoryScale, Tooltip);

function LineChart01({
  data,
  width,
  height,
  unitLabel = '°C'
}) {

  const [chart, setChart] = useState(null);
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors; 

  useEffect(() => {
    // Hủy biểu đồ cũ nếu tồn tại
    if (chart) {
      chart.destroy();
    }

    if (!canvas.current) return;

    // Đảm bảo datasets có backgroundColor và đặt các thuộc tính cần thiết
    if (data && data.datasets && data.datasets.length > 0) {
      data.datasets.forEach(dataset => {
        // Đảm bảo fill được bật
        dataset.fill = true;
        
        // Thêm backgroundColor nếu chưa có
        if (!dataset.backgroundColor) {
          // Chuyển đổi borderColor thành backgroundColor với alpha thấp
          if (dataset.borderColor) {
            const colorBase = dataset.borderColor.toString();
            if (colorBase.startsWith('rgb')) {
              dataset.backgroundColor = colorBase.replace('rgb', 'rgba').replace(')', ', 0.2)');
            } else {
              dataset.backgroundColor = 'rgba(56, 128, 255, 0.2)'; // Light blue
            }
          } else {
            dataset.backgroundColor = 'rgba(56, 128, 255, 0.2)'; // Light blue fallback
          }
        }
      });
    }

    const ctx = canvas.current;
    // eslint-disable-next-line no-unused-vars
    const newChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        layout: {
          padding: 20,
        },
        scales: {
          y: {
            display: true,
            beginAtZero: true,
            grid: {
              drawBorder: false,
              color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              callback: (value) => `${value}${unitLabel}`,
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            },
          },
          x: {
            type: 'category',
            display: true,
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: () => false, // Disable tooltip title
              label: (context) => `${context.parsed.y}${unitLabel}`,
            },
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
          },
          legend: {
            display: false,
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
    });
    setChart(newChart);
    return () => {
      if (newChart) newChart.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, unitLabel]);

  useEffect(() => {
    if (!chart) return;

    if (darkMode) {
      chart.options.plugins.tooltip.bodyColor = tooltipBodyColor.dark;
      chart.options.plugins.tooltip.backgroundColor = tooltipBgColor.dark;
      chart.options.plugins.tooltip.borderColor = tooltipBorderColor.dark;
      chart.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.1)';
      chart.options.scales.y.ticks.color = 'rgba(255, 255, 255, 0.7)';
      chart.options.scales.x.ticks.color = 'rgba(255, 255, 255, 0.7)';
    } else {
      chart.options.plugins.tooltip.bodyColor = tooltipBodyColor.light;
      chart.options.plugins.tooltip.backgroundColor = tooltipBgColor.light;
      chart.options.plugins.tooltip.borderColor = tooltipBorderColor.light;
      chart.options.scales.y.grid.color = 'rgba(0, 0, 0, 0.05)';
      chart.options.scales.y.ticks.color = 'rgba(0, 0, 0, 0.7)';
      chart.options.scales.x.ticks.color = 'rgba(0, 0, 0, 0.7)';
    }
    chart.update('none');
  }, [currentTheme, chart, tooltipBodyColor, tooltipBgColor, tooltipBorderColor]);

  return (
    <canvas ref={canvas} width={width} height={height}></canvas>
  );
}

export default LineChart01;
