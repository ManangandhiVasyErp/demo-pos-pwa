import Dexie from "dexie";
import { useState, useEffect } from "react";
import axios from "axios";
import MainListComponent from "./component/MainListComponent/MainListComponent";
import Navbar from "./component/Navbar/Navbar";
import "./App.css";
import FooterComponent from "./component/FooterComponent/FooterComponent";

const App = () => {
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
  const [quantity, setQuantity] = useState(undefined);

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
      db.products.toArray().then((products) => {
        setSearchResults(products);
      });
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
      cartDB.products.add({ ...value, quantity });
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
    if (quantity[row.id] > 1) {
      setQuantity((prev) => ({
        ...prev,
        [row.id]: prev[row.id] - 1,
      }));
      updateProductQuantity(row.id, quantity[row.id] - 1);
    } else {
      setSelectedProducts((prev) => prev.filter((prod) => prod.id !== row.id));
      deleteProduct(row.id);
    }
  };

  const handleIncrement = (row) => {
    const updatedQuantity =
      quantity && quantity[row.id] ? quantity[row.id] + 1 : 1;
    setQuantity((prev) => ({
      ...prev,
      [row.id]: updatedQuantity,
    }));
    updateProductQuantity(row.id, updatedQuantity);
  };

  useEffect(() => {
    cartDB.products.toArray().then((data) => {
      setSelectedProducts(data);
      const quantities = data.reduce((acc, product) => {
        acc[product.id] = product.quantity;
        return acc;
      }, {});
      setQuantity(quantities);
    });
    // eslint-disable-next-line
  }, []);

  return (
    <div className="App">
      <Navbar
        searchResults={searchResults}
        handleAutoCompleteChange={handleAutoCompleteChange}
      />
      <MainListComponent
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
        handleDecrement={handleDecrement}
        handleIncrement={handleIncrement}
        quantity={quantity}
      />
      {Object.keys(selectedProducts).length > 0 && <FooterComponent />}
    </div>
  );
};

export default App;
