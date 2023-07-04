import ProductList from "../products/ProductList";

const MainListComponent = ({
  selectedProducts,
  setSelectedProducts,
  handleDecrement,
  handleIncrement,
  quantity,
}) => {
  return (
    <div className="m-10">
      <ProductList
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
        handleDecrement={handleDecrement}
        handleIncrement={handleIncrement}
        quantity={quantity}
      />
    </div>
  );
};

export default MainListComponent;
