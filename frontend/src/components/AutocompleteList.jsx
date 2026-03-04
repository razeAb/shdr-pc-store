export default function AutocompleteList({ id, items, activeIndex, onSelect }) {
  return (
    <ul className="autocomplete" id={id} role="listbox">
      {items.map((item, index) => (
        <li
          key={item.id}
          id={`${id}-option-${index}`}
          role="option"
          aria-selected={activeIndex === index}
        >
          <button type="button" onClick={() => onSelect(item)}>
            <span className="autocomplete-title">{item.title}</span>
            <span className="autocomplete-meta">{item.platform}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
