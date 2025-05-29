import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import { variables } from '../utils/variables';

function Recomendation() {
  const API_URL = variables.SENSOR_READING;
  const PREDICT_API_URL = "http://127.0.0.1:5000/predict";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    Nitrogen: "",
    Phosphorus: "",
    Potassium: "",
    Temperature: "",
    Humidity: "",
    Ph: "",
    Rainfall: "",
  });
  const [result, setResult] = useState(null);
  
  // Dùng useRef để lưu thời gian gọi API gần nhất
  const lastPredictTimeRef = useRef(null);
  const cropDict = {
    1: "Cây lúa",
    2: "Cây ngô",
    3: "Cây đai",
    4: "Cây bông",
    5: "Cây dừa",
    6: "Đu đủ",
    7: "Cam",
    8: "Táo",
    9: "Dưa lưới",
    10: "Dưa hấu",
    11: "Cây nho",
    12: "Cây Xoài",
    13: "Chuối",
    14: "Lựu",
    15: "Đậu lăng",
    16: "Đậu đen",
    17: "Đậu xanh",
    18: "Đậu mèo",
    19: "Đậu tằm",
    20: "Đậu thận",
    21: "Đậu gà",
    22: "Cây cà phê"
  };
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Lỗi khi lấy dữ liệu cảm biến");
        }

        const sensorData = await response.json();
        if (sensorData.length > 0) {
          const latestData = sensorData[0];
          setFormData({
            Nitrogen: latestData.nitrogen || "",
            Phosphorus: latestData.phosphorus || "",
            Potassium: latestData.potassium || "",
            Temperature: latestData.temperature || "",
            Humidity: latestData.humidity || "",
            Ph: latestData.soilPH || "",
            Rainfall: latestData.waterMeter || "",
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const predictPlantRecommendation = async () => {
      try {
        const parsedData = {
          Nitrogen: parseFloat(formData.Nitrogen) || 0,
          Phosphorus: parseFloat(formData.Phosphorus) || 0,
          Potassium: parseFloat(formData.Potassium) || 0,
          Temperature: parseFloat(formData.Temperature) || 0,
          Humidity: parseFloat(formData.Humidity) || 0,
          Ph: parseFloat(formData.Ph) || 0,
          Rainfall: parseFloat(formData.Rainfall) || 0,
        };

        const response = await fetch(PREDICT_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsedData),
        });

        if (!response.ok) {
          throw new Error("Lỗi khi gọi API dự đoán");
        }

        const data = await response.json();
        setResult(data.result);
        lastPredictTimeRef.current = Date.now(); // Cập nhật thời gian gọi API
      } catch (error) {
        console.error("Error:", error);
      }
    };

    // Gọi predict ngay lần đầu tiên khi trang load
    predictPlantRecommendation();

    // Sau đó, tự động gọi predict mỗi 30 phút
    const predictInterval = setInterval(predictPlantRecommendation, 30 * 60 * 1000);

    return () => clearInterval(predictInterval);
  }, []); // useEffect chỉ chạy một lần khi component mount

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                Khuyến Nghị & Cảm Biến
              </h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                  🌱 Khuyến nghị cây trồng
                </h2>
                {result ? (
                  <div className="mt-6 bg-white text-gray-800 p-6 rounded-xl shadow-md border border-gray-200">
                    <h5 className="text-xl font-semibold mb-2">🌿 Cây trồng được đề xuất:</h5>
                    <p className="text-lg">{cropDict[result]}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Đang lấy dữ liệu...</p>
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                  📊 Thông tin cảm biến
                </h2>
                <div className="mt-4">
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex justify-between"><span>🌡 Nhiệt độ:</span><span>{formData.Temperature}°C</span></li>
                    <li className="flex justify-between"><span>💧 Độ ẩm:</span><span>{formData.Humidity}%</span></li>
                    <li className="flex justify-between"><span>🧪 Nitơ:</span><span>{formData.Nitrogen} mg/kg</span></li>
                    <li className="flex justify-between"><span>🧪 Phốt pho:</span><span>{formData.Phosphorus} mg/kg</span></li>
                    <li className="flex justify-between"><span>🧪 Kali:</span><span>{formData.Potassium} mg/kg</span></li>
                    <li className="flex justify-between"><span>🧪 pH đất:</span><span>{formData.Ph}</span></li>
                    <li className="flex justify-between"><span>🌧 Lượng nước tưới:</span><span>{formData.Rainfall} mm</span></li>
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

export default Recomendation;
