import React from 'react';
import { useSelector } from 'react-redux';

function UserInfo() {
  // **Lấy user từ Redux store**
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <p className="text-center text-gray-500">Chưa có thông tin người dùng.</p>;
  }

  return (
    <section className="w-full overflow-hidden dark:bg-gray-900">
      <div className="flex flex-col">
        {/* Cover Image */}
        <img
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw5fHxjb3ZlcnxlbnwwfDB8fHwxNzEwNzQxNzY0fDA&ixlib=rb-4.0.3&q=80&w=1080"
          alt="User Cover"
          className="w-full xl:h-[20rem] lg:h-[18rem] md:h-[16rem] sm:h-[14rem] xs:h-[11rem]"
        />
        <div className="sm:w-[80%] xs:w-[90%] mx-auto flex">
          <img
            src={user.avatar || "https://via.placeholder.com/150"}
            alt="User Profile"
            className="rounded-md lg:w-[12rem] lg:h-[12rem] md:w-[10rem] md:h-[10rem] sm:w-[8rem] sm:h-[8rem] xs:w-[7rem] xs:h-[7rem] outline outline-2 outline-offset-2 outline-blue-500 relative lg:bottom-[5rem] sm:bottom-[4rem] xs:bottom-[3rem]"
          />
          <h1 className="w-full text-left my-4 sm:mx-4 xs:pl-4 text-gray-800 dark:text-white lg:text-4xl md:text-3xl sm:text-3xl xs:text-xl font-serif">
            {user.fullName || "Chưa có tên"}
          </h1>
        </div>

        <div className="xl:w-[80%] lg:w-[90%] md:w-[90%] sm:w-[92%] xs:w-[90%] mx-auto flex flex-col gap-4 items-center relative lg:-top-8 md:-top-6 sm:-top-4 xs:-top-4">
          <p className="w-fit text-gray-700 dark:text-gray-400 text-md">
            {user.status || "Trạng thái chưa cập nhật"} tại{" "}
            <span className="font-semibold">{user.location || "Không xác định"}</span>
          </p>

          <div className="w-full my-auto py-6 flex flex-col justify-center gap-2">
            <div className="w-full flex sm:flex-row xs:flex-col gap-2 justify-center">
              <div className="w-full">
                <dl className="text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
                  <div className="flex flex-col pb-3">
                    <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Họ và tên</dt>
                    <dd className="text-lg font-semibold">{user.fullName || "Chưa cập nhật"}</dd>
                  </div>
                  <div className="flex flex-col py-3">
                    <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Email</dt>
                    <dd className="text-lg font-semibold">{user.email || "Chưa có email"}</dd>
                  </div>
                  <div className="flex flex-col py-3">
                    <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Số điện thoại</dt>
                    <dd className="text-lg font-semibold">{user.phoneNumber || "Chưa có số điện thoại"}</dd>
                  </div>
                  <div className="flex flex-col py-3">
                    <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Vai trò</dt>
                    <dd className="text-lg font-semibold">{user.role_name || "Chưa xác định"}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="my-10 lg:w-[70%] md:h-[14rem] xs:w-full xs:h-[10rem]">
              <h1 className="w-fit font-serif my-4 pb-1 pr-2 rounded-b-md border-b-4 border-blue-600 dark:border-yellow-600 dark:text-white lg:text-4xl md:text-3xl xs:text-xl">
                Vị trí của tôi
              </h1>
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(user.location || "Hà Nội, Việt Nam")}&output=embed`}
                className="rounded-lg w-full h-full"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UserInfo;
