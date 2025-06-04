
import React, { useState, useEffect } from "react";
import { ShoppingBag, MapPin, CreditCard, Truck, Tag } from "lucide-react";
import {
  addAddress,
  getAllAddress,
  getDefaultAddress,
} from "../../services/receiverAddressService";
import { getAllPaymentMethods } from "../../services/paymentMethodService";
import { getAllDeliveryMethods } from "../../services/deliveryMethodService";
import { createOrder } from "../../services/orderService";
import { toast } from "react-toastify";
import { deleteCartItem } from "../../services/cartService";
import VoucherInput from "../../components/voucher/VoucherInput";

export default function CheckoutPage() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [isAddAddressModalVisible, setIsAddAddressModalVisible] =
    useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAddresses();
    fetchDefaultAddress();
    fetchPaymentMethods();
    fetchShippingMethods();
    fetchCartItems();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await getAllAddress();
      setAddresses(response.data);
      // Set default address if available
      const defaultAddr = response.data.find((address) => address.default);
      if (defaultAddr && !selectedAddress) {
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Không thể tải danh sách địa chỉ!");
    }
  };

  const fetchDefaultAddress = async () => {
    try {
      const response = await getDefaultAddress();
      setDefaultAddress(response.data);
      setSelectedAddress(response.data);
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

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPaymentMethod || !selectedShippingMethod) {
      toast.warning("Vui lòng chọn đầy đủ thông tin trước khi đặt hàng!");
      return;
    }

    try {
      setIsProcessing(true);
      const payload = {
        receiverAddressId: selectedAddress?.addressId,
        paymentMethodId: selectedPaymentMethod,
        deliveryMethodId: selectedShippingMethod,
        voucherId: selectedVoucher?.voucherId,
        orderDetails: cartItems.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        })),
      };

      const response = await createOrder(payload);
      await deleteCartItem(cartItems.map((item) => item.productVariantId));
      localStorage.removeItem("itemsToCheckout");

      if (selectedPaymentMethod === 2) {
        window.location.href = response.data;
      } else {
        toast.success("Đặt hàng thành công!");
        window.location.href = "/order-history";
      }
    } catch (error) {
      toast.error("Không thể đặt hàng! Vui lòng thử lại sau.");
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;

    if (selectedVoucher.discountType === "PERCENTAGE") {
      return Math.floor(
        (calculateSubtotal() * selectedVoucher.discountValue) / 100
      );
    }
    // Fixed discount
    return Math.min(selectedVoucher.discountValue, calculateSubtotal());
  };

  const calculateShippingFee = () => {
    if (!selectedShippingMethod) return 0;
    const method = shippingMethods.find(
      (m) => m.deliveryMethodId === selectedShippingMethod
    );
    return method ? parseFloat(method.deliveryFee) : 0;
  };

  const calculateTotal = () => {
    return Math.max(
      0,
      calculateSubtotal() - calculateDiscount() + calculateShippingFee()
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // Address Modal Component
  const AddressSelectionModal = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        isAddressModalVisible ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Chọn địa chỉ nhận hàng</h2>
          <button
            onClick={() => setIsAddressModalVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.addressId}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-400 ${
                  selectedAddress?.addressId === address.addressId
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
                onClick={() => {
                  setSelectedAddress(address);
                  setIsAddressModalVisible(false);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{address.receiverName}</p>
                    <p className="text-gray-700">{address.receiverPhone}</p>
                    <p className="text-gray-600 mt-1">
                      {address.street}, {address.ward}, {address.district},{" "}
                      {address.city}
                    </p>
                  </div>
                  {address.default && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Mặc định
                    </span>
                  )}
                </div>
              </div>
            ))}
            <button
              className="w-full py-2 mt-2 text-blue-600 font-medium border border-blue-600 rounded-lg hover:bg-blue-50"
              onClick={() => {
                setIsAddressModalVisible(false);
                setIsAddAddressModalVisible(true);
              }}
            >
              + Thêm địa chỉ mới
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="mb-4 text-gray-600">Không có địa chỉ nào được lưu.</p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              onClick={() => {
                setIsAddressModalVisible(false);
                setIsAddAddressModalVisible(true);
              }}
            >
              Thêm địa chỉ mới
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="text-blue-600" size={20} />
                  <h2 className="text-lg font-semibold">Địa chỉ nhận hàng</h2>
                </div>
                {selectedAddress && (
                  <button
                    onClick={() => setIsAddressModalVisible(true)}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Thay đổi
                  </button>
                )}
              </div>

              {selectedAddress ? (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="font-medium">
                    {selectedAddress.receiverName} |{" "}
                    {selectedAddress.receiverPhone}
                  </p>
                  <p className="text-gray-600 mt-1">
                    {selectedAddress.street}, {selectedAddress.ward},{" "}
                    {selectedAddress.district}, {selectedAddress.city}
                  </p>
                  {selectedAddress.default && (
                    <span className="inline-flex items-center mt-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      <span className="text-sm mr-1">✓</span> Mặc định
                    </span>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAddressModalVisible(true)}
                  className="w-full py-3 border border-blue-600 text-blue-600 rounded-lg text-center font-medium hover:bg-blue-50"
                >
                  + Chọn địa chỉ nhận hàng
                </button>
              )}
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="text-blue-600" size={20} />
                <h2 className="text-lg font-semibold">
                  Sản phẩm ({cartItems.length})
                </h2>
              </div>

              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.productVariantId} className="py-4 flex gap-4">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-md border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.productName}</p>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <span className="mr-3">Size: {item.size}</span>
                        <span>Màu: {item.color}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">
                          SL: {item.quantity}
                        </span>
                        <span className="font-medium">
                          {formatPrice(item.price)} ₫
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="text-blue-600" size={20} />
                <h2 className="text-lg font-semibold">
                  Phương thức thanh toán
                </h2>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.paymentMethodId}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPaymentMethod === method.paymentMethodId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() =>
                      setSelectedPaymentMethod(method.paymentMethodId)
                    }
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedPaymentMethod === method.paymentMethodId
                          ? "border-blue-500"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedPaymentMethod === method.paymentMethodId && (
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                      )}
                    </div>

                    <img
                      src={method.paymentMethodLogo}
                      alt={method.paymentMethodName}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="font-medium">
                      {method.paymentMethodName}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Methods */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="text-blue-600" size={20} />
                <h2 className="text-lg font-semibold">
                  Phương thức vận chuyển
                </h2>
              </div>

              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <div
                    key={method.deliveryMethodId}
                    className={`flex p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedShippingMethod === method.deliveryMethodId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() =>
                      setSelectedShippingMethod(method.deliveryMethodId)
                    }
                  >
                    <div className="flex items-center gap-3 mr-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedShippingMethod === method.deliveryMethodId
                            ? "border-blue-500"
                            : "border-gray-400"
                        }`}
                      >
                        {selectedShippingMethod === method.deliveryMethodId && (
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                        )}
                      </div>

                      <img
                        src={method.deliveryMethodLogo}
                        alt={method.deliveryMethodName}
                        className="w-10 h-10 object-contain"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {method.deliveryMethodName}
                        </span>
                        <span className="font-medium">
                          {method.deliveryFee === "0.0"
                            ? "Miễn phí"
                            : `${formatPrice(
                                parseFloat(method.deliveryFee)
                              )} ₫`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {method.deliveryMethodDescription}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Voucher */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="text-blue-600" size={20} />
                <h2 className="text-lg font-semibold">Mã giảm giá</h2>
              </div>

              {selectedVoucher ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-blue-700 font-medium">
                        {selectedVoucher.voucherCode}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedVoucher.discountType === "PERCENTAGE"
                          ? `Giảm ${selectedVoucher.discountValue}%`
                          : `Giảm ${formatPrice(
                              selectedVoucher.discountValue
                            )} ₫`}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedVoucher(null)}
                      className="text-red-500 text-sm font-medium hover:underline"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <VoucherInput
                  orderTotal={calculateSubtotal()}
                  onApplyVoucher={setSelectedVoucher}
                  selectedVoucher={selectedVoucher}
                />
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Tổng thanh toán</h2>

              <div className="space-y-3 pb-4 border-b border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span>{formatPrice(calculateSubtotal())} ₫</span>
                </div>

                {selectedVoucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(calculateDiscount())} ₫</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span>
                    {calculateShippingFee() === 0
                      ? "Miễn phí"
                      : `${formatPrice(calculateShippingFee())} ₫`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 mb-6">
                <span className="font-semibold">Tổng cộng</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(calculateTotal())} ₫
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={
                  !selectedAddress ||
                  !selectedPaymentMethod ||
                  !selectedShippingMethod ||
                  isProcessing
                }
                className={`w-full py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 
                  ${
                    !selectedAddress ||
                    !selectedPaymentMethod ||
                    !selectedShippingMethod ||
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                {isProcessing ? "Đang xử lý..." : "Đặt hàng"}
                {!isProcessing && <span className="ml-1">→</span>}
              </button>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Bằng cách đặt hàng, bạn đồng ý với điều khoản và chính sách của
                chúng tôi
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Selection Modal */}
      <AddressSelectionModal />

      {/* Add Address Modal would be implemented here */}
      {isAddAddressModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Thêm địa chỉ mới</h2>
            {/* Add Address form would be implemented here */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsAddAddressModalVisible(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => setIsAddAddressModalVisible(false)}
              >
                Thêm địa chỉ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import {
//   ShoppingBag,
//   MapPin,
//   CreditCard,
//   Truck,
//   Tag,
//   Check,
//   ArrowRight,
// } from "lucide-react";
// import {
//   addAddress,
//   getAllAddress,
//   getDefaultAddress,
// } from "../../services/receiverAddressService";
// import { getAllPaymentMethods } from "../../services/paymentMethodService";
// import { getAllDeliveryMethods } from "../../services/deliveryMethodService";
// import { createOrder } from "../../services/orderService";
// import { toast } from "react-toastify";
// import { deleteCartItem } from "../../services/cartService";
// import VoucherInput from "../../components/voucher/VoucherInput";

// export default function CheckoutPage() {
//   const [addresses, setAddresses] = useState([]);
//   const [selectedAddress, setSelectedAddress] = useState(null);
//   const [defaultAddress, setDefaultAddress] = useState(null);
//   const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
//   const [isAddAddressModalVisible, setIsAddAddressModalVisible] =
//     useState(false);
//   const [selectedVoucher, setSelectedVoucher] = useState(null);
//   const [cartItems, setCartItems] = useState([]);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [shippingMethods, setShippingMethods] = useState([]);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
//   const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);

//   useEffect(() => {
//     fetchAddresses();
//     fetchDefaultAddress();
//     fetchPaymentMethods();
//     fetchShippingMethods();
//     fetchCartItems();
//   }, []);

//   const fetchAddresses = async () => {
//     try {
//       const response = await getAllAddress();
//       setAddresses(response.data);
//       // Set default address if available
//       const defaultAddr = response.data.find((address) => address.default);
//       if (defaultAddr && !selectedAddress) {
//         setSelectedAddress(defaultAddr);
//       }
//     } catch (error) {
//       console.error("Error fetching addresses:", error);
//       toast.error("Không thể tải danh sách địa chỉ!");
//     }
//   };

//   const fetchDefaultAddress = async () => {
//     try {
//       const response = await getDefaultAddress();
//       setDefaultAddress(response.data);
//       setSelectedAddress(response.data);
//     } catch (error) {
//       toast.error("Không thể tải địa chỉ mặc định!");
//     }
//   };

//   const fetchPaymentMethods = async () => {
//     try {
//       const response = await getAllPaymentMethods();
//       setPaymentMethods(response.data);
//     } catch {
//       toast.error("Không thể tải phương thức thanh toán!");
//     }
//   };

//   const fetchShippingMethods = async () => {
//     try {
//       const response = await getAllDeliveryMethods();
//       setShippingMethods(response.data);
//     } catch {
//       toast.error("Không thể tải phương thức giao hàng!");
//     }
//   };

//   const fetchCartItems = () => {
//     const items = JSON.parse(localStorage.getItem("itemsToCheckout")) || [];
//     setCartItems(items);
//   };

//   const handlePlaceOrder = async () => {
//     if (!selectedAddress || !selectedPaymentMethod || !selectedShippingMethod) {
//       toast.warning("Vui lòng chọn đầy đủ thông tin trước khi đặt hàng!");
//       return;
//     }

//     try {
//       setIsProcessing(true);
//       const payload = {
//         receiverAddressId: selectedAddress?.addressId,
//         paymentMethodId: selectedPaymentMethod,
//         deliveryMethodId: selectedShippingMethod,
//         voucherId: selectedVoucher?.voucherId,
//         orderDetails: cartItems.map((item) => ({
//           productVariantId: item.productVariantId,
//           quantity: item.quantity,
//         })),
//       };

//       const response = await createOrder(payload);
//       await deleteCartItem(cartItems.map((item) => item.productVariantId));
//       localStorage.removeItem("itemsToCheckout");

//       if (selectedPaymentMethod === 2) {
//         window.location.href = response.data;
//       } else {
//         toast.success("Đặt hàng thành công!");
//         window.location.href = "/order-history";
//       }
//     } catch (error) {
//       toast.error("Không thể đặt hàng! Vui lòng thử lại sau.");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const calculateSubtotal = () => {
//     return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
//   };

//   const calculateDiscount = () => {
//     if (!selectedVoucher) return 0;

//     if (selectedVoucher.discountType === "PERCENTAGE") {
//       return Math.floor(
//         (calculateSubtotal() * selectedVoucher.discountValue) / 100
//       );
//     }
//     // Fixed discount
//     return Math.min(selectedVoucher.discountValue, calculateSubtotal());
//   };

//   const calculateShippingFee = () => {
//     if (!selectedShippingMethod) return 0;
//     const method = shippingMethods.find(
//       (m) => m.deliveryMethodId === selectedShippingMethod
//     );
//     return method ? parseFloat(method.deliveryFee) : 0;
//   };

//   const calculateTotal = () => {
//     return Math.max(
//       0,
//       calculateSubtotal() - calculateDiscount() + calculateShippingFee()
//     );
//   };

//   const formatPrice = (price) => {
//     return new Intl.NumberFormat("vi-VN").format(price);
//   };

//   // Address Modal Component
//   const AddressSelectionModal = () => (
//     <div
//       className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
//         isAddressModalVisible ? "block" : "hidden"
//       }`}
//     >
//       <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">Chọn địa chỉ nhận hàng</h2>
//           <button
//             onClick={() => setIsAddressModalVisible(false)}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             ✕
//           </button>
//         </div>

