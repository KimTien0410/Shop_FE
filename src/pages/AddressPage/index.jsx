import React, { useState, useEffect } from "react";
import { Layout, Button, Modal, Form, Input, Select, message } from "antd";
import { addAddress, deleteAddress, getAllAddress, getCities, getDistricts, getWards, setDefaultAddress, updateAddress } from "../../services/receiverAddressService";
import Sidebar from "../../components/sidebar";
import { toast } from "react-toastify";
import AddAddressModal from "../../components/address/AddAddressModal";

const { Content } = Layout;
const { Option } = Select;

export default function AddressPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [form] = Form.useForm();
  const [addresses, setAddresses] = useState([]);
  const [editingAddressId, setEditingAddressId] = useState(null);
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await getAllAddress();
        setAddresses(response.data);
        toast.success(response.message);
      }
      catch (error) {
        console.error("Error fetching addresses:", error);
        toast.error("Không thể tải danh sách địa chỉ!");
      }
    };
    fetchAddresses();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      try {
          const response = await getCities(); // Gọi API lấy danh sách thành phố
        setCities(response.data.data);
      } catch (error) {
        toast.error("Không thể tải danh sách thành phố!");
      }
    };

    fetchCities();
  }, []);

  const handleCityChange = async (cityId) => {
    form.setFieldsValue({ district: null, ward: null }); // Reset district và ward
    setDistricts([]);
    setWards([]);
    try {
      const response = await getDistricts(cityId); // Gọi API lấy danh sách quận/huyện
      setDistricts(response.data.data);
    } catch (error) {
      toast.error("Không thể tải danh sách quận/huyện!");
    }
  };

  const handleDistrictChange = async (districtId) => {
    form.setFieldsValue({ ward: null }); // Reset ward
    setWards([]);
    try {
      const response = await getWards(districtId);
      // Gọi API lấy danh sách phường/xã
      setWards(response.data.data);
    } catch (error) {
      // console.error("Error fetching wards:", error);
      toast.error("Không thể tải danh sách phường/xã!");
    }
  };

  const handleAddAddress = async (values) => {
    try {
      const cityObj = cities.find((c) => c.code === values.city);
      const districtObj = districts.find((d) => d.code === values.district);
      const wardObj = wards.find((w) => w.code === values.ward);

      const payload = {
        receiverName: values.receiverName,
        receiverPhone: values.receiverPhone,
        street: values.street,
        city: cityObj?.name || "",
        district: districtObj?.name || "",
        ward: wardObj?.name || "",
      };
      if (editingAddressId) {
        // Chỉnh sửa địa chỉ
        await updateAddress(editingAddressId, payload); // Gọi API cập nhật địa chỉ
        toast.success("Cập nhật địa chỉ thành công!");
  
        // Cập nhật danh sách địa chỉ trong state
        setAddresses((prevAddresses) =>
          prevAddresses.map((address) =>
            address.addressId === editingAddressId
              ? { ...address, ...payload }
              : address
          )
        );
      } else {
        // Thêm mới địa chỉ
        await addAddress(payload); // Gọi API thêm địa chỉ
        toast.success("Thêm địa chỉ thành công!");
  
        // Thêm địa chỉ mới vào danh sách
        setAddresses((prevAddresses) => [...prevAddresses, payload]);
      }
  
      setIsModalVisible(false); // Đóng modal
      form.resetFields(); // Reset form
      setEditingAddressId(null); // Reset trạng thái chỉnh sửa
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Không thể lưu địa chỉ!");
    }
  };
  const handleEditAddress = async (address) => {
    setEditingAddressId(address.addressId);
    setIsModalVisible(true);
    // Tìm cityCode, districtCode, và wardCode dựa trên name
    const cityObj = cities.find((c) => c.name === address.city);
    const districtObj = districts.find((d) => d.name === address.district);
    const wardObj = wards.find((w) => w.name === address.ward);

    // Gọi API để lấy danh sách quận/huyện và phường/xã nếu cần
    if (cityObj) {
      await handleCityChange(cityObj.code); // Lấy danh sách quận/huyện
    }
    if (districtObj) {
      await handleDistrictChange(districtObj.code); // Lấy danh sách phường/xã
    }
    // Đặt giá trị mặc định cho form
    form.setFieldsValue({
      receiverName: address.receiverName,
      receiverPhone: address.receiverPhone,
      street: address.street,
      city: cityObj?.code || null, // Sử dụng mã code của thành phố
      district: districtObj?.code || null, // Sử dụng mã code của quận/huyện
      ward: wardObj?.code || null, // Sử dụng mã code của phường/xã
    });
  };
  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId); // Gọi API đặt mặc định
      toast.success("Đặt địa chỉ mặc định thành công!");
      // Cập nhật danh sách địa chỉ
      const updatedAddresses = addresses.map((address) =>
        address.addressId === addressId
          ? { ...address, default: true }
          : { ...address, default: false }
      );
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Không thể đặt địa chỉ mặc định!");
    }
  };
  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await deleteAddress(addressId); // Gọi API xóa địa chỉ
      toast.success(response.message);
      // Cập nhật danh sách địa chỉ
      setAddresses(
        addresses.filter((address) => address.addressId !== addressId)
      );
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Không thể xóa địa chỉ!");
    }
  };
  return (
    <Layout className=" max-w-7xl mx-auto bg-white shadow-lg rounded-lg">
      <Sidebar selectedKey="/address" />
      <Layout style={{ padding: "24px" }}>
        <Content>
          <div className=" flex justify-between">
            <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">
              Địa chỉ nhận hàng
            </h1>
            <Button
              type="primary"
              onClick={() => setIsModalVisible(true)}
              className="mb-4"
            >
              Thêm địa chỉ
            </Button>
          </div>
          <div>
            <div>
              {addresses && addresses.length > 0 ? (
                addresses.map((address) => (
                  <div
                    key={address.addressId}
                    className="mb-4 p-4 border rounded flex justify-between items-center"
                  >
                    <div>
                      <p>
                        <strong>Tên người nhận:</strong> {address.receiverName}
                      </p>
                      <p>
                        <strong>Số điện thoại:</strong> {address.receiverPhone}
                      </p>
                      <p>
                        <strong>Địa chỉ:</strong> {address.street},{" "}
                        {address.ward}, {address.district}, {address.city}
                      </p>
                      {address.default && (
                        <p className="text-green-500 font-semibold">
                          [Mặc định]
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="link"
                        onClick={() => handleEditAddress(address)}
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        type="link"
                        onClick={() => handleSetDefault(address.addressId)}
                      >
                        Đặt mặc định
                      </Button>
                      <Button
                        type="link"
                        danger
                        onClick={() => handleDeleteAddress(address.addressId)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p>Không có địa chỉ nào được lưu.</p>
              )}
            </div>
            {/* <div>
              {addresses && addresses.length > 0 ? (
                addresses.map((address) => (
                  <div
                    key={address.addressId}
                    className="mb-4 p-4 border rounded"
                  >
                    <p>
                      <strong>Tên người nhận:</strong> {address.receiverName}
                    </p>
                    <p>
                      <strong>Số điện thoại:</strong> {address.receiverPhone}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> {address.street}, {address.ward}
                      , {address.district}, {address.city}
                    </p>
                  </div>
                ))
              ) : (
                <p>Không có địa chỉ nào được lưu.</p>
              )}
            </div> */}
          </div>

          {/* Modal thêm địa chỉ */}

          {/* <AddAddressModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onAddressAdded={(newAddress) => {
              setAddresses((prevAddresses) => [...prevAddresses, newAddress]);
            }}
          /> */}
          <Modal
            title="Thêm địa chỉ mới"
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleAddAddress}
              initialValues={{
                receiverName: "",
                receiverPhone: "",
                street: "",
                city: null,
                district: null,
                ward: null,
              }}
            >
              <Form.Item
                label="Tên người nhận"
                name="receiverName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên người nhận!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="receiverPhone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Số điện thoại không hợp lệ!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Thành phố"
                name="city"
                rules={[
                  { required: true, message: "Vui lòng chọn thành phố!" },
                ]}
              >
                <Select
                  onChange={(value) => {
                    handleCityChange(value);
                  }}
                  placeholder="Chọn thành phố"
                >
                  {cities.map((city) => (
                    <Option key={city.id} value={city.code} name={city.name}>
                      {city.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Quận/Huyện"
                name="district"
                rules={[
                  { required: true, message: "Vui lòng chọn quận/huyện!" },
                ]}
              >
                <Select
                  onChange={(value) => {
                    handleDistrictChange(value);
                  }}
                  placeholder="Chọn quận/huyện"
                  disabled={!districts.length}
                >
                  {districts.map((district) => (
                    <Option
                      key={district.id}
                      value={district.code}
                      name={district.name}
                    >
                      {district.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Phường/Xã"
                name="ward"
                rules={[
                  { required: true, message: "Vui lòng chọn phường/xã!" },
                ]}
              >
                <Select placeholder="Chọn phường/xã" disabled={!wards.length}>
                  {wards.map((ward) => (
                    <Option key={ward.id} value={ward.code} name={ward.name}>
                      {ward.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Đường/Thôn"
                name="street"
                rules={[
                  { required: true, message: "Vui lòng nhập đường/thôn!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full">
                  Lưu
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
}
