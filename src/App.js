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

  // Total Amount for cart Items.
  const [totalAmount, setTotalAmount] = useState(0);

  // Search Products API call in useEffect.
  const searchProducts = async () => {
    try {
      const response = await axios.get("https://dummyjson.com/products");
      const existingProductIds = await db.products.toCollection().primaryKeys();
      const newProducts = response.data.products.filter(
        (product) => !existingProductIds.includes(product.id)
      );
      await db.products.bulkAdd(newProducts);
      const filteredResults = response.data.products.filter(
        (product) =>
          !selectedProducts.find(
            (selectedProduct) => selectedProduct.id === product.id
          )
      );
      setSearchResults(filteredResults);
    } catch (error) {
      db.products.toArray().then((products) => {
        const filteredOfflineData = products.filter(
          (product) =>
            !selectedProducts.find(
              (selectedProduct) => selectedProduct.id === product.id
            )
        );
        setSearchResults(filteredOfflineData);
      });
    }
  };

  // For online/offline sync search results...
  useEffect(() => {
    searchProducts();
    // eslint-disable-next-line
  }, [selectedProducts]);

  // autocomplete change event handler
  const handleAutoCompleteChange = (e, value) => {
    e.preventDefault();
    if (value) {
      const newProduct = { ...value, quantity: 1 }; // Set the initial quantity to 1
      cartDB.products.add(newProduct);
      setSelectedProducts((prev) => [...prev, newProduct]);
    }
  };

  // Update Item Quantity...
  const updateProductQuantity = (productId, newQuantity) => {
    cartDB.products.update(productId, { quantity: newQuantity });
  };

  const deleteProduct = (productId) => {
    cartDB.products.delete(productId);
  };

  // ......

  // Quantity updation logic
  const handleDecrement = (row) => {
    if (quantity[row.id] > 1) {
      setQuantity((prev) => ({
        ...prev,
        [row.id]: prev[row.id] - 1,
      }));

      setSelectedProducts((prev) =>
        prev.map((product) =>
          product.id === row.id
            ? { ...product, quantity: quantity[row.id] - 1 }
            : product
        )
      );

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

    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === row.id
          ? { ...product, quantity: updatedQuantity }
          : product
      )
    );

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

  // ............

  // const cartItems = [...selectedProducts];

  // const orderItems = cartItems.map((item) => ({
  //   id: item.id,
  // price: item.price,
  // quantity: item.quantity,
  // Subtotal: item.price * item.quantity
  // }))

  // const requestData = [{totalPrice: 1000, OrderItems: orderItems}]

  // console.log("data", requestData);

  // UseEffect for Total Amount - cart Items.
  useEffect(() => {
    const cartItems = [...selectedProducts];

    let totalPrice = 0;

    for (let i = 0; i < cartItems.length; i++) {
      let subTotalPrice = cartItems[i].quantity * cartItems[i].price;
      totalPrice += subTotalPrice;
    }

    setTotalAmount(totalPrice);
  }, [selectedProducts]);

  // ..............

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


      {Object.keys(selectedProducts).length > 0 && <FooterComponent totalAmount={totalAmount}/>}
    </div>
  );
};

export default App;
