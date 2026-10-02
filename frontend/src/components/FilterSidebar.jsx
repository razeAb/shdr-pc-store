import { useState } from "react";
import { useLang } from "../context/LangContext.jsx";

// Long groups (product type, brand) show this many options until expanded.
const COLLAPSED_OPTION_COUNT = 6;

export default function FilterSidebar({ groups, onToggle, onClear, hasActiveFilters }) {
  const { t } = useLang();
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleExpanded = (key) =>
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

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
      {groups.map((group) => {
        // A group with a single option (e.g. every result is the same brand)
        // can't narrow anything down, so hide it unless it's in use.
        if (group.options.length <= 1 && group.selected.length === 0) return null;
        const isExpanded = !!expandedGroups[group.key];
        const hiddenCount = Math.max(group.options.length - COLLAPSED_OPTION_COUNT, 0);
        // Checked options stay visible even when the group is collapsed.
        const visibleOptions = isExpanded
          ? group.options
          : group.options.filter(
              (option, index) => index < COLLAPSED_OPTION_COUNT || group.selected.includes(option.value)
            );

        return (
          <fieldset key={group.key} className="filter-group filter-group--checkboxes">
            <legend>{group.title}</legend>
            {group.options.length === 0 ? (
              <p className="filter-empty">{t({ en: "No options available.", he: "אין אפשרויות זמינות." })}</p>
            ) : (
              <div className="filter-checkbox-list">
                {visibleOptions.map((option) => {
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
            {hiddenCount > 0 && (
              <button
                type="button"
                className="text-button filter-group__more"
                onClick={() => toggleExpanded(group.key)}
                aria-expanded={isExpanded}
              >
                {isExpanded
                  ? t({ en: "Show less", he: "הצג פחות" })
                  : t({ en: `Show ${hiddenCount} more`, he: `הצג עוד ${hiddenCount}` })}
              </button>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
