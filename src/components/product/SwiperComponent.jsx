import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; // Import CSS cơ bản của Swiper
import "swiper/css/navigation"; // Import CSS cho Navigation
import "swiper/css/pagination"; // Import CSS cho Pagination
import "swiper/css/scrollbar"; // Import CSS cho Scrollbar
import ProductCard from "./ProductCard";
import { Row, Col } from "antd"; // 💡 import từ Ant Design

// Import các module từ Swiper
import { Navigation, Pagination, Scrollbar } from "swiper/modules";

export default function SwiperComponent({title,products=[]}) {
  return (
    <>
      <Row className="mt-10 mb-6">
        <Col span={24}>
          <h2 className="text-center text-3xl font-semibold text-gray-800">
            {title}
          </h2>
        </Col>
      </Row>

      <Row justify="center" style={{ padding: "0 16px" }}>
        <Col xs={24} sm={22} md={20} lg={18} xl={16}>
          <div
            className="bg-white shadow-md rounded-lg p-4"
            style={{ maxWidth: "1200px", margin: "0 auto" }}
          >
            <Swiper
              modules={[Navigation, Pagination, Scrollbar]}
              spaceBetween={20}
              slidesPerView={4}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                320: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
            >
              {products.map((product) => (
                <SwiperSlide key={product.productId}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </Col>
      </Row>
    </>

    // <>
    //       <Row className="mt-10">
    //         <Col span={12}>
    //           <h2 className="font-bold text-center text-2xl">
    //             {title}
    //           </h2>
    //         </Col>
    //       </Row>

    //   <Row justify="center" gutter={[16, 16]} style={{ padding: "20px" }}>
    //     <Col
    //       xs={24}
    //       sm={22}
    //       md={20}
    //       lg={18}
    //       xl={16}
    //       style={{ padding: "0 20px" }}
    //     >
    //       <Swiper
    //         modules={[Navigation, Pagination, Scrollbar]}
    //         spaceBetween={50}
    //         slidesPerView={4}
    //         navigation
    //         pagination={{ clickable: true }}
    //         breakpoints={{
    //           320: { slidesPerView: 1 },
    //           640: { slidesPerView: 2 },
    //           768: { slidesPerView: 3 },
    //           1024: { slidesPerView: 4 },
    //         }}
    //       >
    //         {products.map((product) => (
    //           <SwiperSlide key={product.productId}>
    //             <ProductCard product={product} />
    //           </SwiperSlide>
    //         ))}
    //       </Swiper>
    //     </Col>
    //   </Row>
    // </>
  );
}