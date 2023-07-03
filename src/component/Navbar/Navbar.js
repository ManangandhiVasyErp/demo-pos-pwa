import SearchBox from "./searchBox";

const Navbar = ({ searchResults, handleAutoCompleteChange }) => {
  return (
    <div className="bg-slate-900 h-20 p-2">
      <SearchBox
        searchResults={searchResults}
        handleAutoCompleteChange={handleAutoCompleteChange}
      />
    </div>
  );
};

export default Navbar;
