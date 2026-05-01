import { useCallback, useState } from "react";
import projectsData from "../projects.json";
import { ProjectsTable } from "components/projects/projects-table";
import { ProjectsToolbar } from "components/projects/projects-toolbar";
import { ThemeToggle } from "components/theme-toggle";
import { useFilteredProjects } from "lib/use-filtered-projects";
import type { Project } from "types/project";

const projects = projectsData as Project[];

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(() => new Set());

  const { allTags, filteredProjects } = useFilteredProjects(projects, query, selectedTags);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((previous) => {
      const next = new Set(previous);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[min(118rem,calc(100vw-1rem))] flex-col gap-10 px-3 py-4 sm:px-6 sm:py-6">
        <div className="relative shrink-0">
          <ThemeToggle className="absolute right-0 top-0 z-10" />
          <ProjectsToolbar
            className="min-w-0 pr-12 sm:pr-14"
            query={query}
            onQueryChange={setQuery}
            allTags={allTags}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
          />
        </div>
        <div className="hide-scrollbar max-h-[calc(100svh-9.5rem)] overflow-auto pt-2">
          <ProjectsTable projects={filteredProjects} />
        </div>
      </div>
    </div>
  );
}
