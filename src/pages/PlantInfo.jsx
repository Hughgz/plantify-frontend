import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSensorReadings } from "../store/sensorReadingSlice";
import { fetchPlantInfo, setCurrentPlant } from "../store/plantSlice";
import { variables } from "../utils/variables";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import { 
  FaSun, FaTint, FaThermometerHalf, FaFlask, FaCloudSun, 
  FaCloudRain, FaWater, FaLightbulb, FaLeaf, FaSeedling, 
  FaChevronDown, FaInfoCircle, FaHistory, FaChartLine,
  FaSync
} from "react-icons/fa";
import PlantDetails from "./PlantDetails";

function PlantInfo() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'
  const [isPlantMenuOpen, setIsPlantMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const dispatch = useDispatch();
  const { readings, loading: readingsLoading, error: readingsError } = useSelector((state) => state.sensorReading);
  const { plants, currentPlant, loading: plantsLoading } = useSelector((state) => state.plants);

  useEffect(() => {
    fetchLatestData();
    dispatch(fetchPlantInfo());

    const interval = setInterval(() => {
      fetchLatestData();
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const fetchLatestData = () => {
    console.log("Fetching latest sensor data...");
    dispatch(fetchSensorReadings());
  };

  const handleRefreshData = () => {
    setRefreshing(true);
    dispatch(fetchSensorReadings())
      .then(() => {
        console.log("Manual refresh completed");
        setTimeout(() => setRefreshing(false), 1000);
      })
      .catch((err) => {
        console.error("Manual refresh error:", err);
        setRefreshing(false);
      });
  };

  const handlePlantChange = (plant) => {
    dispatch(setCurrentPlant(plant));
    setIsPlantMenuOpen(false);
  };

  useEffect(() => {
    if (readings && readings.length > 0) {
      console.log('Sensor data received in component:', readings);
    }
  }, [readings]);

  useEffect(() => {
    if (activeTab === 'current') {
      fetchLatestData();
    }
  }, [activeTab]);

  const groupParameters = (parameters) => {
    const groups = {
      soil: [],
      air: [],
      light: [],
      other: []
    };

    if (!parameters) return groups;

    const data = Array.isArray(parameters) ? parameters[0] : parameters;
    
    console.log("Grouping parameters from data:", data);

    Object.entries(data).forEach(([key, value]) => {
      if (key === "id" || key === "sensor_reading_id" || key === "created_at" || key === "updated_at") {
        return;
      }
      
      const numValue = parseFloat(value);
      if (isNaN(numValue) && typeof value !== 'boolean' && value !== 0 && value !== 1) {
        console.log(`Skipping invalid value for key ${key}:`, value);
        return;
      }

      if (key.startsWith('soil') || key === 'nitrogen' || key === 'phosphorus' || key === 'potassium') {
        groups.soil.push({ key, value });
      } else if (key === 'temperature' || key === 'humidity' || key === 'weather' || key === 'waterMeter') {
        groups.air.push({ key, value });
      } else if (key === 'lux' || key === 'led') {
        groups.light.push({ key, value });
      } else {
        groups.other.push({ key, value });
      }
    });

    console.log("Grouped parameters:", groups);
    return groups;
  };

  const parameterLabels = {
    lux: { label: "Ánh sáng", unit: "lux", icon: <FaSun className="text-yellow-500" />, color: "yellow" },
    nitrogen: { label: "Nitơ", unit: "mg/kg", icon: <FaFlask className="text-green-500" />, color: "green" },
    phosphorus: { label: "Phốt pho", unit: "mg/kg", icon: <FaFlask className="text-blue-500" />, color: "blue" },
    potassium: { label: "Kali", unit: "mg/kg", icon: <FaFlask className="text-red-500" />, color: "red" },
    soilConductivity: { label: "Độ dẫn điện của đất", unit: "µS/cm", icon: <FaFlask className="text-purple-500" />, color: "purple" },
    soilHumidity: { label: "Độ ẩm đất", unit: "%", icon: <FaTint className="text-blue-400" />, color: "blue" },
    soilPH: { label: "Độ pH đất", unit: "", icon: <FaFlask className="text-indigo-500" />, color: "indigo" },
    soilTemperature: { label: "Nhiệt độ đất", unit: "°C", icon: <FaThermometerHalf className="text-orange-500" />, color: "orange" },
    temperature: { label: "Nhiệt độ", unit: "°C", icon: <FaThermometerHalf className="text-red-400" />, color: "red" },
    humidity: { label: "Độ ẩm không khí", unit: "%", icon: <FaTint className="text-blue-300" />, color: "blue" },
    waterMeter: { label: "Lượng mưa", unit: "mm", icon: <FaWater className="text-blue-500" />, color: "blue" },
    led: { label: "Đèn", unit: "", icon: <FaLightbulb className="text-yellow-400" />, color: "yellow" },
    weather: { label: "Thời tiết", unit: "", icon: null, color: "blue" },
  };

  const formatParameterValue = (key, value) => {
    if (key === "weather") {
      return value === 1 ? (
        <>
          <FaCloudSun className="text-yellow-500 inline" /> Trời nắng
        </>
      ) : (
        <>
          <FaCloudRain className="text-blue-500 inline" /> Trời mưa
        </>
      );
    }
    if (key === "led") {
      return value === 1 ? "Đã bật" : "Đã tắt";
    }
    return `${value}${parameterLabels[key]?.unit ? ` ${parameterLabels[key].unit}` : ""}`;
  };

  const getProgressBarWidth = (key, value) => {
    const maxValues = {
      temperature: 50,
      humidity: 100,
      soilHumidity: 100,
      lux: 10000,
      soilPH: 14,
      nitrogen: 100,
      phosphorus: 100,
      potassium: 100,
      soilTemperature: 50,
      soilConductivity: 2000,
      waterMeter: 50,
    };

    if (key === "led" || key === "weather") {
      return value === 1 ? "100%" : "0%";
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return "0%";

    const max = maxValues[key] || 100;
    return `${Math.min(100, (numValue / max) * 100)}%`;
  };

  const getCardColorClass = (color) => {
    const colorMap = {
      'red': 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
      'blue': 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      'green': 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      'yellow': 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20',
      'purple': 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      'indigo': 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
      'orange': 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
    };
    
    return colorMap[color] || 'from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20';
  };

  const getProgressBarColorClass = (color) => {
    const colorMap = {
      'red': 'bg-red-500',
      'blue': 'bg-blue-500',
      'green': 'bg-green-500',
      'yellow': 'bg-yellow-500',
      'purple': 'bg-purple-500',
      'indigo': 'bg-indigo-500',
      'orange': 'bg-orange-500',
    };
    
    return colorMap[color] || 'bg-gray-500';
  };

  const getIconBgColorClass = (color) => {
    const colorMap = {
      'red': 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200',
      'blue': 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200',
      'green': 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200',
      'yellow': 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-200',
      'purple': 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-200',
      'indigo': 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-200',
      'orange': 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-200',
    };
    
    return colorMap[color] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200';
  };

  const parameterGroups = groupParameters(readings && readings.length > 0 ? readings[0] : null);

  const renderParameterCard = (param) => {
    const { key, value } = param;
    const label = parameterLabels[key]?.label || key;
    const icon = parameterLabels[key]?.icon;
    const color = parameterLabels[key]?.color || 'gray';
    
    let displayValue = value;
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
      displayValue = parseFloat(value);
    }
    
    return (
      <div key={key} className={`p-4 rounded-lg shadow-md bg-gradient-to-r ${getCardColorClass(color)}`}>
        <div className="flex items-center mb-2">
          <div className={`p-2 rounded-full mr-3 ${getIconBgColorClass(color)}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">{label}</h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatParameterValue(key, displayValue)}
            </p>
          </div>
        </div>
        
        {key !== 'weather' && (
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className={`${getProgressBarColorClass(color)} h-2 rounded-full`} 
              style={{ width: getProgressBarWidth(key, displayValue) }}
            ></div>
          </div>
        )}
      </div>
    );
  };

  const renderLoadingState = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Đang tải dữ liệu cảm biến...</p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex justify-center items-center">
      <div className="text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <p className="text-red-500 font-medium">Lỗi: {readingsError}</p>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Không thể tải dữ liệu cảm biến</p>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex justify-center items-center">
      <div className="text-center">
        <div className="text-gray-400 text-5xl mb-4">📊</div>
        <p className="text-gray-600 dark:text-gray-300">Không có dữ liệu cảm biến</p>
      </div>
    </div>
  );

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
                  <FaLeaf className="mr-3 text-green-500" />
                  Thông Tin Cây Trồng
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Theo dõi tình trạng và thông số cây trồng
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex items-center">
                <button 
                  onClick={handleRefreshData}
                  disabled={refreshing}
                  className="mr-4 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all duration-200 flex items-center"
                >
                  <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Đang cập nhật...' : 'Cập nhật dữ liệu'}
                </button>
                
                <div className="relative">
                  <div 
                    className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md cursor-pointer"
                    onClick={() => setIsPlantMenuOpen(!isPlantMenuOpen)}
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 mr-3">
                        <FaSeedling />
                      </div>
                      <span>{currentPlant?.name || "Chọn cây trồng"}</span>
                    </div>
                    <FaChevronDown className={`ml-3 transition-transform ${isPlantMenuOpen ? 'transform rotate-180' : ''}`} />
                  </div>

                  {isPlantMenuOpen && (
                    <div className="absolute right-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {plantsLoading ? (
                        <div className="p-3 text-center text-gray-500">Đang tải...</div>
                      ) : plants.length > 0 ? (
                        plants.map(plant => (
                          <div 
                            key={plant.id} 
                            className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center ${currentPlant?.id === plant.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                            onClick={() => handlePlantChange(plant)}
                          >
                            <FaSeedling className="mr-2 text-green-500" />
                            {plant.name}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">Không có cây trồng</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>    

            <div className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-md mb-6 flex">
              <button 
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === 'current' 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setActiveTab('current')}
              >
                <div className="flex items-center justify-center">
                  <FaInfoCircle className="mr-2" />
                  Dữ liệu hiện tại
                </div>
              </button>
              <button 
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === 'history' 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setActiveTab('history')}
              >
                <div className="flex items-center justify-center">
                  <FaHistory className="mr-2" />
                  Lịch sử dữ liệu
                </div>
              </button>
            </div>

            {activeTab === 'current' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <PlantDetails />
                </div>
                
                <div className="lg:col-span-2">
                  {readingsLoading ? (
                    renderLoadingState()
                  ) : readingsError ? (
                    renderErrorState()
                  ) : !readings || readings.length === 0 ? (
                    renderEmptyState()
                  ) : (
                    <div className="space-y-6">
                      {parameterGroups.soil.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                          <div className="p-4 bg-gradient-to-r from-brown-500 to-brown-600 text-white">
                            <h2 className="text-xl font-semibold flex items-center">
                              <FaFlask className="mr-2" /> Thông số đất
                            </h2>
                          </div>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {parameterGroups.soil.map(param => renderParameterCard(param))}
                          </div>
                        </div>
                      )}
                      
                      {parameterGroups.air.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                          <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                            <h2 className="text-xl font-semibold flex items-center">
                              <FaTint className="mr-2" /> Thông số không khí & môi trường
                            </h2>
                          </div>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {parameterGroups.air.map(param => renderParameterCard(param))}
                          </div>
                        </div>
                      )}
                      
                      {parameterGroups.light.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                          <div className="p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                            <h2 className="text-xl font-semibold flex items-center">
                              <FaSun className="mr-2" /> Thông số ánh sáng
                            </h2>
                          </div>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {parameterGroups.light.map(param => renderParameterCard(param))}
                          </div>
                        </div>
                      )}
                      
                      {parameterGroups.other.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                          <div className="p-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                            <h2 className="text-xl font-semibold">Thông số khác</h2>
                          </div>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {parameterGroups.other.map(param => renderParameterCard(param))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[300px]">
                <FaChartLine className="text-6xl text-blue-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Lịch sử dữ liệu cảm biến</h2>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                  Tính năng đang được phát triển. Bạn sẽ sớm có thể xem biểu đồ dữ liệu theo thời gian.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default PlantInfo;
