import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";

function LeafMonitor() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [label, setLabel] = useState('');
    const [advice, setAdvice] = useState('');
    const [connectionError, setConnectionError] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [frameCount, setFrameCount] = useState(0);
    const [lastFrameTime, setLastFrameTime] = useState(null);
    const socketRef = useRef(null);
    const [testImage, setTestImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState('');

    useEffect(() => {
        console.log('Initializing WebSocket connection...');
        
        // Create socket connection
        const socket = io('http://127.0.0.1:5000', {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            path: '/socket.io',
            forceNew: true,
            timeout: 60000
        });
        
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to server with ID:', socket.id);
            setConnectionError(false);
            setIsConnected(true);
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setConnectionError(true);
            setIsConnected(false);
        });

        socket.on('server_status', (data) => {
            console.log('Server status:', data);
            // Nếu server thông báo camera đang bật, cập nhật trạng thái
            if (data && data.camera) {
                console.log('Camera is ON according to server');
            } else {
                console.log('Camera is OFF according to server');
            }
        });

        socket.on('image', (data) => {
            const now = new Date();
            setFrameCount(prev => prev + 1);
            setLastFrameTime(now);
            
            console.log(`Received frame #${frameCount + 1} at ${now.toLocaleTimeString()}`, 
                        data ? `Data size: ~${data.image ? Math.round(data.image.length / 1024) : 0}KB` : 'No data');
            
            if (data && data.image) {
                try {
                    setImageSrc(`data:image/jpeg;base64,${data.image}`);
                    if (data.label) setLabel(data.label);
                    if (data.advice) setAdvice(data.advice);
                } catch (error) {
                    console.error('Error processing image data:', error);
                }
            }
        });

        // Cleanup function
        return () => {
            console.log('Disconnecting WebSocket...');
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    // Tính toán fps dựa trên thời gian nhận frame cuối cùng
    const getTimeSinceLastFrame = () => {
        if (!lastFrameTime) return 'N/A';
        const now = new Date();
        const diffSeconds = Math.round((now - lastFrameTime) / 1000);
        return `${diffSeconds}s ago`;
    };

    // Kiểm tra kết nối trực tiếp với máy chủ
    const checkDirectConnection = async () => {
        setIsLoading(true);
        setActionMessage('Đang kiểm tra kết nối...');
        
        try {
            const response = await fetch('http://127.0.0.1:5000/check-connection');
            const data = await response.json();
            
            if (data.status === 'success') {
                setTestImage(`data:image/jpeg;base64,${data.test_image}`);
                setActionMessage(`Kết nối thành công! Camera: ${data.camera_status ? 'BẬT' : 'TẮT'}, Clients: ${data.clients}`);
            } else {
                setActionMessage(`Lỗi: ${data.message}`);
            }
        } catch (error) {
            console.error('Error checking connection:', error);
            setActionMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra xem server đã chạy chưa.');
        } finally {
            setIsLoading(false);
        }
    };

    // Khởi động lại camera
    const restartCamera = async () => {
        setIsLoading(true);
        setActionMessage('Đang khởi động lại camera...');
        
        try {
            const response = await fetch('http://127.0.0.1:5000/restart-camera', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setActionMessage('Đã khởi động lại camera thành công!');
                
                // Làm mới kết nối WebSocket
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current.connect();
                }
            } else {
                setActionMessage(`Lỗi: ${data.message}`);
            }
        } catch (error) {
            console.error('Error restarting camera:', error);
            setActionMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra xem server đã chạy chưa.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {/* Site header */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="flex h-screen overflow-hidden">
                    <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        <main className="grow">
                            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                                    Giám sát lá cây
                                </h1>
                                
                                {connectionError && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                        <p>Không thể kết nối đến máy chủ camera. Vui lòng kiểm tra xem máy chủ đã được khởi động chưa hoặc bật camera từ trang Điều khiển thiết bị.</p>
                                    </div>
                                )}
                                
                                {isConnected && !connectionError && (
                                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 flex justify-between">
                                        <p>Đã kết nối tới máy chủ camera.</p>
                                        <p>Frames: {frameCount} | Last frame: {getTimeSinceLastFrame()}</p>
                                    </div>
                                )}
                                
                                <div className="bg-gray-300 p-6 rounded-lg shadow-lg flex justify-center items-center" style={{ minHeight: "400px" }}>
                                    {imageSrc ? (
                                        <img 
                                            src={imageSrc} 
                                            alt="Leaf Detection" 
                                            className="rounded-lg shadow-lg max-w-full max-h-[600px]" 
                                            onError={(e) => {
                                                console.error('Error loading image');
                                                e.target.style.display = 'none';
                                                setTimeout(() => {
                                                    e.target.style.display = 'block';
                                                }, 1000);
                                            }}
                                        />
                                    ) : (
                                        <p className="text-gray-700">
                                            {isConnected ? 'Đang tải hình ảnh từ camera...' : 'Đang kết nối đến máy chủ camera...'}
                                        </p>
                                    )}
                                </div>
                                
                                {label && (
                                    <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
                                        <h2 className="text-xl font-bold">Trạng thái lá: {label}</h2>
                                        <p className="text-gray-700 mt-2">{advice}</p>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <div className="flex gap-2 flex-wrap">
                                        <button 
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                            onClick={() => {
                                                console.log('Refreshing connection...');
                                                if (socketRef.current) {
                                                    socketRef.current.disconnect();
                                                    socketRef.current.connect();
                                                }
                                            }}
                                            disabled={isLoading}
                                        >
                                            Làm mới kết nối
                                        </button>
                                        
                                        <button 
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                            onClick={checkDirectConnection}
                                            disabled={isLoading}
                                        >
                                            Kiểm tra kết nối
                                        </button>
                                        
                                        <button 
                                            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                            onClick={restartCamera}
                                            disabled={isLoading}
                                        >
                                            Khởi động lại camera
                                        </button>
                                    </div>
                                    
                                    {actionMessage && (
                                        <div className="mt-2 p-2 bg-gray-100 rounded">
                                            {actionMessage}
                                        </div>
                                    )}
                                    
                                    {testImage && (
                                        <div className="mt-2">
                                            <p className="mb-1">Ảnh kiểm tra kết nối:</p>
                                            <img 
                                                src={testImage} 
                                                alt="Test Connection" 
                                                className="border border-gray-300 rounded"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeafMonitor;
