import React, { useEffect, useState } from "react";
import { Select, Button,Tag } from "antd";
import { getVoucherActive } from "../../services/voucherService";
import { toast } from "react-toastify";

export default function VoucherInput({ orderTotal, onApplyVoucher, selectedVoucher }) {
  const [vouchers, setVouchers] = useState([]);
  // const [selectedVoucher, setSelectedVoucher] = useState(null);

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
       toast.error("Không thể tải voucher!");
      }
    };
    fetchVouchers();
  }, []);

  const handleApply = (id) => {
    const voucher = vouchers.find((v) => v.voucherId === id);
    if (!voucher) return;
    if (
      orderTotal < voucher.minOrderValue ||
      (voucher.maxOrderValue && orderTotal > voucher.maxOrderValue)
    ) {
      toast.error("Đơn hàng không đủ điều kiện áp dụng voucher này!");
      return;
    }
    onApplyVoucher(voucher);
    toast.success("Áp dụng voucher thành công!");
  };


  const handleRemove = () => {
    onApplyVoucher(null);
    toast.info("Đã bỏ áp dụng voucher.");
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        showSearch
        style={{ width: 250 }}
        placeholder="Chọn voucher"
        optionFilterProp="children"
        value={selectedVoucher?.voucherId}
        onChange={handleApply}
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
      {!selectedVoucher ? null : (
        <Button danger onClick={handleRemove}>
          Bỏ áp dụng
        </Button>
      )}
      {/* {!selectedVoucher ? null : (
        <Button danger onClick={handleRemove}>
          Bỏ áp dụng
        </Button>
      )} */}
      {selectedVoucher && (
        <span className="ml-2 text-green-600">
          Đã áp dụng: <b>{selectedVoucher.voucherCode}</b>
        </span>
      )}
    </div>
  );
}
