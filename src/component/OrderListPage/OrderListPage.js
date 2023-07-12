import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { StyledTableCell, StyledTableRow } from "../../utils";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

const OrderListPage = () => {
  // Orders state and api call.
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios
      .get("https://getitapi.vasyerp.in/api/getorderlist", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((response) => {
        setOrders(response.data);
      });
  }, []);

  // ............

  // Delete order api call.
  const handleDeleteOrder = async (id) => {
    const res = await axios.delete(
      `https://getitapi.vasyerp.in/api/deletebyid/${id}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
    alert(`${res.data}-${id}`);
    setOrders((prev) => prev.filter((ordr) => ordr.orderId !== id));
  };

  // ...............

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Order ID</StyledTableCell>
            <StyledTableCell align="center">Order Price</StyledTableCell>
            <StyledTableCell align="center">Actions</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((row) => (
            <StyledTableRow key={row.orderId}>
              <StyledTableCell component="th" scope="row">
                {row.orderId}
              </StyledTableCell>
              <StyledTableCell align="center">
                $ {row.totalPrice}
              </StyledTableCell>
              <StyledTableCell align="center">
                <Button
                  color="error"
                  onClick={() => handleDeleteOrder(row.orderId)}
                >
                  Delete
                </Button>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrderListPage;
