import type { ComponentProps } from "react";
import { CategoryFilter } from "components/projects/category-filter";
import { CategoryMatchModeToggle } from "components/projects/category-match-mode-toggle";
import { ProjectSearchField } from "components/projects/project-search-field";
import type { CategoryTagMatchMode } from "lib/use-filtered-projects";
import { mergeTailwindClasses } from "lib/utils";

type ProjectsToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  allCategories: readonly string[];
  selectedCategories: ReadonlySet<string>;
  onToggleCategory: (category: string) => void;
  categoryTagMatchMode: CategoryTagMatchMode;
  onCategoryTagMatchModeChange: (mode: CategoryTagMatchMode) => void;
} & Pick<ComponentProps<"div">, "className">;

export function ProjectsToolbar({
  query,
  onQueryChange,
  allCategories,
  selectedCategories,
  onToggleCategory,
  categoryTagMatchMode,
  onCategoryTagMatchModeChange,
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
      <div className="flex flex-wrap items-end gap-2">
        <CategoryFilter
          categories={allCategories}
          selected={selectedCategories}
          onToggle={onToggleCategory}
        />
        <CategoryMatchModeToggle
          value={categoryTagMatchMode}
          onChange={onCategoryTagMatchModeChange}
        />
      </div>
    </div>
  );
}
