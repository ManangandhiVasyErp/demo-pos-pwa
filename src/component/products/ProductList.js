import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import { StyledTableCell, StyledTableRow } from "../../utils";

const ProductList = ({
  selectedProducts,
  handleDecrement,
  handleIncrement,
  quantity,
}) => {

  if (selectedProducts.length <= 0) {
    return null;
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>No.</StyledTableCell>
            <StyledTableCell align="center">Product Name</StyledTableCell>
            <StyledTableCell align="center">Price</StyledTableCell>
            <StyledTableCell align="center">Actions</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selectedProducts.map((row, index) => (
            <StyledTableRow key={row.id}>
              <StyledTableCell component="th" scope="row">
                {index + 1}
              </StyledTableCell>
              <StyledTableCell align="center">{row.title}</StyledTableCell>
              <StyledTableCell align="center">{row.price}</StyledTableCell>
              <StyledTableCell align="center">
                <div className="items-center">
                  <>
                    <Button
                      size="small"
                      sx={{ fontSize: 20 }}
                      onClick={() => handleDecrement(row)}
                    >
                      -
                    </Button>
                    <span className="">
                      {quantity && quantity[row.id] ? quantity[row.id] : 1}
                    </span>
                    <Button
                      size="small"
                      sx={{ fontSize: 20 }}
                      onClick={() => handleIncrement(row)}
                    >
                      +
                    </Button>
                  </>
                </div>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductList;