//         {addresses.length > 0 ? (
//           <div className="space-y-3">
//             {addresses.map((address) => (
//               <div
//                 key={address.addressId}
//                 className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-400 ${
//                   selectedAddress?.addressId === address.addressId
//                     ? "border-blue-500 bg-blue-50"
//                     : "border-gray-200"
//                 }`}
//                 onClick={() => {
//                   setSelectedAddress(address);
//                   setIsAddressModalVisible(false);
//                 }}
//               >
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <p className="font-bold">{address.receiverName}</p>
//                     <p className="text-gray-700">{address.receiverPhone}</p>
//                     <p className="text-gray-600 mt-1">
//                       {address.street}, {address.ward}, {address.district},{" "}
//                       {address.city}
//                     </p>
//                   </div>
//                   {address.default && (
//                     <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
//                       Mặc định
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ))}
//             <button
//               className="w-full py-2 mt-2 text-blue-600 font-medium border border-blue-600 rounded-lg hover:bg-blue-50"
//               onClick={() => {
//                 setIsAddressModalVisible(false);
//                 setIsAddAddressModalVisible(true);
//               }}
//             >
//               + Thêm địa chỉ mới
//             </button>
//           </div>
//         ) : (
//           <div className="text-center py-6">
//             <p className="mb-4 text-gray-600">Không có địa chỉ nào được lưu.</p>
//             <button
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
//               onClick={() => {
//                 setIsAddressModalVisible(false);
//                 setIsAddAddressModalVisible(true);
//               }}
//             >
//               Thêm địa chỉ mới
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div className="bg-gray-50 min-h-screen py-8">
//       <div className="max-w-6xl mx-auto px-4">
//         <h1 className="text-3xl font-bold mb-8 text-center">Thanh toán</h1>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Order Info */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Shipping Address */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-2">
//                   <MapPin className="text-blue-600" size={20} />
//                   <h2 className="text-lg font-semibold">Địa chỉ nhận hàng</h2>
//                 </div>
//                 {selectedAddress && (
//                   <button
//                     onClick={() => setIsAddressModalVisible(true)}
//                     className="text-blue-600 text-sm font-medium hover:underline"
//                   >
//                     Thay đổi
//                   </button>
//                 )}
//               </div>

