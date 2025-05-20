import React, { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Radio, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
import {
  
} from "../../services/userService";
import { getProfile } from "../../services/userService";
import { updateProfile } from "../../services/userService";
import { toast } from "react-toastify";

export default function ProfileForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getProfile(); // Gọi API lấy thông tin người dùng
        const userData = response.data;

        // Đặt giá trị mặc định cho form
        form.setFieldsValue({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          dateOfBirth: userData.dateOfBirth
            ? moment(userData.dateOfBirth)
            : null,
          gender: userData.gender ? "male" : "female",
          userPhone: userData.userPhone,
        });

        setAvatarUrl(userData.userAvatar); // Đặt ảnh đại diện
      } catch (error) {
        console.error("Error fetching user profile:", error);
        message.error("Không thể tải thông tin người dùng!");
      }
    };

    fetchUserProfile();
  }, [form]);

  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      // Chuẩn bị dữ liệu để gửi
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("firstName", values.firstName);
      formData.append("lastName", values.lastName);
      formData.append(
        "dateOfBirth",
        values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null
      );
      formData.append("gender", values.gender === "male");
      formData.append("userPhone", values.userPhone);

      // Nếu có ảnh đại diện, thêm vào formData
      if (avatarUrl && avatarUrl.file) {
        formData.append("avatar", avatarUrl.file);
      }
      // Log dữ liệu FormData để kiểm tra
      // for (let [key, value] of formData.entries()) {
      //   console.log(`${key}:`, value);
      // }
      // Gọi API cập nhật thông tin người dùng
      await updateProfile(formData); // Gọi API với FormData
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      // console.error("Error updating profile:", error);
      toast.error("Cập nhật thông tin thất bại!");
    } finally {
      setLoading(false);
    }
  };



    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-2xl">
       

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ gender: "male" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <Form.Item label="Email" name="email">
              <Input disabled className="rounded-lg" />
            </Form.Item>

            {/* Số điện thoại */}
            <Form.Item label="Số điện thoại" name="userPhone">
              <Input className="rounded-lg" />
            </Form.Item>

            {/* Họ */}
            <Form.Item
              label="Họ"
              name="firstName"
              rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
            >
              <Input className="rounded-lg" />
            </Form.Item>

            {/* Tên */}
            <Form.Item
              label="Tên"
              name="lastName"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input className="rounded-lg" />
            </Form.Item>

            {/* Ngày sinh */}
            <Form.Item label="Ngày sinh" name="dateOfBirth">
              <DatePicker format="YYYY-MM-DD" className="w-full rounded-lg" />
            </Form.Item>

            {/* Giới tính */}
            <Form.Item label="Giới tính" name="gender">
              <Radio.Group className="flex gap-6">
                <Radio value="male">Nam</Radio>
                <Radio value="female">Nữ</Radio>
              </Radio.Group>
            </Form.Item>
          </div>

          {/* Ảnh đại diện */}
          <div className="mt-8">
            <Form.Item label="Ảnh đại diện">
              <div className="flex items-center gap-6">
                <img
                  src={
                    avatarUrl?.preview ||
                    avatarUrl ||
                    "https://via.placeholder.com/100"
                  }
                  alt="Avatar"
                  className="w-28 h-28 rounded-full object-cover border shadow"
                />
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => {
                    setAvatarUrl({ file, preview: URL.createObjectURL(file) });
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />} className="rounded-md">
                    Tải lên ảnh mới
                  </Button>
                </Upload>
              </div>
            </Form.Item>
          </div>

          {/* Nút lưu */}
          <div className="mt-8 text-center">
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="px-8 py-2 text-lg rounded-xl"
              >
                Lưu thay đổi
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>

      
    );
}