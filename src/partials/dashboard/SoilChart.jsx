import React, { useState, useEffect } from 'react';
import Tooltip from '../../components/Tooltip';
import { chartAreaGradient } from '../../charts/ChartjsConfig';

// Import utilities
import { tailwindConfig, hexToRGB } from '../../utils/Utils';
import RealtimeSoilChart from '../../charts/RealtimeSoilChart';

function SoilChart({ sensorData }) {
  // State để theo dõi dữ liệu thời gian thực
  const [counter, setCounter] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [range, setRange] = useState(20);
  const [slicedData, setSlicedData] = useState([]);
  const [slicedLabels, setSlicedLabels] = useState([]);
  const [currentValue, setCurrentValue] = useState(0);

  // Cập nhật dữ liệu khi sensorData thay đổi
  useEffect(() => {
    if (sensorData) {
      // Lấy giá trị độ ẩm đất từ dữ liệu cảm biến
      const soilHumidity = sensorData.soilHumidity !== undefined ? 
        parseFloat(sensorData.soilHumidity) : 0;
      
      setCurrentValue(soilHumidity);
      
      // Thêm giá trị mới vào dữ liệu hiện tại
      setSlicedData(prevData => {
        // Nếu chưa có dữ liệu, tạo mảng mới với giá trị hiện tại
        if (prevData.length === 0) {
          return Array(range).fill(soilHumidity);
        }
        
        // Nếu đã có dữ liệu, thêm giá trị mới vào cuối và loại bỏ giá trị đầu tiên
        const newData = [...prevData.slice(1), soilHumidity];
        return newData;
      });
      
      // Cập nhật nhãn thời gian
      setSlicedLabels(prevLabels => {
        const now = new Date();
        
        // Nếu chưa có nhãn, tạo mảng mới với thời gian hiện tại
        if (prevLabels.length === 0) {
          const labels = [];
          for (let i = 0; i < range; i++) {
            labels.push(new Date(now - (range - i - 1) * 2000));
          }
          return labels;
        }
        
        // Nếu đã có nhãn, thêm thời gian mới vào cuối và loại bỏ nhãn đầu tiên
        return [...prevLabels.slice(1), now];
      });
    }
  }, [sensorData, range]);

  // Cập nhật dữ liệu mỗi 2 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [counter]);

  // Dữ liệu cho biểu đồ
  const chartData = {
    labels: slicedLabels,
    datasets: [
      {
        data: slicedData,
        fill: true,
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          return chartAreaGradient(ctx, chartArea, [
            { stop: 0, color: `rgba(${hexToRGB(tailwindConfig().theme.colors.violet[500])}, 0)` },
            { stop: 1, color: `rgba(${hexToRGB(tailwindConfig().theme.colors.violet[500])}, 0.2)` },
          ]);
        },
        borderColor: tailwindConfig().theme.colors.violet[500],
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: tailwindConfig().theme.colors.violet[500],
        pointHoverBackgroundColor: tailwindConfig().theme.colors.violet[500],
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl mt-10">
      {/* Header */}
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Cảm biến độ ẩm đất</h2>
          <Tooltip className="ml-2">
            <div className="text-xs text-center whitespace-nowrap">
              Built with{' '}
              <a className="underline" href="https://www.chartjs.org/" target="_blank" rel="noreferrer">
                Chart.js
              </a>
            </div>
          </Tooltip>
        </div>
        <div className="text-xl font-bold text-violet-500">
          {currentValue}%
        </div>
      </header>

      {/* Biểu đồ thời gian thực */}
      <RealtimeSoilChart data={chartData} width={595} height={248} />
    </div>
  );
}

export default SoilChart;
