import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSensorReadings } from "../store/sensorReadingSlice";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import { FaSun, FaTint, FaThermometerHalf, FaFlask, FaCloudSun, FaCloudRain, FaWater, FaLightbulb } from "react-icons/fa";
import PlantDetails from "./PlantDetails";

function PlantInfo() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const dispatch = useDispatch();

  const { readings, loading, error } = useSelector((state) => state.sensorReading);

  useEffect(() => {
    dispatch(fetchSensorReadings());
  }, [dispatch]);

  const parameterLabels = {
    lux: { label: "Ánh sáng", unit: "lux", icon: <FaSun className="text-yellow-500" /> },
    nitrogen: { label: "Nitơ", unit: "mg/kg", icon: <FaFlask className="text-green-500" /> },
    phosphorus: { label: "Phốt pho", unit: "mg/kg", icon: <FaFlask className="text-blue-500" /> },
    potassium: { label: "Kali", unit: "mg/kg", icon: <FaFlask className="text-red-500" /> },
    soilConductivity: { label: "Độ dẫn điện của đất", unit: "µS/cm", icon: <FaFlask className="text-purple-500" /> },
    soilHumidity: { label: "Độ ẩm đất", unit: "%", icon: <FaTint className="text-blue-400" /> },
    soilPH: { label: "Độ pH đất", unit: "", icon: <FaFlask className="text-indigo-500" /> },
    soilTemperature: { label: "Nhiệt độ đất", unit: "°C", icon: <FaThermometerHalf className="text-orange-500" /> },
    temperature: { label: "Nhiệt độ", unit: "°C", icon: <FaThermometerHalf className="text-red-400" /> },
    humidity: { label: "Độ ẩm không khí", unit: "%", icon: <FaTint className="text-blue-300" /> },
    waterMeter: { label: "Lượng mưa", unit: "mm", icon: <FaWater className="text-blue-500" /> },
    led: { label: "Đèn", unit: "", icon: <FaLightbulb className="text-yellow-400" /> },
    weather: { label: "Thời tiết", unit: "", icon: null },
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

  if (loading) return <div className="text-center py-10 text-gray-600">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Lỗi: {error}</div>;
  if (!readings.length) return <div className="text-center py-10 text-gray-600">Không có dữ liệu cảm biến.</div>;

  const parameters = readings[0];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                Thông Tin Cây Trồng
              </h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PlantDetails />
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                  Thông số Kỹ Thuật
                </h2>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  {Object.entries(parameters).map(([key, value]) => (
                    <li key={key} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow">
                      <div className="flex items-center space-x-2">
                        {parameterLabels[key]?.icon}
                        <span className="font-semibold">{parameterLabels[key]?.label || key}:</span>
                      </div>
                      <span className="text-gray-800 dark:text-gray-100">{formatParameterValue(key, value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PlantInfo;
