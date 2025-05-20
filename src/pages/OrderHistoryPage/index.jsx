import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Descriptions, Tag, message } from "antd";
import { cancelOrder, getOrderHistory } from "../../services/orderService";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const location = useLocation();
  // useEffect(() => {
  //   const params = new URLSearchParams(location.search);
  //   if (params.get("status") === "PAID") {
  //     toast.success("Thanh toán thành công!", { autoClose: 3000 });
  //   }
  // }, [location.search]);
  // useEffect(() => {
  //   const params = new URLSearchParams(location.search);
  //   if (params.get("status") === "PAID") {
  //     toast.success("Thanh toán thành công!");
  //   }
  //   if (
  //     params.get("cancel") === "true" &&
  //     params.get("status") === "CANCELLED"
  //   ) {

  //     toast.success("Hủy đơn hàng thành công!");
  //   }
  // }, [location.search]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderCode = params.get("orderCode");
    if (
      params.get("cancel") === "true" &&
      params.get("status") === "CANCELLED" &&
      orderCode
    ) {
      // Gọi API hủy đơn hàng với orderCode
      cancelOrder(orderCode)
        .then(() => {
          toast.success("Hủy đơn hàng thành công!", { autoClose: 3000 });
          fetchOrderHistory();
        })
        .catch(() => {
          toast.error("Không thể hủy đơn hàng!");
        });
    }
    if (params.get("status") === "PAID") {
      toast.success("Thanh toán thành công!", { autoClose: 3000 });
    }
  }, [location.search]);
  
  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const response = await getOrderHistory(); // Gọi API lấy lịch sử đơn hàng
      console.log("Response order history data:", response.data); // Log dữ liệu phản hồi
      setOrders(response.data.content);
    } catch (error) {
      console.error("Error fetching order history:", error);
      message.error("Không thể tải lịch sử đơn hàng!");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId); // Gọi API hủy đơn hàng
      toast.success("Hủy đơn hàng thành công!");
      fetchOrderHistory(); // Cập nhật danh sách đơn hàng
    } catch (error) {
      console.error("Error canceling order:", error);
      toast.error("Không thể hủy đơn hàng!");
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order); // Lưu thông tin đơn hàng được chọn
    setIsModalVisible(true); // Hiển thị modal chi tiết đơn hàng
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (text) => new Date(text).toLocaleString(), // Format ngày
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => {
        let color = "";
        let text = "";
    
        switch (status) {
          case "PENDING":
            color = "blue";
            text = "Đang chờ xử lý";
            break;
          case "IN_PROGRESS":
            color = "orange";
            text = "Đang xử lý";
            break;
          case "SHIPPED":
            color = "purple";
            text = "Đang giao hàng";
            break;
          case "DELIVERED":
            color = "green";
            text = "Đã giao";
            break;
          case "CANCELLED":
            color = "red";
            text = "Đã hủy";
            break;
          default:
            color = "default";
            text = "Không xác định";
        }
    
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: "Tổng tiền",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (price) => `${price.toLocaleString()} VND`,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type="link" onClick={() => handleViewOrderDetails(record)}>
            Xem chi tiết
          </Button>
          {record.orderStatus === "PENDING" && (
            <Button
              type="link"
              danger
              onClick={() => handleCancelOrder(record.orderId)}
            >
              Hủy đơn hàng
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Lịch sử đơn hàng</h1>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="orderId"
        pagination={{ pageSize: 5 }}
      />

      {/* Modal chi tiết đơn hàng */}
      <Modal
        title="Chi tiết đơn hàng"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Mã đơn hàng">
                {selectedOrder.orderId}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt hàng">
                {new Date(selectedOrder.orderDate).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {selectedOrder.orderStatus === "PENDING"
                  ? "Đang chờ xử lý"
                  : "Đã giao"}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {selectedOrder.paymentMethodName}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức giao hàng">
                {selectedOrder.deliveryMethodName}
              </Descriptions.Item>
              <Descriptions.Item label="Người nhận">
                {selectedOrder.receiverName}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.receiverPhone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ nhận hàng">
                {selectedOrder.receiverAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                {selectedOrder.shippingFee.toLocaleString()} VND
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                {selectedOrder.finalPrice.toLocaleString()} VND
              </Descriptions.Item>
            </Descriptions>

            <h3 className="text-lg font-semibold mt-4">Sản phẩm</h3>
            {selectedOrder.orderDetails.map((item) => (
              <div
                key={item.orderDetailId}
                className="flex items-center gap-4 border-b py-2"
              >
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    Màu: {item.color} | Size: {item.size}
                  </p>
                  <p>Số lượng: {item.quantity}</p>
                  <p>Giá: {item.price.toLocaleString()} VND</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
