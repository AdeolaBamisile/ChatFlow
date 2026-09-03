import type { ChatFilterOptions as FilterOptions } from "../../types";

interface FilterButtonsProps {
  filter: FilterOptions;
  activeFilter: FilterOptions;
  setActiveFilter: React.Dispatch<React.SetStateAction<FilterOptions>>;
}

const FilterButtons = ({
  filter,
  activeFilter,
  setActiveFilter,
}: FilterButtonsProps) => {
  return (
    <button
      className={
        activeFilter === filter ? "filter-button active" : "filter-button"
      }
      onClick={() => setActiveFilter(filter)}
    >
      {filter}
    </button>
  );
};

export default FilterButtons;
