import React, { useState } from "react";
import { Input, Dropdown, Menu, Button } from "antd";
import { SearchOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

export default function HeaderAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const {auth,logout} = useAuth();
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/admin/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    // Xử lý đăng xuất
    logout();
    navigate("/login"); // Điều hướng về trang đăng nhập
  };

  const accountMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <span>Thông tin tài khoản</span>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        <span>Đăng xuất</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between">
      {/* Logo */}
      <div className="text-xl font-bold text-blue-600">Admin Dashboard</div>

      {/* Search */}
      {/* <div className="flex items-center gap-2">
        <Input
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          Tìm
        </Button>
      </div> */}

      {/* Account */}
      {auth.isAuthenticated && (
        <Dropdown overlay={accountMenu} trigger={["click"]}>
          <Button icon={<UserOutlined />} type="text">
            Tài khoản
          </Button>
        </Dropdown>
      )}
      
    </header>
  );
}