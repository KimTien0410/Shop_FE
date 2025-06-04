

import React, { useEffect, useState } from "react";
import { Menu, Dropdown, Badge } from "antd";
import { ShoppingCartOutlined, DownOutlined } from "@ant-design/icons";
import { getAllCategories } from "../../services/categoryService";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
// import { getCart } from "../../services/cartService";
import { useCart } from "../../contexts/CartContext";
export default function Header() {
  const { cartCount } = useCart();
   const { auth, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  // console.log("auth ",auth);
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getAllCategories();
      if (Array.isArray(response)) {
        setCategories(response);
      } else {
        console.error("Invalid categories data:", response);
      }
    };

     fetchCategories();
  }, []);

    const handleCategoryClick = (categoryId) => {
      navigate(`/products?category=${categoryId}`);
    };

  const handleLoginClick = () => {
    navigate("/login"); // Điều hướng đến trang LoginPage
  };

  const handleRegisterClick = () => {
    navigate("/register"); // Điều hướng đến trang RegisterPage
  };
  const handleLogoutClick = () => {
    logout(); // Gọi hàm logout từ AuthContext
    navigate("/login"); // Điều hướng về trang chủ sau khi đăng xuất
  };
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };
   const accountMenu = (
     <Menu>
       <Menu.Item key="profile" onClick={() => navigate("/profile")}>
         Hồ sơ cá nhân
       </Menu.Item>
       <Menu.Item key="address" onClick={() => navigate("/receiver-address")}>
         Địa chỉ nhận hàng
       </Menu.Item>
       <Menu.Item key="history" onClick={() => navigate("/order-history")}>
         Lịch sử đơn hàng
       </Menu.Item>
       <Menu.Divider />
       <Menu.Item key="logout" onClick={handleLogoutClick}>
         Đăng xuất
       </Menu.Item>
     </Menu>
   );
  return (
    <header className="sticky top-0 bg-white shadow z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-blue-600">FashionShop</span>
        </Link>
        {/* Menu khu vực giữa */}
        <div className="flex-1 justify-between space-x-4">
          {/* Danh mục cha hiển thị ngang */}
          {/* <Menu mode="horizontal">
            {categories.map((category) => (
              <Menu.SubMenu
                key={category.categoryId}
                title={category.categoryName}
              >
                {category.children?.map((child) => (
                  <Menu.Item
                    key={child.categoryId}
                    onClick={() => handleCategoryClick(child.categoryId)}
                  >
                    {child.categoryName}
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            ))}
          </Menu> */}
          <Menu
            mode="horizontal"
            items={categories.map((category) => ({
              key: category.categoryId,
              label: category.categoryName,
              children: category.children?.map((child) => ({
                key: child.categoryId,
                label: child.categoryName,
                onClick: () => handleCategoryClick(child.categoryId),
              })),
            }))}
          />
        </div>

        {/* Search */}
        <div className="flex-1 mx-4 max-w-2xs w-full">
          <div className="flex rounded overflow-hidden border border-gray-300">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-grow px-4 py-2 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(); // Tìm kiếm khi nhấn Enter
              }}
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSearch}
            >
              Tìm
            </button>
          </div>
        </div>
        {/* Kiểm tra trạng thái đăng nhập */}
        {auth.isAuthenticated ? (
          <div className="flex items-center space-x-8">
            {/* Icon giỏ hàng */}
            <Link to="/cart" className="text-gray-700 hover:text-blue-600">
              <Badge count={cartCount} offset={[10, 0]}>
                <ShoppingCartOutlined style={{ fontSize: "20px" }} />
              </Badge>
            </Link>

            {/* Dropdown tài khoản */}
            <Dropdown overlay={accountMenu} trigger={["click"]}>
              <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                <span>Tài khoản</span>
                <DownOutlined />
              </button>
            </Dropdown>
          </div>
        ) : (
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition"
              onClick={handleLoginClick}
            >
              Đăng nhập
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={handleRegisterClick}
            >
              Đăng ký
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// import React, { useEffect, useState } from "react";
// import { Menu, Dropdown } from "antd";
// import { DownOutlined } from "@ant-design/icons";
// import { getAllCategories } from "../../services/categoryService";
// import { useNavigate } from "react-router-dom";

// export default function Header() {
//   const [categories, setCategories] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchCategories = async () => {
//       const response = await getAllCategories();
//       if (Array.isArray(response)) {
//         setCategories(response);
//       } else {
//         console.error("Invalid categories data:", response);
//       }
//     };
//     fetchCategories();
//   }, []);

//   const handleClick = ({ key }) => {
//     navigate(`/product-list?category=${key}`);
//   };

//   const generateMenuItems = (categories) => {
//     return categories.map((category) => {
//       if (category.children && category.children.length > 0) {
//         return {
//           key: `parent-${category.categoryId}`,
//           label: category.categoryName,
//           children: category.children.map((child) => ({
//             key: child.categoryCode,
//             label: child.categoryName,
//           })),
//         };
//       }
//       return {
//         key: category.categoryCode,
//         label: category.categoryName,
//       };
//     });
//   };

//   return (
//     <header className="sticky top-0 bg-white shadow z-50">
//       <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
//         {/* Logo */}
//         <div className="text-2xl font-bold text-blue-600">MyLogo</div>

//         {/* Dropdown danh mục */}
//         <Dropdown
//           menu={{
//             items: generateMenuItems(categories),
//             onClick: handleClick,
//           }}
//           trigger={["click"]}
//         >
//           <button className="flex items-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700 font-medium transition">
//             <span>Danh mục</span>
//             <DownOutlined className="ml-2 text-xs" />
//           </button>
//         </Dropdown>

//         {/* Search bar */}
//         <div className="flex-1 mx-6 max-w-xl w-full">
//           <div className="flex rounded overflow-hidden border border-gray-300">
//             <input
//               type="text"
//               placeholder="Tìm kiếm sản phẩm..."
//               className="flex-grow px-4 py-2 focus:outline-none"
//             />
//             <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
//               Tìm
//             </button>
//           </div>
//         </div>

//         {/* Auth buttons */}
//         <div className="flex space-x-3">
//           <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
//             Đăng nhập
//           </button>
//           <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
//             Đăng ký
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }

// import React, { useEffect, useState } from 'react'
// import { Menu, Dropdown } from 'antd';
// import { DownOutlined } from '@ant-design/icons';
// import MenuCategory from './MenuCategory';
// import { getAllCategories } from '../../services/categoryService';
// import { useNavigate } from 'react-router-dom';

// export default function Header() {
//     const [categories, setCategories] = useState([]);
//     const navigate = useNavigate();

//     useEffect(() => {
//       const fetchCategories = async () => {
//         const response = await getAllCategories();
//         if (Array.isArray(response)) {
//           setCategories(response);
//         } else {
//           console.error("Invalid categories data:", response);
//         }
//       };
//       fetchCategories();
//     }, []);

//     // 👉 Xử lý khi người dùng click menu item
//     const handleClick = ({ key }) => {
//       navigate(`/product-list?category=${key}`);
//     };

//     // 👉 Chuyển đổi dữ liệu từ API sang format của Ant Design Menu
//     const generateMenuItems = (categories) => {
//       return categories.map((category) => {
//         // Có danh mục con
//         if (category.children && category.children.length > 0) {
//           return {
//             key: `parent-${category.categoryId}`, // không cần dùng key cha
//             label: category.categoryName,
//             children: category.children.map((child) => ({
//               key: child.categoryCode,
//               label: child.categoryName,
//             })),
//           };
//         }
//         // Không có danh mục con
//         return {
//           key: category.categoryCode,
//           label: category.categoryName,
//         };
//       });
//     };

//   return (
//     <header className="sticky top-0 bg-white shadow z-50">
//       <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
//         {/* Logo */}
//         <div className="text-xl font-bold text-blue-600">MyLogo</div>
//         <Dropdown
//           menu={{
//             items: generateMenuItems(categories),
//             onClick: handleClick,
//           }}
//           trigger={["click"]}
//         >
//           <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
//             Danh mục <DownOutlined />
//           </button>
//         </Dropdown>
//         {/* Search */}
//         <div className="flex-1 mx-6">
//           <div className="flex">
//             <input
//               type="text"
//               placeholder="Tìm kiếm sản phẩm..."
//               className="w-100 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//             <button className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700">
//               Tìm
//             </button>
//           </div>
//         </div>

//         {/* Auth Buttons */}
//         <div className="flex space-x-3">
//           <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">
//             Đăng nhập
//           </button>
//           <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//             Đăng ký
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }
