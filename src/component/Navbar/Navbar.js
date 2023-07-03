import { useEffect, useState } from "react";
import SearchBox from "./searchBox";
import axios from "axios";
import ProductList from "../products/ProductList";
import Dexie from "dexie";

const Navbar = () => {

  // Initialize the dexie for storing the data.
  const db = new Dexie("products");

  db.version(1).stores({
    products: "++id, title, price"
  });

  // 1. State for adding search results from products API.
  // 2. Selected Product added in the state.
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Search Products API call in useEffect.
  const searchProducts = async () => {
   try {
    const response = await axios.get("https://dummyjson.com/products");
    const existingProductIds = await db.products.toCollection().primaryKeys();
    const newProducts = response.data.products.filter(product => !existingProductIds.includes(product.id));

    await db.products.bulkAdd(newProducts);
    setSearchResults(response.data.products);
   } catch(error) {
    console.log('Error adding products:', error)
   }
  };

  useEffect(() => {
    searchProducts();
    // eslint-disable-next-line
  }, []);

  // autocomplete change event handler
  const handleAutoCompleteChange = (e, value) => {
    e.preventDefault();
    if (value) {
      setSelectedProducts((prev) => [...prev, value]);
    }
  };

  return (
    <div className="bg-slate-900 h-20 p-2">
      <SearchBox
        searchResults={searchResults}
        handleAutoCompleteChange={handleAutoCompleteChange}
      />

      <div className="m-10">
        <ProductList selectedProducts={selectedProducts} />
      </div>
    </div>
  );
};

export default Navbar;