//               {selectedAddress ? (
//                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
//                   <p className="font-medium">
//                     {selectedAddress.receiverName} |{" "}
//                     {selectedAddress.receiverPhone}
//                   </p>
//                   <p className="text-gray-600 mt-1">
//                     {selectedAddress.street}, {selectedAddress.ward},{" "}
//                     {selectedAddress.district}, {selectedAddress.city}
//                   </p>
//                   {selectedAddress.default && (
//                     <span className="inline-flex items-center mt-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
//                       <Check size={12} className="mr-1" /> Mặc định
//                     </span>
//                   )}
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => setIsAddressModalVisible(true)}
//                   className="w-full py-3 border border-blue-600 text-blue-600 rounded-lg text-center font-medium hover:bg-blue-50"
//                 >
//                   + Chọn địa chỉ nhận hàng
//                 </button>
//               )}
//             </div>

//             {/* Products */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <div className="flex items-center gap-2 mb-4">
//                 <ShoppingBag className="text-blue-600" size={20} />
//                 <h2 className="text-lg font-semibold">
//                   Sản phẩm ({cartItems.length})
//                 </h2>
//               </div>

//               <div className="divide-y">
//                 {cartItems.map((item) => (
//                   <div key={item.productVariantId} className="py-4 flex gap-4">
//                     <img
//                       src={item.productImage}
//                       alt={item.productName}
//                       className="w-20 h-20 object-cover rounded-md border border-gray-200"
//                     />
//                     <div className="flex-1">
//                       <p className="font-semibold">{item.productName}</p>
//                       <div className="flex items-center mt-1 text-sm text-gray-500">
//                         <span className="mr-3">Size: {item.size}</span>
//                         <span>Màu: {item.color}</span>
//                       </div>
//                       <div className="flex justify-between items-center mt-2">
//                         <span className="text-gray-600">
//                           SL: {item.quantity}
//                         </span>
//                         <span className="font-medium">
//                           {formatPrice(item.price)} ₫
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Payment Methods */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <div className="flex items-center gap-2 mb-4">
//                 <CreditCard className="text-blue-600" size={20} />
//                 <h2 className="text-lg font-semibold">
//                   Phương thức thanh toán
//                 </h2>
//               </div>

