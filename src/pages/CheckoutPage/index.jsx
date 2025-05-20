import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Radio,
  message,
  Card,
  Divider,
} from "antd";
import {
  addAddress,
  getAllAddress,
  getDefaultAddress,
} from "../../services/receiverAddressService";
import { getAllPaymentMethods } from "../../services/paymentMethodService";
import { getAllDeliveryMethods } from "../../services/deliveryMethodService";
import { createOrder } from "../../services/orderService";
import { toast } from "react-toastify";
import AddAddressModal from "../../components/address/AddAddressModal";
import { deleteCartItem } from "../../services/cartService";
import VoucherInput from "../../components/voucher/VoucherInput";

export default function CheckoutPage() {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddAddressModalVisible, setIsAddAddressModalVisible] =
    useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDefaultAddress();
    fetchPaymentMethods();
    fetchShippingMethods();
    fetchCartItems();
  }, []);
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await getAllAddress(); // Gọi API lấy danh sách địa chỉ
        setAddresses(response.data);
        // Đặt địa chỉ mặc định nếu có
        const defaultAddress = response.data.find((address) => address.default);
        setSelectedAddress(defaultAddress || null);
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast.error("Không thể tải danh sách địa chỉ!");
      }
    };

    fetchAddresses();
  }, []);
  const fetchDefaultAddress = async () => {
    try {
      const response = await getDefaultAddress();
      setDefaultAddress(response.data);
    } catch (error) {
      toast.error("Không thể tải địa chỉ mặc định!");
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await getAllPaymentMethods();
      setPaymentMethods(response.data);
    } catch {
      toast.error("Không thể tải phương thức thanh toán!");
    }
  };

  const fetchShippingMethods = async () => {
    try {
      const response = await getAllDeliveryMethods();
      setShippingMethods(response.data);
    } catch {
      toast.error("Không thể tải phương thức giao hàng!");
    }
  };

  const fetchCartItems = () => {
    const items = JSON.parse(localStorage.getItem("itemsToCheckout")) || [];
    setCartItems(items);
  };

  // const handleAddAddress = async (values) => {
  //   try {
  //     await addAddress(values);
  //     message.success("Thêm địa chỉ thành công!");
  //     setIsAddAddressModalVisible(false);
  //     fetchDefaultAddress();
  //   } catch {
  //     message.error("Không thể thêm địa chỉ!");
  //   }
  // };

  const handlePlaceOrder = async () => {
    try {
      const payload = {
        receiverAddressId: selectedAddress?.addressId,
        paymentMethodId: selectedPaymentMethod,
        deliveryMethodId: selectedShippingMethod,
        voucherId: selectedVoucher?.voucherId, // Thêm dòng này
        orderDetails: cartItems.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        })),
      };
      console.log("payload", payload);
      const response = await createOrder(payload);
      await deleteCartItem(cartItems.map((item) => item.productVariantId));
      localStorage.removeItem("itemsToCheckout");
      if (selectedPaymentMethod === 2) {
        window.location.href = response.data;
        
      } else {
        toast.success("Đặt hàng thành công!");
        window.location.href = "/order-history";
      }
    } catch {
      // toast.error(response.message);
      toast.error("Không thể đặt hàng!");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };
const calculateDiscount = () => {
  if (!selectedVoucher) return 0;
  if (selectedVoucher.discountType === "PERCENTAGE") {
    return Math.floor((calculateTotal() * selectedVoucher.discountValue) / 100);
  }
  // FIXED
  return Math.min(selectedVoucher.discountValue, calculateTotal());
};

