import type { ComponentProps } from "react";
import { ProjectSearchField } from "components/projects/project-search-field";
import { CategoryFilter } from "components/projects/category-filter";
import { mergeTailwindClasses } from "lib/utils";

type ProjectsToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  allCategories: readonly string[];
  selectedCategories: ReadonlySet<string>;
  onToggleCategory: (category: string) => void;
} & Pick<ComponentProps<"div">, "className">;

export function ProjectsToolbar({
  query,
  onQueryChange,
  allCategories,
  selectedCategories,
  onToggleCategory,
  className,
}: ProjectsToolbarProps) {
  return (
    <div
      className={mergeTailwindClasses(
        "flex flex-col gap-4 sm:flex-row sm:items-end",
        className,
      )}
    >
      <div className="min-w-0 max-w-5xl flex-1">
        <ProjectSearchField value={query} onChange={onQueryChange} />
      </div>
      <CategoryFilter
        categories={allCategories}
        selected={selectedCategories}
        onToggle={onToggleCategory}
      />
    </div>
  );
}
