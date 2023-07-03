import { useEffect, useState } from "react";
import SearchBox from "./searchBox";
import axios from "axios";
import ProductList from "../products/ProductList";
import Dexie from "dexie";

const Navbar = () => {
  // Initialize the dexie for storing the data.
  const db = new Dexie("products");

  db.version(1).stores({
    products: "++id, title, price",
  });

  // Initialize the DB for cart items.
  const cartDB = new Dexie("cartItems");

  cartDB.version(1).stores({
    products: "++id, title, price, quantity",
  });

  // 1. State for adding search results from products API.
  // 2. Selected Product added in the state.
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  // 3. Logic for quantity...
  const [quantity, setQuantity] = useState(1);

  // Search Products API call in useEffect.
  const searchProducts = async () => {
    try {
      const response = await axios.get("https://dummyjson.com/products");
      const existingProductIds = await db.products.toCollection().primaryKeys();
      const newProducts = response.data.products.filter(
        (product) => !existingProductIds.includes(product.id)
      );

      await db.products.bulkAdd(newProducts);
      setSearchResults(response.data.products);
    } catch (error) {
      console.log("Error adding products:", error);
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
      cartDB.products.add({...value, quantity})
      setSelectedProducts((prev) => [...prev, value]);
    }
  };

  const updateProductQuantity = (productId, newQuantity) => {
    cartDB.products.update(productId, { quantity: newQuantity });
  };

  const deleteProduct = (productId) => {
    cartDB.products.delete(productId);
  };

  // Quantity updation logic
  const handleDecrement = (row) => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
      updateProductQuantity(row.id, quantity - 1);
    } else {
      setSelectedProducts((prev) => prev.filter((prod) => prod.id !== row.id));
      deleteProduct(row.id);
    }
  };

  const handleIncrement = (row) => {
    setQuantity((prev) => prev + 1);
    updateProductQuantity(row.id, quantity + 1);
  };

  useEffect(() => {
    // Load products from IndexedDB when the component mounts
    cartDB.products.toArray().then((data) => {
      setSelectedProducts(data);
    });
  }, []);

  return (
    <div className="bg-slate-900 h-20 p-2">
      <SearchBox
        searchResults={searchResults}
        handleAutoCompleteChange={handleAutoCompleteChange}
      />

      <div className="m-10">
        <ProductList
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          handleDecrement={handleDecrement}
          handleIncrement={handleIncrement}
          quantity={quantity}
        />
      </div>
    </div>
  );
};

export default Navbar;
