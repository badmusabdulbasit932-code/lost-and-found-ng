function SearchBar() {
  return (
    <div className="search-bar">

      <input
        type="text"
        placeholder="Search item..."
      />

      <select>
        <option>Category</option>
      </select>

      <select>
        <option>Location</option>
      </select>

      <button>
        Search
      </button>

    </div>
  )
}

export default SearchBar