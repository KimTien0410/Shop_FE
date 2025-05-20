
import React, { useState } from "react";
import ProductCard from "./ProductCard";
import { Pagination } from "antd";
export function ProductList({ products = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8; // Số sản phẩm hiển thị trên mỗi trang

  // Tính toán sản phẩm hiển thị trên trang hiện tại
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Danh sách sản phẩm */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentProducts.map((product) => (
          <ProductCard key={product.productId} product={product} />
        ))}
      </div>

      {/* Phân trang */}
      <div className="flex justify-center mt-6">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={products.length}
          onChange={handlePageChange}
          showSizeChanger={false} // Ẩn tùy chọn thay đổi số sản phẩm mỗi trang
        />
      </div>
    </div>
  );
}