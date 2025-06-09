import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import { variables } from '../utils/variables';
import { FaLeaf, FaThermometerHalf, FaTint, FaFlask, FaVial, FaRainbow, FaSync, FaSeedling, FaSearch, FaBug } from 'react-icons/fa';

function Recomendation() {
  const API_URL = variables.SENSOR_READING_LATEST;
  const PREDICT_API_URL = variables.PREDICT_API_URL;
  const DIRECT_PREDICT_URL = "https://api.plantify.info.vn/predict";
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
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState(null);
  const [sensorTime, setSensorTime] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastPredictTime, setLastPredictTime] = useState(null);
  const [testApiResult, setTestApiResult] = useState(null);
  const [testingApi, setTestingApi] = useState(false);
  
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

  const cropImages = {
    1: "https://images.unsplash.com/photo-1568700942080-c70abf66c741",
    2: "https://images.unsplash.com/photo-1601593768799-76e5da5bbc3d",
    3: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2",
    4: "https://images.unsplash.com/photo-1534701005-9f20f9a2c1c3",
    5: "https://images.unsplash.com/photo-1553279768-865429fa0078",
    6: "https://images.unsplash.com/photo-1526318472351-c75fcf070305",
    7: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12",
    8: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a",
    9: "https://images.unsplash.com/photo-1571575173700-afb9492e6a50",
    10: "https://images.unsplash.com/photo-1595475207225-428b62bda831",
    11: "https://images.unsplash.com/photo-1596363505729-4190a9506133",
    12: "https://images.unsplash.com/photo-1553279768-7412ce2f62cc",
    13: "https://images.unsplash.com/photo-1603833665858-e61d17a86224",
    14: "https://images.unsplash.com/photo-1607170084038-6174352f3c8d",
    15: "https://images.unsplash.com/photo-1515543904379-3d757abe63ea",
    16: "https://images.unsplash.com/photo-1551659818-3e3a3f7a3154",
    17: "https://images.unsplash.com/photo-1563635707451-0a3e0a7a7e01",
    18: "https://images.unsplash.com/photo-1567374783966-0981f51ba4fa",
    19: "https://images.unsplash.com/photo-1576038761134-9e33b9ea7eef",
    20: "https://images.unsplash.com/photo-1563635707451-0a3e0a7a7e01",
    21: "https://images.unsplash.com/photo-1563635707451-0a3e0a7a7e01",
    22: "https://images.unsplash.com/photo-1559525839-b184a4d698c7"
  };

  const fetchSensorData = async () => {
    setRefreshing(true);
    try {
      console.log("Fetching sensor data from:", API_URL);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Lỗi khi lấy dữ liệu cảm biến");
      }

      const sensorData = await response.json();
      console.log("Sensor data received:", sensorData);
      
      // Xử lý dữ liệu - nếu là mảng lấy phần tử đầu tiên, nếu không thì sử dụng trực tiếp
      const latestData = Array.isArray(sensorData) ? sensorData[0] : sensorData;
      
      if (latestData) {
        setFormData({
          Nitrogen: latestData.nitrogen || "",
          Phosphorus: latestData.phosphorus || "",
          Potassium: latestData.potassium || "",
          Temperature: latestData.temperature || "",
          Humidity: latestData.humidity || "",
          Ph: latestData.soilPH || "",
          Rainfall: latestData.waterMeter || "",
        });
        
        // Lưu thời gian của bản ghi cảm biến nếu có
        if (latestData.created_at) {
          setSensorTime(new Date(latestData.created_at));
        }
        
        setError(null);
      } else {
        setError("Không có dữ liệu cảm biến");
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const fetchInterval = setInterval(fetchSensorData, 30000); // Cập nhật dữ liệu cảm biến mỗi 30 giây
    
    return () => {
      clearInterval(fetchInterval);
    };
  }, []);

  const predictPlantRecommendation = async () => {
    try {
      // Nếu đang dự đoán, bỏ qua
      if (predicting) {
        return;
      }
      
      setPredicting(true);
      setError(null);
      
      // Lấy dữ liệu từ form, đảm bảo tất cả các trường đều có giá trị mặc định là 0
      const parsedData = {
        Nitrogen: parseFloat(formData.Nitrogen) || 0,
        Phosphorus: parseFloat(formData.Phosphorus) || 0,
        Potassium: parseFloat(formData.Potassium) || 0,
        Temperature: parseFloat(formData.Temperature) || 0,
        Humidity: parseFloat(formData.Humidity) || 0,
        Ph: parseFloat(formData.Ph) || 0,
        Rainfall: parseFloat(formData.Rainfall) || 0,
      };

      // Kiểm tra xem có đủ dữ liệu quan trọng không
      const hasMinimumData = parsedData.Temperature > 0 || parsedData.Humidity > 0;
      
      if (!hasMinimumData) {
        setError("Cần ít nhất dữ liệu nhiệt độ hoặc độ ẩm để dự đoán.");
        setPredicting(false);
        return;
      }

      // Log chi tiết thông tin gửi đi
      console.log("=== DEBUG PREDICT API CALL ===");
      console.log("From variables.jsx PREDICT_API_URL:", PREDICT_API_URL);
      console.log("Direct URL:", DIRECT_PREDICT_URL);
      console.log("Using URL:", DIRECT_PREDICT_URL);
      console.log("Request data:", JSON.stringify(parsedData, null, 2));
      
      // Thử dùng URL cứng thay vì biến từ variables
      const response = await fetch(DIRECT_PREDICT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Thêm header để tránh vấn đề CORS
          "Accept": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      console.log("Response status:", response.status);
      console.log("Response OK:", response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`Lỗi khi gọi API dự đoán: ${response.status} ${errorText || response.statusText}`);
      }

      // Log response headers để debug
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("Response headers:", headers);

      // Thử đọc response text trước để debug
      const responseText = await response.text();
      console.log("Raw response text:", responseText);
      
      // Chuyển text thành JSON
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
        console.log("Parsed JSON data:", data);
      } catch (e) {
        console.error("Error parsing JSON:", e);
        throw new Error(`Không thể phân tích dữ liệu JSON: ${e.message}. Raw data: ${responseText}`);
      }
      
      if (data && data.result !== undefined) {
        console.log("Setting result:", data.result);
        
        // Lấy ID cây trồng từ kết quả
        const cropId = data.result;
        // Hiển thị tên cây trồng trong log
        const cropName = cropDict[cropId] || `Không xác định (ID: ${cropId})`;
        console.log(`Cây trồng được đề xuất: ${cropName}`);
        
        setResult(cropId);
        const now = Date.now();
        lastPredictTimeRef.current = now; // Cập nhật thời gian gọi API
        setLastPredictTime(now);
      } else {
        console.error("Invalid result format:", data);
        throw new Error("Kết quả dự đoán không hợp lệ hoặc không có trường 'result'");
      }
    } catch (error) {
      console.error("Error in prediction:", error);
      setError(`Không thể dự đoán cây trồng: ${error.message}`);
    } finally {
      setPredicting(false);
    }
  };

  const handleRefresh = () => {
    fetchSensorData();
  };

  const handlePredict = () => {
    predictPlantRecommendation();
  };

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Tính thời gian từ lần dự đoán cuối cùng
  const getTimeSinceLastPrediction = () => {
    if (!lastPredictTime) return null;
    const seconds = Math.floor((Date.now() - lastPredictTime) / 1000);
    return `${seconds} giây trước`;
  };

  // Hàm test API riêng biệt
  const testPredictApi = async () => {
    setTestingApi(true);
    setTestApiResult(null);
    
    try {
      // Lấy dữ liệu từ form (dữ liệu cảm biến mới nhất) thay vì dữ liệu mock
      const sensorData = {
        Nitrogen: parseFloat(formData.Nitrogen) || 0,
        Phosphorus: parseFloat(formData.Phosphorus) || 0,
        Potassium: parseFloat(formData.Potassium) || 0,
        Temperature: parseFloat(formData.Temperature) || 0,
        Humidity: parseFloat(formData.Humidity) || 0,
        Ph: parseFloat(formData.Ph) || 0,
        Rainfall: parseFloat(formData.Rainfall) || 0,
      };
      
      // Kiểm tra dữ liệu trước khi gửi
      console.log("=== PREDICT WITH REAL SENSOR DATA ===");
      console.log("API URL:", DIRECT_PREDICT_URL);
      console.log("Sensor data for prediction:", sensorData);
      
      // Sử dụng XMLHttpRequest để gọi API
      const xhr = new XMLHttpRequest();
      xhr.open("POST", DIRECT_PREDICT_URL, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Accept", "application/json");
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          console.log("XHR Status:", xhr.status);
          console.log("XHR Response Text:", xhr.responseText);
          
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log("XHR Parsed Response:", response);
              
              // Lấy tên cây trồng từ cropDict dựa vào kết quả
              const cropId = response.result;
              const cropName = cropDict[cropId] || `Không xác định`;
              
              // Cập nhật kết quả test và hiển thị tên cây
              setTestApiResult({
                success: true,
                message: `Dự đoán thành công: ${cropName}`,
                data: response
              });
              
              // Cập nhật luôn kết quả chính để hiển thị trên giao diện
              setResult(cropId);
              const now = Date.now();
              lastPredictTimeRef.current = now;
              setLastPredictTime(now);
            } catch (e) {
              console.error("XHR JSON Parse Error:", e);
              setTestApiResult({
                success: false,
                message: `Lỗi parse JSON: ${e.message}`,
                raw: xhr.responseText
              });
            }
          } else {
            setTestApiResult({
              success: false,
              message: `Lỗi API: ${xhr.status} ${xhr.statusText}`,
              raw: xhr.responseText
            });
          }
          setTestingApi(false);
        }
      };
      
      xhr.onerror = function(e) {
        console.error("XHR Error:", e);
        setTestApiResult({
          success: false,
          message: "Lỗi kết nối đến API. Kiểm tra console để biết thêm chi tiết.",
          error: e
        });
        setTestingApi(false);
      };
      
      xhr.send(JSON.stringify(sensorData));
      
    } catch (error) {
      console.error("Test API Error:", error);
      setTestApiResult({
        success: false,
        message: `Lỗi: ${error.message}`,
        error: error
      });
      setTestingApi(false);
    }
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
                  <FaLeaf className="mr-3 text-green-500" />
                  Khuyến Nghị Cây Trồng
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Dựa trên dữ liệu cảm biến thời gian thực
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
                
                {/* <button 
                  onClick={handlePredict} 
                  disabled={predicting || loading || Object.values(formData).some(val => val === "")}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-all duration-200 flex items-center"
                >
                  <FaSearch className={`mr-2 ${predicting ? 'animate-spin' : ''}`} />
                  {predicting ? 'Đang dự đoán...' : 'Dự đoán cây trồng'}
                </button> */}
                
                <button 
                  onClick={testPredictApi} 
                  disabled={testingApi}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-md transition-all duration-200 flex items-center"
                >
                  <FaBug className={`mr-2 ${testingApi ? 'animate-spin' : ''}`} />
                  {testingApi ? 'Đang dự đoán...' : 'Dự đoán cây trồng'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p className="font-medium">Lỗi: {error}</p>
              </div>
            )}
            
            {testApiResult && (
              <div className={`mb-6 p-4 border-l-4 ${testApiResult.success ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`}>
                <p className="font-medium">{testApiResult.message}</p>
                {testApiResult.raw && (
                  <div className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32">
                    <pre className="text-xs">{testApiResult.raw}</pre>
                  </div>
                )}
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {sensorTime && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <p className="text-gray-600 dark:text-gray-300 flex items-center">
                    <FaVial className="mr-2 text-blue-500" />
                    <span className="font-medium mr-2">Dữ liệu cảm biến cập nhật lúc:</span>
                    <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
                      {formatTime(sensorTime)}
                    </span>
                  </p>
                </div>
              )}
              
              {lastPredictTime && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <p className="text-gray-600 dark:text-gray-300 flex items-center">
                    <FaSeedling className="mr-2 text-green-500" />
                    <span className="font-medium mr-2">Dự đoán gần nhất:</span>
                    <span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">
                      {getTimeSinceLastPrediction()}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Thông tin cảm biến */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <h2 className="text-xl font-semibold flex items-center">
                      <FaFlask className="mr-2" /> Thông số cảm biến
                    </h2>
                  </div>
                  
                  <div className="p-5">
                    {loading ? (
                      <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <SensorItem 
                          icon={<FaThermometerHalf className="text-red-500" />} 
                          label="Nhiệt độ" 
                          value={formData.Temperature} 
                          unit="°C"
                          color="red" 
                        />
                        
                        <SensorItem 
                          icon={<FaTint className="text-blue-500" />} 
                          label="Độ ẩm" 
                          value={formData.Humidity} 
                          unit="%" 
                          color="blue"
                        />
                        
                        <SensorItem 
                          icon={<FaFlask className="text-green-500" />} 
                          label="Nitơ" 
                          value={formData.Nitrogen} 
                          unit="mg/kg" 
                          color="green"
                        />
                        
                        <SensorItem 
                          icon={<FaFlask className="text-yellow-500" />} 
                          label="Phốt pho" 
                          value={formData.Phosphorus} 
                          unit="mg/kg" 
                          color="yellow"
                        />
                        
                        <SensorItem 
                          icon={<FaFlask className="text-purple-500" />} 
                          label="Kali" 
                          value={formData.Potassium} 
                          unit="mg/kg" 
                          color="purple"
                        />
                        
                        <SensorItem 
                          icon={<FaVial className="text-indigo-500" />} 
                          label="pH đất" 
                          value={formData.Ph} 
                          unit="" 
                          color="indigo"
                        />
                        
                        <SensorItem 
                          icon={<FaRainbow className="text-blue-400" />} 
                          label="Lượng nước tưới" 
                          value={formData.Rainfall} 
                          unit="mm" 
                          color="blue"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Khuyến nghị cây trồng */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <h2 className="text-xl font-semibold flex items-center">
                      <FaSeedling className="mr-2" /> Khuyến nghị cây trồng phù hợp
                    </h2>
                  </div>
                  
                  <div className="p-5">
                    {predicting ? (
                      <div className="flex flex-col items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Đang phân tích dữ liệu...</p>
                      </div>
                    ) : result ? (
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-full md:w-1/3">
                          <div className="relative pb-[100%] rounded-lg overflow-hidden shadow-lg">
                            <img 
                              src={cropImages[result] || "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2"} 
                              alt={cropDict[result]}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        
                        <div className="w-full md:w-2/3">
                          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                            {cropDict[result]}
                          </h3>
                          
                          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-4">
                            <p className="text-green-700 dark:text-green-300">
                              Dựa trên các thông số đất và môi trường hiện tại, đây là loại cây trồng phù hợp nhất.
                            </p>
                          </div>
                          
                          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Điều kiện phù hợp:</h4>
                          <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                            <li className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span>Nhiệt độ: {formData.Temperature}°C</span>
                            </li>
                            <li className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span>Độ ẩm: {formData.Humidity}%</span>
                            </li>
                            <li className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span>pH đất: {formData.Ph}</span>
                            </li>
                          </ul>
                          
                          <button 
                            onClick={handlePredict}
                            disabled={predicting}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-all duration-200 flex items-center"
                          >
                            <FaSync className={`mr-2 ${predicting ? 'animate-spin' : ''}`} />
                            {predicting ? 'Đang phân tích...' : 'Phân tích lại'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64">
                        <FaSeedling className="text-gray-400 text-5xl mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Chưa có dữ liệu khuyến nghị</p>
                        {/* <button 
                          onClick={handlePredict}
                          disabled={predicting || loading || Object.values(formData).some(val => val === "")}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-all duration-200 flex items-center"
                        >
                          <FaSearch className="mr-2" />
                          Dự đoán cây trồng
                        </button> */}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Component hiển thị một thông số cảm biến
function SensorItem({ icon, label, value, unit, color }) {
  // Xác định màu sắc dựa trên tham số color
  const getBgColor = () => {
    const colorMap = {
      'red': 'bg-red-50 dark:bg-red-900/20',
      'blue': 'bg-blue-50 dark:bg-blue-900/20',
      'green': 'bg-green-50 dark:bg-green-900/20',
      'yellow': 'bg-yellow-50 dark:bg-yellow-900/20',
      'purple': 'bg-purple-50 dark:bg-purple-900/20',
      'indigo': 'bg-indigo-50 dark:bg-indigo-900/20',
    };
    return colorMap[color] || 'bg-gray-50 dark:bg-gray-900/20';
  };
  
  const getBorderColor = () => {
    const colorMap = {
      'red': 'border-red-200 dark:border-red-800',
      'blue': 'border-blue-200 dark:border-blue-800',
      'green': 'border-green-200 dark:border-green-800',
      'yellow': 'border-yellow-200 dark:border-yellow-800',
      'purple': 'border-purple-200 dark:border-purple-800',
      'indigo': 'border-indigo-200 dark:border-indigo-800',
    };
    return colorMap[color] || 'border-gray-200 dark:border-gray-700';
  };
  
  return (
    <div className={`p-3 rounded-lg border ${getBgColor()} ${getBorderColor()}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="mr-3">
            {icon}
          </div>
          <span className="font-medium text-gray-700 dark:text-gray-300">{label}:</span>
        </div>
        <span className="font-bold text-gray-800 dark:text-gray-100">
          {value !== "" ? value : "N/A"}{unit}
        </span>
      </div>
    </div>
  );
}

export default Recomendation;
