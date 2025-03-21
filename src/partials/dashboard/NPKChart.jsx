import React, { useState, useEffect } from 'react';
import Tooltip from '../../components/Tooltip';
import { chartAreaGradient } from '../../charts/ChartjsConfig';

// Import utilities
import { tailwindConfig, hexToRGB } from '../../utils/Utils';
import RealTimeNPKChart from '../../charts/RealTimeNPKChart';

function NPKChart() {
  const data = [
    { n: 20, p: 15, k: 10 },
    { n: 21, p: 16, k: 11 },
    { n: 22, p: 17, k: 12 },
    { n: 23, p: 18, k: 13 },
    { n: 24, p: 19, k: 14 },
    { n: 25, p: 20, k: 15 },
    { n: 26, p: 21, k: 16 },
    { n: 25, p: 20, k: 15 },
    { n: 24, p: 19, k: 14 },
    { n: 23, p: 18, k: 13 },
  ];

  const [counter, setCounter] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [range, setRange] = useState(6); // Hiển thị 6 mốc thời gian
  const [slicedData, setSlicedData] = useState(data.slice(0, range));

  const generateDates = () => {
    const now = new Date();
    const dates = [];
    for (let i = 0; i < data.length; i++) {
      dates.push(new Date(now - i * 5000)); // Mỗi mốc cách nhau 5 giây
    }
    return dates;
  };

  const [slicedLabels, setSlicedLabels] = useState(generateDates().slice(0, range).reverse());

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 5000); // Cập nhật mỗi 5 giây
    return () => clearInterval(interval);
  }, [counter]);

  useEffect(() => {
    setIncrement(increment + 1);
    if (increment + range < data.length) {
      setSlicedData(([_, ...slicedData]) => [...slicedData, data[increment + range]]);
    } else {
      setIncrement(0);
      setRange(6); // Reset lại range
    }

    setSlicedLabels(([_, ...slicedLabels]) => [...slicedLabels, new Date()]);
    return () => setIncrement(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  const chartData = {
    labels: slicedLabels,
    datasets: [
      {
        label: 'Nitrogen (N)',
        data: slicedData.map((d) => d.n),
        fill: false,
        borderColor: tailwindConfig().theme.colors.green[500],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2,
      },
      {
        label: 'Phosphorus (P)',
        data: slicedData.map((d) => d.p),
        fill: false,
        borderColor: tailwindConfig().theme.colors.yellow[500],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2,
      },
      {
        label: 'Potassium (K)',
        data: slicedData.map((d) => d.k),
        fill: false,
        borderColor: tailwindConfig().theme.colors.red[500],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Cảm biến NPK</h2>
        <Tooltip className="ml-2">
          <div className="text-xs text-center whitespace-nowrap">
            Built with{' '}
            <a className="underline" href="https://www.chartjs.org/" target="_blank" rel="noreferrer">
              Chart.js
            </a>
          </div>
        </Tooltip>
      </header>
      <RealTimeNPKChart data={chartData} width={595} height={248} />
    </div>
  );
}

export default NPKChart;
