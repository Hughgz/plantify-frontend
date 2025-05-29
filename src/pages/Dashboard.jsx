import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSensorReadings } from '../store/sensorReadingSlice';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import FilterButton from '../components/DropdownFilter';
import Datepicker from '../components/Datepicker';
import SoilChart from '../partials/dashboard/SoilChart';
import TemperatureChart from '../partials/dashboard/TemperatureChart';
import PhChart from '../partials/dashboard/PhChart';
import NPKChart from '../partials/dashboard/NPKChart';
import ActivityRecent from '../partials/dashboard/ActivityRecent';
import Members from '../partials/dashboard/Members';
import TotalWatering from '../partials/dashboard/TotalWatering';
import WeatherChart from '../partials/dashboard/WeatherChar';
import { FaThermometerHalf, FaTint, FaFlask, FaLeaf } from 'react-icons/fa';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { readings, loading, error } = useSelector((state) => state.sensorReading);

  useEffect(() => {
    // Lấy dữ liệu cảm biến khi component được mount
    dispatch(fetchSensorReadings());

    // Cập nhật dữ liệu mỗi 30 giây
    const interval = setInterval(() => {
      dispatch(fetchSensorReadings());
    }, 30000);

    // Cleanup interval khi component unmount
    return () => clearInterval(interval);
  }, [dispatch]);

  // Lấy dữ liệu cảm biến mới nhất
  const latestData = readings && readings.length > 0 ? readings[0] : null;

  // Component hiển thị card chỉ số
  const StatCard = ({ icon, label, value, unit, bgColor }) => (
    <div className={`p-4 rounded-xl shadow-sm ${bgColor} transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-center">
        <div className="p-3 rounded-full mr-4 bg-white bg-opacity-30">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-white opacity-80">{label}</h3>
          <p className="text-2xl font-bold text-white">{value} {unit}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow bg-gray-50 dark:bg-gray-900">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            {/* Dashboard header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">

              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Bảng điều khiển</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Theo dõi và quản lý các thông số cây trồng theo thời gian thực
                </p>
              </div>

              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/* Filter button */}
                <FilterButton align="right" />
                {/* Datepicker built with flatpickr */}
                <Datepicker align="right" />
                {/* Refresh button */}
                <button 
                  className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
                  onClick={() => dispatch(fetchSensorReadings())}
                >
                  <svg className="w-4 h-4 fill-current opacity-50 shrink-0" viewBox="0 0 16 16">
                    <path d="M7 0H9V16H7V0Z" />
                    <path d="M0 7H16V9H0V7Z" />
                  </svg>
                  <span className="ml-2">Cập nhật</span>
                </button>                          
              </div>
            </div>
            
            {/* Thông số chính */}
            {latestData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  icon={<FaThermometerHalf className="h-6 w-6 text-white" />}
                  label="Nhiệt độ"
                  value={latestData.temperature !== undefined ? parseFloat(latestData.temperature).toFixed(1) : "N/A"}
                  unit="°C"
                  bgColor="bg-gradient-to-r from-red-500 to-red-400"
                />
                <StatCard
                  icon={<FaTint className="h-6 w-6 text-white" />}
                  label="Độ ẩm đất"
                  value={latestData.soilHumidity !== undefined ? parseFloat(latestData.soilHumidity).toFixed(1) : "N/A"}
                  unit="%"
                  bgColor="bg-gradient-to-r from-blue-500 to-blue-400"
                />
                <StatCard
                  icon={<FaFlask className="h-6 w-6 text-white" />}
                  label="Độ pH"
                  value={latestData.soilPH !== undefined ? parseFloat(latestData.soilPH).toFixed(1) : "N/A"}
                  unit=""
                  bgColor="bg-gradient-to-r from-indigo-500 to-indigo-400"
                />
                <StatCard
                  icon={<FaLeaf className="h-6 w-6 text-white" />}
                  label="Nitrogen (N)"
                  value={latestData.nitrogen !== undefined ? parseFloat(latestData.nitrogen).toFixed(1) : "N/A"}
                  unit="mg/kg"
                  bgColor="bg-gradient-to-r from-green-500 to-green-400"
                />
              </div>
            )}

            {/* Cards */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-full xl:col-span-8">
                <div className="flex flex-col bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                  <div className="px-5 py-4">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                      Thông số thời tiết
                    </h2>
                  </div>
                  <div className="flex-grow">
                    <WeatherChart />
                  </div>
                </div>
              </div>
              
              {/* Các thành viên */}
              <div className="col-span-full xl:col-span-4">
                <Members />
              </div>
              
              {/* Biểu đồ cảm biến */}
              <SoilChart sensorData={latestData} />
              <TemperatureChart sensorData={latestData} />
              <PhChart sensorData={latestData} />
              <NPKChart sensorData={latestData} />
              
              {/* Hoạt động gần đây */}
              <div className="col-span-full xl:col-span-8">
                <ActivityRecent />
              </div>
              
              {/* Thêm card hướng dẫn */}
              <div className="col-span-full xl:col-span-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg overflow-hidden">
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-2">Hướng dẫn sử dụng</h3>
                  <p className="text-white text-opacity-80 mb-4">
                    Theo dõi các thông số cây trồng theo thời gian thực và nhận thông báo khi có bất thường.
                  </p>
                  <ul className="space-y-2 text-white text-opacity-90">
                    <li className="flex items-center">
                      <span className="bg-white bg-opacity-20 rounded-full p-1 mr-2">✓</span>
                      Kiểm tra thông số nhiệt độ và độ ẩm
                    </li>
                    <li className="flex items-center">
                      <span className="bg-white bg-opacity-20 rounded-full p-1 mr-2">✓</span>
                      Theo dõi chỉ số NPK để điều chỉnh phân bón
                    </li>
                    <li className="flex items-center">
                      <span className="bg-white bg-opacity-20 rounded-full p-1 mr-2">✓</span>
                      Cài đặt thời gian tưới tự động
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}

export default Dashboard;