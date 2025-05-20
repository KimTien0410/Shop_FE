import React, { useEffect, useState } from "react";
import { Checkbox, Button, InputNumber, Table, message } from "antd";
import { deleteCartItem, getCart, updateCart } from "../../services/cartService";
import { useCart } from "../../contexts/CartContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const { updateCartCount } = useCart();
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await getCart();
        console.log("Cart data:", response);
          const items = response.data.cartDetailResponses;
        setCartItems(items);
        // Cập nhật số lượng sản phẩm trong giỏ hàng
        const totalCount = items.reduce(
          (total, item) => total + item.quantity,
          0
        );
        updateCartCount(totalCount);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        toast.error("Không thể tải giỏ hàng!");
      }
    };
    fetchCartItems();
  }, [updateCartCount]);

  // Xử lý chọn checkbox
  const handleSelectItem = (cartDetailId, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, cartDetailId]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== cartDetailId));
    }
  };

  // Xử lý tăng/giảm số lượng
  const handleQuantityChange = async (cartDetailId,productVariantId, value) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartDetailId === cartDetailId ? { ...item, quantity: value } : item
        )
      );
    try {
      await updateCart({ productVariantId, quantity: value });
      message.success("Cập nhật số lượng thành công!");
      // Cập nhật số lượng sản phẩm trong giỏ hàng
      const totalCount = cartItems.reduce(
        (total, item) =>
          item.cartDetailId === cartDetailId
            ? total + value
            : total + item.quantity,
        0
      );
      updateCartCount(totalCount);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật số lượng!");
    }
  };

  // Xử lý xóa sản phẩm
  const handleDeleteItem = async (cartDetailId, productVariantId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.cartDetailId !== cartDetailId)
    );
    setSelectedItems((prevSelected) =>
      prevSelected.filter((id) => id !== cartDetailId)
    );
    

    try {
      await deleteCartItem([productVariantId]);
      toast.success("Sản phẩm đã được xóa khỏi giỏ hàng!");
      // Cập nhật số lượng sản phẩm trong giỏ hàng
      const totalCount = cartItems.reduce(
        (total, item) =>
          item.cartDetailId === cartDetailId ? total : total + item.quantity,
        0
      );
      updateCartCount(totalCount);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa sản phẩm!");
    }
  };

  // Xử lý thanh toán
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }
    const itemsToCheckout = cartItems.filter((item) =>
      selectedItems.includes(item.cartDetailId)
    );
    localStorage.setItem("itemsToCheckout", JSON.stringify(itemsToCheckout));
    navigate("/checkout");
    // navigate("/checkout", {
    //   state: { itemsToCheckout }
    // });
    // console.log("Thanh toán các sản phẩm:", itemsToCheckout);
    // message.success("Thanh toán thành công!");
  };

  // Cột của bảng
  const columns = [
    {
      title: "",
      dataIndex: "checkbox",
      render: (_, record) => (
        <Checkbox
          checked={selectedItems.includes(record.cartDetailId)}
          onChange={(e) =>
            handleSelectItem(record.cartDetailId, e.target.checked)
          }
        />
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "productImage",
      render: (imageUrl) => (
        <img src={imageUrl} alt="Product" className="w-16 h-16 object-cover" />
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      render: (_, record) => (
        <div>
          <p className="font-bold">{record.productName}</p>
          <p className="text-sm text-gray-500">
            Màu: {record.color}, Size: {record.size}
          </p>
        </div>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      render: (price) => <p>{price.toLocaleString()} VND</p>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (_, record) => (
        <InputNumber
          min={1}
          max={99}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.cartDetailId,record.productVariantId, value)}
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "subTotal",
      render: (_, record) => (
        <p>{(record.price * record.quantity).toLocaleString()} VND</p>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "actions",
      render: (_, record) => (
        <Button danger onClick={() => handleDeleteItem(record.cartDetailId, record.productVariantId)}>
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng</h1>
      <Table
        dataSource={cartItems}
        columns={columns}
        rowKey="cartDetailId"
        pagination={false}
      />
      <div className="flex justify-between items-center mt-6">
        <p className="text-lg font-semibold">
          Tổng tiền:{" "}
          {cartItems
            .filter((item) => selectedItems.includes(item.cartDetailId))
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toLocaleString()}{" "}
          VND
        </p>
        <Button
          type="primary"
          size="large"
          onClick={handleCheckout}
          disabled={selectedItems.length === 0}
        >
          Mua hàng
        </Button>
      </div>
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import { Checkbox, Button, InputNumber, Table, message } from "antd";

// import { getCart } from "../../services/cartService";

// export default function CartPage() {
//   // Dữ liệu giả lập từ API
//   const [cartItems, setCartItems] = useState([]);
//   useEffect(() => {

//     const fetchCartItems = async () => {
//       const response = await getCart();
//         console.log("cart",response);
//       setCartItems(response.data.cartDetailResponses);
//     };
//     fetchCartItems();
//   }, []);

//   const [selectedItems, setSelectedItems] = useState([]);

//   // Xử lý chọn checkbox
//   const handleSelectItem = (cartDetailId, checked) => {
//     if (checked) {
//       setSelectedItems([...selectedItems, cartDetailId]);
//     } else {
//       setSelectedItems(selectedItems.filter((id) => id !== cartDetailId));
//     }
//   };

//   // Xử lý tăng/giảm số lượng
//   const handleQuantityChange = (cartDetailId, value) => {
//     setCartItems((prevItems) =>
//       prevItems.map((item) =>
//         item.cartDetailId === cartDetailId ? { ...item, quantity: value } : item
//       )
//     );
//   };

//   // Xử lý xóa sản phẩm
//   const handleDeleteItem = (cartDetailId) => {
//     setCartItems((prevItems) =>
//       prevItems.filter((item) => item.cartDetailId !== cartDetailId)
//     );
//     setSelectedItems((prevSelected) =>
//       prevSelected.filter((id) => id !== cartDetailId)
//     );
//     message.success("Sản phẩm đã được xóa khỏi giỏ hàng!");
//   };

//   // Xử lý thanh toán
//   const handleCheckout = () => {
//     if (selectedItems.length === 0) {
//       message.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
//       return;
//     }
//     const itemsToCheckout = cartItems.filter((item) =>
//       selectedItems.includes(item.cartDetailId)
//     );
//     console.log("Thanh toán các sản phẩm:", itemsToCheckout);
//     message.success("Thanh toán thành công!");
//   };

//   // Cột của bảng
//   const columns = [
//     {
//       title: "",
//       dataIndex: "checkbox",
//       render: (_, record) => (
//         <Checkbox
//           checked={selectedItems.includes(record.cartDetailId)}
//           onChange={(e) =>
//             handleSelectItem(record.cartDetailId, e.target.checked)
//           }
//         />
//       ),
//     },
//     {
//       title: "Hình ảnh",
//       dataIndex: "imageUrl",
//         render: (imageUrl) => (
//             <img src={product.productImage}  alt="Product" className="w-16 h-16 object-cover" />
//       ),
//     },
//     {
//       title: "Sản phẩm",
//       dataIndex: "productName",
//       render: (_, record) => (
//         <div>
//           <p className="font-bold">{record.productName}</p>
//           <p className="text-sm text-gray-500">
//             Màu: {record.color}, Size: {record.size}
//           </p>
//         </div>
//       ),
//     },
//     {
//       title: "Đơn giá",
//       dataIndex: "price",
//       render: (price) => <p>{price.toLocaleString()} VND</p>,
//     },
//     {
//       title: "Số lượng",
//       dataIndex: "quantity",
//       render: (_, record) => (
//         <InputNumber
//           min={1}
//           max={99}
//           value={record.quantity}
//           onChange={(value) => handleQuantityChange(record.cartDetailId, value)}
//         />
//       ),
//     },
//     {
//       title: "Thành tiền",
//       dataIndex: "total",
//       render: (_, record) => (
//         <p>{(record.price * record.quantity).toLocaleString()} VND</p>
//       ),
//     },
//     {
//       title: "Hành động",
//       dataIndex: "actions",
//       render: (_, record) => (
//         <Button danger onClick={() => handleDeleteItem(record.cartDetailId)}>
//           Xóa
//         </Button>
//       ),
//     },
//   ];

//   return (
//     <div className="max-w-7xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Giỏ hàng</h1>
//       <Table
//         dataSource={cartItems}
//         columns={columns}
//         rowKey="cartDetailId"
//         pagination={false}
//       />
//       <div className="flex justify-between items-center mt-6">
//         <p className="text-lg font-semibold">
//           Tổng tiền:{" "}
//           {cartItems
//             .filter((item) => selectedItems.includes(item.cartDetailId))
//             .reduce((total, item) => total + item.price * item.quantity, 0)
//             .toLocaleString()}{" "}
//           VND
//         </p>
//         <Button
//           type="primary"
//           size="large"
//           onClick={handleCheckout}
//           disabled={selectedItems.length === 0}
//         >
//           Thanh toán
//         </Button>
//       </div>
//     </div>
//   );
// }
