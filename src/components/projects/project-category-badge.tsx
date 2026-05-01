import { mergeTailwindClasses } from "lib/utils";

type ProjectCategoryBadgeProps = {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
};

export function ProjectCategoryBadge({
  label,
  selected = false,
  onToggle,
}: ProjectCategoryBadgeProps) {
  const className = mergeTailwindClasses(
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-normal leading-none",
    "text-foreground transition-colors",
    !selected && "border-muted-foreground/35 bg-muted dark:border-border",
    selected &&
      "border-muted-foreground/62 bg-muted-foreground/20 dark:border-muted-foreground/64 dark:bg-muted-foreground/26",
    onToggle &&
      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    onToggle &&
      !selected &&
      "hover:border-muted-foreground/50 hover:bg-muted-foreground/12 dark:hover:border-muted-foreground/55 dark:hover:bg-muted-foreground/16",
    onToggle &&
      selected &&
      "hover:bg-muted-foreground/26 dark:hover:bg-muted-foreground/32",
  );

  if (onToggle) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        aria-label={
          selected
            ? `Remove category filter ${label}`
            : `Add category filter ${label}`
        }
        className={className}
      >
        {label}
      </button>
    );
  }

  return <span className={className}>{label}</span>;
}
