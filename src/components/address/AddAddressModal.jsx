import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";

import { toast } from "react-toastify";
import { addAddress, getCities, getDistricts, getWards } from "../../services/receiverAddressService";

const { Option } = Select;

export default function AddAddressModal({ visible, onClose, onAddressAdded }) {
  const [form] = Form.useForm();
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await getCities();
        setCities(response.data.data);
      } catch (error) {
        toast.error("Không thể tải danh sách thành phố!");
      }
    };
    fetchCities();
  }, []);

  const handleCityChange = async (cityId) => {
    form.setFieldsValue({ district: null, ward: null });
    setDistricts([]);
    setWards([]);
    try {
      const response = await getDistricts(cityId);
      setDistricts(response.data.data);
    } catch (error) {
      toast.error("Không thể tải danh sách quận/huyện!");
    }
  };

  const handleDistrictChange = async (districtId) => {
    form.setFieldsValue({ ward: null });
    setWards([]);
    try {
      const response = await getWards(districtId);
      setWards(response.data.data);
    } catch (error) {
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

      await addAddress(payload);
      toast.success("Thêm địa chỉ thành công!");
      onAddressAdded(payload); // Gọi callback để cập nhật danh sách địa chỉ
      onClose(); // Đóng modal
      form.resetFields(); // Reset form
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Không thể thêm địa chỉ!");
    }
  };

  return (
    <Modal
      title="Thêm địa chỉ mới"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleAddAddress}>
        <Form.Item
          label="Tên người nhận"
          name="receiverName"
          rules={[{ required: true, message: "Vui lòng nhập tên người nhận!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="receiverPhone"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Thành phố"
          name="city"
          rules={[{ required: true, message: "Vui lòng chọn thành phố!" }]}
        >
          <Select onChange={handleCityChange} placeholder="Chọn thành phố">
            {cities.map((city) => (
              <Option key={city.id} value={city.code}>
                {city.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Quận/Huyện"
          name="district"
          rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}
        >
          <Select
            onChange={handleDistrictChange}
            placeholder="Chọn quận/huyện"
            disabled={!districts.length}
          >
            {districts.map((district) => (
              <Option key={district.id} value={district.code}>
                {district.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Phường/Xã"
          name="ward"
          rules={[{ required: true, message: "Vui lòng chọn phường/xã!" }]}
        >
          <Select placeholder="Chọn phường/xã" disabled={!wards.length}>
            {wards.map((ward) => (
              <Option key={ward.id} value={ward.code}>
                {ward.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Đường/Thôn"
          name="street"
          rules={[{ required: true, message: "Vui lòng nhập đường/thôn!" }]}
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
  );
}
