import { useMemo } from "react";
import type { Project } from "types/project";

/** all: AND every selected category. any: OR at least one selected category. */
export type CategoryTagMatchMode = "all" | "any";

export function useFilteredProjects(
  projects: readonly Project[],
  searchQuery: string,
  selectedCategories: ReadonlySet<string>,
  categoryTagMatchMode: CategoryTagMatchMode,
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
      if (selectedCategories.size === 0) return true;

      const tagsOnProject = project.category;
      if (categoryTagMatchMode === "all") {
        for (const category of selectedCategories) {
          if (!tagsOnProject.includes(category)) return false;
        }
      } else {
        const anyHit = [...selectedCategories].some((category) =>
          tagsOnProject.includes(category),
        );
        if (!anyHit) return false;
      }

      return true;
    });
    return [...matchingProjects].sort((firstProject, secondProject) =>
      firstProject.name.localeCompare(secondProject.name, undefined, {
        sensitivity: "base",
      }),
    );
  }, [projects, searchQuery, selectedCategories, categoryTagMatchMode]);

  return { allCategories, filteredProjects };
}
