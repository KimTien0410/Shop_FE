import React from "react";
import { Layout } from "antd";
import ProfileForm from "./ProfileForm";
import Sidebar from "../../components/sidebar";


const { Content } = Layout;

export default function ProfilePage() {
  return (
    <Layout className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg">
      <Sidebar selectedKey="/profile" />
      <Layout style={{ padding: "24px" }}>
        <Content>
          <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">
            Thông tin cá nhân
          </h1>
          <ProfileForm />
        </Content>
      </Layout>
    </Layout>
  );
}
