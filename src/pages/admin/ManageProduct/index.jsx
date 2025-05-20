import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  InputNumber,
  Upload,
} from "antd";
import { toast } from "react-toastify";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
} from "../../../services/productService";
import { getBrandAdmin } from "../../../services/brandService";
import {  getAllCategoriesByAdmin } from "../../../services/categoryService";

export default function ManageProduct() {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetchProducts(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);
  useEffect(() => {
    if (isModalVisible) {
      fetchBrands();
      fetchCategories();
    }
  }, [isModalVisible]);
  const fetchBrands = async () => {
    try {
      const response = await getBrandAdmin(); // Gọi API lấy danh sách thương hiệu
      setBrands(response.data.content); // Gán dữ liệu thương hiệu vào state
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Không thể tải danh sách thương hiệu!");
    }
  };
  const processCategories = (categories) => {
    const result = [];

    const traverse = (categoryList, parentName = "") => {
      categoryList.forEach((category) => {
        const fullName = parentName
          ? `${parentName} > ${category.categoryName}`
          : category.categoryName;

        result.push({
          categoryId: category.categoryId,
          categoryName: fullName,
        });

        if (category.children && category.children.length > 0) {
          traverse(category.children, fullName); // Đệ quy để xử lý danh mục con
        }
      });
    };

    traverse(categories);
    return result;
  };
  const fetchCategories = async () => {
    try {
      const response = await getAllCategoriesByAdmin(); // Gọi API lấy danh sách danh mục
      console.log("Response category data:", response); // Log the response data
      // setCategories(response.content); // Gán dữ liệu danh mục vào state
      const processedCategories = processCategories(response.content); // Xử lý danh mục
      setCategories(processedCategories); // Gán dữ liệu danh mục đã xử lý vào state
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Không thể tải danh sách danh mục!");
    }
  };
  const fetchProducts = async (page = 1, pageSize = 5) => {
    try {
      const response = await getProducts(page - 1, pageSize); // API sử dụng page bắt đầu từ 0
      setProducts(response.data.content); // Gán danh sách sản phẩm
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: response.data.totalElements, // Tổng số phần tử
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải danh sách sản phẩm!");
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditProduct = (record) => {
    setEditingProduct(record);
    // Ánh xạ dữ liệu từ record vào form
    // Xử lý hình ảnh để hiển thị trong Upload
    const fileList =
      record.productResources?.map((resource) => ({
        uid: resource.resourceId, // Mỗi file cần một uid duy nhất
        name: resource.resourceName, // Tên file
        url: resource.resourceUrl, // URL của hình ảnh
      })) || [];
    form.setFieldsValue({
      productName: record.productName,
      productDescription: record.productDescription,
      brandId: record.brand?.brandId, // Lấy brandId từ record.brand
      categoryId: record.category?.categoryId, // Lấy categoryId từ record.category
      productVariants: record.productVariants || [], // Biến thể sản phẩm
      images: fileList,
    });
    setIsModalVisible(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      toast.success("Xóa sản phẩm thành công!");
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Không thể xóa sản phẩm!");
    }
  };

  const handleRestoreProduct = async (productId) => {
    try {
      await restoreProduct(productId);
      toast.success("Khôi phục sản phẩm thành công!");
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error restoring product:", error);
      toast.error("Không thể khôi phục sản phẩm!");
    }
  };

 
  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Thêm các trường của product vào FormData
      formData.append("productName", values.productName);
      formData.append("productDescription", values.productDescription || "");
      formData.append("isNewArrival", values.isNewArrival || true);
      formData.append("brandId", values.brandId);
      formData.append("categoryId", values.categoryId);

      // Thêm productVariants vào FormData (mỗi biến thể là một phần tử riêng)
      values.productVariants.forEach((variant, index) => {
        formData.append(`productVariants[${index}].color`, variant.color);
        formData.append(`productVariants[${index}].size`, variant.size);
        formData.append(
          `productVariants[${index}].stockQuantity`,
          variant.stockQuantity
        );
        formData.append(
          `productVariants[${index}].variantPrice`,
          variant.variantPrice
        );
      });

      // Chuẩn hóa dữ liệu hình ảnh
      // let fileList = [];

      // if (Array.isArray(values.images)) {
      //   fileList = values.images;
      // } else if (
      //   values.images &&
      //   typeof values.images === "object" &&
      //   values.images.length !== undefined
      // ) {
      //   fileList = Array.from(values.images); // Trường hợp là FileList
      // }

      // // const fileList = Array.isArray(values.images) ? values.images : []; // Đảm bảo fileList luôn là một mảng
      // fileList.forEach((file) => {
      //   if (file.originFileObj) {
      //     // Hình ảnh mới tải lên
      //     formData.append("images", file.originFileObj);
      //   } else if (file.url) {
      //     // Hình ảnh cũ (URL)
      //     formData.append("existingImages", file.url);
      //   }
      // });
      // Chuẩn hóa dữ liệu hình ảnh
      const fileList = Array.isArray(values.images) ? values.images : []; // Đảm bảo fileList luôn là một mảng
      fileList.forEach((file) => {
        if (file.originFileObj) {
          // Hình ảnh mới tải lên
          formData.append("images", file.originFileObj);
        } else if (file.url) {
          // Hình ảnh cũ (URL)
          formData.append("existingImages", file.url);
        }
      });

      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });

      if (editingProduct) {
        // Update product
        console.log(editingProduct.productId);
        await updateProduct(editingProduct.productId, formData);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        // Add new product
        await addProduct(formData);
        toast.success("Thêm sản phẩm thành công!");
      }

      setIsModalVisible(false);
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Không thể lưu sản phẩm!");
    }
  };
  const columns = [
    {
      title: "ID",
      dataIndex: "productId",
      key: "productId",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Số lượng",
      dataIndex: "productQuantity",
      key: "productQuantity",
    },
    {
      title: "Giá cơ bản",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (price) => `${price.toLocaleString()} VND`,
    },
    {
      title: "Thương hiệu",
      dataIndex: ["brand", "brandName"],
      key: "brand",
    },
    {
      title: "Danh mục",
      dataIndex: ["category", "categoryName"],
      key: "category",
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
                onClick={() => handleEditProduct(record)}
              />
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa sản phẩm này?"
                onConfirm={() => handleDeleteProduct(record.productId)}
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
              title="Bạn có chắc chắn muốn khôi phục sản phẩm này?"
              onConfirm={() => handleRestoreProduct(record.productId)}
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
        <h1 className="text-2xl font-bold mb-4">Quản lý sản phẩm</h1>
        <Button
          type="primary"
          onClick={handleAddProduct}
          className="mb-4"
          icon={<PlusOutlined style={{ fontSize: "18px" }} />}
          shape="circle"
        />
         
      </div>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="productId"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            fetchProducts(page, pageSize); // Gọi lại API khi thay đổi trang
          },
        }}
      />

      <Modal
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên sản phẩm"
            name="productName"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
          >
            <Input />
          </Form.Item>

          {/* <Form.Item
            label="Số lượng"
            name="productQuantity"
            rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
          >
            <InputNumber min={0} />
          </Form.Item> */}
          <Form.Item
            label="Thương hiệu"
            name="brandId"
            rules={[{ required: true, message: "Vui lòng chọn thương hiệu!" }]}
          >
            <Select placeholder="Chọn thương hiệu">
              {brands.map((brand) => (
                <Select.Option key={brand.brandId} value={brand.brandId}>
                  {brand.brandName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((category) => (
                <Select.Option
                  key={category.categoryId}
                  value={category.categoryId}
                >
                  {category.categoryName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Mô tả sản phẩm"
            name="productDescription"
            rules={[
              { required: false, message: "Vui lòng nhập mô tả sản phẩm!" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
          </Form.Item>
          <Form.List name="productVariants">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <div key={key} className="flex gap-4 items-center">
                    <Form.Item
                      {...restField}
                      name={[name, "color"]}
                      fieldKey={[fieldKey, "color"]}
                      rules={[
                        { required: true, message: "Vui lòng nhập màu sắc!" },
                      ]}
                    >
                      <Input placeholder="Màu sắc" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "size"]}
                      fieldKey={[fieldKey, "size"]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập kích thước!",
                        },
                      ]}
                    >
                      <Input placeholder="Kích thước" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "stockQuantity"]}
                      fieldKey={[fieldKey, "stockQuantity"]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số lượng tồn kho!",
                        },
                      ]}
                    >
                      <InputNumber placeholder="Số lượng tồn kho" min={0} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "variantPrice"]}
                      fieldKey={[fieldKey, "variantPrice"]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập giá biến thể!",
                        },
                      ]}
                    >
                      <InputNumber placeholder="Giá biến thể" min={0} />
                    </Form.Item>
                    <Button
                      type="link"
                      danger
                      onClick={() => remove(name)}
                      icon={<DeleteOutlined />}
                    />
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm biến thể
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item
            label="Hình ảnh"
            name="images"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              console.log("Upload event:", e);
              return Array.isArray(e) ? e : e?.fileList || [];
            }}
          >
            <Upload
              listType="picture"
              beforeUpload={() => false} // Không tự động tải lên
              multiple
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Tải lên</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
