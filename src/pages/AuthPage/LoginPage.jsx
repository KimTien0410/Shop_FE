import React from "react";
import { Form, Input, Button, Typography } from "antd";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
const { Title } = Typography;
import { toast } from "react-toastify";
export default function LoginPage() {
   const { loginResponse } = useAuth();
  const navigate = useNavigate();
  // const onFinish = async (values) => {
  //   // console.log("Received values:", values);
  //   const response = await loginResponse(values);
  //   toast.success("Đăng nhập thành công");
  //   // console.log("login response: ", response);
  //   if (response.role === "ADMIN") {
  //     navigate("/admin");
  //   } else {
  //     navigate("/");
  //   }
  //   if (response.code !== 200) {
  //     console.log("Login failed:");
  //     toast.error("Login failed:", response.data.message);
  //     return;
  //   }

  // };
  // const onFinish = async (values) => {
  //   try {
  //     const response = await loginResponse(values);
  //     if (response && response.code === 200) {
  //       toast.success("Đăng nhập thành công");
  //       if (response.role === "ADMIN") {
  //         navigate("/admin");
  //       } else {
  //         navigate("/");
  //       }
  //     } else {
  //       toast.error(response?.message || "Đăng nhập thất bại!");
  //     }
  //   } catch (error) {
  //     // Nếu là lỗi từ axios
  //     const msg =
  //       error?.response?.data?.message ||
  //       error?.message ||
  //       "Đăng nhập thất bại!";
  //     toast.error(msg);
  //   }
  // };
  const onFinish = async (values) => {
    const response = await loginResponse(values);
    if (response.success) {
      toast.success(response.message);
      if (response.auth.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      toast.error(response.message);
    }
  };
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div
        style={{
          minWidth: 400,
          margin: "auto",
          padding: "40px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          backgroundColor: "#fff",
        }}
      >
        <Title level={3} style={{ textAlign: "center" }}>
          Đăng nhập
        </Title>
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Nhập email của bạn" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu của bạn" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng nhập
            </Button>
            <div style={{ textAlign: "center" , marginTop: "10px" }}>
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

