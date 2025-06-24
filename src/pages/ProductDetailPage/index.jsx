import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Breadcrumb, Tag, Button, Skeleton, Tabs, Rate } from "antd";
import {
  getProductByCategoryId,
  getProductById,
} from "../../services/productService";
import { addToCart } from "../../services/cartService";
import { toast } from "react-toastify";
import ProductCard from "../../components/product/ProductCard";
import { getReviewsByProduct } from "../../services/reviewService";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await getProductById(productId);
        if (response.code === 200) {
          const productData = response.data;
          setProduct(productData);

          if (productData.productVariants.length > 0) {
            setSelectedVariant(productData.productVariants[0]);
          }
          if (productData.productResources.length > 0) {
            const primaryImage = productData.productResources.find(
              (resource) => resource.primary
            );
            setMainImage(
              primaryImage?.resourceUrl ||
                productData.productResources[0].resourceUrl
            );
          }
          if (productData.category?.categoryId) {
            const relatedRes = await getProductByCategoryId(
              productData.category.categoryId,
              0,
              8
            );
            if (Array.isArray(relatedRes.content)) {
              setRelatedProducts(
                relatedRes.content.filter(
                  (p) => p.productId !== productData.productId
                )
              );
            }
          }
        }
      } catch (error) {
        toast.error("Lỗi khi lấy chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchReviews = async () => {
      try {
        const res = await getReviewsByProduct(productId);
        console.log("review",res);
        if (res.code === 200) {
          setReviews(res.data || []);
          // Tính averageRating
          if (res.data && res.data.length > 0) {
            const avg =
              res.data.reduce((sum, r) => sum + r.reviewRating, 0) /
              res.data.length;
            setAverageRating(avg);
          } else {
            setAverageRating(0);
          }
        }
      } catch {
        setAverageRating(0);
      }
    };

    fetchProductDetail();
    fetchReviews();

    fetchProductDetail();
    
  }, [productId]);

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
  };

  const handleThumbnailClick = (imageUrl) => {
    setMainImage(imageUrl);
  };

  const handleQuantityChange = (value) => {
    if (value > 0 && value <= selectedVariant.stockQuantity) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (selectedVariant && quantity > 0) {
      try {
        const cartData = {
          productVariantId: selectedVariant.variantId,
          quantity: quantity,
        };
        await addToCart(cartData);
        toast.success("Sản phẩm đã được thêm vào giỏ hàng!");
      } catch (error) {
        toast.error("Không thể thêm sản phẩm vào giỏ hàng!");
      }
    }
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  if (!product) {
    return <div>Không tìm thấy sản phẩm</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 mb-4">
        {/* <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/products">Sản phẩm</Link>
          </Breadcrumb.Item>
          {product.category && (
            <Breadcrumb.Item>
              <Link to={`/products?category=${product.category.categoryId}`}>
                {product.category.categoryName}
              </Link>
            </Breadcrumb.Item>
          )}
          <Breadcrumb.Item>{product.productName}</Breadcrumb.Item>
        </Breadcrumb> */}
        <Breadcrumb
          items={[
            { title: <Link to="/">Trang chủ</Link> },
            { title: <Link to="/products">Sản phẩm</Link> },
            ...(product.category
              ? [
                  {
                    title: (
                      <Link
                        to={`/products?category=${product.category.categoryId}`}
                      >
                        {product.category.categoryName}
                      </Link>
                    ),
                  },
                ]
              : []),
            { title: product.productName },
          ]}
        />
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-8">
        {/* Left: Images */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <div className="rounded-lg overflow-hidden border shadow-sm bg-white">
            <img
              src={mainImage}
              alt={product.productName}
              className="w-full h-full object-cover bg-white"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {product.productResources.map((resource, index) => (
              <img
                key={index}
                src={resource.resourceUrl}
                alt={`Thumbnail ${index + 1}`}
                className={`w-16 h-16 object-cover rounded-lg cursor-pointer border transition ${
                  mainImage === resource.resourceUrl
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : "border-gray-300"
                }`}
                onClick={() => handleThumbnailClick(resource.resourceUrl)}
              />
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="md:w-1/2 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {product.productName}
            </h1>
            <div className="flex flex-wrap gap-2 mb-2">
              <Tag color="blue">
                {product.brand?.brandName || "Không có thương hiệu"}
              </Tag>
              <Tag color="purple">
                {product.category?.categoryName || "Không có danh mục"}
              </Tag>
              {selectedVariant?.stockQuantity > 0 ? (
                <Tag color="green">Còn hàng</Tag>
              ) : (
                <Tag color="red">Hết hàng</Tag>
              )}
            </div>
            {/* Average Rating */}
            <div className="flex items-center gap-2 mb-2">
              <Rate
                allowHalf
                disabled
                value={averageRating}
                style={{ fontSize: 20 }}
              />
              <span className="text-yellow-600 font-medium">
                {averageRating ? averageRating.toFixed(1) : "Chưa có đánh giá"}
              </span>
              <span className="text-gray-500 text-sm">
                ({reviews.length} đánh giá)
              </span>
            </div>
            <div className="text-xl font-bold text-red-500 mb-2">
              {selectedVariant?.variantPrice?.toLocaleString()} ₫
            </div>
            <div className="text-gray-600 mb-2">
              Đã bán: <b>{product.productSold}</b> | Còn lại:{" "}
              <b>{selectedVariant?.stockQuantity}</b>
            </div>
          </div>

          {/* Variants */}
          <div>
            <h3 className="font-semibold mb-1">Chọn biến thể:</h3>
            <div className="flex flex-wrap gap-2">
              {product.productVariants.map((variant) => (
                <Button
                  key={variant.variantId}
                  type={
                    selectedVariant?.variantId === variant.variantId
                      ? "primary"
                      : "default"
                  }
                  onClick={() => handleVariantChange(variant)}
                  size="small"
                  className="!rounded-lg"
                >
                  {variant.color} / {variant.size}
                </Button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="font-semibold mb-1">Số lượng:</h3>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                shape="circle"
              >
                -
              </Button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="w-16 text-center border rounded"
                min={1}
                max={selectedVariant?.stockQuantity}
              />
              <Button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= selectedVariant?.stockQuantity}
                shape="circle"
              >
                +
              </Button>
              <span className="text-gray-500 ml-2">
                (Còn lại: {selectedVariant?.stockQuantity || 0})
              </span>
            </div>
          </div>

          {/* Add to cart */}
          <Button
            type="primary"
            size="large"
            className="mt-4 w-1/2 !rounded-lg"
            onClick={handleAddToCart}
            disabled={selectedVariant?.stockQuantity <= 0}
          >
            Thêm vào giỏ hàng
          </Button>

          <div className="mt-6">
            <Tabs
              defaultActiveKey="1"
              type="card"
              items={[
                {
                  key: "1",
                  label: "Mô tả sản phẩm",
                  children: (
                    <div className="text-gray-700 whitespace-pre-line">
                      {product.productDescription || "Không có mô tả"}
                    </div>
                  ),
                },
                {
                  key: "2",
                  label: `Đánh giá (${reviews.length})`,
                  children:
                    reviews.length === 0 ? (
                      <div className="text-gray-500">Chưa có đánh giá nào.</div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div
                            key={review.reviewId}
                            className="border-b pb-3 mb-3 flex gap-3 items-start"
                          >
                            <img
                              src={
                                review.avatar ||
                                "https://imgs.search.brave.com/8tClYn-CooF3taY4EnAm1Q_iCp3XRNbYFvIjmjfb8yY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vOFdoTXVs/MUdvTE9PUFN0R3FH/SFpXUTl3ODZkUXBj/SkNJWkFWTVFDN1Jl/RS9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlr/YjJOei9MbWR5WVha/aGRHRnlMbU52L2JT/OTNjQzFqYjI1MFpX/NTAvTDNWd2JHOWha/SE12TWpBeS9OUzh3/TWk5aGRtRjBZWEl0/L2JYbHpkR1Z5ZVhC/bGNuTnYvYmkweU1E/STFNREl4TUMweS9O/VFl1Y0c1blAzYzlN/alUy"
                              }
                              alt={review.email}
                              className="w-10 h-10 rounded-full object-cover border"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Rate
                                  disabled
                                  value={review.reviewRating}
                                  style={{ fontSize: 16 }}
                                />
                                {/* <span className="text-gray-600 text-sm font-medium">
                                  {review.email}
                                </span> */}
                              </div>
                              <div className="text-gray-700">
                                {review.reviewComment || (
                                  <span className="italic text-gray-400">
                                    Không có nội dung
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Related products */}
      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Sản phẩm cùng danh mục
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.length === 0 && <p>Không có sản phẩm nào.</p>}
          {relatedProducts.map((item) => (
            <ProductCard key={item.productId} product={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { getProductByCategoryId, getProductById } from "../../services/productService";
// import { addToCart } from "../../services/cartService";
// import { toast } from "react-toastify";
// import ProductCard from "../../components/product/ProductCard";

// export default function ProductDetailPage() {
//   const { productId } = useParams(); // Lấy productId từ URL
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedVariant, setSelectedVariant] = useState(null); // Biến thể được chọn
//   const [quantity, setQuantity] = useState(1); // Số lượng sản phẩm
//   const [mainImage, setMainImage] = useState(null); // Hình ảnh chính
//   const [relatedProducts, setRelatedProducts] = useState([]);
//   useEffect(() => {
//     const fetchProductDetail = async () => {
//       try {
//         const response = await getProductById(productId); // Gọi API lấy chi tiết sản phẩm
//         if (response.code === 200) {
//           const productData = response.data;
//           setProduct(productData);

//           // Thiết lập giá trị mặc định cho biến thể và hình ảnh chính
//           if (productData.productVariants.length > 0) {
//             setSelectedVariant(productData.productVariants[0]);
//           }
//           if (productData.productResources.length > 0) {
//             const primaryImage = productData.productResources.find(
//               (resource) => resource.primary
//             );
//             setMainImage(
//               primaryImage?.resourceUrl ||
//                 productData.productResources[0].resourceUrl
//             );
//           }
//           if (productData.category?.categoryId) {
//             const relatedRes = await getProductByCategoryId(
//               productData.category.categoryId,
//               0,
//               8
//             );
//             if (Array.isArray(relatedRes.content)) {
//               setRelatedProducts(
//                 relatedRes.content.filter(
//                   (p) => p.productId !== productData.productId
//                 )
//               );
//             }
//           }

//         }
//       } catch (error) {
//         toast.error("Lỗi khi lấy chi tiết sản phẩm:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProductDetail();
//   }, [productId]);

//   const handleVariantChange = (variant) => {
//     setSelectedVariant(variant);
//   };

//   const handleThumbnailClick = (imageUrl) => {
//     setMainImage(imageUrl);
//   };

//   const handleQuantityChange = (value) => {
//     if (value > 0 && value <= selectedVariant.stockQuantity) {
//       setQuantity(value);
//     }
//   };

//   const handleAddToCart = async () => {
//     if (selectedVariant && quantity > 0) {
//       try {
//         // Gửi dữ liệu đến API thêm vào giỏ hàng
//         // Gửi dữ liệu dưới dạng JSON
//         const cartData = {
//           productVariantId: selectedVariant.variantId,
//           quantity: quantity,
//         };
//         await addToCart(cartData);
//         toast.success("Sản phẩm đã được thêm vào giỏ hàng!");

//       } catch (error) {
//         console.error("Lỗi khi thêm vào giỏ hàng:", error);
//         toast.error("Không thể thêm sản phẩm vào giỏ hàng!");
//       }
//     }
//   };

//   if (loading) {
//     return <div>Đang tải...</div>;
//   }

//   if (!product) {
//     return <div>Không tìm thấy sản phẩm</div>;
//   }

//   return (
//     <div className="flex flex-wrap p-6">
//       {/* Hình ảnh sản phẩm */}
//       <div className="w-full md:w-1/2">
//         {/* Hình ảnh chính */}
//         <div className="mb-4">
//           <img
//             src={mainImage}
//             alt="Main Product"
//             className="w-full h-150  rounded-lg shadow-md"
//           />
//         </div>

//         {/* Hình ảnh nhỏ (thumbnail) */}
//         <div className="flex space-x-4">
//           {product.productResources.map((resource, index) => (
//             <img
//               key={index}
//               src={resource.resourceUrl}
//               alt={`Thumbnail ${index + 1}`}
//               className={`w-16 h-16 object-cover rounded-lg cursor-pointer border ${
//                 mainImage === resource.resourceUrl
//                   ? "border-blue-500"
//                   : "border-gray-300"
//               }`}
//               onClick={() => handleThumbnailClick(resource.resourceUrl)}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Thông tin sản phẩm */}
//       <div className="w-full md:w-1/2 p-6">
//         <h1 className="text-3xl font-bold mb-4">{product.productName}</h1>
//         <div className="mb-4">
//           <h3 className="text-lg font-semibold mb-2">Thông tin chi tiết:</h3>
//           <p>Số lượng đã bán: {product.productSold}</p>
//           <p>Số lượng còn lại: {product.productQuantity}</p>
//           <p>Thương hiệu: {product.brand?.brandName || "Không có"}</p>
//           <p>Danh mục: {product.category?.categoryName || "Không có"}</p>
//         </div>
//         {/* Mô tả sản phẩm */}
//         <div className="mb-4">
//           <h3 className="text-lg font-semibold mb-2">Mô tả sản phẩm:</h3>
//           <p className="text-gray-700">
//             {product.productDescription || "Không có mô tả"}
//           </p>
//         </div>
//         {/* Biến thể (Màu sắc + Kích thước) */}
//         <div className="mb-4">
//           <h3 className="text-lg font-semibold mb-2">Chọn biến thể:</h3>
//           <div className="flex flex-wrap gap-4">
//             {product.productVariants.map((variant) => (
//               <button
//                 key={variant.variantId}
//                 className={`px-4 py-2 border rounded ${
//                   selectedVariant?.variantId === variant.variantId
//                     ? "border-blue-500 bg-blue-100"
//                     : "border-gray-300"
//                 }`}
//                 onClick={() => handleVariantChange(variant)}
//               >
//                 {variant.color} + {variant.size}
//               </button>
//             ))}
//           </div>
//         </div>
//         {/* Giá tiền */}
//         <div className="mb-4">
//           <h3 className="text-lg font-semibold mb-2">Giá tiền:</h3>
//           <p className="text-2xl font-bold text-red-500">
//             {selectedVariant?.variantPrice || 0} VND
//           </p>
//         </div>
//         {/* Số lượng */}
//         <div className="mb-4">
//           <h3 className="text-lg font-semibold mb-2">Số lượng:</h3>
//           <div className="flex items-center space-x-4">
//             <button
//               className="px-4 py-2 border rounded"
//               onClick={() => handleQuantityChange(quantity - 1)}
//               disabled={quantity <= 1}
//             >
//               -
//             </button>
//             <input
//               type="number"
//               value={quantity}
//               onChange={(e) => handleQuantityChange(Number(e.target.value))}
//               className="w-16 text-center border rounded"
//             />
//             <button
//               className="px-4 py-2 border rounded"
//               onClick={() => handleQuantityChange(quantity + 1)}
//               disabled={quantity >= selectedVariant?.stockQuantity}
//             >
//               +
//             </button>
//           </div>
//           <p className="text-sm text-gray-500">
//             Số lượng còn lại: {selectedVariant?.stockQuantity || 0}
//           </p>
//         </div>
//         {/* Nút thêm vào giỏ hàng */}
//         <button
//           className={`px-6 py-3 rounded ${
//             selectedVariant?.stockQuantity > 0
//               ? "bg-blue-500 text-white hover:bg-blue-600"
//               : "bg-gray-400 text-gray-700 cursor-not-allowed"
//           }`}
//           onClick={handleAddToCart}
//           disabled={selectedVariant?.stockQuantity <= 0}
//         >
//           Thêm vào giỏ hàng
//         </button>
//       </div>
//       {/* Sản phẩm cùng danh mục */}
//       <div className="w-full mt-12">
//         <h2 className="text-xl font-bold mb-4 text-gray-800">
//           Sản phẩm cùng danh mục
//         </h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//           {relatedProducts.length === 0 && <p>Không có sản phẩm nào.</p>}
//           {relatedProducts.map((item) => (
//             <ProductCard key={item.productId} product={item} />

//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { getProductById } from "../../services/productService";

// const colorMap = {
//   Đen: "#000000",
//   Đỏ: "#FF0000",
//   Xanh: "#0000FF",
//   Vàng: "#FFFF00",
//   Trắng: "#FFFFFF",
//   Xám: "#808080",
//   Cam: "#FFA500",
//   Hồng: "#FFC0CB",
//   Tím: "#800080",
//   Nâu: "#A52A2A",
//   XanhLá: "#008000",
//   XanhDương: "#0000FF",
//   XanhDaTrời: "#87CEEB",
//   XanhNgọc: "#00FFFF",
//   XanhLáCây: "#228B22",
// };

// export default function ProductDetailPage() {
//   const { productId } = useParams(); // Lấy productId từ URL
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedColor, setSelectedColor] = useState(null);
//   const [selectedSize, setSelectedSize] = useState(null);
//   const [price, setPrice] = useState(null);
//   const [stockQuantity, setStockQuantity] = useState(null); // Số lượng còn lại
//   const [mainImage, setMainImage] = useState(null); // Hình ảnh chính

//   useEffect(() => {
//     const fetchProductDetail = async () => {
//       try {
//         const response = await getProductById(productId); // Gọi API lấy chi tiết sản phẩm
//         if (response.code === 200) {
//           const productData = response.data;
//           setProduct(productData);

//           // Thiết lập giá trị mặc định cho màu sắc, kích thước, giá và hình ảnh chính
//           if (productData.productVariants.length > 0) {
//             const defaultVariant = productData.productVariants[0];
//             setSelectedColor(defaultVariant.color);
//             setSelectedSize(defaultVariant.size);
//             setPrice(defaultVariant.variantPrice);
//             setStockQuantity(defaultVariant.stockQuantity);
//           }
//           if (productData.productResources.length > 0) {
//             const primaryImage = productData.productResources.find(
//               (resource) => resource.primary
//             );
//             setMainImage(
//               primaryImage?.resourceUrl ||
//                 productData.productResources[0].resourceUrl
//             );
//           }
//         }
//       } catch (error) {
//         console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProductDetail();
//   }, [productId]);

//   const handleVariantChange = (color, size) => {
//     const selectedVariant = product.productVariants.find(
//       (variant) => variant.color === color && variant.size === size
//     );
//     if (selectedVariant) {
//       setSelectedColor(color);
//       setSelectedSize(size);
//       setPrice(selectedVariant.variantPrice);
//       setStockQuantity(selectedVariant.stockQuantity); // Cập nhật số lượng còn lại
//     }
//   };

//   const handleThumbnailClick = (imageUrl) => {
//     setMainImage(imageUrl);
//   };

//   if (loading) {
//     return <div>Đang tải...</div>;
//   }

//   if (!product) {
//     return <div>Không tìm thấy sản phẩm</div>;
//   }

//   return (
//     <div className="flex flex-wrap p-6">
//       {/* Hình ảnh sản phẩm */}
//       <div className="w-full md:w-1/2">
//         {/* Hình ảnh chính */}
//         <div className="mb-4">
//           <img
//             src={mainImage}
//             alt="Main Product"
//             className="w-full h-125 object-cover rounded-lg shadow-md"
//           />
//         </div>

//         {/* Hình ảnh nhỏ (thumbnail) */}
//         <div className="flex space-x-4">
//           {product.productResources.map((resource, index) => (
//             <img
//               key={index}
//               src={resource.resourceUrl}
//               alt={`Thumbnail ${index + 1}`}
//               className={`w-16 h-16 object-cover rounded-lg cursor-pointer border ${
//                 mainImage === resource.resourceUrl
//                   ? "border-blue-500"
//                   : "border-gray-300"
//               }`}
//               onClick={() => handleThumbnailClick(resource.resourceUrl)}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Thông tin sản phẩm */}
//       <div className="w-full md:w-1/2 p-6">
//         <h1 className="text-3xl font-bold mb-4">{product.productName}</h1>
//         {/* Thông tin thêm */}

//         <div className="mb-4">
//           <h3 className="text-lg font-semibold mb-2">Thông tin chi tiết:</h3>
//           <p>Số lượng đã bán: {product.productSold}</p>
//           <p>Số lượng còn lại: {product.productQuantity}</p>
//           <p>Thương hiệu: {product.brand?.brandName || "Không có"}</p>
//           <p>Danh mục: {product.category?.categoryName || "Không có"}</p>
//         </div>
//         {/* Mô tả sản phẩm */}
//         <div className="mb-4">
//           <h3 className="text-lg font-semibold mb-2">Mô tả sản phẩm:</h3>
//           <p className="text-gray-700">
//             {product.productDescription || "Không có mô tả"}
//           </p>
//         </div>
//         {/* Màu sắc */}
//         <div className="mb-4">
//           <h3 className="text-lg font-semibold mb-2">Màu sắc:</h3>
//           <div className="flex space-x-4">
//             {[...new Set(product.productVariants.map((v) => v.color))].map(
//               (color, index) => (
//                 <button
//                   key={index}
//                   className={`w-8 h-8 rounded-full border-2 ${
//                     selectedColor === color
//                       ? "border-blue-500"
//                       : "border-gray-300"
//                   }`}
//                   style={{ backgroundColor: colorMap[color] || "gray" }}
//                   onClick={() => handleVariantChange(color, selectedSize)}
//                 ></button>
//               )
//             )}
//           </div>
//         </div>
//         {/* Kích thước */}
//         <div className="mb-4">
//           <h3 className="text-lg font-semibold mb-2">Kích thước:</h3>
//           <div className="flex space-x-4">
//             {[...new Set(product.productVariants.map((v) => v.size))].map(
//               (size, index) => (
//                 <button
//                   key={index}
//                   className={`px-4 py-2 border rounded ${
//                     selectedSize === size
//                       ? "border-blue-500 bg-blue-100"
//                       : "border-gray-300"
//                   }`}
//                   onClick={() => handleVariantChange(selectedColor, size)}
//                 >
//                   {size}
//                 </button>
//               )
//             )}
//           </div>
//         </div>
//         {/* Giá tiền */}
//         <div className="flex gap-4 mb-4">
//           <h3 className="text-lg font-semibold mb-2">Giá tiền:</h3>
//           <p className="text-2xl font-bold text-red-500">{price} VND</p>
//         </div>

//         {/* Số lượng còn lại */}
//         <div className="flex gap-4  mb-4 ">
//           <h3 className="text-lg font-semibold mb-2">Số lượng còn lại: </h3>
//           <p className="text-lg">{stockQuantity || "Không có thông tin"}</p>
//         </div>
//         {/* Nút thêm vào giỏ hàng */}
//         <button
//           className={`px-6 py-3 rounded ${
//             stockQuantity > 0
//               ? "bg-blue-500 text-white hover:bg-blue-600"
//               : "bg-gray-400 text-gray-700 cursor-not-allowed"
//           }`}
//           disabled={stockQuantity <= 0}
//         >
//           {stockQuantity > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
//         </button>
//       </div>
//     </div>
//   );
// }
