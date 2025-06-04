import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Pagination,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  getBrands,
  addBrand,
  updateBrand,
  deleteBrand,
  restoreBrand,
} from "../../../services/brandService";
import { toast } from "react-toastify";

export default function ManageBrand() {
  const [brands, setBrands] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  useEffect(() => {
    fetchBrands(searchQuery, pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const fetchBrands = async (search="",page, size) => {
    try {
      const response = await getBrands(search, page - 1, size); // Đảm bảo API sử dụng page bắt đầu từ 0
      if (response.data && response.data.content) {
        setBrands(response.data.content);
        setPagination((prev) => ({
          ...prev,
          total: response.data.totalElements,
        }));
      } else {
        throw new Error("Dữ liệu trả về không hợp lệ");
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Không thể tải danh sách thương hiệu!");
    }
  };
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchBrands(searchQuery, 1, pagination.pageSize);
  };
  const handleAddBrand = () => {
    setEditingBrand(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditBrand = (record) => {
    setEditingBrand(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteBrand = async (brandId) => {
    try {
      await deleteBrand(brandId);
      toast.success("Xóa thương hiệu thành công!");
      fetchBrands("",pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error("Không thể xóa thương hiệu!");
    }
  };

  const handleRestoreBrand = async (brandId) => {
    try {
      await restoreBrand(brandId);
      toast.success("Khôi phục thương hiệu thành công!");
      fetchBrands("",pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error restoring brand:", error);
      toast.error("Không thể khôi phục thương hiệu!");
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("brandName", values.brandName);
      if (values.brandThumbnail) {
        formData.append(
          "brandThumbnail",
          values.brandThumbnail.file.originFileObj
        );
      }
      if (values.brandDescription) {
        formData.append("brandDescription", values.brandDescription);
      }

      if (editingBrand) {
        // Update brand
        await updateBrand(editingBrand.brandId, formData);
        toast.success("Cập nhật thương hiệu thành công!");
      } else {
        // Add new brand
        await addBrand(formData);
        toast.success("Thêm thương hiệu thành công!");
      }

      setIsModalVisible(false);
      fetchBrands(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error saving brand:", error);
      toast.error("Không thể lưu thương hiệu!");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "brandId",
      key: "brandId",
    },
    {
      title: "Tên thương hiệu",
      dataIndex: "brandName",
      key: "brandName",
    },
    {
      title: "Mã thương hiệu",
      dataIndex: "brandCode",
      key: "brandCode",
    },
    {
      title: "Ảnh thương hiệu",
      dataIndex: "brandThumbnail",
      key: "brandThumbnail",
      render: (thumbnail) =>
        thumbnail ? (
          <img
            src={thumbnail}
            alt="Thumbnail"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        ) : (
          "Không có ảnh"
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) =>
        createdAt ? new Date(createdAt).toLocaleString() : "Không có dữ liệu",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt) =>
        updatedAt ? new Date(updatedAt).toLocaleString() : "Không có dữ liệu",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          {record.deletedAt === null ? (
            <>
              <Button
                type="link"
                icon={<EditOutlined style={{ fontSize: "18px" }} />}
                onClick={() => handleEditBrand(record)}
              />
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa thương hiệu này?"
                onConfirm={() => handleDeleteBrand(record.brandId)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined style={{ fontSize: "18px" }} />}
                />
              </Popconfirm>
            </>
          ) : (
            <Popconfirm
              title="Bạn có chắc chắn muốn khôi phục thương hiệu này?"
              onConfirm={() => handleRestoreBrand(record.brandId)}
              okText="Khôi phục"
              cancelText="Hủy"
            >
              <Button
                type="link"
                style={{ color: "green" }}
                icon={<UndoOutlined style={{ fontSize: "18px" }} />}
              />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Quản lý thương hiệu</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            Tìm
          </Button>
        </div>
        <Button
          type="primary"
          onClick={handleAddBrand}
          className="mb-4"
          icon={<PlusOutlined style={{ fontSize: "18px" }} />}
          shape="circle"
        />
      </div>
      <Table
        columns={columns}
        dataSource={brands}
        rowKey="brandId"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize,
            }));
            fetchBrands(page, pageSize); // Gọi lại API khi thay đổi trang
          },
        }}
      />
      {/* <Pagination
        className="mt-4"
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page, pageSize) => {
          setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize,
          }));
          fetchBrands(page, pageSize); // Gọi lại API khi thay đổi trang hoặc kích thước trang
        }}
      /> */}

      <Modal
        title={editingBrand ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Tên thương hiệu */}
          <Form.Item
            label="Tên thương hiệu"
            name="brandName"
            rules={[
              { required: true, message: "Vui lòng nhập tên thương hiệu!" },
            ]}
          >
            <Input />
          </Form.Item>

          {/* Ảnh thương hiệu */}
          <Form.Item
            label="Ảnh thương hiệu"
            name="brandThumbnail"
            valuePropName="file"
            getValueFromEvent={(e) => (e.file ? e.file : null)}
          >
            <Input type="file" />
          </Form.Item>

          {/* Mô tả */}
          <Form.Item label="Mô tả" name="brandDescription">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
