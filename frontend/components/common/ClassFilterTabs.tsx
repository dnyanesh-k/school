"use client";

interface ClassOption {
  id: number;
  name: string;
}

interface ClassFilterTabsProps {
  classes: ClassOption[];
  selectedClass: number | null;
  onSelect: (classId: number | null) => void;
  showAll?: boolean;
}

export function ClassFilterTabs({
  classes,
  selectedClass,
  onSelect,
  showAll = false,
}: ClassFilterTabsProps) {
  return (
    <div className="vt-filter-row">
      {showAll && (
        <button
          type="button"
          className={`vt-filter-pill${selectedClass === null ? " is-active" : ""}`}
          onClick={() => onSelect(null)}
        >
          All
        </button>
      )}

      {classes.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`vt-filter-pill${selectedClass === item.id ? " is-active" : ""}`}
          onClick={() => onSelect(item.id)}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
