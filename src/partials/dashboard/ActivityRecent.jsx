import React from 'react';
import { FaLeaf, FaWater, FaCamera, FaBug, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

function ActivityRecent() {
  const activities = [
    {
      id: 1,
      type: 'watering',
      title: 'Hệ thống hoàn thành tưới',
      description: 'Đã tưới 250ml nước cho cây.',
      date: 'Hôm nay, 10:32',
      icon: <FaWater className="text-white" />,
      bgColor: 'bg-blue-500',
      status: 'success'
    },
    {
      id: 2,
      type: 'detection',
      title: 'Camera ghi nhận lá cây có dấu hiệu vàng lá',
      description: 'Có khả năng thiếu dinh dưỡng hoặc ánh sáng.',
      date: 'Hôm nay, 09:15',
      icon: <FaLeaf className="text-white" />,
      bgColor: 'bg-yellow-500',
      status: 'warning'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Cảm biến phát hiện độ ẩm quá thấp',
      description: 'Độ ẩm đất chỉ còn 15%, dưới ngưỡng an toàn.',
      date: 'Hôm qua, 17:45',
      icon: <FaExclamationTriangle className="text-white" />,
      bgColor: 'bg-red-500',
      status: 'danger'
    },
    {
      id: 4,
      type: 'detection',
      title: 'Camera ghi nhận có côn trùng lạ',
      description: 'Có thể là bọ trĩ hoặc rệp xanh trên lá.',
      date: 'Hôm qua, 14:22',
      icon: <FaBug className="text-white" />,
      bgColor: 'bg-orange-500',
      status: 'warning'
    },
    {
      id: 5,
      type: 'system',
      title: 'Hệ thống đã cập nhật cài đặt mới',
      description: 'Lịch tưới đã được thay đổi theo mùa.',
      date: 'Hôm qua, 10:00',
      icon: <FaCheckCircle className="text-white" />,
      bgColor: 'bg-green-500',
      status: 'success'
    },
  ];

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Hoạt động gần đây</h2>
          <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-700 dark:text-blue-100">
            {activities.length} mới
          </span>
        </div>
        <button className="text-sm font-medium text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
          Xem tất cả
        </button>
      </header>
      
      <div className="flex-grow overflow-auto">
        <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
          {activities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center`}>
                  {activity.icon}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{activity.date}</span>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{activity.description}</p>
                  
                  <div className="flex items-center mt-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusIndicator(activity.status)} mr-2`}></div>
                    <span className="text-xs font-medium">
                      {activity.status === 'success' && 'Thành công'}
                      {activity.status === 'warning' && 'Cảnh báo'}
                      {activity.status === 'danger' && 'Nguy hiểm'}
                    </span>
                    
                    <a 
                      href="#0" 
                      className="ml-auto text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center"
                    >
                      Xem chi tiết
                      <svg className="w-3 h-3 fill-current ml-1" viewBox="0 0 12 12">
                        <path d="M6.602 11l-.875-.864L9.33 6.534H0v-1.25h9.33L5.727 1.693l.875-.875 5.091 5.091z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-700/20">
        <button className="w-full py-2 px-3 text-xs font-medium text-center text-white bg-indigo-500 hover:bg-indigo-600 rounded-md transition-colors">
          Xem tất cả hoạt động
        </button>
      </div>
    </div>
  );
}

export default ActivityRecent;
