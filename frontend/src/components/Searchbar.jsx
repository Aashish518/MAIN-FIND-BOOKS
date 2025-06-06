import { FaSearch } from "react-icons/fa";
import "../components-css/Searchbar.css";
export const Searchbar = ({ search, setSearch, handleSearch }) => {
  return (
    <>
      <div className="searchbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search Books"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="search-btn" onClick={handleSearch}>
          <FaSearch />
        </button>
      </div>
    </>
  );
};


