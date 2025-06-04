import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  restoreUser,
} from "../../../services/userService";
import { toast } from "react-toastify";
export default function ManageUser() {
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
   const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  // Fetch users on component mount or when pagination changes
  useEffect(() => {
    fetchUsers(searchQuery, pagination.current, pagination.pageSize);
  }, [searchQuery, pagination.current, pagination.pageSize]);

  // Fetch users from API
  const fetchUsers = async (search = "", page = 1, pageSize = 5) => {
    try {
      const response = await getUsers(search, page - 1, pageSize); // API sử dụng page bắt đầu từ 0
      setUsers(response.data.content); // Gán danh sách người dùng
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: response.data.totalElements, // Tổng số phần tử
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng!");
    }
  };
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchUsers(searchQuery, 1, pagination.pageSize);
  };
  // Handle add user
  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle edit user
  const handleEditUser = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      toast.success("Xóa người dùng thành công!");
      fetchUsers("",pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Không thể xóa người dùng!");
    }
  };

  // Handle restore user
  const handleRestoreUser = async (userId) => {
    try {
      await restoreUser(userId);
      toast.success("Khôi phục người dùng thành công!");
      fetchUsers("",pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error restoring user:", error);
      toast.error("Không thể khôi phục người dùng!");
    }
  };

  // Handle form submit for add/edit user
  const handleSubmit = async (values) => {
    try {
      console.log(values);
      if (editingUser) {
        // Update user
        await updateUser(editingUser.userId, values);
        toast.success("Cập nhật người dùng thành công!");
      } else {
        // Add new user
        await addUser(values);
        toast.success("Thêm người dùng thành công!");
      }
      setIsModalVisible(false);
      fetchUsers("",pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Không thể lưu người dùng!");
    }
  };

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "userId",
      key: "userId",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Họ và tên",
      key: "fullName",
      render: (_, record) =>
        `${record.firstName || ""} ${record.lastName || ""}`.trim() ||
        "Không có dữ liệu",
    },
    {
      title: "Số điện thoại",
      dataIndex: "userPhone",
      key: "userPhone",
      render: (phone) => phone || "Không có dữ liệu",
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      key: "roles",
      render: (roles) => roles.map((role) => role.roleName).join(", "),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          {record.deletedAt === null ? (
            <>
              <Button
                type="link"
                icon={<EditOutlined styles={{ fontSize: 18 }} />}
                onClick={() => handleEditUser(record)}
              />
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa người dùng này?"
                onConfirm={() => handleDeleteUser(record.userId)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined styles={{ fontSize: 18 }} />}
                />
              </Popconfirm>
            </>
          ) : (
            <Popconfirm
              title="Bạn có chắc chắn muốn khôi phục người dùng này?"
              onConfirm={() => handleRestoreUser(record.userId)}
              okText="Khôi phục"
              cancelText="Hủy"
            >
              <Button
                type="link"
                style={{ color: "green" }}
                icon={<UndoOutlined styles={{ fontSize: 18 }} />}
              />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>
         <div className="flex items-center gap-2">
                  <Input
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{ width: 300 }}
                  />
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                  >
                    Tìm
                  </Button>
                </div>
        <Button
          type="primary"
          onClick={handleAddUser}
          className="mb-4"
          shape="circle"
          icon={<PlusOutlined styles={{ fontSize: 18 }} />}
        />
          {/* Thêm
        </Button> */}
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="userId"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            fetchUsers(page, pageSize); // Gọi lại API khi thay đổi trang
          },
        }}
      />

      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Họ" name="firstName">
            <Input />
          </Form.Item>
          <Form.Item label="Tên" name="lastName">
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password">
            <Input.Password />
          </Form.Item>
          <Form.Item label="Vai trò" name="role">
            <Select placeholder="Chọn vai trò">
              <Select.Option value="USER">Người dùng</Select.Option>
              <Select.Option value="ADMIN">Quản trị viên</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   Button,
//   Modal,
//   Form,
//   Input,
//   Select,
//   message,
//   Popconfirm,
// } from "antd";
// import {
//   PlusOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   UndoOutlined,
// } from "@ant-design/icons";
// import {
//   getUsers,
//   addUser,
//   updateUser,
//   deleteUser,
//   restoreUser,
// } from "../../../services/userService";

// export default function ManageUser() {
//   const [users, setUsers] = useState([]);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [editingUser, setEditingUser] = useState(null);
//   const [form] = Form.useForm();
//   const [pagination, setPagination] = useState({
//     current: 1,
//     pageSize: 5,
//     total: 0,
//   });
//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async (page = 1, pageSize = 5) => {
//     try {
//       const response = await getUsers(page - 1, pageSize); // API sử dụng page bắt đầu từ 0
//       setUsers(response.data.content); // Gán danh sách người dùng
//       setPagination((prev) => ({
//         ...prev,
//         current: page,
//         pageSize,
//         total: response.data.totalElements, // Tổng số phần tử
//       }));
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       message.error("Không thể tải danh sách người dùng!");
//     }

