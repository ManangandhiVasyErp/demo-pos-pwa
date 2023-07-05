import { Autocomplete, TextField } from "@mui/material";

const SearchAutoComplete = ({ searchResults, handleAutoCompleteChange }) => {
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

export default SearchAutoComplete;
