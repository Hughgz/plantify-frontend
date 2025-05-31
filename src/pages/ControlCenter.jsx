import React, { useState, useEffect } from 'react';
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Notification, { notify } from '../components/Notification'
import { variables } from '../utils/variables';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSensorReadings } from '../store/sensorReadingSlice';
import { FaLightbulb, FaTint, FaThermometerHalf, FaVideo, FaCloudRain, FaRegClock, FaSlidersH, FaCheck } from 'react-icons/fa';

// CSS để đảm bảo input time hiển thị định dạng 24 giờ
const timeInputStyle = {
    WebkitAppearance: 'textfield',
    MozAppearance: 'textfield',
    appearance: 'textfield'
};

// Hàm chuyển đổi từ định dạng 12 giờ sang 24 giờ
const convertTo24Hour = (timeStr) => {
    if (!timeStr) return timeStr;
    
    // Kiểm tra nếu đã ở định dạng 24 giờ (không có AM/PM)
    if (!timeStr.toLowerCase().includes('am') && !timeStr.toLowerCase().includes('pm')) {
        return timeStr;
    }
    
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
        hours = modifier.toLowerCase() === 'am' ? '00' : '12';
    } else if (modifier.toLowerCase() === 'pm') {
        hours = String(parseInt(hours, 10) + 12);
    }
    
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

