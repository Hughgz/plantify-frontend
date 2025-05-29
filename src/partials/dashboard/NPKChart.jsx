import React, { useState, useEffect } from 'react';
import Tooltip from '../../components/Tooltip';
import { chartAreaGradient } from '../../charts/ChartjsConfig';

// Import utilities
import { tailwindConfig, hexToRGB } from '../../utils/Utils';
import RealTimeNPKChart from '../../charts/RealTimeNPKChart';

function NPKChart({ sensorData }) {
  const [counter, setCounter] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [range, setRange] = useState(6); // Hiển thị 6 mốc thời gian
  const [slicedData, setSlicedData] = useState([]);
  const [slicedLabels, setSlicedLabels] = useState([]);
  const [currentValues, setCurrentValues] = useState({ n: 0, p: 0, k: 0 });

  // Cập nhật dữ liệu khi sensorData thay đổi
  useEffect(() => {
    if (sensorData) {
      // Lấy giá trị NPK từ dữ liệu cảm biến
      const nitrogen = sensorData.nitrogen !== undefined ? parseFloat(sensorData.nitrogen) : 0;
      const phosphorus = sensorData.phosphorus !== undefined ? parseFloat(sensorData.phosphorus) : 0;
      const potassium = sensorData.potassium !== undefined ? parseFloat(sensorData.potassium) : 0;
      
      setCurrentValues({ n: nitrogen, p: phosphorus, k: potassium });
      
      // Thêm giá trị mới vào dữ liệu hiện tại
      setSlicedData(prevData => {
        // Nếu chưa có dữ liệu, tạo mảng mới với giá trị hiện tại
        if (prevData.length === 0) {
          return Array(range).fill({ n: nitrogen, p: phosphorus, k: potassium });
        }
        
        // Nếu đã có dữ liệu, thêm giá trị mới vào cuối và loại bỏ giá trị đầu tiên
        const newData = [...prevData.slice(1), { n: nitrogen, p: phosphorus, k: potassium }];
        return newData;
      });
      
      // Cập nhật nhãn thời gian
      setSlicedLabels(prevLabels => {
        const now = new Date();
        
        // Nếu chưa có nhãn, tạo mảng mới với thời gian hiện tại
        if (prevLabels.length === 0) {
          const labels = [];
          for (let i = 0; i < range; i++) {
            labels.push(new Date(now - (range - i - 1) * 5000));
          }
          return labels;
        }
        
        // Nếu đã có nhãn, thêm thời gian mới vào cuối và loại bỏ nhãn đầu tiên
        return [...prevLabels.slice(1), now];
      });
    }
  }, [sensorData, range]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 5000); // Cập nhật mỗi 5 giây
    return () => clearInterval(interval);
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
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Cảm biến NPK</h2>
          <Tooltip className="ml-2">
            <div className="text-xs text-center whitespace-nowrap">
              Built with{' '}
              <a className="underline" href="https://www.chartjs.org/" target="_blank" rel="noreferrer">
                Chart.js
              </a>
            </div>
          </Tooltip>
        </div>
        <div className="flex space-x-3">
          <div className="text-sm font-medium text-green-500">N: {currentValues.n} mg/kg</div>
          <div className="text-sm font-medium text-yellow-500">P: {currentValues.p} mg/kg</div>
          <div className="text-sm font-medium text-red-500">K: {currentValues.k} mg/kg</div>
        </div>
      </header>
      <RealTimeNPKChart data={chartData} width={595} height={248} />
    </div>
  );
}

export default NPKChart;