//               <div className="space-y-3">
//                 {paymentMethods.map((method) => (
//                   <div
//                     key={method.paymentMethodId}
//                     className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
//                       selectedPaymentMethod === method.paymentMethodId
//                         ? "border-blue-500 bg-blue-50"
//                         : "border-gray-200 hover:border-blue-300"
//                     }`}
//                     onClick={() =>
//                       setSelectedPaymentMethod(method.paymentMethodId)
//                     }
//                   >
//                     <div
//                       className={`w-5 h-5 rounded-full border flex items-center justify-center ${
//                         selectedPaymentMethod === method.paymentMethodId
//                           ? "border-blue-500"
//                           : "border-gray-400"
//                       }`}
//                     >
//                       {selectedPaymentMethod === method.paymentMethodId && (
//                         <div className="w-3 h-3 rounded-full bg-blue-500" />
//                       )}
//                     </div>

//                     <img
//                       src={method.paymentMethodLogo}
//                       alt={method.paymentMethodName}
//                       className="w-8 h-8 object-contain"
//                     />
//                     <span className="font-medium">
//                       {method.paymentMethodName}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Shipping Methods */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <div className="flex items-center gap-2 mb-4">
//                 <Truck className="text-blue-600" size={20} />
//                 <h2 className="text-lg font-semibold">
//                   Phương thức vận chuyển
//                 </h2>
//               </div>

