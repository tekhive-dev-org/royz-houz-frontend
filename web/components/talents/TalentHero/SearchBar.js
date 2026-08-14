import { useState } from "react";
import styles from "./TalentHero.module.css";

/**
 * Search icon matching the exact Figma vector
 */
function SearchIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M17.5 17.5L13.5 13.5M14.8333 10.1667C14.8333 10.7795 14.7126 11.3863 14.4781 11.9525C14.2436 12.5187 13.8998 13.0331 13.4665 13.4665C13.0332 13.8998 12.5187 14.2436 11.9525 14.4781C11.3863 14.7126 10.7795 14.8333 10.1667 14.8333C9.5538 14.8333 8.947 14.7126 8.3808 14.4781C7.8146 14.2436 7.3002 13.8998 6.8668 13.4665C6.4335 13.0331 6.0898 12.5187 5.8552 11.9525C5.6207 11.3863 5.5 10.7795 5.5 10.1667C5.5 8.929 5.9917 7.742 6.8668 6.8668C7.742 5.9917 8.929 5.5 10.1667 5.5C11.4043 5.5 12.5913 5.9917 13.4665 6.8668C14.3417 7.742 14.8333 8.929 14.8333 10.1667Z"
        stroke="#6A7282"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * SearchBar component matching Figma dimensions: 603px input + 149px button, h-54px, rx-6px.
 */
export function SearchBar({ onSearch, placeholder = "Search by name, category, or location..." }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchForm} role="search">
      <div className={styles.searchInputWrapper}>
        <span className={styles.searchIconPosition} aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search talents"
          className={styles.searchInput}
        />
      </div>

      <button type="submit" className={styles.searchButton}>
        SEARCH
      </button>
    </form>
  );
}

export default SearchBar;
