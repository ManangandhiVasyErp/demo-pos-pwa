import { Button } from "@mui/material";
import React from "react";

const FooterComponent = ({ totalAmount }) => {
  return (
    <div className="flex justify-between p-10">
      <p className="text-xl"><span className="text-blue-500 font-bold">Total Amount: </span>${totalAmount}.00</p>
      <Button variant="contained">Save</Button>
    </div>
  );
};

export default FooterComponent;
