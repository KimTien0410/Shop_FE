import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Modal,
  Descriptions,
  Popconfirm,
  Pagination,
} from "antd";
import { cancelOrderByAdmin, getAllOrders, updateOrderStatus } from "../../../services/orderService";
import { EyeOutlined, SyncOutlined, CloseOutlined  } from "@ant-design/icons";
import { toast } from "react-toastify";
const ManageOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  // Fetch orders from API
  const fetchOrders = async (page = 1, pageSize = 5) => {
    setLoading(true);
    try {
    //   const response = await axios.get(
    //     `/api/orders?page=${page - 1}&size=${pageSize}`
        const response = await getAllOrders(page - 1, pageSize);
        console.log("Response order data:", response.data); // Log dữ liệu phản hồi
       // Thay bằng endpoint API của bạn
      const { content, totalElements } = response.data;
      setOrders(content);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: totalElements,
      }));
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleUpdateStatus = async (orderId) => {
    try {
        //   await axios.put(`/api/orders/${orderId}/status`, { status }); // Thay bằng endpoint API cập nhật trạng thái
        await updateOrderStatus(orderId); // Thay bằng endpoint API cập nhật trạng thái
      toast.success("Cập nhật trạng thái đơn hàng thành công!");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái đơn hàng!");
    }
  };
  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrderByAdmin(orderId); // Gọi API hủy đơn hàng
      toast.success("Hủy đơn hàng thành công!");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      toast.error("Không thể hủy đơn hàng!");
    }
  };
  const handleTableChange = (page, pageSize) => {
    fetchOrders(page, pageSize);
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethodName",
      key: "paymentMethodName",
    },
    {
      title: "Tổng tiền",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (price) => `${price.toLocaleString()} VND`,
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => {
        let color;
        switch (status) {
          case "PENDING":
            color = "orange";
            break;
          case "IN_PROGRESS":
            color = "blue";
            break;
          case "SHIPPED":
            color = "purple";
            break;
          case "DELIVERED":
            color = "green";
            break;
          case "CANCELLED":
            color = "red";
            break;
          default:
            color = "gray";
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="link"
            icon={<EyeOutlined styles={{ fontSize: 18 }} />}
            onClick={() => handleViewDetails(record)}
          />
          {/* Nút cập nhật trạng thái với biểu tượng SyncOutlined */}
          <Button
            type="link"
            icon={<SyncOutlined styles={{ fontSize: 18 }} />}
            onClick={() => handleUpdateStatus(record.orderId)}
          />
          {/* Nút hủy đơn hàng */}
          <Popconfirm
            title="Bạn có chắc chắn muốn hủy đơn hàng này?"
            onConfirm={() => handleCancelOrder(record.orderId)}
            okText="Hủy"
            cancelText="Không"
          >
            <Button type="link" danger icon={<CloseOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="orderId"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: handleTableChange,
        }}
      />

      {/* Modal xem chi tiết đơn hàng */}
      <Modal
        title="Chi tiết đơn hàng"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedOrder && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID">
              {selectedOrder.orderId}
            </Descriptions.Item>
            <Descriptions.Item label="Người nhận">
              {selectedOrder.receiverName}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedOrder.receiverPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {selectedOrder.receiverAddress}
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              {selectedOrder.paymentMethodName}
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức giao hàng">
              {selectedOrder.deliveryMethodName}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              {selectedOrder.finalPrice.toLocaleString()} VND
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  selectedOrder.orderStatus === "PENDING"
                    ? "orange"
                    : selectedOrder.orderStatus === "COMPLETED"
                    ? "green"
                    : "red"
                }
              >
                {selectedOrder.orderStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Chi tiết sản phẩm">
              {selectedOrder.orderDetails.map((detail) => (
                <div key={detail.orderDetailId} className="mb-2">
                  <img
                    src={detail.productImage}
                    alt={detail.productName}
                    style={{ width: 50, height: 50, marginRight: 10 }}
                  />
                  {detail.productName} - {detail.color} - {detail.size} -{" "}
                  {detail.quantity} x {detail.price.toLocaleString()} VND
                </div>
              ))}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ManageOrder;

// import React, { useEffect, useState } from "react";
// import { Table, Button, Tag, Modal, Descriptions, Select, message } from "antd";
// import axios from "axios";
// import { getAllOrders } from "../../../services/orderService";

// const ManageOrder = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [isModalVisible, setIsModalVisible] = useState(false);

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const response = await getAllOrders(); // Thay bằng endpoint API của bạn
//       setOrders(response.data.content);
//     } catch (error) {
//       message.error("Không thể tải danh sách đơn hàng!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const handleViewDetails = (order) => {
//     setSelectedOrder(order);
//     setIsModalVisible(true);
//   };

//   const handleUpdateStatus = async (orderId, status) => {
//     try {
//       await axios.put(`/api/orders/${orderId}/status`, { status }); // Thay bằng endpoint API cập nhật trạng thái
//       message.success("Cập nhật trạng thái đơn hàng thành công!");
//       fetchOrders();
//     } catch (error) {
//       message.error("Không thể cập nhật trạng thái đơn hàng!");
//     }
//   };

//   const columns = [
//     {
//       title: "Order ID",
//       dataIndex: "orderId",
//       key: "orderId",
//     },
//     {
//       title: "User ID",
//       dataIndex: "userId",
//       key: "userId",
//     },
//     {
//       title: "Phương thức thanh toán",
//       dataIndex: "paymentMethodName",
//       key: "paymentMethodName",
//     },
//     {
//       title: "Tổng tiền",
//       dataIndex: "finalPrice",
//       key: "finalPrice",
//       render: (price) => `${price.toLocaleString()} VND`,
//     },
//     {
//       title: "Trạng thái",
//       dataIndex: "orderStatus",
//       key: "orderStatus",
//       render: (status) => {
//         let color;
//         switch (status) {
//           case "PENDING":
//             color = "orange";
//             break;
//           case "IN_PROGRESS":
//             color = "blue";
//             break;
//           case "SHIPPED":
//             color = "purple";
//             break;
//           case "DELIVERED":
//             color = "green";
//             break;
//           case "CANCELLED":
//             color = "red";
//             break;
//           default:
//             color = "gray";
//         }
//         return <Tag color={color}>{status}</Tag>;
//       },
//     },
//     {
//       title: "Hành động",
//       key: "action",
//       render: (_, record) => (
//         <div className="flex gap-2">
//           <Button type="link" onClick={() => handleViewDetails(record)}>
//             Xem chi tiết
//           </Button>
//           <Select
//             defaultValue={record.orderStatus}
//             style={{ width: 120 }}
//             onChange={(value) => handleUpdateStatus(record.orderId, value)}
//           >
//             <Select.Option value="PENDING">PENDING</Select.Option>
//             <Select.Option value="COMPLETED">COMPLETED</Select.Option>
//             <Select.Option value="CANCELLED">CANCELLED</Select.Option>
//           </Select>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>
//       <Table
//         columns={columns}
//         dataSource={orders}
//         rowKey="orderId"
//         loading={loading}
//         pagination={{ pageSize: 10 }}
//       />

//       {/* Modal xem chi tiết đơn hàng */}
//       <Modal
//         title="Chi tiết đơn hàng"
//         visible={isModalVisible}
//         onCancel={() => setIsModalVisible(false)}
//         footer={null}
//       >
//         {selectedOrder && (
//           <Descriptions bordered column={1}>
//             <Descriptions.Item label="ID">
//               {selectedOrder.orderId}
//             </Descriptions.Item>
//             <Descriptions.Item label="Người nhận">
//               {selectedOrder.receiverName}
//             </Descriptions.Item>
//             <Descriptions.Item label="Số điện thoại">
//               {selectedOrder.receiverPhone}
//             </Descriptions.Item>
//             <Descriptions.Item label="Địa chỉ">
//               {selectedOrder.receiverAddress}
//             </Descriptions.Item>
//             <Descriptions.Item label="Phương thức thanh toán">
//               {selectedOrder.paymentMethodName}
//             </Descriptions.Item>
//             <Descriptions.Item label="Phương thức giao hàng">
//               {selectedOrder.deliveryMethodName}
//             </Descriptions.Item>
//             <Descriptions.Item label="Tổng tiền">
//               {selectedOrder.finalPrice.toLocaleString()} VND
//             </Descriptions.Item>
//             <Descriptions.Item label="Trạng thái">
//               <Tag
//                 color={
//                   selectedOrder.orderStatus === "PENDING"
//                     ? "orange"
//                     : selectedOrder.orderStatus === "COMPLETED"
//                     ? "green"
//                     : "red"
//                 }
//               >
//                 {selectedOrder.orderStatus}
//               </Tag>
//             </Descriptions.Item>
//             <Descriptions.Item label="Chi tiết sản phẩm">
//               {selectedOrder.orderDetails.map((detail) => (
//                 <div key={detail.orderDetailId} className="mb-2">
//                   <img
//                     src={detail.productImage}
//                     alt={detail.productName}
//                     style={{ width: 50, height: 50, marginRight: 10 }}
//                   />
//                   {detail.productName} - {detail.color} - {detail.size} -{" "}
//                   {detail.quantity} x {detail.price.toLocaleString()} VND
//                 </div>
//               ))}
//             </Descriptions.Item>
//           </Descriptions>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default ManageOrder;
