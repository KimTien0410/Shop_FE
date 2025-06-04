import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-cards";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import ProductCard from "./ProductCard";
import { Row, Col } from "antd";

export default function SwiperComponent({ title, products = [], subtitle }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  return (
    <div className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800 relative inline-block">
            {title}
            <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
          </h2>
          {subtitle && (
            <p className="text-gray-600 max-w-xl mx-auto text-lg">{subtitle}</p>
          )}
          <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Swiper Carousel */}
        <div className="relative">
          {/* Custom navigation arrows outside swiper */}
          <div className="absolute top-1/2 -left-4 z-10 hidden md:block">
            <button className="swiper-button-prev-custom bg-white rounded-full p-3 shadow-lg text-blue-500 hover:bg-blue-50 transition-all duration-300 focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
          <div className="absolute top-1/2 -right-4 z-10 hidden md:block">
            <button className="swiper-button-next-custom bg-white rounded-full p-3 shadow-lg text-blue-500 hover:bg-blue-50 transition-all duration-300 focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            spaceBetween={24}
            slidesPerView={5}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              renderBullet: function (index, className) {
                return `<span class="${className} bg-blue-500 opacity-70 w-3 h-3"></span>`;
              },
            }}
            loop={products.length > 5}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 10 },
              640: { slidesPerView: 2, spaceBetween: 15 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 20 },
              1280: { slidesPerView: 5, spaceBetween: 20 },
            }}
            className="px-1 py-4"
          >
            {products.map((product, index) => (
              <SwiperSlide
                key={product.productId}
                className="transition-transform duration-300 hover:scale-105"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={`h-full ${
                    hoveredIndex === index ? "shadow-xl" : "shadow-md"
                  } rounded-xl overflow-hidden transition-shadow duration-300`}
                >
                  <ProductCard
                    product={product}
                    isHovered={hoveredIndex === index}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* View All Button */}
        {/* <div className="text-center mt-8">
          <button className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-300 transform hover:scale-105">
            Xem tất cả
          </button>
        </div> */}
      </div>
    </div>
  );
}



// import React, { useState } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css"; // Import CSS cơ bản của Swiper
// import "swiper/css/navigation"; // Import CSS cho Navigation
// import "swiper/css/pagination"; // Import CSS cho Pagination
// import "swiper/css/scrollbar"; // Import CSS cho Scrollbar
// import ProductCard from "./ProductCard";
// import { Row, Col } from "antd"; // 💡 import từ Ant Design

// // Import các module từ Swiper
// import { Navigation, Pagination, Scrollbar } from "swiper/modules";

// export default function SwiperComponent({title,products=[]}) {
//   return (
//     <>
//       <Row className="mt-10 mb-6">
//         <Col span={24}>
//           <h2 className="text-center text-3xl font-semibold text-gray-800">
//             {title}
//           </h2>
//         </Col>
//       </Row>

//       <Row justify="center" style={{ padding: "0 16px" }}>
//         <Col xs={24} sm={22} md={20} lg={18} xl={16}>
//           <div
//             className="bg-white shadow-md rounded-lg p-4"
//             style={{ maxWidth: "1200px", margin: "0 auto" }}
//           >
//             <Swiper
//               modules={[Navigation, Pagination, Scrollbar]}
//               spaceBetween={20}
//               slidesPerView={4}
//               navigation
//               pagination={{ clickable: true }}
//               breakpoints={{
//                 320: { slidesPerView: 1 },
//                 640: { slidesPerView: 2 },
//                 768: { slidesPerView: 3 },
//                 1024: { slidesPerView: 4 },
//               }}
//             >
//               {products.map((product) => (
//                 <SwiperSlide key={product.productId}>
//                   <ProductCard product={product} />
//                 </SwiperSlide>
//               ))}
//             </Swiper>
//           </div>
//         </Col>
//       </Row>
//     </>
// );
// }
//hhhhh
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
// 