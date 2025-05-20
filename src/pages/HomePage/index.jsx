import React, { useEffect, useState } from 'react'
import Banner from '../../components/banner/Banner'

import SwiperComponent from '../../components/product/SwiperComponent'
import { getAllBestSellingProducts, getAllProductNewArrivals } from '../../services/productService'

export default function Homepage() {
  const [newProducts, setNewProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  useEffect(() => {
    const fetchNewProductProducts = async () => {
      const products = await getAllProductNewArrivals();
      // console.log(products.content);
      setNewProducts(Array.isArray(products.content) ? products.content : []);
    };
    fetchNewProductProducts();
    const fetchBestSellingProducts = async () => {
      const products = await getAllBestSellingProducts();
      console.log(products.content);
      setBestSellingProducts(
        Array.isArray(products.content) ? products.content : []
      );
    };

    fetchBestSellingProducts();

  }, []);
  

  return (
    <div>
      <Banner />
      {/* <ProductList /> */}
      <SwiperComponent title="Sản phẩm mới nhất" products={newProducts} />
      <SwiperComponent
        title="Sản phẩm bán chạy"
        products={bestSellingProducts}
      />
    </div>
  );
}
