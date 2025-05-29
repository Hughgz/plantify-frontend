import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSensorReadings } from "../store/sensorReadingSlice";
import { variables } from "../utils/variables";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import LineChart01 from "../charts/LineChart01";
import { 
  FaChartLine, FaChartBar, FaChartPie, FaChartArea, 
  FaThermometerHalf, FaTint, FaFlask, FaLeaf, FaSun, 
  FaSync, FaCalendarAlt, FaFilter, FaDownload, FaTable,
  FaVial, FaAtom, FaBolt, FaWater, FaPrescriptionBottle
} from "react-icons/fa";

function Analysis() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('temperature');
  const [dateRange, setDateRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const { readings, loading: readingsLoading } = useSelector((state) => state.sensorReading);

  // Tabs cho các loại phân tích
  const analysisTabs = [
    { id: 'temperature', label: 'Nhiệt độ', icon: <FaThermometerHalf className="text-red-500" /> },
    { id: 'humidity', label: 'Độ ẩm', icon: <FaTint className="text-blue-500" /> },
    { id: 'soil', label: 'Chất lượng đất', icon: <FaFlask className="text-brown-500" /> },
    { id: 'light', label: 'Ánh sáng', icon: <FaSun className="text-yellow-500" /> },
    { id: 'phosphorus', label: 'Phosphorus', icon: <FaVial className="text-purple-500" /> },
    { id: 'potassium', label: 'Potassium', icon: <FaAtom className="text-orange-500" /> },
    { id: 'soilConductivity', label: 'Độ dẫn đất', icon: <FaBolt className="text-yellow-600" /> },
    { id: 'soilHumidity', label: 'Độ ẩm đất', icon: <FaWater className="text-blue-600" /> },
    { id: 'soilPH', label: 'pH đất', icon: <FaPrescriptionBottle className="text-green-600" /> },
  ];

  // Các khoảng thời gian phân tích
  const timeRanges = [
    { id: 'day', label: 'Ngày' },
    { id: 'week', label: 'Tuần' },
    { id: 'month', label: 'Tháng' },
    { id: 'year', label: 'Năm' }
  ];

  useEffect(() => {
    // Lấy dữ liệu cảm biến mới nhất
    dispatch(fetchSensorReadings());
    
    // Lấy dữ liệu lịch sử (giả lập)
    fetchHistoricalData();
  }, [dispatch]);

  // Hàm giả lập lấy dữ liệu lịch sử
  const fetchHistoricalData = async () => {
    setRefreshing(true);
    setLoading(true);
    
    try {
      // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu lịch sử
      // Ở đây chúng ta tạo dữ liệu giả lập
      
      // Tạo mốc thời gian cho biểu đồ
      const now = new Date();
      const timestamps = [];
      const temperatureData = [];
      const humidityData = [];
      const soilMoistureData = [];
      const lightData = [];
      const phosphorusData = [];
      const potassiumData = [];
      const soilConductivityData = [];
      const soilHumidityData = [];
      const soilPHData = [];
      
      // Tạo dữ liệu giả lập cho 7 ngày
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        timestamps.push(date.toLocaleDateString('vi-VN'));
        
        // Tạo dữ liệu ngẫu nhiên nhưng có xu hướng
        const baseTemp = 25 + Math.sin(i / 2) * 5;
        const baseHumidity = 60 + Math.cos(i / 2) * 15;
        const baseSoil = 40 + Math.sin(i / 3) * 10;
        const baseLight = 5000 + Math.cos(i / 2) * 3000;
        const basePhosphorus = 15 + Math.sin(i / 2) * 5;
        const basePotassium = 20 + Math.cos(i / 3) * 7;
        const baseSoilConductivity = 1.2 + Math.sin(i / 2) * 0.4;
        const baseSoilHumidity = 35 + Math.cos(i / 2) * 10;
        const baseSoilPH = 6.5 + Math.sin(i / 3) * 0.5;
        
        temperatureData.push(+(baseTemp + Math.random() * 2).toFixed(1));
        humidityData.push(+(baseHumidity + Math.random() * 5).toFixed(1));
        soilMoistureData.push(+(baseSoil + Math.random() * 5).toFixed(1));
        lightData.push(Math.round(baseLight + Math.random() * 1000));
        phosphorusData.push(+(basePhosphorus + Math.random() * 2).toFixed(1));
        potassiumData.push(+(basePotassium + Math.random() * 3).toFixed(1));
        soilConductivityData.push(+(baseSoilConductivity + Math.random() * 0.2).toFixed(2));
        soilHumidityData.push(+(baseSoilHumidity + Math.random() * 5).toFixed(1));
        soilPHData.push(+(baseSoilPH + Math.random() * 0.3).toFixed(1));
      }
      
      // Thêm dữ liệu thống kê
      const stats = {
        temperature: {
          current: temperatureData[temperatureData.length - 1],
          avg: +(temperatureData.reduce((a, b) => a + b, 0) / temperatureData.length).toFixed(1),
          min: +Math.min(...temperatureData).toFixed(1),
          max: +Math.max(...temperatureData).toFixed(1),
          unit: '°C',
          trend: temperatureData[temperatureData.length - 1] > temperatureData[0] ? 'up' : 'down'
        },
        humidity: {
          current: humidityData[humidityData.length - 1],
          avg: +(humidityData.reduce((a, b) => a + b, 0) / humidityData.length).toFixed(1),
          min: +Math.min(...humidityData).toFixed(1),
          max: +Math.max(...humidityData).toFixed(1),
          unit: '%',
          trend: humidityData[humidityData.length - 1] > humidityData[0] ? 'up' : 'down'
        },
        soil: {
          current: soilMoistureData[soilMoistureData.length - 1],
          avg: +(soilMoistureData.reduce((a, b) => a + b, 0) / soilMoistureData.length).toFixed(1),
          min: +Math.min(...soilMoistureData).toFixed(1),
          max: +Math.max(...soilMoistureData).toFixed(1),
          unit: '%',
          trend: soilMoistureData[soilMoistureData.length - 1] > soilMoistureData[0] ? 'up' : 'down'
        },
        light: {
          current: lightData[lightData.length - 1],
          avg: Math.round(lightData.reduce((a, b) => a + b, 0) / lightData.length),
          min: Math.min(...lightData),
          max: Math.max(...lightData),
          unit: 'lux',
          trend: lightData[lightData.length - 1] > lightData[0] ? 'up' : 'down'
        },
        phosphorus: {
          current: phosphorusData[phosphorusData.length - 1],
          avg: +(phosphorusData.reduce((a, b) => a + b, 0) / phosphorusData.length).toFixed(1),
          min: +Math.min(...phosphorusData).toFixed(1),
          max: +Math.max(...phosphorusData).toFixed(1),
          unit: 'mg/kg',
          trend: phosphorusData[phosphorusData.length - 1] > phosphorusData[0] ? 'up' : 'down'
        },
        potassium: {
          current: potassiumData[potassiumData.length - 1],
          avg: +(potassiumData.reduce((a, b) => a + b, 0) / potassiumData.length).toFixed(1),
          min: +Math.min(...potassiumData).toFixed(1),
          max: +Math.max(...potassiumData).toFixed(1),
          unit: 'mg/kg',
          trend: potassiumData[potassiumData.length - 1] > potassiumData[0] ? 'up' : 'down'
        },
        soilConductivity: {
          current: soilConductivityData[soilConductivityData.length - 1],
          avg: +(soilConductivityData.reduce((a, b) => a + b, 0) / soilConductivityData.length).toFixed(2),
          min: +Math.min(...soilConductivityData).toFixed(2),
          max: +Math.max(...soilConductivityData).toFixed(2),
          unit: 'mS/cm',
          trend: soilConductivityData[soilConductivityData.length - 1] > soilConductivityData[0] ? 'up' : 'down'
        },
        soilHumidity: {
          current: soilHumidityData[soilHumidityData.length - 1],
          avg: +(soilHumidityData.reduce((a, b) => a + b, 0) / soilHumidityData.length).toFixed(1),
          min: +Math.min(...soilHumidityData).toFixed(1),
          max: +Math.max(...soilHumidityData).toFixed(1),
          unit: '%',
          trend: soilHumidityData[soilHumidityData.length - 1] > soilHumidityData[0] ? 'up' : 'down'
        },
        soilPH: {
          current: soilPHData[soilPHData.length - 1],
          avg: +(soilPHData.reduce((a, b) => a + b, 0) / soilPHData.length).toFixed(1),
          min: +Math.min(...soilPHData).toFixed(1),
          max: +Math.max(...soilPHData).toFixed(1),
          unit: 'pH',
          trend: soilPHData[soilPHData.length - 1] > soilPHData[0] ? 'up' : 'down'
        }
      };
      
      setHistoricalData({
        timestamps,
        temperature: temperatureData,
        humidity: humidityData,
        soil: soilMoistureData,
        light: lightData,
        phosphorus: phosphorusData,
        potassium: potassiumData,
        soilConductivity: soilConductivityData,
        soilHumidity: soilHumidityData,
        soilPH: soilPHData,
        stats
      });
      
      setError(null);
    } catch (err) {
      console.error("Error fetching historical data:", err);
      setError("Không thể lấy dữ liệu lịch sử. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchSensorReadings());
    fetchHistoricalData();
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu theo khoảng thời gian mới
    fetchHistoricalData();
  };

  // Hàm render biểu đồ dựa trên tab đang active
  const renderChart = () => {
    if (!historicalData) return null;
    
    const { timestamps } = historicalData;
    let data, label, color, unit, backgroundColor;
    
    switch (activeTab) {
      case 'temperature':
        data = historicalData.temperature;
        label = 'Nhiệt độ';
        color = 'rgb(239, 68, 68)'; // red-500
        backgroundColor = 'rgba(239, 68, 68, 0.15)';
        unit = '°C';
        break;
      case 'humidity':
        data = historicalData.humidity;
        label = 'Độ ẩm';
        color = 'rgb(59, 130, 246)'; // blue-500
        backgroundColor = 'rgba(59, 130, 246, 0.15)';
        unit = '%';
        break;
      case 'soil':
        data = historicalData.soil;
        label = 'Chất lượng đất';
        color = 'rgb(180, 83, 9)'; // amber-700
        backgroundColor = 'rgba(180, 83, 9, 0.15)';
        unit = '%';
        break;
      case 'light':
        data = historicalData.light;
        label = 'Ánh sáng';
        color = 'rgb(234, 179, 8)'; // yellow-500
        backgroundColor = 'rgba(234, 179, 8, 0.15)';
        unit = 'lux';
        break;
      case 'phosphorus':
        data = historicalData.phosphorus;
        label = 'Phosphorus';
        color = 'rgb(139, 92, 246)'; // purple-500
        backgroundColor = 'rgba(139, 92, 246, 0.15)';
        unit = 'mg/kg';
        break;
      case 'potassium':
        data = historicalData.potassium;
        label = 'Potassium';
        color = 'rgb(249, 115, 22)'; // orange-500
        backgroundColor = 'rgba(249, 115, 22, 0.15)';
        unit = 'mg/kg';
        break;
      case 'soilConductivity':
        data = historicalData.soilConductivity;
        label = 'Độ dẫn đất';
        color = 'rgb(202, 138, 4)'; // yellow-600
        backgroundColor = 'rgba(202, 138, 4, 0.15)';
        unit = 'mS/cm';
        break;
      case 'soilHumidity':
        data = historicalData.soilHumidity;
        label = 'Độ ẩm đất';
        color = 'rgb(37, 99, 235)'; // blue-600
        backgroundColor = 'rgba(37, 99, 235, 0.15)';
        unit = '%';
        break;
      case 'soilPH':
        data = historicalData.soilPH;
        label = 'pH đất';
        color = 'rgb(22, 163, 74)'; // green-600
        backgroundColor = 'rgba(22, 163, 74, 0.15)';
        unit = 'pH';
        break;
      default:
        data = historicalData.temperature;
        label = 'Nhiệt độ';
        color = 'rgb(239, 68, 68)'; // red-500
        backgroundColor = 'rgba(239, 68, 68, 0.15)';
        unit = '°C';
    }
    
    // Tạo cấu trúc dữ liệu cho LineChart01
    const chartData = {
      labels: timestamps,
      datasets: [
        {
          label: label,
          data: data,
          fill: true,
          backgroundColor: backgroundColor,
          borderColor: color,
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: color,
          pointHoverRadius: 6,
        },
      ],
    };
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{label} theo thời gian</h3>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
              {dateRange === 'day' ? 'Theo giờ' : 
               dateRange === 'week' ? '7 ngày qua' : 
               dateRange === 'month' ? '30 ngày qua' : '12 tháng qua'}
            </span>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          </div>
        </div>
        <div className="h-72 bg-blue-50 dark:bg-blue-900/10 rounded-lg p-2">
          <LineChart01 data={chartData} width={100} height={100} unitLabel={unit} />
        </div>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Min: {historicalData.stats[activeTab].min}{unit}</span>
            <span>Avg: {historicalData.stats[activeTab].avg}{unit}</span>
            <span>Max: {historicalData.stats[activeTab].max}{unit}</span>
          </div>
        </div>
      </div>
    );
  };

  // Render bảng dữ liệu
  const renderDataTable = () => {
    if (!historicalData) return null;
    
    const { timestamps } = historicalData;
    let data, unit;
    
    switch (activeTab) {
      case 'temperature':
        data = historicalData.temperature;
        unit = '°C';
        break;
      case 'humidity':
        data = historicalData.humidity;
        unit = '%';
        break;
      case 'soil':
        data = historicalData.soil;
        unit = '%';
        break;
      case 'light':
        data = historicalData.light;
        unit = 'lux';
        break;
      case 'phosphorus':
        data = historicalData.phosphorus;
        unit = 'mg/kg';
        break;
      case 'potassium':
        data = historicalData.potassium;
        unit = 'mg/kg';
        break;
      case 'soilConductivity':
        data = historicalData.soilConductivity;
        unit = 'mS/cm';
        break;
      case 'soilHumidity':
        data = historicalData.soilHumidity;
        unit = '%';
        break;
      case 'soilPH':
        data = historicalData.soilPH;
        unit = 'pH';
        break;
      default:
        data = historicalData.temperature;
        unit = '°C';
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Dữ liệu chi tiết</h3>
          <button className="flex items-center text-blue-500 hover:text-blue-600">
            <FaDownload className="mr-1" /> Xuất CSV
          </button>
        </div>
        
        <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Giá trị</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">So với trung bình</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((value, index) => {
              const avg = historicalData.stats[activeTab].avg;
              const diff = value - avg;
              
              return (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/10">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{timestamps[index]}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{value} {unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`${diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(1)} {unit}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Render thẻ thống kê
  const renderStats = () => {
    if (!historicalData) return null;
    
    const stats = historicalData.stats[activeTab];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Hiện tại" 
          value={stats.current} 
          unit={stats.unit} 
          icon={<FaChartLine className="text-blue-500" />} 
        />
        <StatCard 
          title="Trung bình" 
          value={stats.avg} 
          unit={stats.unit} 
          icon={<FaChartBar className="text-green-500" />} 
        />
        <StatCard 
          title="Thấp nhất" 
          value={stats.min} 
          unit={stats.unit} 
          icon={<FaChartArea className="text-red-500" />} 
        />
        <StatCard 
          title="Cao nhất" 
          value={stats.max} 
          unit={stats.unit} 
          icon={<FaChartPie className="text-purple-500" />} 
        />
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow bg-gray-50 dark:bg-gray-900">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                  <FaChartLine className="mr-3 text-blue-500" />
                  Phân tích dữ liệu
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Theo dõi và phân tích dữ liệu cảm biến theo thời gian
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button 
                  onClick={handleRefresh} 
                  disabled={refreshing || loading}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all duration-200 flex items-center"
                >
                  <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Đang cập nhật...' : 'Cập nhật dữ liệu'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p className="font-medium">Lỗi: {error}</p>
              </div>
            )}

            {/* Bộ lọc và điều khiển */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                  <span className="text-gray-700 dark:text-gray-300 flex items-center">
                    <FaFilter className="mr-2" /> Phân tích:
                  </span>
                  {analysisTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`px-3 py-1 rounded-lg flex items-center ${
                        activeTab === tab.id 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tab.icon}
                      <span className="ml-2">{tab.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="text-gray-700 dark:text-gray-300 flex items-center">
                    <FaCalendarAlt className="mr-2" /> Thời gian:
                  </span>
                  {timeRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => handleDateRangeChange(range.id)}
                      className={`px-3 py-1 rounded-lg ${
                        dateRange === range.id 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex justify-center items-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">Đang tải dữ liệu phân tích...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Thẻ thống kê */}
                {renderStats()}
                
                {/* Biểu đồ */}
                <div className="mb-6">
                  {renderChart()}
                </div>
                
                {/* Bảng dữ liệu */}
                <div className="mb-6">
                  {renderDataTable()}
                </div>
                
                {/* Phân tích xu hướng */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Phân tích xu hướng</h3>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-700 dark:text-blue-300 mb-4">
                    <h4 className="font-semibold mb-2">Nhận xét</h4>
                    <p>
                      {activeTab === 'temperature' && 'Nhiệt độ có xu hướng tăng nhẹ trong tuần qua. Nhiệt độ trung bình là lý tưởng cho hầu hết các loại cây trồng.'}
                      {activeTab === 'humidity' && 'Độ ẩm không khí có xu hướng giảm nhẹ. Cần theo dõi nếu độ ẩm tiếp tục giảm trong những ngày tới.'}
                      {activeTab === 'soil' && 'Độ ẩm đất duy trì ở mức ổn định. Hệ thống tưới tự động đang hoạt động hiệu quả.'}
                      {activeTab === 'light' && 'Cường độ ánh sáng có sự biến động lớn, có thể do điều kiện thời tiết thay đổi trong tuần qua.'}
                      {activeTab === 'phosphorus' && 'Hàm lượng Phosphorus (P) đang ở mức trung bình, phù hợp cho sự phát triển của cây trồng và hình thành hoa, quả.'}
                      {activeTab === 'potassium' && 'Nồng độ Potassium (K) đang trong ngưỡng an toàn, giúp tăng cường khả năng chống chịu bệnh tật cho cây.'}
                      {activeTab === 'soilConductivity' && 'Độ dẫn điện của đất đang ở mức phù hợp, cho thấy hàm lượng muối và khoáng chất thích hợp.'}
                      {activeTab === 'soilHumidity' && 'Độ ẩm đất duy trì ở mức tốt cho sự phát triển của rễ cây, giúp hấp thu dưỡng chất hiệu quả.'}
                      {activeTab === 'soilPH' && 'Độ pH của đất đang ở mức trung tính đến hơi acid, phù hợp với nhiều loại cây trồng khác nhau.'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300">
                    <h4 className="font-semibold mb-2">Đề xuất</h4>
                    <p>
                      {activeTab === 'temperature' && 'Tiếp tục duy trì nhiệt độ hiện tại. Không cần điều chỉnh hệ thống điều hòa.'}
                      {activeTab === 'humidity' && 'Cân nhắc tăng cường phun sương nếu độ ẩm tiếp tục giảm trong 2-3 ngày tới.'}
                      {activeTab === 'soil' && 'Duy trì lịch tưới hiện tại. Theo dõi dự báo thời tiết để điều chỉnh nếu cần.'}
                      {activeTab === 'light' && 'Cân nhắc bổ sung đèn LED trong những ngày có cường độ ánh sáng thấp.'}
                      {activeTab === 'phosphorus' && 'Tiếp tục theo dõi, có thể bổ sung phân lân nếu chỉ số giảm xuống dưới 10 mg/kg trong thời gian tới.'}
                      {activeTab === 'potassium' && 'Duy trì chế độ bón phân hiện tại, không cần bổ sung thêm phân kali trong thời điểm này.'}
                      {activeTab === 'soilConductivity' && 'Kiểm soát lượng phân bón để duy trì độ dẫn điện ở mức hiện tại, tránh tích tụ muối quá mức.'}
                      {activeTab === 'soilHumidity' && 'Duy trì chế độ tưới hiện tại, đảm bảo độ ẩm đất ổn định giữa 30-40% để tối ưu cho cây trồng.'}
                      {activeTab === 'soilPH' && 'Không cần điều chỉnh độ pH đất, tiếp tục theo dõi để đảm bảo không có biến động lớn.'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Component thẻ thống kê
function StatCard({ title, value, unit, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-gray-500 dark:text-gray-400 font-medium">{title}</h4>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        {value} <span className="text-sm font-normal text-gray-500">{unit}</span>
      </div>
    </div>
  );
}

export default Analysis; 