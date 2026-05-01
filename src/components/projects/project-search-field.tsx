import { mergeTailwindClasses } from "lib/utils";

type ProjectSearchFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
};

export function ProjectSearchField({
  id = "project-search",
  value,
  onChange,
  label = "Search",
  placeholder = "Name, description, or tag",
}: ProjectSearchFieldProps) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium" htmlFor={id}>
      {label}
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={mergeTailwindClasses(
          "h-10 rounded-md border border-input bg-background px-3 text-sm",
          "placeholder:text-muted-foreground outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring",
        )}
      />
    </label>
  );
}
