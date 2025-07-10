import React from "react";
import clsx from "clsx";

interface FilterBarProps {
  onFilterChange: (filters: string[]) => void; 
  options: string[];
  activeFilters: string[];
  multiSelect?: boolean;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onFilterChange,
  options,
  activeFilters,
  multiSelect = false,
  className = "",
}) => {
  const handleClick = (option: string) => {
    if (multiSelect) {
      if (activeFilters.includes(option)) {
        onFilterChange(activeFilters.filter((f) => f !== option));
      } else {
        onFilterChange([...activeFilters, option]);
      }
    } else {
      if (activeFilters.includes(option)) {
        onFilterChange([]);
      } else {
        onFilterChange([option]);
      }
    }
  };

  return (
    <div
      className={clsx(
        "flex space-x-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleClick(option)}
          className={clsx(
            `
            px-4 py-2
            rounded-md
            transition-colors duration-300
            focus:outline-none focus:ring-2 focus:ring-cyan-500
            `,
            activeFilters.includes(option)
              ? "bg-cyan-500 text-white"
              : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-cyan-300 dark:hover:bg-cyan-600"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
