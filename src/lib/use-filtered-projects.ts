import { useMemo } from "react";
import type { Project } from "types/project";

export function useFilteredProjects(
  projects: readonly Project[],
  searchQuery: string,
  selectedCategories: ReadonlySet<string>,
) {
  const allCategories = useMemo(() => {
    const unique = new Set<string>();
    for (const project of projects) {
      for (const category of project.category) unique.add(category);
    }
    return [...unique].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const searchQueryLowercase = searchQuery.trim().toLowerCase();
    const matchingProjects = projects.filter((project) => {
      if (searchQueryLowercase) {
        const combinedSearchText =
          `${project.name} ${project.description} ${project.category.join(" ")}`.toLowerCase();
        if (!combinedSearchText.includes(searchQueryLowercase)) return false;
      }
      for (const category of selectedCategories) {
        if (!project.category.includes(category)) return false;
      }
      return true;
    });
    return [...matchingProjects].sort((firstProject, secondProject) =>
      firstProject.name.localeCompare(secondProject.name, undefined, {
        sensitivity: "base",
      }),
    );
  }, [projects, searchQuery, selectedCategories]);

  return { allCategories, filteredProjects };
}
