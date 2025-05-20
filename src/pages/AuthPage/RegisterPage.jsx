import React from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import { toast } from "react-toastify";

const { Title } = Typography;

const RegisterPage= () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      // Loại bỏ field confirm không cần thiết
      const { confirm, ...registerData } = values;
      await register(registerData);
      toast.success("Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(error?.response?.data?.message || "Đăng ký thất bại!");
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "auto",
        padding: "40px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        backgroundColor: "#fff",
      }}
    >
      <Title level={3} style={{ textAlign: "center" }}>
        Register
      </Title>
      <Form
        form={form}
        name="signup"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="First name"
          name="firstName"
          rules={[{ required: true, message: "Please type your first name!" }]}
        >
          <Input placeholder="Văn A" />
        </Form.Item>

        <Form.Item
          label="Last name"
          name="lastName"
          rules={[{ required: true, message: "Please type your last name!" }]}
        >
          <Input placeholder="Nguyễn" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please type your email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder="email@example.com" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please type your password!" }]}
          hasFeedback
        >
          <Input.Password placeholder="Mật khẩu" />
        </Form.Item>

        <Form.Item
          label="ConfirmPassword"
          name="confirm"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject("Mật khẩu xác nhận không khớp!");
              },
            }),
          ]}
        >
          <Input.Password placeholder="Nhập lại mật khẩu" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Register
          </Button>
        </Form.Item>
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </Form>
    </div>
  );
};

export default RegisterPage;
