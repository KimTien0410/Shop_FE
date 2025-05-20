import React, { useEffect, useState } from "react";
import { Select, Button, message, Tag } from "antd";
import { getVoucherActive } from "../../services/voucherService";

export default function VoucherInput({ orderTotal, onApplyVoucher }) {
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await getVoucherActive();
        const now = new Date();
        // Lọc voucher còn hiệu lực theo thời gian
        const validVouchers = (res.data || []).filter(
          (v) =>
            new Date(v.startDate) <= now &&
            new Date(v.endDate) >= now &&
            (!v.quantity || v.quantity > 0)
        );
        setVouchers(validVouchers);
      } catch {
        message.error("Không thể tải voucher!");
      }
    };
    fetchVouchers();
  }, []);

  const handleApply = () => {
    if (!selectedVoucher) {
      message.warning("Vui lòng chọn voucher!");
      return;
    }
    // Kiểm tra điều kiện áp dụng
    if (
      orderTotal < selectedVoucher.minOrderValue ||
      (selectedVoucher.maxOrderValue &&
        orderTotal > selectedVoucher.maxOrderValue)
    ) {
      message.error("Đơn hàng không đủ điều kiện áp dụng voucher này!");
      return;
    }
    onApplyVoucher(selectedVoucher);
    message.success("Áp dụng voucher thành công!");
  };

  const handleRemove = () => {
    setSelectedVoucher(null);
    onApplyVoucher(null);
    message.info("Đã bỏ áp dụng voucher.");
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        showSearch
        style={{ width: 250 }}
        placeholder="Chọn voucher"
        optionFilterProp="children"
        value={selectedVoucher?.voucherId}
        onChange={(id) => {
          const v = vouchers.find((v) => v.voucherId === id);
          setSelectedVoucher(v);
        }}
        filterOption={(input, option) =>
          (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
        }
        disabled={!!selectedVoucher}
      >
        {vouchers.map((v) => (
          <Select.Option key={v.voucherId} value={v.voucherId}>
            <Tag color={v.discountType === "PERCENTAGE" ? "blue" : "green"}>
              {v.discountType === "PERCENTAGE"
                ? `${v.discountValue}%`
                : `${v.discountValue} VNĐ`}
            </Tag>
            {v.voucherCode}
          </Select.Option>
        ))}
      </Select>
      {!selectedVoucher ? (
        <Button type="primary" onClick={handleApply}>
          Áp dụng
        </Button>
      ) : (
        <Button danger onClick={handleRemove}>
          Bỏ áp dụng
        </Button>
      )}
      {selectedVoucher && (
        <span className="ml-2 text-green-600">
          Đã áp dụng: <b>{selectedVoucher.voucherCode}</b>
        </span>
      )}
    </div>
  );
}
