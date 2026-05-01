import { mergeTailwindClasses } from "lib/utils";

type TagsFilterProps = {
  tags: readonly string[];
  selected: ReadonlySet<string>;
  onToggle: (tag: string) => void;
  label?: string;
};

export function TagsFilter({
  tags,
  selected,
  onToggle,
  label = "Tags",
}: TagsFilterProps) {
  return (
    <div className="flex flex-col gap-2 sm:w-64">
      <span className="text-sm font-medium">{label}</span>
      <details className="relative">
        <summary
          className={mergeTailwindClasses(
            "flex h-10 cursor-pointer list-none items-center rounded-md border border-input bg-background px-3 text-sm",
            "marker:hidden [&::-webkit-details-marker]:hidden",
          )}
        >
          <span className="text-muted-foreground">
            {selected.size === 0 ? "All tags" : `${selected.size} selected`}
          </span>
        </summary>
        <div
          className={mergeTailwindClasses(
            "absolute right-0 z-10 mt-1 max-h-64 min-w-full hide-scrollbar overflow-auto rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md",
          )}
        >
          {tags.map((tag) => (
            <label
              key={tag}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
            >
              <input
                type="checkbox"
                checked={selected.has(tag)}
                onChange={() => onToggle(tag)}
                className="rounded border-input"
              />
              {tag}
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}
