import React from 'react'
import { Link } from "react-router-dom";
import { FrownOutlined } from "@ant-design/icons";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
    <div className="flex flex-col items-center">
      <FrownOutlined className="text-7xl text-blue-500 mb-4" />
      <h1 className="text-4xl font-bold text-blue-900 mb-2">404 - Không tìm thấy trang</h1>
      <p className="text-gray-600 mb-6">
        Xin lỗi, trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link
        to="/"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition"
      >
        Quay về trang chủ
      </Link>
    </div>
  </div>
  )
}
