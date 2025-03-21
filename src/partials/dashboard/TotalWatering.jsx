import React from 'react';
import BarChart from '../../charts/BarChart01';

// Import utilities
import { tailwindConfig } from '../../utils/Utils';

function TotalWatering() {

  const chartData = {
    labels: [
      '01-11-2023', '02-11-2023', '03-11-2023',
      '04-11-2023', '05-11-2023', '06-11-2023',
      '07-11-2023', '08-11-2023',
    ],
    datasets: [
      {
        label: 'Lượng nước tưới (liters)',
        data: [
          120, 150, 180, 100, 130, 160, 190, 170, // Lượng nước tưới trong tuần
        ],
        backgroundColor: tailwindConfig().theme.colors.sky[500],
        hoverBackgroundColor: tailwindConfig().theme.colors.sky[600],
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Lượng nước tưới trong tuần</h2>
      </header>
      <BarChart data={chartData} width={595} height={248} />
    </div>
  );
}

export default TotalWatering;
