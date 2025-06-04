import React from "react";
import { Card, Button } from "antd";
import { useNavigate } from "react-router-dom";

const { Meta } = Card;

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/products/${product.productId}`);
  };

  return (
    <Card
      hoverable
      style={{ width: 240 }}
      cover={
        <img
          alt={product.productName}
          src={
            product.thumbnail ||
            "https://js0fpsb45jobj.vcdn.cloud/storage/upload/media/gumac3/ple11074/2-be-ple11074-1.jpg"
          }
          onClick={handleNavigate}
          className="w-full h-50  rounded-lg"
        />
      }
    >
      <Meta
        title={
          <span
            style={{ cursor: "pointer", color: "#1890ff" }}
            onClick={handleNavigate}
          >
            {product.productName}
          </span>
        }
        description={
          <>
            <p className="font-bold text-orange-500">
              Giá: {product.basePrice ? `${product.basePrice} VND` : "Liên hệ"}
            </p>
            <p>Đã bán: {product.productSold}</p>
          </>
        }
      />
      <Button
        type="primary"
        className="bg-green-500"
        style={{ marginTop: 10, width: "100%" }}
        onClick={handleNavigate}
      >
        Xem chi tiết
      </Button>
    </Card>
  );
}
