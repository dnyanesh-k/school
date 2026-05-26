"use client";

interface SegmentedOption<T extends string> {
  id: T;
  label: string;
  badge?: number;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="vt-segmented">
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            className={`vt-segmented-btn${active ? " is-active" : ""}`}
            onClick={() => onChange(option.id)}
          >
            {option.label}
            {!!option.badge && option.badge > 0 && (
              <span
                style={{
                  minWidth: 18,
                  height: 18,
                  padding: "0 5px",
                  borderRadius: "var(--radius-full)",
                  background: active ? "var(--error)" : "var(--ink-300)",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
