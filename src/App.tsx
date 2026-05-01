import { useCallback, useState } from "react";
import projectsData from "../projects.json";
import { GithubIcon } from "components/icons/github-icon";
import { ProjectsTable } from "components/projects/projects-table";
import { ProjectsToolbar } from "components/projects/projects-toolbar";
import { ThemeToggle } from "components/theme-toggle";
import { mergeTailwindClasses } from "lib/utils";
import { useFilteredProjects } from "lib/use-filtered-projects";
import type { Project } from "types/project";

const projects = projectsData as Project[];

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => new Set());

  const { allCategories, filteredProjects } = useFilteredProjects(
    projects,
    query,
    selectedCategories,
  );

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((previous) => {
      const next = new Set(previous);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  return (
    <div className="flex min-h-svh flex-col text-foreground">
      <div className="mx-auto flex min-h-0 w-full max-w-[min(118rem,calc(100vw-1rem))] flex-1 flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6">
        <section
          aria-label="Search and filters"
          className="shrink-0 px-1 sm:px-0"
        >
          <header className="mb-4 space-y-2 sm:mb-5">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Crypto Project Board
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              A list of various projects. Listing doesn't mean they're safe or endorsed.
            </p>
          </header>
          <div className="flex w-full shrink-0 flex-col gap-4 sm:flex-row sm:items-end">
            <ProjectsToolbar
              className="min-w-0 w-full sm:flex-1"
              query={query}
              onQueryChange={setQuery}
              allCategories={allCategories}
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
            />
            <div className="flex shrink-0 items-end gap-2 self-end">
              <ThemeToggle />
              <a
                href="https://github.com/Braqzen/crypto-project-board"
                target="_blank"
                rel="noreferrer noopener"
                className={mergeTailwindClasses(
                  "table-elevated-surface inline-flex size-10 shrink-0 items-center justify-center rounded-md",
                  "text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                aria-label="Crypto Project Board on GitHub"
                title="View source repository on GitHub"
              >
                <GithubIcon className="size-5" />
              </a>
            </div>
          </div>
        </section>
        <section
          aria-label="Projects"
          className="table-elevated-surface flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl text-card-foreground"
        >
          <div className="hide-scrollbar min-h-0 flex-1 overflow-auto px-3 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
            <ProjectsTable
              projects={filteredProjects}
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
