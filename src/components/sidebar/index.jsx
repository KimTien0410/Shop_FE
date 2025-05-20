import React from "react";
import { Layout, Menu } from "antd";
import { UserOutlined, HistoryOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;

export default function Sidebar({ selectedKey }) {
  const navigate = useNavigate();

  return (
    <Sider width={200} className="bg-gray-100">
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={(e) => navigate(e.key)}
        style={{ height: "100%", borderRight: 0 }}
      >
        <Menu.Item key="/profile" icon={<UserOutlined />}>
          Thông tin cá nhân
        </Menu.Item>
        <Menu.Item key="/receiver-address" icon={<HomeOutlined />}>
          Địa chỉ nhận hàng
        </Menu.Item>
        <Menu.Item key="/order-history" icon={<HistoryOutlined />}>
          Lịch sử đơn hàng
        </Menu.Item>
      </Menu>
    </Sider>
  );
}
