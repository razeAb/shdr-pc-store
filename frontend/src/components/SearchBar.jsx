import { useEffect, useMemo, useRef, useState, useId } from "react";
import { useNavigate } from "react-router-dom";
import AutocompleteList from "./AutocompleteList.jsx";

const MAX_SUGGESTIONS = 6;

export default function SearchBar({ id, products, isOpen, onRequestClose }) {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const isVisible = isOpen ?? true;

  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter((product) => {
        const inTitle = product.title.toLowerCase().includes(term);
        const inTags = (product.tags || []).some((tag) => tag.toLowerCase().includes(term));
        const inSku = product.sku?.toLowerCase().includes(term);
        const inCategory = product.category?.toLowerCase().includes(term);
        return inTitle || inTags || inSku || inCategory;
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [products, query]);

  const openList = suggestions.length > 0 && isExpanded;

  useEffect(() => {
    const handleOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsExpanded(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setIsExpanded(false);
      setActiveIndex(-1);
    }
  }, [isVisible]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setIsExpanded(false);
    onRequestClose?.();
  };

  const handleSelect = (item) => {
    setQuery(item.title);
    setIsExpanded(false);
    setActiveIndex(-1);
    navigate(`/product/${item.slug}`);
    onRequestClose?.();
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsExpanded(true);
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const item = suggestions[activeIndex];
      if (item) handleSelect(item);
    }
    if (event.key === "Escape") {
      setIsExpanded(false);
      setActiveIndex(-1);
    }
  };

  return (
    <form
      className={`search ${isVisible ? "search-visible" : "search-hidden"}`}
      onSubmit={handleSubmit}
      role="search"
      ref={wrapperRef}
    >
      <label className="visually-hidden" htmlFor={id}>
        Search products
      </label>
      <input
        id={id}
        type="search"
        placeholder="Search games, platforms, tags"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsExpanded(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsExpanded(true)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={openList}
        aria-activedescendant={
          activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
        }
      />
      <button type="submit" className="search-button">
        Search
      </button>
      {openList && (
        <AutocompleteList
          id={listId}
          items={suggestions}
          activeIndex={activeIndex}
          onSelect={handleSelect}
        />
      )}
    </form>
  );
}
