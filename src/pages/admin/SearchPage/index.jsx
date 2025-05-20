import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { searchProducts } from "../../../services/productService";

export default function SearchPage() {
  const [results, setResults] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get("query");

    if (searchQuery) {
      fetchSearchResults(searchQuery);
    }
  }, [location]);

  const fetchSearchResults = async (query) => {
    try {
      // Gọi API tìm kiếm
    //   const response = await searchProducts(`/products/filter?search=${query}`);
    //   const data = await response.json();
        //   setResults(data.results);
        
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kết quả tìm kiếm</h1>
      <ul>
        {/* {results.map((item) => (
          <li key={item.productId}>{item.productName}</li>
        ))} */}
      </ul>
    </div>
  );
}
