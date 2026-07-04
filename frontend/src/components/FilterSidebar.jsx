import { useLang } from "../context/LangContext.jsx";

export default function FilterSidebar({ groups, onToggle, onClear, hasActiveFilters }) {
  const { t } = useLang();

  return (
    <div className="filter-sidebar">
      <div className="filter-sidebar__header">
        <h2>{t({ en: "Filters", he: "סינון" })}</h2>
        {hasActiveFilters ? (
          <button type="button" className="text-button filter-sidebar__clear" onClick={onClear}>
            {t({ en: "Clear all", he: "נקה הכל" })}
          </button>
        ) : null}
      </div>
      {groups.map((group) => (
        <fieldset key={group.key} className="filter-group filter-group--checkboxes">
          <legend>{group.title}</legend>
          {group.options.length === 0 ? (
            <p className="filter-empty">{t({ en: "No options available.", he: "אין אפשרויות זמינות." })}</p>
          ) : (
            <div className="filter-checkbox-list">
              {group.options.map((option) => {
                const isChecked = group.selected.includes(option.value);
                const isDisabled = option.count === 0 && !isChecked;
                return (
                  <label
                    key={option.value}
                    className={`filter-checkbox-row ${isDisabled ? "is-disabled" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={() => onToggle(group.key, option.value)}
                    />
                    <span className="filter-checkbox-row__label">{option.label}</span>
                    <span className="filter-checkbox-row__count">{option.count}</span>
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>
      ))}
    </div>
  );
}