//   const handleAddUser = () => {
//     setEditingUser(null);
//     form.resetFields();
//     setIsModalVisible(true);
//   };

//   const handleEditUser = (record) => {
//     setEditingUser(record);
//     form.setFieldsValue(record);
//     setIsModalVisible(true);
//   };

//   const handleDeleteUser = async (userId) => {
//     try {
//       await deleteUser(userId);
//       message.success("Xóa người dùng thành công!");
//       fetchUsers();
//     } catch (error) {
//       console.error("Error deleting user:", error);
//       message.error("Không thể xóa người dùng!");
//     }
//   };

//   const handleRestoreUser = async (userId) => {
//     try {
//       await restoreUser(userId);
//       message.success("Khôi phục người dùng thành công!");
//       fetchUsers();
//     } catch (error) {
//       console.error("Error restoring user:", error);
//       message.error("Không thể khôi phục người dùng!");
//     }
//   };

//   const handleSubmit = async (values) => {
//     try {
//       if (editingUser) {
//         // Update user
//         await updateUser(editingUser.userId, values);
//         message.success("Cập nhật người dùng thành công!");
//       } else {
//         // Add new user
//         await addUser(values);
//         message.success("Thêm người dùng thành công!");
//       }
//       setIsModalVisible(false);
//       fetchUsers();
//     } catch (error) {
//       console.error("Error saving user:", error);
//       message.error("Không thể lưu người dùng!");
//     }
//   };

//   const columns = [
//     {
//       title: "ID",
//       dataIndex: "userId",
//       key: "userId",
//     },
//     {
//       title: "Email",
//       dataIndex: "email",
//       key: "email",
//     },
//     {
//       title: "Họ và tên",
//       key: "fullName",
//       render: (_, record) =>
//         `${record.firstName || ""} ${record.lastName || ""}`.trim() ||
//         "Không có dữ liệu",
//     },
//     {
//       title: "Số điện thoại",
//       dataIndex: "userPhone",
//       key: "userPhone",
//       render: (phone) => phone || "Không có dữ liệu",
//     },
//     {
//       title: "Vai trò",
//       dataIndex: "roles",
//       key: "roles",
//       render: (roles) => roles.map((role) => role.roleName).join(", "),
//     },
//     {
//       title: "Hành động",
//       key: "action",
//       render: (_, record) => (
//         <div className="flex gap-2">
//           {record.deletedAt === null ? (
//             <>
//               <Button
//                 type="link"
//                 icon={<EditOutlined />}
//                 onClick={() => handleEditUser(record)}
//               />
//               <Popconfirm
//                 title="Bạn có chắc chắn muốn xóa người dùng này?"
//                 onConfirm={() => handleDeleteUser(record.userId)}
//                 okText="Xóa"
//                 cancelText="Hủy"
//               >
//                 <Button type="link" danger icon={<DeleteOutlined />} />
//               </Popconfirm>
//             </>
//           ) : (
//             <Popconfirm
//               title="Bạn có chắc chắn muốn khôi phục người dùng này?"
//               onConfirm={() => handleRestoreUser(record.userId)}
//               okText="Khôi phục"
//               cancelText="Hủy"
//             >
//               <Button
//                 type="link"
//                 style={{ color: "green" }}
//                 icon={<UndoOutlined />}
//               />
//             </Popconfirm>
//           )}
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <div className="flex justify-between">
//         <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>
//         <Button
//           type="primary"
//           onClick={handleAddUser}
//           className="mb-4"
//           icon={<PlusOutlined />}
//         >
//           Thêm
//         </Button>
//       </div>
//       <Table
//         columns={columns}
//         dataSource={users}
//         rowKey="userId"
//         pagination={{
//           current: pagination.current,
//           pageSize: pagination.pageSize,
//           total: pagination.total,
//           onChange: (page, pageSize) => {
//             fetchUsers(page, pageSize); // Gọi lại API khi thay đổi trang
//           },
//         }}
//       />

//       <Modal
//         title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
//         visible={isModalVisible}
//         onCancel={() => setIsModalVisible(false)}
//         onOk={() => form.submit()}
//       >
//         <Form form={form} layout="vertical" onFinish={handleSubmit}>
//           <Form.Item
//             label="Email"
//             name="email"
//             rules={[{ required: true, message: "Vui lòng nhập email!" }]}
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item label="Họ" name="firstName">
//             <Input />
//           </Form.Item>
//           <Form.Item label="Tên" name="lastName">
//             <Input />
//           </Form.Item>
//           <Form.Item label="Số điện thoại" name="userPhone">
//             <Input />
//           </Form.Item>
//           <Form.Item label="Vai trò" name="roles">
//             <Select mode="multiple" placeholder="Chọn vai trò">
//               <Select.Option value="USER">Người dùng</Select.Option>
//               <Select.Option value="ADMIN">Quản trị viên</Select.Option>
//             </Select>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// }
