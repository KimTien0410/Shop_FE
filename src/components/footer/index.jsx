import React from "react";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  MailOutlined,
} from "@ant-design/icons";
export default function Footer() {
  return (
    <footer className="sticky bg-blue-900 text-white py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo + mô tả */}
        <div>
          <h2 className="text-2xl font-bold mb-2">FashionShop</h2>
          <p className="text-sm text-gray-400">
            Những sản phẩm uy tín và chất lượng.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Liên kết</h3>
          <ul className="space-y-1 text-gray-400 text-sm">
            <li>
              <a href="/about" className="hover:underline">
                Giới thiệu
              </a>
            </li>
            <li>
              <a href="/products" className="hover:underline">
                Sản phẩm
              </a>
            </li>
            <li>
              <a href="/blog" className="hover:underline">
                Bài viết
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:underline">
                Liên hệ
              </a>
            </li>
          </ul>
        </div>

        {/* Thông tin liên hệ */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Liên hệ</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>📍 123 Đường Sức Khỏe, Quận 1, TP.HCM</li>
            <li>📞 0123 456 789</li>
            <li>📧 support@pharmastore.vn</li>
          </ul>
        </div>

        {/* Mạng xã hội */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Kết nối với chúng tôi</h3>
          <div className="flex space-x-4 mt-2">
            <a href="#" className="hover:text-blue-500">
              <FacebookOutlined />
            </a>
            <a href="#" className="hover:text-sky-400">
              <TwitterOutlined />
            </a>
            <a href="#" className="hover:text-pink-500">
              <InstagramOutlined />
            </a>
            <a href="#" className="hover:text-red-400">
              <MailOutlined />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm text-white">
        © 2025 FashionShop. All rights reserved.
      </div>
    </footer>
  );
}
      