//               <div className="space-y-3">
//                 {shippingMethods.map((method) => (
//                   <div
//                     key={method.deliveryMethodId}
//                     className={`flex p-4 border rounded-lg cursor-pointer transition-all ${
//                       selectedShippingMethod === method.deliveryMethodId
//                         ? "border-blue-500 bg-blue-50"
//                         : "border-gray-200 hover:border-blue-300"
//                     }`}
//                     onClick={() =>
//                       setSelectedShippingMethod(method.deliveryMethodId)
//                     }
//                   >
//                     <div className="flex items-center gap-3 mr-3">
//                       <div
//                         className={`w-5 h-5 rounded-full border flex items-center justify-center ${
//                           selectedShippingMethod === method.deliveryMethodId
//                             ? "border-blue-500"
//                             : "border-gray-400"
//                         }`}
//                       >
//                         {selectedShippingMethod === method.deliveryMethodId && (
//                           <div className="w-3 h-3 rounded-full bg-blue-500" />
//                         )}
//                       </div>

//                       <img
//                         src={method.deliveryMethodLogo}
//                         alt={method.deliveryMethodName}
//                         className="w-10 h-10 object-contain"
//                       />
//                     </div>

//                     <div className="flex-1">
//                       <div className="flex justify-between">
//                         <span className="font-medium">
//                           {method.deliveryMethodName}
//                         </span>
//                         <span className="font-medium">
//                           {method.deliveryFee === "0.0"
//                             ? "Miễn phí"
//                             : `${formatPrice(
//                                 parseFloat(method.deliveryFee)
//                               )} ₫`}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-600 mt-1">
//                         {method.deliveryMethodDescription}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Order Summary */}
//           <div className="lg:col-span-1 space-y-6">
//             {/* Voucher */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <div className="flex items-center gap-2 mb-4">
//                 <Tag className="text-blue-600" size={20} />
//                 <h2 className="text-lg font-semibold">Mã giảm giá</h2>
//               </div>

//               {selectedVoucher ? (
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <span className="text-blue-700 font-medium">
//                         {selectedVoucher.voucherCode}
//                       </span>
//                       <p className="text-sm text-gray-600 mt-1">
//                         {selectedVoucher.discountType === "PERCENTAGE"
//                           ? `Giảm ${selectedVoucher.discountValue}%`
//                           : `Giảm ${formatPrice(
//                               selectedVoucher.discountValue
//                             )} ₫`}
//                       </p>
//                     </div>
//                     <button
//                       onClick={() => setSelectedVoucher(null)}
//                       className="text-red-500 text-sm font-medium hover:underline"
//                     >
//                       Hủy
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <VoucherInput
//                   orderTotal={calculateSubtotal()}
//                   onApplyVoucher={setSelectedVoucher}
//                   selectedVoucher={selectedVoucher}
//                 />
//               )}
//             </div>

//             {/* Order Summary */}
//             <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
//               <h2 className="text-lg font-semibold mb-4">Tổng thanh toán</h2>

//               <div className="space-y-3 pb-4 border-b border-gray-100">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Tạm tính</span>
//                   <span>{formatPrice(calculateSubtotal())} ₫</span>
//                 </div>

//                 {selectedVoucher && (
//                   <div className="flex justify-between text-green-600">
//                     <span>Giảm giá</span>
//                     <span>-{formatPrice(calculateDiscount())} ₫</span>
//                   </div>
//                 )}

//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Phí vận chuyển</span>
//                   <span>
//                     {calculateShippingFee() === 0
//                       ? "Miễn phí"
//                       : `${formatPrice(calculateShippingFee())} ₫`}
//                   </span>
//                 </div>
//               </div>

//               <div className="flex justify-between items-center mt-4 mb-6">
//                 <span className="font-semibold">Tổng cộng</span>
//                 <span className="text-xl font-bold text-blue-600">
//                   {formatPrice(calculateTotal())} ₫
//                 </span>
//               </div>

