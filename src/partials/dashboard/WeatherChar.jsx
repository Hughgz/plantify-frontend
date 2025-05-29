import React, { useState, useEffect } from "react";
import axios from "axios";
import Tooltip from "../../components/Tooltip";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"; // Import OpenStreetMap
import "leaflet/dist/leaflet.css"; // CSS cho OpenStreetMap
import { tailwindConfig } from "../../utils/Utils";
import { variables } from '../../utils/variables';
import { FaMapMarkerAlt, FaTemperatureHigh, FaWater, FaCloud, FaWind, FaSun, FaCloudRain, FaSnowflake } from 'react-icons/fa';
import L from 'leaflet';

// Fix cho icon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function WeatherChart() {
    const API_URL = variables.WEATHER;
    const [location, setLocation] = useState({ lat: null, lon: null });
    const [weatherData, setWeatherData] = useState(null);
    const [address, setAddress] = useState("Đang lấy vị trí...");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Lấy vị trí của người dùng
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("Tọa độ người dùng:", position.coords.latitude, position.coords.longitude);
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Lỗi lấy vị trí:", error);
                    setError("Không thể lấy vị trí. Hãy bật GPS.");
                }
            );
        } else {
            setError("Trình duyệt không hỗ trợ Geolocation.");
        }
    }, []);

    // Gọi API khi lấy được vị trí
    useEffect(() => {
        if (location.lat && location.lon) {
            fetchWeatherData();
            fetchAddress();
        }
    }, [location]);

    // Gọi API backend để lấy dữ liệu thời tiết từ OpenWeather
    const fetchWeatherData = async () => {
        if (!location.lat || !location.lon) return;

        setLoading(true);
        try {
            const response = await axios.get(
                `${API_URL}/location?lat=${location.lat}&lon=${location.lon}`
            );

            console.log("Dữ liệu thời tiết nhận được:", response.data); // Log dữ liệu API
            setWeatherData(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu thời tiết:", error);
            setError("Không thể lấy dữ liệu thời tiết.");
        }
        setLoading(false);
    };


    // Gọi OpenStreetMap Nominatim API để lấy địa chỉ cụ thể
    const fetchAddress = async () => {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lon}&format=json`
            );

            if (response.data.display_name) {
                setAddress(response.data.display_name);
            } else {
                setAddress("Không xác định vị trí");
            }
        } catch (error) {
            console.error("Lỗi khi lấy địa chỉ:", error);
            setAddress("Không thể lấy địa chỉ");
        }
    };

    // Hiển thị biểu tượng thời tiết phù hợp
    const getWeatherIcon = (weatherCode) => {
        if (!weatherCode) return <FaCloud />;
        
        if (weatherCode.includes('clear')) return <FaSun className="text-yellow-400" />;
        if (weatherCode.includes('cloud')) return <FaCloud className="text-gray-400" />;
        if (weatherCode.includes('rain') || weatherCode.includes('drizzle')) return <FaCloudRain className="text-blue-400" />;
        if (weatherCode.includes('snow')) return <FaSnowflake className="text-blue-200" />;
        
        return <FaCloud className="text-gray-400" />;
    };

    return (
        <div className="flex flex-col h-full">
            {loading ? (
                <div className="flex items-center justify-center h-full p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                        <div className="text-red-500 text-4xl mb-4">⚠️</div>
                        <p className="text-red-500">{error}</p>
                    </div>
                </div>
            ) : weatherData ? (
                <>
                    <div className="p-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
                        <div className="md:w-1/2">
                            <div className="flex items-center mb-4">
                                <FaMapMarkerAlt className="text-red-500 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">{address}</h3>
                            </div>
                            
                            <div className="flex items-center mb-4">
                                <div className="text-5xl mr-4">
                                    {getWeatherIcon(weatherData.weather[0].description.toLowerCase())}
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{weatherData.main.temp}°C</p>
                                    <p className="text-gray-500 dark:text-gray-400 capitalize">{weatherData.weather[0].description}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 md:w-1/2">
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center">
                                <FaTemperatureHigh className="text-red-500 mr-3 text-xl" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Cảm giác như</p>
                                    <p className="text-gray-800 dark:text-gray-100 font-bold">{weatherData.main.feels_like}°C</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center">
                                <FaWater className="text-blue-500 mr-3 text-xl" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Độ ẩm</p>
                                    <p className="text-gray-800 dark:text-gray-100 font-bold">{weatherData.main.humidity}%</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center">
                                <FaWind className="text-teal-500 mr-3 text-xl" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Gió</p>
                                    <p className="text-gray-800 dark:text-gray-100 font-bold">{weatherData.wind.speed} m/s</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center">
                                <FaCloud className="text-gray-500 mr-3 text-xl" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Mây</p>
                                    <p className="text-gray-800 dark:text-gray-100 font-bold">{weatherData.clouds.all}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Hiển thị bản đồ từ OpenStreetMap */}
                    {location.lat && location.lon && (
                        <div className="flex-grow">
                            <MapContainer 
                                center={[location.lat, location.lon]} 
                                zoom={14} 
                                style={{ height: "100%", width: "100%", minHeight: "250px" }}
                                className="rounded-b-lg overflow-hidden z-0"
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                />
                                <Marker position={[location.lat, location.lon]}>
                                    <Popup>
                                        <div className="text-center">
                                            <p className="font-bold">Vị trí hiện tại</p>
                                            <p className="text-sm">{address}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex items-center justify-center h-full p-8">
                    <p className="text-gray-500 dark:text-gray-400">Đang tải dữ liệu thời tiết...</p>
                </div>
            )}
        </div>
    );
}

export default WeatherChart;