// Hàm chuyển đổi từ định dạng 24 giờ sang 12 giờ (thêm AM/PM)
const convertTo12Hour = (timeStr) => {
    if (!timeStr) return timeStr;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    let period = 'AM';
    let hour = hours;
    
    if (hours >= 12) {
        period = 'PM';
        hour = hours === 12 ? 12 : hours - 12;
    }
    
    if (hours === 0) {
        hour = 12;
    }
    
    return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

function ControlCenter() {
    const dispatch = useDispatch();
    const sensorReadings = useSelector(state => state.sensorReading.readings);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mode, setMode] = useState("manual");
    const [manualControls, setManualControls] = useState(() => {
        const savedState = localStorage.getItem("manualControls");
        return savedState ? JSON.parse(savedState) : {
            "Đèn sợi đốt": false,
            "Máy phun sương": false,
            "Máy bơm nước": false,
            "Camera": false,
        };
    });
    const [sensorData, setSensorData] = useState({
        temperature: 0,
        humidity: 0,
        soilMoisture: 0,
    });
    const [motorStatus, setMotorStatus] = useState({
        "Đèn sợi đốt": false,
        "Máy phun sương": false,
        "Máy bơm nước": false,
        "Camera": false,
    });
    const [schedule, setSchedule] = useState(() => {
        const savedSchedule = localStorage.getItem("schedule");
        return savedSchedule ? JSON.parse(savedSchedule) : {
            "Đèn sợi đốt": { on: "08:42", off: "23:46" },
            "Máy phun sương": { on: "16:31", off: "18:29" },
            "Máy bơm nước": { on: "04:00", off: "05:00" },
            "Camera": { on: "12:00", off: "23:59" },
        };
    });

    const deviceToLedMap = {
        "Đèn sợi đốt": "led1",
        "Máy phun sương": "led2",
        "Máy bơm nước": "led3",
        "Camera": "led4"
    };

    const ledToDeviceMap = {
        "led1": "Đèn sợi đốt",
        "led2": "Máy phun sương",
        "led3": "Máy bơm nước",
        "led4": "Camera"
    };

    const modeMap = {
        0: "manual",
        1: "schedule",
        2: "sensor"
    };

    // Lưu trạng thái trước đó để so sánh
    const [prevMotorStatus, setPrevMotorStatus] = useState(motorStatus);

    // Device icons mapping
    const deviceIcons = {
        "Đèn sợi đốt": <FaLightbulb className="text-yellow-500" />,
        "Máy phun sương": <FaCloudRain className="text-blue-400" />,
        "Máy bơm nước": <FaTint className="text-blue-600" />,
        "Camera": <FaVideo className="text-gray-600" />
    };

    useEffect(() => {
        fetchDeviceStatus();
        fetchModeSetting();
        fetchLedControlSchedule();
        if (mode === "sensor") {
            fetchSensorData();
        }

        const interval = setInterval(() => {
            fetchDeviceStatus();
            if (mode === "sensor") {
                fetchSensorData();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [mode]);

    useEffect(() => {
        Object.keys(motorStatus).forEach(device => {
            if (prevMotorStatus[device] !== motorStatus[device]) {
                const modeLabel = mode === 'schedule' ? 'Lịch trình' : mode === 'sensor' ? 'Cảm biến' : 'Thủ công';
                notify.info(`[${modeLabel}] Đã ${motorStatus[device] ? 'bật' : 'tắt'} ${device}!`);
            }
        });
        setPrevMotorStatus(motorStatus);
    }, [motorStatus, mode]);

    // Fetch sensor data using Redux
    const fetchSensorData = () => {
        dispatch(fetchSensorReadings());
    };

    // Update sensorData when readings change
    useEffect(() => {
        if (sensorReadings && sensorReadings.length > 0) {
            console.log('Latest sensor readings:', sensorReadings[sensorReadings.length - 1]);
            // Get the latest reading
            const latestReading = sensorReadings[0]; // The API returns an array with the latest reading first
            setSensorData({
                temperature: latestReading.temperature || 0,
                humidity: latestReading.humidity || 0,
                soilMoisture: latestReading.soilHumidity || 0 // Using soilHumidity as seen in PlantInfo.jsx
            });
        }
    }, [sensorReadings]);

    const fetchLedControlSchedule = async () => {
        try {
            const response = await fetch(variables.LED_CONTROL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            
            const newSchedule = {};
            data.forEach(item => {
                const deviceName = ledToDeviceMap[item.ledName];
                
                // Lấy ra giá trị thời gian từ server
                let onTime, offTime;
                
                // Kiểm tra định dạng thời gian từ server
                if (Array.isArray(item.turnOnTime)) {
                    // Nếu nhận được dạng mảng [giờ, phút] hoặc [giờ, phút, giây]
                    onTime = `${String(item.turnOnTime[0]).padStart(2, '0')}:${String(item.turnOnTime[1]).padStart(2, '0')}`;
                    offTime = `${String(item.turnOffTime[0]).padStart(2, '0')}:${String(item.turnOffTime[1]).padStart(2, '0')}`;
                } else if (typeof item.turnOnTime === 'string') {
                    // Nếu nhận được dạng chuỗi (có thể là "HH:MM:SS")
                    onTime = item.turnOnTime.split(':').slice(0, 2).join(':');
                    offTime = item.turnOffTime.split(':').slice(0, 2).join(':');
                } else {
                    // Xử lý trường hợp khác (có thể là đối tượng)
                    console.log("Unexpected time format:", item.turnOnTime);
                    onTime = "00:00";
                    offTime = "00:00";
                }
                
                // Xử lý đặc biệt cho 24:00
                if (onTime === "24:00") onTime = "23:59";
                if (offTime === "24:00") offTime = "23:59";

                newSchedule[deviceName] = { on: onTime, off: offTime };
            });
            
            setSchedule(newSchedule);
            localStorage.setItem("schedule", JSON.stringify(newSchedule));
        } catch (error) {
            console.error('Error fetching LED control schedule:', error);
            notify.error("Lỗi khi lấy lịch trình thiết bị!");
        }
    };

    const fetchDeviceStatus = async () => {
        try {
            const response = await fetch(variables.LED_STATUS, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            
            const newControls = {
                "Đèn sợi đốt": data.led1 === 1,
                "Máy phun sương": data.led2 === 1,
                "Máy bơm nước": data.led3 === 1,
                "Camera": data.led4 === 1,
            };
            
            setManualControls(newControls);
            setMotorStatus(newControls);
            localStorage.setItem("manualControls", JSON.stringify(newControls));
        } catch (error) {
            console.error('Error fetching device status:', error);
            notify.error("Lỗi khi lấy trạng thái thiết bị!");
        }
    };

    const fetchModeSetting = async () => {
        try {
            const response = await fetch(variables.MODE_SETTING, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            const currentMode = modeMap[data.mode] || "manual";
            setMode(currentMode);
        } catch (error) {
            console.error('Error fetching mode setting:', error);
            notify.error("Lỗi khi lấy chế độ hoạt động!");
        }
    };

    const updateModeSetting = async (newMode) => {
        const modeValue = Object.keys(modeMap).find(key => modeMap[key] === newMode);
        try {
            const response = await fetch(
                `${variables.MODE_SETTING_UPDATE}?mode=${modeValue}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                setMode(newMode);
                notify.success(`Đã chuyển sang chế độ: ${
                    newMode === 'manual' ? 'Thủ công' : 
                    newMode === 'sensor' ? 'Tự động (cảm biến)' : 
                    'Tự động (thời gian)'
                }`);
            } else {
                notify.error("Không thể cập nhật chế độ hoạt động!");
            }
        } catch (error) {
            console.error('Error updating mode setting:', error);
            notify.error("Lỗi khi cập nhật chế độ hoạt động!");
        }
    };

    const toggleManualControl = async (device) => {
        const newStatus = !manualControls[device];
        const ledName = deviceToLedMap[device];
        const statusValue = newStatus ? 1 : 0;

        try {
            const response = await fetch(
                `${variables.LED_STATUS_UPDATE}?led=${ledName}&status=${statusValue}`, 
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const newControls = {
                    ...manualControls,
                    [device]: newStatus
                };
                setManualControls(newControls);
                setMotorStatus(newControls);
                localStorage.setItem("manualControls", JSON.stringify(newControls));
                notify.success(`Đã ${newStatus ? 'bật' : 'tắt'} ${device}!`);
                
                // If the device is the Camera, also toggle the Python camera
                if (device === "Camera") {
                    try {
                        const pythonResponse = await fetch(variables.PYTHON_CAMERA_TOGGLE, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ status: newStatus }),
                        });
                        
                        if (pythonResponse.ok) {
                            const result = await pythonResponse.json();
                            console.log('Python camera toggle response:', result);
                        } else {
                            console.error('Failed to toggle Python camera:', await pythonResponse.text());
                        }
                    } catch (pythonError) {
                        console.error('Error connecting to Python server:', pythonError);
                        notify.warning('Kết nối tới máy chủ camera thất bại, nhưng trạng thái đã được cập nhật.');
                    }
                }
            } else {
                notify.error(`Không thể cập nhật trạng thái ${device}!`);
            }
        } catch (error) {
            console.error('Error updating device status:', error);
            notify.error(`Lỗi khi cập nhật trạng thái ${device}!`);
        }
    };

    const saveSchedule = async () => {
        try {
            // Xử lý từng thiết bị riêng biệt
            for (const device of Object.keys(schedule)) {
                const ledName = deviceToLedMap[device];
                
                // Ánh xạ tên LED sang ID cố định dựa trên dữ liệu từ hình
                let ledId;
                switch (ledName) {
                    case 'led1': ledId = 1; break;
                    case 'led2': ledId = 2; break;
                    case 'led3': ledId = 3; break;
                    case 'led4': ledId = 4; break;
                    default: ledId = null;
                }
                
                console.log(`Processing device: ${device}, ledName: ${ledName}, ledId: ${ledId}`);
                
                // Chuyển đổi thời gian từ định dạng 12 giờ sang 24 giờ
                const onTime = convertTo24Hour(schedule[device].on);
                const offTime = convertTo24Hour(schedule[device].off);
                
                console.log(`Original times - on: ${schedule[device].on}, off: ${schedule[device].off}`);
                console.log(`Converted times - on: ${onTime}, off: ${offTime}`);
                
                // Tách giờ và phút
                const [onHours, onMinutes] = onTime.split(':').map(Number);
                const [offHours, offMinutes] = offTime.split(':').map(Number);
                
                // Đảm bảo định dạng thời gian chỉ là HH:mm (không có giây)
                const formatTime = (timeStr) => {
                    if (!timeStr) return timeStr;
                    
                    // Nếu thời gian có chứa dấu hai chấm, lấy ra chỉ giờ và phút
                    if (timeStr.includes(':')) {
                        const parts = timeStr.split(':');
                        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
                    }
                    
                    return timeStr;
                };
                
                // Xử lý trường hợp 24:00, đổi thành 23:59
                const handleSpecialTime = (timeStr) => {
                    if (timeStr === "24:00") return "23:59";
                    return timeStr;
                };
                
                // Tạo đúng định dạng cho turnOnTime và turnOffTime theo yêu cầu của server
                const formattedOnTime = formatTime(onTime);
                const formattedOffTime = formatTime(offTime);
                
                const finalOnTime = handleSpecialTime(formattedOnTime);
                const finalOffTime = handleSpecialTime(formattedOffTime);
                
                // Tạo đúng định dạng cho turnOnTime và turnOffTime theo yêu cầu của server
                const ledControlDto = {
                    id: ledId, // Thêm ID cố định dựa trên LED
                    ledName,
                    turnOnTime: finalOnTime,
                    turnOffTime: finalOffTime
                };
                
                console.log('Sending data to server:', JSON.stringify(ledControlDto, null, 2));
                
                try {
                    // Gửi dữ liệu với JSON đã biết hoạt động
                    const response = await fetch(variables.LED_CONTROL_UPDATE, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(ledControlDto),
                    });
                    
                    // Xử lý phản hồi
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => response.text());
                        console.error(`Error response for ${device}:`, errorData);
                        notify.error(`Không thể cập nhật lịch trình cho ${device}!`);
                        return;
                    }
                } catch (fetchError) {
                    console.error(`Network error for ${device}:`, fetchError);
                    notify.error(`Lỗi kết nối khi cập nhật ${device}!`);
                    return;
                }
            }
            
            // Lưu lịch trình vào localStorage
            localStorage.setItem("schedule", JSON.stringify(schedule));
            notify.success("Đã lưu lịch trình thành công!");
            
            // Cập nhật lại lịch trình từ server
            await fetchLedControlSchedule();
        } catch (error) {
            console.error('Error saving schedule:', error);
            notify.error("Lỗi khi lưu lịch trình!");
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto bg-gray-50 dark:bg-gray-900">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                        <FaSlidersH className="mr-3 text-blue-500" />
                        Điều khiển thiết bị
                    </h1>

                    <div className="flex flex-wrap gap-4 mb-6 justify-center sm:justify-start">
                        {[
                            { id: 'manual', label: 'Thủ công', icon: <FaSlidersH /> },
                            { id: 'sensor', label: 'Tự động (cảm biến)', icon: <FaThermometerHalf /> },
                            { id: 'schedule', label: 'Tự động (thời gian)', icon: <FaRegClock /> }
                        ].map((type) => (
                            <button
                                key={type.id}
                                className={`flex items-center px-5 py-3 rounded-lg text-white transition-all duration-300 shadow ${
                                    mode === type.id 
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 scale-105 shadow-lg transform -translate-y-1' 
                                        : 'bg-gray-600 hover:bg-gray-700 hover:-translate-y-1'
                                }`}
                                onClick={() => updateModeSetting(type.id)}
                            >
                                <span className="mr-2">{type.icon}</span>
                                {type.label}
                                {mode === type.id && <FaCheck className="ml-2" />}
                            </button>
                        ))}
                    </div>

                    {mode === "manual" && (
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300">
                            <h2 className="text-xl font-bold mb-6 border-b pb-3 text-gray-800 dark:text-gray-100 flex items-center">
                                <FaSlidersH className="mr-2 text-blue-500" />
                                Điều khiển thủ công
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {Object.keys(manualControls).map((device, index) => (
                                    <div 
                                        key={index} 
                                        className={`p-5 rounded-lg shadow-md transition-all duration-300 cursor-pointer 
                                        ${manualControls[device] 
                                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-l-4 border-blue-500' 
                                            : 'bg-white dark:bg-gray-700 border-l-4 border-gray-300 dark:border-gray-600'}`}
                                        onClick={() => toggleManualControl(device)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className={`p-3 rounded-full mr-3 
                                                    ${manualControls[device] 
                                                        ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200' 
                                                        : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300'}`}>
                                                    {deviceIcons[device]}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-800 dark:text-gray-200">{device}</h3>
                                                    <p className={`text-sm ${manualControls[device] ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                        {manualControls[device] ? 'Đang hoạt động' : 'Đã tắt'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={manualControls[device]} 
                                                    onChange={() => {}} 
                                                />
                                                <div className={`w-14 h-7 rounded-full transition-colors ${manualControls[device] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                    <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 ${manualControls[device] ? 'transform translate-x-7' : ''}`}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {mode === "sensor" && (
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300">
                            <h2 className="text-xl font-bold mb-6 border-b pb-3 text-gray-800 dark:text-gray-100 flex items-center">
                                <FaThermometerHalf className="mr-2 text-red-500" />
                                Thông số cảm biến và trạng thái thiết bị
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 p-5 rounded-lg shadow-md">
                                    <div className="flex items-center mb-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full mr-3 text-blue-600 dark:text-blue-200">
                                            <FaThermometerHalf className="text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Nhiệt độ</h3>
                                            <div className="flex items-center">
                                                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{sensorData.temperature}</span>
                                                <span className="ml-1 text-gray-500 dark:text-gray-400">°C</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, sensorData.temperature * 2)}%` }}></div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700 p-5 rounded-lg shadow-md">
                                    <div className="flex items-center mb-4">
                                        <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full mr-3 text-green-600 dark:text-green-200">
                                            <FaTint className="text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Độ ẩm không khí</h3>
                                            <div className="flex items-center">
                                                <span className="text-3xl font-bold text-green-600 dark:text-green-400">{sensorData.humidity}</span>
                                                <span className="ml-1 text-gray-500 dark:text-gray-400">%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${sensorData.humidity}%` }}></div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-700 p-5 rounded-lg shadow-md">
                                    <div className="flex items-center mb-4">
                                        <div className="p-3 bg-amber-100 dark:bg-amber-800 rounded-full mr-3 text-amber-600 dark:text-amber-200">
                                            <FaTint className="text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Độ ẩm đất</h3>
                                            <div className="flex items-center">
                                                <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">{sensorData.soilMoisture}</span>
                                                <span className="ml-1 text-gray-500 dark:text-gray-400">%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                        <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: `${sensorData.soilMoisture}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 border-b pb-2">Trạng thái thiết bị</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.keys(motorStatus).map((device, index) => (
                                    <div key={index} className={`p-4 rounded-lg shadow-md 
                                        ${motorStatus[device] 
                                            ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-l-4 border-green-500' 
                                            : 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-l-4 border-red-500'}`}>
                                        <div className="flex items-center">
                                            <div className={`p-3 rounded-full mr-3 
                                                ${motorStatus[device] 
                                                    ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200' 
                                                    : 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200'}`}>
                                                {deviceIcons[device]}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-800 dark:text-gray-200">{device}</h4>
                                                <p className={`text-sm font-medium ${motorStatus[device] ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {motorStatus[device] ? 'Đang hoạt động' : 'Đã tắt'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {mode === "schedule" && (
                        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300">
                            <h2 className="text-xl font-bold mb-6 border-b pb-3 text-gray-800 dark:text-gray-100 flex items-center">
                                <FaRegClock className="mr-2 text-purple-500" />
                                Thiết lập lịch trình
                            </h2>
                            <div className="overflow-x-auto">
                                <div className="mb-4 flex justify-end">
                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-sm">
                                        <p className="text-blue-700 dark:text-blue-300 mb-1 font-medium">
                                            <FaRegClock className="inline mr-1" /> Thông tin về thời gian:
                                        </p>
                                        <ul className="list-disc pl-5 text-blue-600 dark:text-blue-400">
                                            <li>Chọn thời gian theo định dạng 12 giờ (AM/PM) sẽ tự động chuyển đổi sang 24 giờ khi lưu</li>
                                            <li>Giá trị hiển thị bên dưới mỗi ô nhập theo cả định dạng 24 giờ và 12 giờ (AM/PM)</li>
                                            <li>Hệ thống sẽ luôn lưu trữ ở định dạng 24 giờ: 11:00 PM = 23:00</li>
                                        </ul>
                                    </div>
                                </div>
                                <table className="w-full text-left rounded-lg overflow-hidden">
                                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200">
                                        <tr>
                                            <th className="p-3 border-b">Thiết bị</th>
                                            <th className="p-3 border-b">Giờ bật</th>
                                            <th className="p-3 border-b">Giờ tắt</th>
                                            <th className="p-3 border-b">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(schedule).map((device, index) => (
                                            <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="p-3 flex items-center">
                                                    <div className="p-2 mr-3 rounded-full bg-gray-100 dark:bg-gray-700">
                                                        {deviceIcons[device]}
                                                    </div>
                                                    <span>{device}</span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                        </span>
                                                        <input 
                                                            type="time" 
                                                            className="pl-8 p-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                                            value={schedule[device].on} 
                                                            onChange={(e) => {
                                                                // Đảm bảo chỉ lấy HH:mm
                                                                const newTime = e.target.value.split(':').slice(0, 2).join(':');
                                                                setSchedule(prev => ({ 
                                                                    ...prev, 
                                                                    [device]: { ...prev[device], on: newTime } 
                                                                }))
                                                            }}
                                                            step="60" // Chỉ cho phép chọn phút, không có giây
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                        </span>
                                                        <input 
                                                            type="time" 
                                                            className="pl-8 p-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                                            value={schedule[device].off} 
                                                            onChange={(e) => {
                                                                // Đảm bảo chỉ lấy HH:mm
                                                                const newTime = e.target.value.split(':').slice(0, 2).join(':');
                                                                setSchedule(prev => ({ 
                                                                    ...prev, 
                                                                    [device]: { ...prev[device], off: newTime } 
                                                                }))
                                                            }}
                                                            step="60" // Chỉ cho phép chọn phút, không có giây
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-3">    
                                                    <button 
                                                        onClick={saveSchedule} 
                                                        className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow hover:-translate-y-1"
                                                    >
                                                        <FaCheck className="mr-2" />
                                                        Thiết lập
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <Notification />
        </div>
    );
}

export default ControlCenter;