//               <button
//                 onClick={handlePlaceOrder}
//                 disabled={
//                   !selectedAddress ||
//                   !selectedPaymentMethod ||
//                   !selectedShippingMethod ||
//                   isProcessing
//                 }
//                 className={`w-full py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 
//                   ${
//                     !selectedAddress ||
//                     !selectedPaymentMethod ||
//                     !selectedShippingMethod ||
//                     isProcessing
//                       ? "bg-gray-400 cursor-not-allowed"
//                       : "bg-blue-600 hover:bg-blue-700"
//                   }`}
//               >
//                 {isProcessing ? "Đang xử lý..." : "Đặt hàng"}
//                 {!isProcessing && <ArrowRight size={16} />}
//               </button>

//               <div className="mt-4 text-xs text-gray-500 text-center">
//                 Bằng cách đặt hàng, bạn đồng ý với điều khoản và chính sách của
//                 chúng tôi
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Address Selection Modal */}
//       <AddressSelectionModal />

//       {/* Add Address Modal would be implemented here */}
//       {isAddAddressModalVisible && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-lg">
//             <h2 className="text-xl font-bold mb-4">Thêm địa chỉ mới</h2>
//             {/* Add Address form would be implemented here */}
//             <div className="flex justify-end gap-3 mt-4">
//               <button
//                 onClick={() => setIsAddAddressModalVisible(false)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg"
//               >
//                 Hủy
//               </button>
//               <button
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg"
//                 onClick={() => setIsAddAddressModalVisible(false)}
//               >
//                 Thêm địa chỉ
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // import React, { useState, useEffect } from "react";
// // import {
// //   Button,
// //   Modal,
// //   Form,
// //   Input,
// //   Radio,
// //   message,
// //   Card,
// //   Divider,
// // } from "antd";
// // import {
// //   addAddress,
// //   getAllAddress,
// //   getDefaultAddress,
// // } from "../../services/receiverAddressService";
// // import { getAllPaymentMethods } from "../../services/paymentMethodService";
// // import { getAllDeliveryMethods } from "../../services/deliveryMethodService";
// // import { createOrder } from "../../services/orderService";
// // import { toast } from "react-toastify";
// // import AddAddressModal from "../../components/address/AddAddressModal";
// // import { deleteCartItem } from "../../services/cartService";
// // import VoucherInput from "../../components/voucher/VoucherInput";

// // export default function CheckoutPage() {
// //     const [addresses, setAddresses] = useState([]);
// //     const [selectedAddress, setSelectedAddress] = useState(null);
// //   const [defaultAddress, setDefaultAddress] = useState(null);
// //   const [isModalVisible, setIsModalVisible] = useState(false);
// //   const [isAddAddressModalVisible, setIsAddAddressModalVisible] =
// //     useState(false);
// //   const [selectedVoucher, setSelectedVoucher] = useState(null);
// //   const [cartItems, setCartItems] = useState([]);
// //   const [paymentMethods, setPaymentMethods] = useState([]);
// //   const [shippingMethods, setShippingMethods] = useState([]);
// //   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
// //   const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
// //   const [form] = Form.useForm();

// //   useEffect(() => {
// //     fetchDefaultAddress();
// //     fetchPaymentMethods();
// //     fetchShippingMethods();
// //     fetchCartItems();
// //   }, []);
// //   useEffect(() => {
// //     const fetchAddresses = async () => {
// //       try {
// //         const response = await getAllAddress(); // Gọi API lấy danh sách địa chỉ
// //         setAddresses(response.data);
// //         // Đặt địa chỉ mặc định nếu có
// //         const defaultAddress = response.data.find((address) => address.default);
// //         setSelectedAddress(defaultAddress || null);
// //       } catch (error) {
// //         console.error("Error fetching addresses:", error);
// //         toast.error("Không thể tải danh sách địa chỉ!");
// //       }
// //     };

// //     fetchAddresses();
// //   }, []);
// //   const fetchDefaultAddress = async () => {
// //     try {
// //       const response = await getDefaultAddress();
// //       setDefaultAddress(response.data);
// //     } catch (error) {
// //       toast.error("Không thể tải địa chỉ mặc định!");
// //     }
// //   };

// //   const fetchPaymentMethods = async () => {
// //     try {
// //       const response = await getAllPaymentMethods();
// //       setPaymentMethods(response.data);
// //     } catch {
// //       toast.error("Không thể tải phương thức thanh toán!");
// //     }
// //   };

// //   const fetchShippingMethods = async () => {
// //     try {
// //       const response = await getAllDeliveryMethods();
// //       setShippingMethods(response.data);
// //     } catch {
// //       toast.error("Không thể tải phương thức giao hàng!");
// //     }
// //   };

