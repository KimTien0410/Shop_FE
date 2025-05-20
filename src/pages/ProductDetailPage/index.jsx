import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProductByCategoryId, getProductById } from "../../services/productService";
import { message } from "antd";
import { addToCart } from "../../services/cartService";
import { toast } from "react-toastify";
import ProductCard from "../../components/product/ProductCard";

const colorMap = {
  Đen: "#000000",
  Đỏ: "#FF0000",
  Xanh: "#0000FF",
};

export default function ProductDetailPage() {
  const { productId } = useParams(); // Lấy productId từ URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null); // Biến thể được chọn
  const [quantity, setQuantity] = useState(1); // Số lượng sản phẩm
  const [mainImage, setMainImage] = useState(null); // Hình ảnh chính
  const [relatedProducts, setRelatedProducts] = useState([]);
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await getProductById(productId); // Gọi API lấy chi tiết sản phẩm
        if (response.code === 200) {
          const productData = response.data;
          setProduct(productData);

          // Thiết lập giá trị mặc định cho biến thể và hình ảnh chính
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
        // Gửi dữ liệu đến API thêm vào giỏ hàng
        // Gửi dữ liệu dưới dạng JSON
        const cartData = {
          productVariantId: selectedVariant.variantId,
          quantity: quantity,
        };
        await addToCart(cartData);
        toast.success("Sản phẩm đã được thêm vào giỏ hàng!");
        
      } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
        toast.error("Không thể thêm sản phẩm vào giỏ hàng!");
      }
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!product) {
    return <div>Không tìm thấy sản phẩm</div>;
  }

  return (
    <div className="flex flex-wrap p-6">
      {/* Hình ảnh sản phẩm */}
      <div className="w-full md:w-1/2">
        {/* Hình ảnh chính */}
        <div className="mb-4">
          <img
            src={mainImage}
            alt="Main Product"
            className="w-full h-150  rounded-lg shadow-md"
          />
        </div>

        {/* Hình ảnh nhỏ (thumbnail) */}
        <div className="flex space-x-4">
          {product.productResources.map((resource, index) => (
            <img
              key={index}
              src={resource.resourceUrl}
              alt={`Thumbnail ${index + 1}`}
              className={`w-16 h-16 object-cover rounded-lg cursor-pointer border ${
                mainImage === resource.resourceUrl
                  ? "border-blue-500"
                  : "border-gray-300"
              }`}
              onClick={() => handleThumbnailClick(resource.resourceUrl)}
            />
          ))}
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="w-full md:w-1/2 p-6">
        <h1 className="text-3xl font-bold mb-4">{product.productName}</h1>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Thông tin chi tiết:</h3>
          <p>Số lượng đã bán: {product.productSold}</p>
          <p>Số lượng còn lại: {product.productQuantity}</p>
          <p>Thương hiệu: {product.brand?.brandName || "Không có"}</p>
          <p>Danh mục: {product.category?.categoryName || "Không có"}</p>
        </div>
        {/* Mô tả sản phẩm */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Mô tả sản phẩm:</h3>
          <p className="text-gray-700">
            {product.productDescription || "Không có mô tả"}
          </p>
        </div>
        {/* Biến thể (Màu sắc + Kích thước) */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Chọn biến thể:</h3>
          <div className="flex flex-wrap gap-4">
            {product.productVariants.map((variant) => (
              <button
                key={variant.variantId}
                className={`px-4 py-2 border rounded ${
                  selectedVariant?.variantId === variant.variantId
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-300"
                }`}
                onClick={() => handleVariantChange(variant)}
              >
                {variant.color} + {variant.size}
              </button>
            ))}
          </div>
        </div>
        {/* Giá tiền */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Giá tiền:</h3>
          <p className="text-2xl font-bold text-red-500">
            {selectedVariant?.variantPrice || 0} VND
          </p>
        </div>
        {/* Số lượng */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Số lượng:</h3>
          <div className="flex items-center space-x-4">
            <button
              className="px-4 py-2 border rounded"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              className="w-16 text-center border rounded"
            />
            <button
              className="px-4 py-2 border rounded"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= selectedVariant?.stockQuantity}
            >
              +
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Số lượng còn lại: {selectedVariant?.stockQuantity || 0}
          </p>
        </div>
        {/* Nút thêm vào giỏ hàng */}
        <button
          className={`px-6 py-3 rounded ${
            selectedVariant?.stockQuantity > 0
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
          onClick={handleAddToCart}
          disabled={selectedVariant?.stockQuantity <= 0}
        >
          Thêm vào giỏ hàng
        </button>
      </div>
      {/* Sản phẩm cùng danh mục */}
      <div className="w-full mt-12">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Sản phẩm cùng danh mục
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.length === 0 && <p>Không có sản phẩm nào.</p>}
          {relatedProducts.map((item) => (
            <ProductCard key={item.productId} product={item} />
            /* <div
              key={item.productId}
              className="border rounded p-2 shadow hover:shadow-lg transition"
            >
              <img
                src={
                  item.productThumbnail ||
                  (item.productResources &&
                    item.productResources[0]?.resourceUrl)
                }
                alt={item.productName}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <div className="font-semibold">{item.productName}</div>
              <div className="text-red-500 font-bold">
                {item.price || item.productVariants?.[0]?.variantPrice} VND
              </div>
              <a
                href={`/product/${item.productId}`}
                className="text-blue-500 hover:underline text-sm"
              >
                Xem chi tiết
              </a>
            </div> */
          ))}
        </div>
      </div>
    </div>
  );
}

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