const calculateFinalTotal = () => {
  return Math.max(0, calculateTotal() - calculateDiscount());
};
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Thanh toán</h1>

      {/* Địa chỉ nhận hàng */}
      <Card title="Địa chỉ nhận hàng" className="mb-6">
        {selectedAddress ? (
          <div>
            <p>
              <strong>Tên:</strong> {selectedAddress.receiverName}
            </p>
            <p>
              <strong>Điện thoại:</strong> {selectedAddress.receiverPhone}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {selectedAddress.street},{" "}
              {selectedAddress.ward}, {selectedAddress.district},{" "}
              {selectedAddress.city}
            </p>
            <Button type="link" onClick={() => setIsModalVisible(true)}>
              Thay đổi
            </Button>
          </div>
        ) : (
          <Button
            type="primary"
            onClick={() => setIsAddAddressModalVisible(true)}
          >
            Chọn địa chỉ
          </Button>
        )}
      </Card>
      {/* <Card title="Mã giảm giá" className="mb-6">
        <VoucherInput
          orderTotal={calculateTotal()}
          onApplyVoucher={setSelectedVoucher}
          selectedVoucher={selectedVoucher}
        />
      </Card> */}
      {/* Danh sách sản phẩm */}
      <Card title="Sản phẩm" className="mb-6">
        {cartItems.map((item) => (
          <div
            key={item.productVariantId}
            className="flex items-center justify-between py-2 border-b"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p className="font-semibold">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  Size: {item.size} | Màu: {item.color}
                </p>
                <p>Số lượng: {item.quantity}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">{item.price} VND</p>
              <p className="text-sm text-gray-500">
                Tổng: {item.quantity * item.price} VND
              </p>
            </div>
          </div>
        ))}
        <Divider />
        {selectedVoucher && (
          <div className="text-right text-green-600">
            Giảm giá: -{calculateDiscount()} VND
          </div>
        )}
        <div className="text-right font-bold text-lg">
          Tổng cộng: {calculateFinalTotal()} VND
        </div>
      </Card>

      {/* Phương thức thanh toán */}
      <Card title="Phương thức thanh toán" className="mb-6">
        <Radio.Group
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
          value={selectedPaymentMethod}
        >
          {paymentMethods.map((method) => (
            <Radio
              key={method.paymentMethodId}
              value={method.paymentMethodId}
              className="flex items-center gap-2 my-2"
            >
              <img
                src={method.paymentMethodLogo}
                alt={method.paymentMethodName}
                className="w-6 h-6 object-cover rounded-full"
              />
              {method.paymentMethodName}
            </Radio>
          ))}
        </Radio.Group>
      </Card>

      {/* Phương thức giao hàng */}
      <Card title="Phương thức giao hàng" className="mb-6">
        <Radio.Group
          onChange={(e) => setSelectedShippingMethod(e.target.value)}
          value={selectedShippingMethod}
        >
          {shippingMethods.map((method) => (
            <Radio
              key={method.deliveryMethodId}
              value={method.deliveryMethodId}
              className="flex items-start gap-4 my-2"
            >
              <img
                src={method.deliveryMethodLogo}
                alt={method.deliveryMethodName}
                className="w-10 h-10 object-cover"
              />
              <div>
                <p className="font-semibold">{method.deliveryMethodName}</p>
                <p className="text-sm text-gray-500">
                  {method.deliveryMethodDescription}
                </p>
                <p className="text-sm text-gray-500">
                  Phí giao hàng:{" "}
                  {method.deliveryFee === "0.0"
                    ? "Miễn phí"
                    : `${Number(method.deliveryFee).toLocaleString()} VND`}
                </p>
              </div>
            </Radio>
          ))}
        </Radio.Group>
      </Card>

      {/* Nút đặt hàng */}
      <Button
        type="primary"
        size="large"
        block
        onClick={handlePlaceOrder}
        disabled={
          !defaultAddress || !selectedPaymentMethod || !selectedShippingMethod
        }
      >
        Đặt hàng
      </Button>
      <Modal
        title="Chọn địa chỉ nhận hàng"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div
              key={address.addressId}
              className={`p-4 border rounded mb-2 ${
                selectedAddress?.addressId === address.addressId
                  ? "border-blue-500"
                  : ""
              }`}
              onClick={() => {
                setSelectedAddress(address); // Đặt địa chỉ được chọn
                setIsModalVisible(false); // Đóng modal
              }}
            >
              <p>
                <strong>Tên người nhận:</strong> {address.receiverName}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {address.receiverPhone}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {address.street}, {address.ward},{" "}
                {address.district}, {address.city}
              </p>
              {address.default && (
                <p className="text-green-500 font-semibold">[Mặc định]</p>
              )}
            </div>
          ))
        ) : (
          <p>Không có địa chỉ nào được lưu.</p>
        )}
      </Modal>
      {/* Modal thêm địa chỉ */}

      <Modal
        title="Chọn địa chỉ nhận hàng"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div
              key={address.addressId}
              className={`p-4 border rounded mb-2 ${
                selectedAddress?.addressId === address.addressId
                  ? "border-blue-500"
                  : ""
              }`}
              onClick={() => {
                setSelectedAddress(address); // Đặt địa chỉ được chọn
                setIsModalVisible(false); // Đóng modal
              }}
            >
              <p>
                <strong>Tên người nhận:</strong> {address.receiverName}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {address.receiverPhone}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {address.street}, {address.ward},{" "}
                {address.district}, {address.city}
              </p>
              {address.default && (
                <p className="text-green-500 font-semibold">[Mặc định]</p>
              )}
            </div>
          ))
        ) : (
          <p>Không có địa chỉ nào được lưu.</p>
        )}
      </Modal>
    </div>
  );
}


