import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const SearchBox = ({ searchResults, handleAutoCompleteChange }) => {
  return (
    <Autocomplete
      id="product-search-item"
      options={searchResults || []}
      getOptionLabel={(option) => option.title}
      onChange={handleAutoCompleteChange}
      sx={{ width: 250, backgroundColor: "white" }}
      renderInput={(params) => (
        <TextField {...params} label="Search Product Name" />
      )}
    />
  );
};

export default SearchBox;
