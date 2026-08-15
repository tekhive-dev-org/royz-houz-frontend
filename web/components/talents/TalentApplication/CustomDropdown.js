import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./TalentApplication.module.css";

/**
 * Reusable CustomDropdown component matching Figma design specs.
 * Supports icons for both trigger button and dropdown list items.
 */
export function CustomDropdown({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Selected Option",
  required = false,
  error = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find(
    (opt) => (typeof opt === "string" ? opt : opt.id || opt.label || opt.name) === value
  );

  const displayValue = selectedOption
    ? typeof selectedOption === "string"
      ? selectedOption
      : selectedOption.label || selectedOption.name
    : value || placeholder;

  const displayIcon =
    selectedOption && typeof selectedOption === "object" ? selectedOption.icon : null;

  const handleSelect = (option) => {
    const val = typeof option === "string" ? option : option.id || option.label || option.name;
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownField} ref={dropdownRef}>
      {label && (
        <label className={styles.inputLabel}>
          {label}
          {required && <span className={styles.requiredStar}>*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`${styles.dropdownTrigger} ${
          isOpen ? styles.dropdownTriggerOpen : ""
        } ${error ? styles.inputError : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {displayIcon && <span className={styles.optionIcon}>{displayIcon}</span>}
          <span className={value ? styles.triggerTextActive : styles.triggerTextPlaceholder}>
            {displayValue}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[#525866] shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#525866] shrink-0" />
        )}
      </button>

      {/* Floating Options Menu */}
      {isOpen && (
        <div className={styles.dropdownMenu} role="listbox">
          {options.map((option, index) => {
            const optValue =
              typeof option === "string" ? option : option.id || option.label || option.name;
            const optLabel =
              typeof option === "string" ? option : option.label || option.name;
            const isSelected = value === optValue;
            const isCustom = typeof option === "object" && Boolean(option.isCustom || option.isOther);

            return (
              <div key={optValue || index}>
                {isCustom && <div className={styles.dropdownDivider} />}
                <button
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`${styles.dropdownOption} ${
                    isSelected ? styles.dropdownOptionSelected : ""
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  {typeof option === "object" && option.icon && (
                    <span className={styles.optionIcon}>{option.icon}</span>
                  )}
                  <span className="truncate">{optLabel}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

export default CustomDropdown;
