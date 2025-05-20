import { useEffect, useState } from "react";
import { Menu, Checkbox, InputNumber, Select } from "antd";
import { useLocation } from "react-router-dom";
import { getAllCategories } from "../../services/categoryService";
import {
  getAllProducts,
  getProductByCategoryId,
  searchProductAdvances2,
  searchProducts,
} from "../../services/productService";
import { ProductList } from "../../components/product/ProductList";
import { toast } from "react-toastify";
import { getAllBrands } from "../../services/brandService";

export default function ProductListPage() {
  const [brands, setBrands] = useState([]);
  const [checkedBrands, setCheckedBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const location = useLocation();

  const [minPrice, setMinPrice] = useState();
  const [maxPrice, setMaxPrice] = useState();
  const [sortOption, setSortOption] = useState("newest"); // "newest", "bestseller", "price_asc", "price_desc"
  const [search, setSearch] = useState("");
  const getSortParams = () => {
    switch (sortOption) {
      case "price_asc":
        return { orderBy: "price", sortDirection: "asc" };
      case "price_desc":
        return { orderBy: "price", sortDirection: "desc" };
      case "bestseller":
        return { orderBy: "totalSold", sortDirection: "desc" };
      case "newest":
      default:
        return { orderBy: "createdAt", sortDirection: "desc" };
    }
  };
  // Lấy categories và brands 1 lần duy nhất
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getAllCategories();
      if (Array.isArray(response)) setCategories(response);
    };
    fetchCategories();

    const fetchBrands = async () => {
      const response = await getAllBrands();
      if (Array.isArray(response.data.content))
        setBrands(response.data.content);
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { orderBy, sortDirection } = getSortParams();
      const data = await searchProductAdvances2({
        search,
        categoryId: selectedCategory,
        brandCode: checkedBrands,
        minPrice,
        maxPrice,
        // color, size, isNewArrival, isBestSeller nếu có
        orderBy,
        sortDirection,
        page: 0,
        sizePerPage: 12,
      });
      setProducts(data.content || []);
    };
    fetchData();
  }, [
    search,
    selectedCategory,
    checkedBrands,
    minPrice,
    maxPrice,
    sortOption
    // color, size, isNewArrival, isBestSeller nếu có
  ]);
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getAllCategories();
      if (Array.isArray(response)) {
        setCategories(response);
      } else {
        console.error("Invalid categories data:", response);
      }
    };
    fetchCategories();
    const fetchBrands = async () => {
      const response = await getAllBrands();
      if (Array.isArray(response.data.content)) {
        console.log("Response brand data: ", response.data.content);
        setBrands(response.data.content);
      }
    };
    fetchBrands();
  }, []);


  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryId = queryParams.get("category");
    const searchQuery = queryParams.get("search");
    if (categoryId) setSelectedCategory(Number(categoryId));
    if (searchQuery) setSearch(searchQuery);
  }, [location]);
  // Gọi API nâng cao mỗi khi filter thay đổi
  // useEffect(() => {
  //   const fetchData = async () => {
  //     let categoryCode = null;
  //     if (selectedCategory) {
  //       const cat = categories.find((c) => c.categoryId === selectedCategory);
  //       categoryCode = cat?.categoryCode;
  //     }
  //     const { orderBy, sortDirection } = getSortParams();
  //     try {
  //       const data = await searchProductAdvances2({
  //         search,
  //         categoryCode,
  //         brandCode: checkedBrands,
  //         minPrice,
  //         maxPrice,
  //         orderBy,
  //         sortDirection,
  //         page: 0,
  //         sizePerPage: 12,
  //       });
  //       setProducts(data.content || []);
  //     } catch (error) {
  //       toast.error("Không thể tải sản phẩm!");
  //     }
  //   };
  //   fetchData();
  // }, [
  //   search,
  //   selectedCategory,
  //   checkedBrands,
  //   minPrice,
  //   maxPrice,
  //   sortOption,
  //   categories,
  // ]);

  // useEffect(() => {
  //   const fetchProductsByCategory = async () => {
  //     if (selectedCategory) {
  //       const response = await getProductByCategoryId(selectedCategory);
  //       if (Array.isArray(response.content)) {
  //         setProducts(response.content);
  //       } else {
  //         toast.error("Invalid products data:", response);
  //       }
  //     }
  //   };
  //   fetchProductsByCategory();
  // }, [selectedCategory]);
  // const fetchAllProducts = async () => {
  //   try {
  //     const response = await getAllProducts();
  //     if (Array.isArray(response.content)) {
  //       setProducts(response.content);
  //     } else {
  //       toast.error("Invalid products data:", response);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching all products:", error);
  //   }
  // };
  // const fetchProductsBySearch = async (query) => {
  //   try {
  //     const response = await searchProducts(query); // Gọi API tìm kiếm sản phẩm
  //     // console.log("Response search data222:", response.content);
  //     setProducts(response.content); // Lưu danh sách sản phẩm vào state
  //   } catch (error) {
  //     console.error("Error fetching search results:", error);
  //     toast.error("Không thể tìm kiếm sản phẩm!");
  //   }
  // };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Danh mục sản phẩm */}
      <div className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Danh mục sản phẩm
        </h2>
        <Menu
          mode="inline"
          selectedKeys={[selectedCategory?.toString()]}
          onClick={({ key }) => setSelectedCategory(Number(key))}
        >
          {categories.map((category) => {
            if (category.children && category.children.length > 0) {
              return (
                <Menu.SubMenu
                  key={category.categoryId}
                  title={category.categoryName}
                >
                  {category.children.map((child) => (
                    <Menu.Item key={child.categoryId}>
                      {child.categoryName}
                    </Menu.Item>
                  ))}
                </Menu.SubMenu>
              );
            }
            return (
              <Menu.Item key={category.categoryId}>
                {category.categoryName}
              </Menu.Item>
            );
          })}
        </Menu>
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Khoảng giá</h2>
          <div className="flex items-center gap-2">
            <InputNumber
              placeholder="Giá từ"
              min={0}
              value={minPrice}
              onChange={setMinPrice}
              style={{ width: 90 }}
            />
            <span>-</span>
            <InputNumber
              placeholder="Giá đến"
              min={0}
              value={maxPrice}
              onChange={setMaxPrice}
              style={{ width: 90 }}
            />
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Thương hiệu</h2>
          <Checkbox.Group
            value={checkedBrands}
            onChange={setCheckedBrands}
            style={{ display: "flex", flexDirection: "column" }}
          >
            {brands.map((brand) => (
              <Checkbox key={brand.brandId} value={brand.brandCode}>
                {brand.brandName}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </div>
      </div>

      {/* Nội dung chính - Danh sách sản phẩm */}
      <div className="flex-1 p-6">
        {/* Navbar lọc và sắp xếp */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {categories.find((cat) => cat.categoryId === selectedCategory)
              ?.categoryName || "Tất cả sản phẩm"}
          </h1>
          <div>
            <span className="mr-2">Sắp xếp theo:</span>
            <Select
              value={sortOption}
              onChange={setSortOption}
              style={{ width: 150, marginRight: 50 }}
              allowClear
              placeholder="Chọn sắp xếp"
            >
              <Select.Option value="newest">Mới nhất</Select.Option>
              <Select.Option value="bestseller">Bán chạy</Select.Option>
              <Select.Option value="price_asc">Giá tăng dần</Select.Option>
              <Select.Option value="price_desc">Giá giảm dần</Select.Option>
            </Select>
          </div>
        </div>

        <ProductList products={products} />
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { Menu } from "antd";
// import { useLocation } from "react-router-dom";
// import { getAllCategories } from "../../services/categoryService";
// import ProductCard from "../../components/product/ProductCard";

// import {getAllProducts, getProductByCategoryId } from "../../services/productService";
// import { ProductList } from "../../components/product/ProductList";

// export default function ProductListPage() {

//   const [products,setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const location = useLocation();
//   useEffect(() => {
//     const fetchCategories = async () => {
//       const response = await getAllCategories();
//       if (Array.isArray(response)) {
//         setCategories(response);
//       } else {
//         console.error("Invalid categories data:", response);
//       }
//     };
//     fetchCategories();
//   }, []);
//   useEffect(() => {
//     // Lấy categoryId từ query parameters
//     const queryParams = new URLSearchParams(location.search);
//     const categoryId = queryParams.get("category");
//     if (categoryId) {
//       setSelectedCategory(Number(categoryId));
//     }
//   }, [location]);

//   useEffect(() => {
//     const fetchProductsByCategory = async () => {
//       if (selectedCategory) {
//         const response = await getProductByCategoryId(selectedCategory);
//         if (Array.isArray(response.content)) {
//           setProducts(response.content);
//         } else {
//           console.error("Invalid products data:", response);
//         }
//       } else {
//         const response = await getAllProducts();
//         if (Array.isArray(response.content)) {
//           setProducts(response.content);
//         } else {
//           console.error("Invalid products data:", response);
//         }
//       }
//     };
//     fetchProductsByCategory();
//   }, [selectedCategory]);
//    const filteredProducts = selectedCategory
//      ? products.filter((product) => product.categoryId === selectedCategory)
//      : products;

//    const handleCategoryClick = (categoryId) => {
//      setSelectedCategory(categoryId);
//    };
//   console.log(filteredProducts);
//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar - Danh mục sản phẩm */}
//       <div className="w-64 bg-white shadow-md p-4">
//         <h2 className="text-xl font-bold mb-4 text-gray-800">
//           Danh mục sản phẩm
//         </h2>
//         <Menu
//           mode="inline"
//           selectedKeys={[selectedCategory?.toString()]}
//           onClick={({ key }) => handleCategoryClick(Number(key))}
//         >
//           {categories.map((category) => {
//             if (category.children && category.children.length > 0) {
//               return (
//                 <Menu.SubMenu
//                   key={category.categoryId}
//                   title={category.categoryName}
//                 >
//                   {category.children.map((child) => (
//                     <Menu.Item key={child.categoryId}>
//                       {child.categoryName}
//                     </Menu.Item>
//                   ))}
//                 </Menu.SubMenu>
//               );
//             }
//             return (
//               <Menu.Item key={category.categoryId}>
//                 {category.categoryName}
//               </Menu.Item>
//             );
//           })}
//         </Menu>
//       </div>

//       {/* Nội dung chính - Danh sách sản phẩm */}
//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-bold mb-6 text-gray-800">
//           {categories.find((cat) => cat.categoryId === selectedCategory)
//             ?.categoryName || "Tất cả sản phẩm"}
//         </h1>
//         <ProductList products={filteredProducts} />
//       </div>
//     </div>
//   );
// }
