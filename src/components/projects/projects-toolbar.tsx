import type { ComponentProps } from "react";
import { ProjectSearchField } from "components/projects/project-search-field";
import { TagsFilter } from "components/projects/tags-filter";
import { mergeTailwindClasses } from "lib/utils";

type ProjectsToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  allTags: readonly string[];
  selectedTags: ReadonlySet<string>;
  onToggleTag: (tag: string) => void;
} & Pick<ComponentProps<"div">, "className">;

export function ProjectsToolbar({
  query,
  onQueryChange,
  allTags,
  selectedTags,
  onToggleTag,
  className,
}: ProjectsToolbarProps) {
  return (
    <div
      className={mergeTailwindClasses(
        "flex flex-col gap-4 sm:flex-row sm:items-start",
        className,
      )}
    >
      <ProjectSearchField value={query} onChange={onQueryChange} />
      <TagsFilter tags={allTags} selected={selectedTags} onToggle={onToggleTag} />
    </div>
  );
}
