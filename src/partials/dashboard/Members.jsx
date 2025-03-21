import React from 'react';

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
    },
    {
      id: '1',
      image: Image02,
      name: 'Nguyễn Thành Tài',
      email: 'thanhtai@gmail.com',
      role: 'Quản trị',
      location: 'VN',
    },
    {
      id: '2',
      image: Image03,
      name: 'Mai Vân Phương Vũ',
      email: 'phuongvu@gmail.com',
      role: 'Chủ hộ 1',
      location: 'VN',
    },
    {
      id: '3',
      image: Image04,
      name: 'Phan Anh Lộc',
      email: 'anhloc@gmail.com',
      role: 'Chủ hộ 2',
      location: 'VN',
    },
  ];

  return (
    <div className="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Thành Viên</h2>
      </header>
      <div className="p-3">

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50">
              <tr>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Tên</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Email</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Vai trò</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-center">Quốc gia</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
              {
                members.map(member => {
                  return (
                    <tr key={member.id}>
                      <td className="p-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 shrink-0 mr-2 sm:mr-3">
                            <img
                              className="rounded-full object-cover w-12 h-12"
                              src={member.image}
                              alt={member.name}
                            />

                          </div>
                          <div className="font-medium text-gray-800 dark:text-gray-100">{member.name}</div>
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-left">{member.email}</div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-left font-medium text-blue-500">{member.role}</div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-lg text-center">{member.location}</div>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>

        </div>

      </div>
    </div>
  );
}

export default Members;
