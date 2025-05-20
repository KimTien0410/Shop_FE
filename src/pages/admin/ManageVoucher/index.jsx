import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Popconfirm,
  message,
} from "antd";
import moment from "moment";
import {
  getAllVoucher,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from "../../../services/voucherService";
import { toast } from "react-toastify";
const { RangePicker } = DatePicker;
import {
  PlusOutlined,EditOutlined,
  DeleteOutlined,

} from "@ant-design/icons";

export default function ManageVoucher() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [form] = Form.useForm();

  // Lấy danh sách voucher
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await getAllVoucher();
      setVouchers(res.data || []);
    } catch (err) {
      message.error("Không thể tải danh sách voucher!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Mở modal thêm/sửa
  const openModal = (voucher = null) => {
    setEditingVoucher(voucher);
    if (voucher) {
      form.setFieldsValue({
        ...voucher,
        dateRange: [moment(voucher.startDate), moment(voucher.endDate)],
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Xử lý submit form
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const { dateRange, ...rest } = values;
      const payload = {
        ...rest,
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
      };
      console.log("Payload:", payload);
      if (editingVoucher) {
        await updateVoucher(editingVoucher.voucherId, payload);
        toast.success("Cập nhật voucher thành công!");
      } else {
        await createVoucher(payload);
        toast.success("Thêm voucher thành công!");
      }
      setModalVisible(false);
      fetchVouchers();
    } catch (err) {
      // validation error
    }
  };

  // Xoá voucher
  const handleDelete = async (voucherId) => {
    try {
      await deleteVoucher(voucherId);
      toast.success("Xoá voucher thành công!");
      fetchVouchers();
    } catch (err) {
      toast.error("Không thể xoá voucher!");
    }
  };

  const columns = [
    { title: "Mã voucher", dataIndex: "voucherCode", key: "voucherCode" },
    {
      title: "Loại giảm",
      dataIndex: "discountType",
      key: "discountType",
      render: (v) => (v === "PERCENTAGE" ? "Phần trăm" : "Cố định"),
    },
    { title: "Giá trị", dataIndex: "discountValue", key: "discountValue" },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minOrderValue",
      key: "minOrderValue",
    },
    {
      title: "Đơn tối đa",
      dataIndex: "maxOrderValue",
      key: "maxOrderValue",
      render: (v) => v ?? "-",
    },
    {
      title: "Bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (v) => moment(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (v) => moment(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <>
          {/* <Button type="link" onClick={() => openModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xoá voucher này?"
            onConfirm={() => handleDelete(record.voucherId)}
          >
            <Button type="link" danger>
              Xoá
            </Button>
          </Popconfirm> */}

          <Button
            type="link"
            icon={<EditOutlined style={{ fontSize: "18px" }} />}
            onClick={() => openModal(record)}
          />

          {/* Nút Xóa */}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa voucher này?"
            onConfirm={() => handleDelete(record.voucherId)}
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
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Quản lý Voucher</h1>
        {/* <Button
            type="primary"
            onClick={() => openModal()}
            style={{ marginBottom: 16 }}
          >
            Thêm voucher
          </Button> */}
        <Button
          type="primary"
          onClick={() => openModal()}
          className="mb-4"
          icon={<PlusOutlined style={{ fontSize: "18px" }} />}
          shape="circle"
        />
      </div>
      <Table
        columns={columns}
        dataSource={vouchers}
        rowKey="voucherId"
        loading={loading}
        bordered
      />

      <Modal
        title={editingVoucher ? "Cập nhật voucher" : "Thêm voucher"}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="voucherCode"
            label="Mã voucher"
            rules={[{ required: true, message: "Nhập mã voucher" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="discountType"
            label="Loại giảm"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="PERCENTAGE">Phần trăm (%)</Select.Option>
              <Select.Option value="FIXED">Cố định (VNĐ)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="discountValue"
            label="Giá trị giảm"
            rules={[{ required: true, type: "number", min: 1 }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              {
                required: true,
                type: "number",
                min: 0,
                message: "Nhập số lượng >= 0",
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="minOrderValue"
            label="Đơn tối thiểu"
            rules={[{ required: true, type: "number", min: 0 }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="maxOrderValue" label="Đơn tối đa">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Thời gian áp dụng"
            rules={[{ required: true, type: "array", len: 2 }]}
          >
            <RangePicker showTime format="DD/MM/YYYY HH:mm" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