// //   const fetchCartItems = () => {
// //     const items = JSON.parse(localStorage.getItem("itemsToCheckout")) || [];
// //     setCartItems(items);
// //   };

// //   const handlePlaceOrder = async () => {
// //     try {
// //       const payload = {
// //         receiverAddressId: selectedAddress?.addressId,
// //         paymentMethodId: selectedPaymentMethod,
// //         deliveryMethodId: selectedShippingMethod,
// //         voucherId: selectedVoucher?.voucherId, // Thêm dòng này
// //         orderDetails: cartItems.map((item) => ({
// //           productVariantId: item.productVariantId,
// //           quantity: item.quantity,
// //         })),
// //       };
// //       console.log("payload", payload);
// //       const response = await createOrder(payload);
// //       await deleteCartItem(cartItems.map((item) => item.productVariantId));
// //       localStorage.removeItem("itemsToCheckout");
// //       if (selectedPaymentMethod === 2) {
// //         window.location.href = response.data;

// //       } else {
// //         toast.success("Đặt hàng thành công!");
// //         window.location.href = "/order-history";
// //       }
// //     } catch {
// //       // toast.error(response.message);
// //       toast.error("Không thể đặt hàng!");
// //     }
// //   };

// //   const calculateTotal = () => {
// //     return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
// //   };
// // const calculateDiscount = () => {
// //   if (!selectedVoucher) return 0;
// //   if (selectedVoucher.discountType === "PERCENTAGE") {
// //     return Math.floor((calculateTotal() * selectedVoucher.discountValue) / 100);
// //   }
// //   // FIXED
// //   return Math.min(selectedVoucher.discountValue, calculateTotal());
// // };

// // const calculateFinalTotal = () => {
// //   return Math.max(0, calculateTotal() - calculateDiscount());
// // };
// //   return (
// //     <div className="max-w-4xl mx-auto p-4">
// //       <h1 className="text-3xl font-bold mb-6 text-center">Thanh toán</h1>

// //       {/* Địa chỉ nhận hàng */}
// //       <Card title="Địa chỉ nhận hàng" className="mb-6">
// //         {selectedAddress ? (
// //           <div>
// //             <p>
// //               <strong>Tên:</strong> {selectedAddress.receiverName}
// //             </p>
// //             <p>
// //               <strong>Điện thoại:</strong> {selectedAddress.receiverPhone}
// //             </p>
// //             <p>
// //               <strong>Địa chỉ:</strong> {selectedAddress.street},{" "}
// //               {selectedAddress.ward}, {selectedAddress.district},{" "}
// //               {selectedAddress.city}
// //             </p>
// //             <Button type="link" onClick={() => setIsModalVisible(true)}>
// //               Thay đổi
// //             </Button>
// //           </div>
// //         ) : (
// //           <Button
// //             type="primary"
// //             onClick={() => setIsAddAddressModalVisible(true)}
// //           >
// //             Chọn địa chỉ
// //           </Button>
// //         )}
// //       </Card>
// //       <Card title="Mã giảm giá" className="mb-6">
// //         <VoucherInput
// //           orderTotal={calculateTotal()}
// //           onApplyVoucher={setSelectedVoucher}
// //           selectedVoucher={selectedVoucher}
// //         />
// //       </Card>
// //       {/* Danh sách sản phẩm */}
// //       <Card title="Sản phẩm" className="mb-6">
// //         {cartItems.map((item) => (
// //           <div
// //             key={item.productVariantId}
// //             className="flex items-center justify-between py-2 border-b"
// //           >
// //             <div className="flex items-center gap-4">
// //               <img
// //                 src={item.productImage}
// //                 alt={item.productName}
// //                 className="w-16 h-16 object-cover rounded"
// //               />
// //               <div>
// //                 <p className="font-semibold">{item.productName}</p>
// //                 <p className="text-sm text-gray-500">
// //                   Size: {item.size} | Màu: {item.color}
// //                 </p>
// //                 <p>Số lượng: {item.quantity}</p>
// //               </div>
// //             </div>
// //             <div className="text-right">
// //               <p className="font-medium">{item.price} VND</p>
// //               <p className="text-sm text-gray-500">
// //                 Tổng: {item.quantity * item.price} VND
// //               </p>
// //             </div>
// //           </div>
// //         ))}
// //         <Divider />
// //         {selectedVoucher && (
// //           <div className="text-right text-green-600">
// //             Giảm giá: -{calculateDiscount()} VND
// //           </div>
// //         )}
// //         <div className="text-right font-bold text-lg">
// //           Tổng cộng: {calculateFinalTotal()} VND
// //         </div>
// //       </Card>

