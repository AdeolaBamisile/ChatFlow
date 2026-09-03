interface FilterButtonProps {
  category: string;
  activeCategory: string;
  setActiveCategory: React.Dispatch<React.SetStateAction<string>>;
}

const FilterButton = ({
  category,
  activeCategory,
  setActiveCategory,
}: FilterButtonProps) => {
  return (
    <button
      key={category}
      className={
        activeCategory === category
          ? "category-button active"
          : "category-button"
      }
      onClick={() => setActiveCategory(category)}
    >
      {category}
    </button>
  );
};

export default FilterButton;
