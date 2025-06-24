import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Descriptions,
  Tag,
  message,
  Pagination,
  Tabs,
  Table,
  Rate,
  Input,
} from "antd";
import { cancelOrder, getOrderHistory } from "../../services/orderService";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { submitReview } from "../../services/reviewService";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("PENDING");

  const pageSize = 4;
  const location = useLocation();
  const ORDER_TABS = [
    { key: "PENDING", label: "Đang chờ xử lý" },
    { key: "IN_PROGRESS", label: "Đang xử lý" },
    { key: "SHIPPED", label: "Đang giao hàng" },
    { key: "DELIVERED", label: "Đã giao" },
    { key: "CANCELLED", label: "Đã hủy" },
  ];

  const filteredOrders =
    activeTab === "ALL"
      ? orders
      : orders.filter((order) => order.orderStatus === activeTab);

  const pagedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderCode = params.get("orderCode");
    if (
      params.get("cancel") === "true" &&
      params.get("status") === "CANCELLED" &&
      orderCode
    ) {
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
      const response = await getOrderHistory();
      setOrders(response.data.content);
    } catch (error) {
      message.error("Không thể tải lịch sử đơn hàng!");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);
      toast.success("Hủy đơn hàng thành công!");
      fetchOrderHistory();
    } catch (error) {
      toast.error("Không thể hủy đơn hàng!");
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const onOk = async () => {
    try {
      const form = new FormData();
      form.append("productId", reviewProduct.productId);
      form.append("reviewRating", reviewRating);
      form.append("reviewComment", reviewComment);
      await submitReview(form);
      toast.success("Đánh giá thành công!");
      setIsReviewModalVisible(false);
      // Cập nhật lại trạng thái đã đánh giá nếu muốn
      fetchOrderHistory();
    } catch {
      toast.error("Gửi đánh giá thất bại!");
    }
  };

  // Helper để render trạng thái đơn hàng
  const renderStatus = (status) => {
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
  };

  // Table columns
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      render: (text) => (
        <span className="font-semibold text-blue-700">{text}</span>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => renderStatus(status),
    },
    {
      title: "Sản phẩm",
      dataIndex: "orderDetails",
      key: "orderDetails",
      render: (details, record) => (
        <div className="space-y-1">
          {details.map((item) => (
            <div key={item.orderDetailId} className="flex items-center gap-2">
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-10 h-10 object-cover rounded border"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/no-image.png";
                }}
              />
              <div>
                <div className="font-medium">{item.productName}</div>
                <div className="text-xs text-gray-400">
                  Màu: {item.color} | Size: {item.size} | SL: {item.quantity}
                </div>
                <div className="text-xs">
                  Giá: {item.price.toLocaleString()} VND
                </div>
                {record.orderStatus === "DELIVERED" && (
                  <Button
                    size="small"
                    type={item.isReviewed ? "default" : "primary"}
                    className={
                      item.isReviewed ? "border-green-500 text-green-600" : ""
                    }
                    onClick={() => {
                      setReviewProduct(item);
                      setIsReviewModalVisible(true);
                      setReviewRating(item.reviewRating || 5);
                      setReviewComment(item.reviewComment || "");
                    }}
                  >
                    {item.isReviewed ? "Đã đánh giá" : "Đánh giá"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (price) => (
        <span className="text-red-500 font-bold">
          {price.toLocaleString()} VND
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div className="flex flex-col gap-1">
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
    <div className="min-h-screen max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Lịch sử đơn hàng</h1>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setCurrentPage(1);
        }}
        items={ORDER_TABS.map((tab) => ({
          key: tab.key,
          label: tab.label,
        }))}
        className="mb-6"
      />
      <Table
        columns={columns}
        dataSource={pagedOrders}
        rowKey="orderId"
        pagination={false}
        bordered
        className="bg-white rounded-xl shadow"
        locale={{ emptyText: "Không có đơn hàng nào." }}
      />
      <div className="flex justify-center mt-8">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredOrders.length}
          onChange={setCurrentPage}
          showSizeChanger={false}
        />
      </div>
      {/* Modal chi tiết đơn hàng */}
      <Modal
        title="Chi tiết đơn hàng"
        open={isModalVisible}
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
                {renderStatus(selectedOrder.orderStatus)}
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
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/no-image.png";
                  }}
                />
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    Màu: {item.color} | Size: {item.size}
                  </p>
                  <p>Số lượng: {item.quantity}</p>
                  <p>Giá: {item.price.toLocaleString()} VND</p>
                  {selectedOrder.orderStatus === "DELIVERED" && (
                    <Button
                      type="primary"
                      size="small"
                      className="mt-2"
                      onClick={() => {
                        setReviewProduct(item);
                        setIsReviewModalVisible(true);
                        setReviewRating(5);
                        setReviewComment("");
                      }}
                    >
                      Đánh giá
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
      {/* Modal đánh giá sản phẩm */}
      <Modal
        title={`Đánh giá sản phẩm${
          reviewProduct ? `: ${reviewProduct.productName}` : ""
        }`}
        open={isReviewModalVisible}
        onCancel={() => setIsReviewModalVisible(false)}
        onOk={onOk}
        okText="Gửi đánh giá"
      >
        <div className="mb-3">
          <span className="font-medium">Chọn số sao:</span>
          <Rate value={reviewRating} onChange={setReviewRating} />
        </div>
        <div>
          <span className="font-medium">Nội dung đánh giá:</span>
          <Input.TextArea
            rows={4}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Nhập nội dung đánh giá..."
          />
        </div>
      </Modal>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   Modal,
//   Descriptions,
//   Tag,
//   message,
//   Pagination,
//   Tabs,
// } from "antd";
// import { cancelOrder, getOrderHistory } from "../../services/orderService";
// import { toast } from "react-toastify";
// import { useLocation } from "react-router-dom";
// import { Rate, Input } from "antd";
// import { submitReview } from "../../services/reviewService";
// export default function OrderHistoryPage() {
//   const [orders, setOrders] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
//   const [reviewProduct, setReviewProduct] = useState(null);
//   const [reviewRating, setReviewRating] = useState(5);
//   const [reviewComment, setReviewComment] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [activeTab, setActiveTab] = useState("PENDING");

//   const pageSize = 4; // Số đơn hàng mỗi trang
//   const location = useLocation();
//   const ORDER_TABS = [
//     { key: "PENDING", label: "Đang chờ xử lý" },
//     { key: "IN_PROGRESS", label: "Đang xử lý" },
//     { key: "SHIPPED", label: "Đang giao hàng" },
//     { key: "DELIVERED", label: "Đã giao" },
//     { key: "CANCELLED", label: "Đã hủy" },
//   ];

//   const filteredOrders =
//     activeTab === "ALL"
//       ? orders
//       : orders.filter((order) => order.orderStatus === activeTab);

//   const pagedOrders = filteredOrders.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );
//   // Tính toán dữ liệu phân trang
//   // const pagedOrders = orders.slice(
//   //   (currentPage - 1) * pageSize,
//   //   currentPage * pageSize
//   // );

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const orderCode = params.get("orderCode");
//     if (
//       params.get("cancel") === "true" &&
//       params.get("status") === "CANCELLED" &&
//       orderCode
//     ) {
//       // Gọi API hủy đơn hàng với orderCode
//       cancelOrder(orderCode)
//         .then(() => {
//           toast.success("Hủy đơn hàng thành công!", { autoClose: 3000 });
//           fetchOrderHistory();
//         })
//         .catch(() => {
//           toast.error("Không thể hủy đơn hàng!");
//         });
//     }
//     if (params.get("status") === "PAID") {
//       toast.success("Thanh toán thành công!", { autoClose: 3000 });
//     }
//   }, [location.search]);

//   useEffect(() => {
//     fetchOrderHistory();
//   }, []);

//   const fetchOrderHistory = async () => {
//     try {
//       const response = await getOrderHistory(); // Gọi API lấy lịch sử đơn hàng
//       console.log("Response order history data:", response.data); // Log dữ liệu phản hồi
//       setOrders(response.data.content);
//     } catch (error) {
//       console.error("Error fetching order history:", error);
//       message.error("Không thể tải lịch sử đơn hàng!");
//     }
//   };

//   const handleCancelOrder = async (orderId) => {
//     try {
//       await cancelOrder(orderId); // Gọi API hủy đơn hàng
//       toast.success("Hủy đơn hàng thành công!");
//       fetchOrderHistory(); // Cập nhật danh sách đơn hàng
//     } catch (error) {
//       console.error("Error canceling order:", error);
//       toast.error("Không thể hủy đơn hàng!");
//     }
//   };

//   const handleViewOrderDetails = (order) => {
//     setSelectedOrder(order); // Lưu thông tin đơn hàng được chọn
//     setIsModalVisible(true); // Hiển thị modal chi tiết đơn hàng
//   };
//   const onOk = async () => {
//     try {
//       const form = new FormData();
//       form.append("productId", reviewProduct.productId);
//       form.append("reviewRating", reviewRating);
//       form.append("reviewComment", reviewComment);
//       await submitReview(form);
//       toast.success("Đánh giá thành công!");
//       setIsReviewModalVisible(false);
//     } catch {
//       toast.error("Gửi đánh giá thất bại!");
//     }
//   };

//   // Helper để render trạng thái đơn hàng
//   const renderStatus = (status) => {
//     let color = "";
//     let text = "";
//     switch (status) {
//       case "PENDING":
//         color = "blue";
//         text = "Đang chờ xử lý";
//         break;
//       case "IN_PROGRESS":
//         color = "orange";
//         text = "Đang xử lý";
//         break;
//       case "SHIPPED":
//         color = "purple";
//         text = "Đang giao hàng";
//         break;
//       case "DELIVERED":
//         color = "green";
//         text = "Đã giao";
//         break;
//       case "CANCELLED":
//         color = "red";
//         text = "Đã hủy";
//         break;
//       default:
//         color = "default";
//         text = "Không xác định";
//     }
//     return <Tag color={color}>{text}</Tag>;
//   };
//   return (
//     <div className="min-h-screen max-w-6xl mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6 text-center">Lịch sử đơn hàng</h1>
//       <Tabs
//         activeKey={activeTab}
//         onChange={(key) => {
//           setActiveTab(key);
//           setCurrentPage(1); // reset về trang 1 khi đổi tab
//         }}
//         items={ORDER_TABS.map((tab) => ({
//           key: tab.key,
//           label: tab.label,
//         }))}
//         className="mb-6"
//       />
//       <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
//         {pagedOrders.length === 0 && (
//           <div className="col-span-2 text-center text-gray-500">
//             Không có đơn hàng nào.
//           </div>
//         )}
//         {pagedOrders.map((order) => (
//           <div
//             key={order.orderId}
//             className="bg-white rounded-xl shadow p-5 flex flex-col gap-3 border"
//           >
//             <div className="flex justify-between items-center">
//               <div>
//                 <span className="font-semibold">Mã đơn hàng:</span>{" "}
//                 {order.orderId}
//                 {/* {renderStatus(order.orderStatus)} */}
//               </div>

//               {/* {renderStatus(order.orderStatus)} */}
//               <div className="flex gap-2">
//                 <Button
//                   type="link"
//                   onClick={() => handleViewOrderDetails(order)}
//                 >
//                   Xem chi tiết
//                 </Button>
//                 {order.orderStatus === "PENDING" && (
//                   <Button
//                     type="link"
//                     danger
//                     onClick={() => handleCancelOrder(order.orderId)}
//                   >
//                     Hủy đơn hàng
//                   </Button>
//                 )}
//               </div>
//             </div>
//             <div>
//               <span className="font-semibold">Ngày đặt:</span>{" "}
//               {new Date(order.orderDate).toLocaleString()}
//             </div>
//             <div>
//               <span className="font-semibold">Sản phẩm:</span>
//               <div className="divide-y mt-2">
//                 {order.orderDetails.map((item) => (
//                   <div
//                     key={item.orderDetailId}
//                     className="flex items-center gap-3 py-2"
//                   >
//                     <img
//                       src={item.productImage}
//                       alt={item.productName}
//                       className="w-14 h-14 object-cover rounded border"
//                     />
//                     <div className="flex-1">
//                       <div className="font-medium">{item.productName}</div>
//                       <div className="text-sm text-gray-500">
//                         Màu: {item.color} | Size: {item.size}
//                       </div>
//                       <div className="text-sm">
//                         SL: {item.quantity} | Giá: {item.price.toLocaleString()}{" "}
//                         VND
//                       </div>
//                     </div>
//                     {order.orderStatus === "DELIVERED" && (
//                       <Button
//                         type="primary"
//                         size="small"
//                         onClick={() => {
//                           setReviewProduct(item);
//                           setIsReviewModalVisible(true);
//                           setReviewRating(5);
//                           setReviewComment("");
//                         }}
//                       >
//                         Đánh giá
//                       </Button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <span className="font-semibold">Phí vận chuyển:</span>{" "}
//               {order.shippingFee.toLocaleString()} VND
//             </div>
//             <div>
//               <span className="font-semibold">Giảm giá:</span>{" "}
//               {order.discountPrice.toLocaleString()} VND
//             </div>
//             <div>
//               <span className="font-semibold">Tổng tiền:</span>{" "}
//               <span className="text-red-500 font-bold">
//                 {order.finalPrice.toLocaleString()} VND
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>
//       {/* <div className="flex justify-center mt-8">
//         <Pagination
//           current={currentPage}
//           pageSize={pageSize}
//           total={orders.length}
//           onChange={setCurrentPage}
//           showSizeChanger={false}
//         />
//       </div> */}
//       {/* Modal chi tiết đơn hàng */}
//       <Modal
//         title="Chi tiết đơn hàng"
//         open={isModalVisible}
//         onCancel={() => setIsModalVisible(false)}
//         footer={null}
//       >
//         {selectedOrder && (
//           <div>
//             <Descriptions bordered column={1}>
//               <Descriptions.Item label="Mã đơn hàng">
//                 {selectedOrder.orderId}
//               </Descriptions.Item>
//               <Descriptions.Item label="Ngày đặt hàng">
//                 {new Date(selectedOrder.orderDate).toLocaleString()}
//               </Descriptions.Item>
//               <Descriptions.Item label="Trạng thái">
//                 {renderStatus(selectedOrder.orderStatus)}
//               </Descriptions.Item>
//               <Descriptions.Item label="Phương thức thanh toán">
//                 {selectedOrder.paymentMethodName}
//               </Descriptions.Item>
//               <Descriptions.Item label="Phương thức giao hàng">
//                 {selectedOrder.deliveryMethodName}
//               </Descriptions.Item>
//               <Descriptions.Item label="Người nhận">
//                 {selectedOrder.receiverName}
//               </Descriptions.Item>
//               <Descriptions.Item label="Số điện thoại">
//                 {selectedOrder.receiverPhone}
//               </Descriptions.Item>
//               <Descriptions.Item label="Địa chỉ nhận hàng">
//                 {selectedOrder.receiverAddress}
//               </Descriptions.Item>
//               <Descriptions.Item label="Phí vận chuyển">
//                 {selectedOrder.shippingFee.toLocaleString()} VND
//               </Descriptions.Item>
//               <Descriptions.Item label="Tổng tiền">
//                 {selectedOrder.finalPrice.toLocaleString()} VND
//               </Descriptions.Item>
//             </Descriptions>
//             <h3 className="text-lg font-semibold mt-4">Sản phẩm</h3>
//             {selectedOrder.orderDetails.map((item) => (
//               <div
//                 key={item.orderDetailId}
//                 className="flex items-center gap-4 border-b py-2"
//               >
//                 <img
//                   src={item.productImage}
//                   alt={item.productName}
//                   className="w-16 h-16 object-cover rounded"
//                 />
//                 <div>
//                   <p className="font-semibold">{item.productName}</p>
//                   <p className="text-sm text-gray-500">
//                     Màu: {item.color} | Size: {item.size}
//                   </p>
//                   <p>Số lượng: {item.quantity}</p>
//                   <p>Giá: {item.price.toLocaleString()} VND</p>
//                   {selectedOrder.orderStatus === "DELIVERED" && (
//                     <Button
//                       type="primary"
//                       size="small"
//                       className="mt-2"
//                       onClick={() => {
//                         setReviewProduct(item);
//                         setIsReviewModalVisible(true);
//                         setReviewRating(5);
//                         setReviewComment("");
//                       }}
//                     >
//                       Đánh giá
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </Modal>
//       {/* Modal đánh giá sản phẩm */}
//       <Modal
//         title={`Đánh giá sản phẩm${
//           reviewProduct ? `: ${reviewProduct.productName}` : ""
//         }`}
//         open={isReviewModalVisible}
//         onCancel={() => setIsReviewModalVisible(false)}
//         onOk={onOk}
//         okText="Gửi đánh giá"
//       >
//         <div className="mb-3">
//           <span className="font-medium">Chọn số sao:</span>
//           <Rate value={reviewRating} onChange={setReviewRating} />
//         </div>
//         <div>
//           <span className="font-medium">Nội dung đánh giá:</span>
//           <Input.TextArea
//             rows={4}
//             value={reviewComment}
//             onChange={(e) => setReviewComment(e.target.value)}
//             placeholder="Nhập nội dung đánh giá..."
//           />
//         </div>
//       </Modal>
//     </div>
//   );
// }
