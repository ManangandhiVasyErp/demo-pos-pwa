import Dexie from "dexie";
import { useState, useEffect } from "react";
import axios from "axios";
import MainListComponent from "./component/MainListComponent/MainListComponent";
import "./App.css";
import FooterComponent from "./component/FooterComponent/FooterComponent";
import { Button } from "@mui/material";
import SearchAutoComplete from "./component/SearchAutoComplete/SearchAutoComplete";
import OrderListPage from "./component/OrderListPage/OrderListPage";
import qz from "qz-tray";

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

  // Initialize the DB for orders.
  const orderDB = new Dexie("orders");

  orderDB.version(1).stores({
    orders: "++id",
  });

  // 1. State for adding search results from products API.
  // 2. Selected Product added in the state.
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  // 3. Logic for quantity...
  const [quantity, setQuantity] = useState(undefined);

  // Total Amount for cart Items.
  const [totalAmount, setTotalAmount] = useState(0);

  const [showOrdersBtn, setShowOrdersBtn] = useState(false);

  const [webSocketConnected, setWebSocketConnected] = useState(false);

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
      quantity && quantity[row.id] ? quantity[row.id] + 1 : 2;

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

  // useEffect for qz-websocket connection when first time page load...

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await qz.websocket.connect().then(() => {
          alert("web socket connected.");
        });
        qz.api.showDebug(true);
        setWebSocketConnected(true);
      } catch (err) {
        console.log("error to connect with websocket", err);
      }
    };

    connectWebSocket();

    // // return () => {
    // //   if (webSocketConnected) {
    // //     qz.websocket.disconnect();
    // //     setWebSocketConnected(false);
    // //   }
    // };
  }, []);

  // .................

  // Print order func.

  const printOrder = () => {
    const orderHTML = `

    <div id="pos-bill">
      <h1>Point of Sale Bill</h1>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${selectedProducts
            .map(
              (item) =>
                `<tr key=${item.price + item.title + item.quantity}>
                  <td>${item.title}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price}</td>
                </tr>`
            )
            .join("")}
        </tbody>
      </table>
      <p>Total: ${totalAmount}</p>
      <p>Thank you for your purchase!</p>
    </div>`;

    if (webSocketConnected) {
      try {
        qz.api.showDebug(true);
        qz.printers
          .getDefault()
          .then((printer) => {
            const config = qz.configs.create(printer, {
              size: { width: 4, height: 6 },
            });
            const printData = [
              {
                type: "html",
                format: "plain",
                data: orderHTML,
              },
            ];
            return qz.print(config, printData);
          })
          .catch((err) => {
            console.log("Error printing order:", err);
          });
      } catch (error) {
        console.log("Error printing order:", error);
      }
    } else {
      console.log("WebSocket is not connected. Cannot print order.");
    }

    // END....
  };

  // ...............

  // Event handler for save orders.

  const handleSaveBtn = async () => {
    const cartItems = [...selectedProducts];

    const orderData = cartItems.map((item) => ({
      pid: item.id,
      price: item.price,
      quantity: item.quantity,
      subTotal: item.price * item.quantity,
    }));

    const payloadData = [{ totalPrice: totalAmount, orderItems: orderData }];
    if (navigator.onLine) {
      try {
        const response = await axios.post(
          "https://getitapi.vasyerp.in/api/addorderlist",
          payloadData,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
        console.log("response", response);
        alert("Order successfully done with online mode.");
        setSelectedProducts([]);
        setTotalAmount(0);

        printOrder();
        setQuantity(undefined);
        await cartDB.delete().then(() => {
          console.log("cartDB deleted Successfully");
        });
      } catch (err) {
        console.log("error to order", err);
      }
    } else {
      await orderDB.orders.add(payloadData);
      alert("Order successfully done with offline mode.");
      setSelectedProducts([]);
      setTotalAmount(0);
      setQuantity(undefined);
      printOrder();
      await cartDB.delete().then(() => {
        console.log("cartDB deleted Successfully in offline mode");
      });

      // Sync offline orders when app comes online
      const syncOfflineOrders = async () => {
        const offlineOrders = await orderDB.orders.toArray();

        const offlinePayloadData = offlineOrders.map((el) => el[0]);

        alert("back to online");

        if (offlineOrders.length > 0) {
          try {
            const response = await axios.post(
              "https://getitapi.vasyerp.in/api/addorderlist",
              offlinePayloadData,
              {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                },
              }
            );
            console.log("Offline orders synced:", response);
            await orderDB.delete().then(() => {
              console.log("OrderDB deleted.");
            });
            await cartDB.delete().then(() => {
              console.log("cartDB deleted Successfully");
            });
          } catch (err) {
            console.log("Error syncing offline orders:", err);
          }
        }
      };

      // Call the syncOfflineOrders function when the app comes online
      window.addEventListener("online", syncOfflineOrders);
    }
  };

  // .............

  return (
    <div className="App">
      <div className="bg-slate-900 h-18 p-2 flex justify-between">
        {!showOrdersBtn ? (
          <SearchAutoComplete
            searchResults={searchResults}
            handleAutoCompleteChange={handleAutoCompleteChange}
          />
        ) : (
          <h1 className="text-slate-300 text-2xl">Order List</h1>
        )}
        {showOrdersBtn ? (
          <Button
            color="secondary"
            onClick={() => setShowOrdersBtn(!showOrdersBtn)}
          >
            Back To Home
          </Button>
        ) : (
          <Button
            onClick={() => setShowOrdersBtn(!showOrdersBtn)}
            color="primary"
          >
            Orders
          </Button>
        )}
      </div>
      {showOrdersBtn ? (
        <div className="p-4">
          <OrderListPage />
        </div>
      ) : (
        <>
          <MainListComponent
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            handleDecrement={handleDecrement}
            handleIncrement={handleIncrement}
            quantity={quantity}
          />

          {Object.keys(selectedProducts).length > 0 && (
            <FooterComponent
              handleSaveBtn={handleSaveBtn}
              totalAmount={totalAmount}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
