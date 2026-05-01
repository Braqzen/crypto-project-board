import { useMemo } from "react";
import type { Project } from "types/project";

export function useFilteredProjects(
  projects: readonly Project[],
  searchQuery: string,
  selectedTags: ReadonlySet<string>,
) {
  const allTags = useMemo(() => {
    const uniqueTags = new Set<string>();
    for (const project of projects) {
      for (const tag of project.tags) uniqueTags.add(tag);
    }
    return [...uniqueTags].sort((firstTag, secondTag) =>
      firstTag.localeCompare(secondTag, undefined, { sensitivity: "base" }),
    );
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const searchQueryLowercase = searchQuery.trim().toLowerCase();
    const matchingProjects = projects.filter((project) => {
      if (searchQueryLowercase) {
        const combinedSearchText =
          `${project.name} ${project.description} ${project.tags.join(" ")}`.toLowerCase();
        if (!combinedSearchText.includes(searchQueryLowercase)) return false;
      }
      for (const tag of selectedTags) {
        if (!project.tags.includes(tag)) return false;
      }
      return true;
    });
    return [...matchingProjects].sort((firstProject, secondProject) =>
      firstProject.name.localeCompare(secondProject.name, undefined, {
        sensitivity: "base",
      }),
    );
  }, [projects, searchQuery, selectedTags]);

  return { allTags, filteredProjects };
}
