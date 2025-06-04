import React from "react";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
import {
  AppstoreOutlined,
  ShoppingOutlined,
  UserOutlined,
  TagsOutlined,
  BarChartOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";

export default function SidebarAdmin() {
  const navigate = useNavigate();

  const menuItems = [
    {
      key: "/admin",
      icon: <BarChartOutlined />,
      label: "Thống kê",
    },
    {
      key: "/admin/manage-category",
      icon: <AppstoreOutlined />,
      label: "Quản lý danh mục",
    },
    {
      key: "/admin/manage-product",
      icon: <ShoppingOutlined />,
      label: "Quản lý sản phẩm",
    },
    {
      key: "/admin/manage-order",
      icon: <OrderedListOutlined />,
      label: "Quản lý đơn hàng",
    },
    {
      key: "/admin/manage-user",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
    },
    {
      key: "/admin/manage-brand",
      icon: <TagsOutlined />,
      label: "Quản lý thương hiệu",
    },
    {
      key: "/admin/manage-voucher",
      icon: <TagsOutlined />,
      label: "Quản lý voucher",
    },
  ];

  return (
    <div className="w-64 h-screen bg-white shadow-md">
      
      <Menu
        mode="inline"
        defaultSelectedKeys={["/admin/statistic"]}
        onClick={({ key }) => navigate(key)}
        items={menuItems}
      />
    </div>
  );
}
