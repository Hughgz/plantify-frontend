import React from 'react';
import { FaUser, FaUserCog, FaMapMarkerAlt } from 'react-icons/fa';

import Image01 from '../../images/Doflamingo.jpg';
import Image02 from '../../images/madara.jpg';
import Image03 from '../../images/1847967.png';
import Image04 from '../../images/6245477.jpg';

function Members() {

  const members = [
    {
      id: '0',
      image: Image01,
      name: 'Võ Minh Hiếu',
      email: 'minhhieu@gmail.com',
      role: 'Quản trị',
      location: 'VN',
      isOnline: true,
    },
    {
      id: '1',
      image: Image02,
      name: 'Nguyễn Thành Tài',
      email: 'thanhtai@gmail.com',
      role: 'Quản trị',
      location: 'VN',
      isOnline: true,
    },
    {
      id: '2',
      image: Image03,
      name: 'Mai Vân Phương Vũ',
      email: 'phuongvu@gmail.com',
      role: 'Chủ hộ 1',
      location: 'VN',
      isOnline: false,
    },
    {
      id: '3',
      image: Image04,
      name: 'Phan Anh Lộc',
      email: 'anhloc@gmail.com',
      role: 'Chủ hộ 2',
      location: 'VN',
      isOnline: true,
    },
  ];

  const getRoleBadgeColor = (role) => {
    if (role.includes('Quản trị')) return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
    if (role.includes('Chủ hộ')) return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  };

  const getRoleIcon = (role) => {
    if (role.includes('Quản trị')) return <FaUserCog className="mr-1" />;
    return <FaUser className="mr-1" />;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Thành viên</h2>
        <div className="flex items-center text-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          <span className="text-gray-500 dark:text-gray-400">{members.filter(m => m.isOnline).length} đang hoạt động</span>
        </div>
      </header>
      
      <div className="flex-grow overflow-auto">
        <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
          {members.map(member => (
            <div key={member.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150">
              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  <img
                    className="w-12 h-12 rounded-full object-cover"
                    src={member.image}
                    alt={member.name}
                  />
                  {member.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{member.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center ${getRoleBadgeColor(member.role)}`}>
                      {getRoleIcon(member.role)}
                      {member.role}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="truncate">{member.email}</span>
                  </div>
                  
                  <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>{member.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-700/20">
        <button className="text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400">
          Xem tất cả thành viên →
        </button>
      </div>
    </div>
  );
}

export default Members;
