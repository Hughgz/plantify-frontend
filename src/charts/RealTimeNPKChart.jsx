import React, { useRef, useEffect } from 'react';
import { Chart } from 'chart.js';

function RealTimeNPKChart({ data, width, height }) {
  const canvas = useRef(null);

  useEffect(() => {
    const ctx = canvas.current;
    const chart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        layout: { padding: 20 },
        scales: {
          y: {
            suggestedMin: 0,
            suggestedMax: 30, // Phạm vi NPK (mg/kg)
            ticks: {
              callback: (value) => `${value} mg/kg`,
            },
          },
          x: {
            type: 'time',
            time: {
              unit: 'second',
              stepSize: 5, // Khoảng cách giữa các mốc thời gian là 5 giây
              displayFormats: { second: 'H:mm:ss' },
            },
            ticks: {
              maxTicksLimit: 6, // Giới hạn hiển thị 6 mốc thời gian
            },
          },
        },
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y} mg/kg`,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
      },
    });

    return () => chart.destroy();
  }, [data]);

  return <canvas ref={canvas} width={width} height={height}></canvas>;
}

export default RealTimeNPKChart;