// //       {/* Phương thức thanh toán */}
// //       <Card title="Phương thức thanh toán" className="mb-6">
// //         <Radio.Group
// //           onChange={(e) => setSelectedPaymentMethod(e.target.value)}
// //           value={selectedPaymentMethod}
// //         >
// //           {paymentMethods.map((method) => (
// //             <Radio
// //               key={method.paymentMethodId}
// //               value={method.paymentMethodId}
// //               className="flex items-center gap-2 my-2"
// //             >
// //               <img
// //                 src={method.paymentMethodLogo}
// //                 alt={method.paymentMethodName}
// //                 className="w-6 h-6 object-cover rounded-full"
// //               />
// //               {method.paymentMethodName}
// //             </Radio>
// //           ))}
// //         </Radio.Group>
// //       </Card>

// //       {/* Phương thức giao hàng */}
// //       <Card title="Phương thức giao hàng" className="mb-6">
// //         <Radio.Group
// //           onChange={(e) => setSelectedShippingMethod(e.target.value)}
// //           value={selectedShippingMethod}
// //         >
// //           {shippingMethods.map((method) => (
// //             <Radio
// //               key={method.deliveryMethodId}
// //               value={method.deliveryMethodId}
// //               className="flex items-start gap-4 my-2"
// //             >
// //               <img
// //                 src={method.deliveryMethodLogo}
// //                 alt={method.deliveryMethodName}
// //                 className="w-10 h-10 object-cover"
// //               />
// //               <div>
// //                 <p className="font-semibold">{method.deliveryMethodName}</p>
// //                 <p className="text-sm text-gray-500">
// //                   {method.deliveryMethodDescription}
// //                 </p>
// //                 <p className="text-sm text-gray-500">
// //                   Phí giao hàng:{" "}
// //                   {method.deliveryFee === "0.0"
// //                     ? "Miễn phí"
// //                     : `${Number(method.deliveryFee).toLocaleString()} VND`}
// //                 </p>
// //               </div>
// //             </Radio>
// //           ))}
// //         </Radio.Group>
// //       </Card>

// //       {/* Nút đặt hàng */}
// //       <Button
// //         type="primary"
// //         size="large"
// //         block
// //         onClick={handlePlaceOrder}
// //         disabled={
// //           !defaultAddress || !selectedPaymentMethod || !selectedShippingMethod
// //         }
// //       >
// //         Đặt hàng
// //       </Button>
// //       <Modal
// //         title="Chọn địa chỉ nhận hàng"
// //         visible={isModalVisible}
// //         onCancel={() => setIsModalVisible(false)}
// //         footer={null}
// //       >
// //         {addresses.length > 0 ? (
// //           addresses.map((address) => (
// //             <div
// //               key={address.addressId}
// //               className={`p-4 border rounded mb-2 ${
// //                 selectedAddress?.addressId === address.addressId
// //                   ? "border-blue-500"
// //                   : ""
// //               }`}
// //               onClick={() => {
// //                 setSelectedAddress(address); // Đặt địa chỉ được chọn
// //                 setIsModalVisible(false); // Đóng modal
// //               }}
// //             >
// //               <p>
// //                 <strong>Tên người nhận:</strong> {address.receiverName}
// //               </p>
// //               <p>
// //                 <strong>Số điện thoại:</strong> {address.receiverPhone}
// //               </p>
// //               <p>
// //                 <strong>Địa chỉ:</strong> {address.street}, {address.ward},{" "}
// //                 {address.district}, {address.city}
// //               </p>
// //               {address.default && (
// //                 <p className="text-green-500 font-semibold">[Mặc định]</p>
// //               )}
// //             </div>
// //           ))
// //         ) : (
// //           <p>Không có địa chỉ nào được lưu.</p>
// //         )}
// //       </Modal>
// //       {/* Modal thêm địa chỉ */}

// //       <Modal
// //         title="Chọn địa chỉ nhận hàng"
// //         visible={isModalVisible}
// //         onCancel={() => setIsModalVisible(false)}
// //         footer={null}
// //       >
// //         {addresses.length > 0 ? (
// //           addresses.map((address) => (
// //             <div
// //               key={address.addressId}
// //               className={`p-4 border rounded mb-2 ${
// //                 selectedAddress?.addressId === address.addressId
// //                   ? "border-blue-500"
// //                   : ""
// //               }`}
// //               onClick={() => {
// //                 setSelectedAddress(address); // Đặt địa chỉ được chọn
// //                 setIsModalVisible(false); // Đóng modal
// //               }}
// //             >
// //               <p>
// //                 <strong>Tên người nhận:</strong> {address.receiverName}
// //               </p>
// //               <p>
// //                 <strong>Số điện thoại:</strong> {address.receiverPhone}
// //               </p>
// //               <p>
// //                 <strong>Địa chỉ:</strong> {address.street}, {address.ward},{" "}
// //                 {address.district}, {address.city}
// //               </p>
// //               {address.default && (
// //                 <p className="text-green-500 font-semibold">[Mặc định]</p>
// //               )}
// //             </div>
// //           ))
// //         ) : (
// //           <p>Không có địa chỉ nào được lưu.</p>
// //         )}
// //       </Modal>
// //     </div>
// //   );
// // }
