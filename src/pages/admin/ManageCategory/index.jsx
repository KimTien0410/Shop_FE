import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm } from "antd";
import {
  PlusOutlined,EditOutlined,
  DeleteOutlined,
  UndoOutlined,
} from "@ant-design/icons";

import {
  updateCategory,
  deleteCategory,
  createCategory,
  getAllCategoriesByAdmin,
  restoreCategory,
} from "../../../services/categoryService";
import { toast } from "react-toastify";

export default function ManageCategory() {
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getAllCategoriesByAdmin();
      setCategories(response.content);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Không thể tải danh mục!");
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCategory = (record) => {
    setEditingCategory(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };
  const handleRestoreCategory = async (categoryId) => {
    try {
      await restoreCategory(categoryId); // Gọi API khôi phục danh mục
      toast.success("Khôi phục danh mục thành công!");
      fetchCategories(); // Cập nhật lại danh sách danh mục
    } catch (error) {
      console.error("Error restoring category:", error);
      toast.error("Không thể khôi phục danh mục!");
    }
  };
  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      toast.success("Xóa danh mục thành công!");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Không thể xóa danh mục!");
    }
  };
  const handleSubmit = async (values) => {
    try {
      console.log("values: ",values);
      const formData = new FormData();
      formData.append("categoryName", values.categoryName);
      // formData.append("categoryThumbnail", values.categoryThumbnail || null);
      formData.append("categoryDescription", values.categoryDescription || "");
      formData.append("parentId", values.parentId || "");
      
      
      if (editingCategory) {
        // Update category
        await updateCategory(editingCategory.categoryId, formData);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        // Add new category
        await createCategory(formData);
        toast.success("Thêm danh mục thành công!");
      }

      setIsModalVisible(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Không thể lưu danh mục!");
    }
  };


  const columns = [
    {
      title: "ID",
      dataIndex: "categoryId",
      key: "categoryId",
    },
    {
      title: "Tên danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
    },

    {
      title: "Mô tả",
      dataIndex: "categoryDescription",
      key: "categoryDescription",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          {record.deletedAt === null ? (
            <>
              {/* Nút Sửa */}
              <Button
                type="link"
                icon={<EditOutlined style={{ fontSize: "18px" }} />}
                onClick={() => handleEditCategory(record)}
              />

              {/* Nút Xóa */}
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa danh mục này?"
                onConfirm={() => handleDeleteCategory(record.categoryId)}
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
            <>
              {/* Nút Khôi phục */}
              <Popconfirm
                title="Bạn có chắc chắn muốn khôi phục danh mục này?"
                onConfirm={() => handleRestoreCategory(record.categoryId)}
                okText="Khôi phục"
                cancelText="Hủy"
              >
                <Button
                  type="link"
                  style={{ color: "green" }}
                  icon={<UndoOutlined style={{ fontSize: "18px" }} />}
                />
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Quản lý danh mục</h1>
        {/* <Button
          type="primary"
          onClick={handleAddCategory}
          className="mb-4"
          icon={<PlusOutlined />}
        >
          Thêm
        </Button> */}
        <Button
          type="primary"
          onClick={handleAddCategory}
          className="mb-4"
          icon={<PlusOutlined style={{ fontSize: "18px" }} />}
          shape="circle"
        />
      </div>
      <Table columns={columns} dataSource={categories} rowKey="categoryId" />

      {/* Modal thêm/sửa danh mục */}
      <Modal
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Tên danh mục */}
          <Form.Item
            label="Tên danh mục"
            name="categoryName"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input />
          </Form.Item>

          {/* Ảnh danh mục */}
          {/* <Form.Item
            label="Ảnh danh mục"
            name="categoryThumbnail"
            valuePropName="file"
            getValueFromEvent={(e) => (e.file ? e.file.originFileObj : null)}
            rules={[{ required: false, message: "Vui lòng chọn ảnh danh mục!" }]}
          >
            <Input type="file" />
          </Form.Item> */}

          {/* Mô tả */}
          <Form.Item label="Mô tả" name="categoryDescription">
            <Input.TextArea />
          </Form.Item>

          {/* Danh mục cha */}
          <Form.Item label="Danh mục cha" name="parentId">
            <Input placeholder="Nhập ID danh mục cha (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
