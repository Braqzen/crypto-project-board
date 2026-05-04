import { useCallback, useMemo, useState } from "react";
import projectsData from "../projects.json";
import { GithubIcon } from "components/icons/github-icon";
import { CompareModeButton } from "components/projects/compare-mode-button";
import { CompareProjectsDialog } from "components/projects/compare-projects-dialog";
import { ProjectsTable } from "components/projects/projects-table";
import { ProjectsToolbar } from "components/projects/projects-toolbar";
import { TagGraphVisualizationButton } from "components/tag-graph/tag-graph-visualization-button";
import { ThemeToggle } from "components/theme-toggle";
import { COMPARE_PROJECT_MAX, projectRowKey } from "lib/project-row-key";
import { mergeTailwindClasses } from "lib/utils";
import { useFilteredProjects, type CategoryTagMatchMode } from "lib/use-filtered-projects";
import type { Project } from "types/project";

const projects = projectsData as Project[];

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => new Set());
  const [categoryTagMatchMode, setCategoryTagMatchMode] = useState<CategoryTagMatchMode>("all");

  const [compareMode, setCompareMode] = useState(false);
  const [compareOrderedKeys, setCompareOrderedKeys] = useState<string[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  const { allCategories, filteredProjects } = useFilteredProjects(
    projects,
    query,
    selectedCategories,
    categoryTagMatchMode,
  );

  const compareKeysVisible = useMemo(() => {
    const allowed = new Set(filteredProjects.map((p) => projectRowKey(p)));
    return compareOrderedKeys.filter((key) => allowed.has(key));
  }, [compareOrderedKeys, filteredProjects]);

  const compareSelectedSet = useMemo(() => new Set(compareKeysVisible), [compareKeysVisible]);

  const compareResolvedProjects = useMemo(() => {
    return compareKeysVisible
      .map((key) => filteredProjects.find((p) => projectRowKey(p) === key))
      .filter((p): p is Project => p != null);
  }, [compareKeysVisible, filteredProjects]);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((previous) => {
      const next = new Set(previous);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const toggleCompareMode = useCallback(() => {
    setCompareMode((was) => {
      if (was) {
        setCompareOrderedKeys([]);
        setCompareDialogOpen(false);
      }
      return !was;
    });
  }, []);

  const toggleCompareRow = useCallback(
    (project: Project) => {
      const allowed = new Set(filteredProjects.map((p) => projectRowKey(p)));
      const key = projectRowKey(project);
      if (!allowed.has(key)) return;

      setCompareOrderedKeys((previous) => {
        const base = previous.filter((k) => allowed.has(k));
        const idx = base.indexOf(key);
        if (idx >= 0) {
          return base.filter((_, j) => j !== idx);
        }
        if (base.length >= COMPARE_PROJECT_MAX) {
          return base;
        }
        return [...base, key];
      });
    },
    [filteredProjects],
  );

  const compareSelectionCount = compareKeysVisible.length;
  const canOpenCompare = compareSelectionCount >= 2;

  return (
    <div className="flex min-h-svh flex-col text-foreground">
      <div className="mx-auto flex min-h-0 w-full max-w-[min(118rem,calc(100vw-1rem))] flex-1 flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6">
        <section aria-label="Search and filters" className="shrink-0 px-1 sm:px-0">
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
              categoryTagMatchMode={categoryTagMatchMode}
              onCategoryTagMatchModeChange={setCategoryTagMatchMode}
            />
            <div className="flex shrink-0 max-w-full flex-wrap items-center justify-end gap-x-2 gap-y-2 self-end">
              <div className="relative shrink-0">
                {compareMode ? (
                  <div className="absolute bottom-[calc(100%+0.35rem)] right-0 z-40 flex w-[min(100vw-1.75rem,12.5rem)] flex-col gap-2 rounded-lg border border-elevated bg-card px-3.5 py-2.5 text-center shadow-md">
                    <p className="text-[0.7rem] font-bold tabular-nums leading-tight text-foreground sm:text-xs">
                      Selected {compareSelectionCount}/{COMPARE_PROJECT_MAX}
                    </p>
                    <button
                      type="button"
                      disabled={!canOpenCompare}
                      className={mergeTailwindClasses(
                        "rounded-md border border-elevated px-3 py-2.5 text-sm font-bold tracking-tight transition-colors",
                        "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        canOpenCompare
                          ? "cursor-pointer bg-muted-foreground/22 text-foreground hover:bg-muted-foreground/32 dark:bg-muted-foreground/30 dark:hover:bg-muted-foreground/40"
                          : "cursor-not-allowed border-elevated bg-muted/50 text-muted-foreground opacity-70",
                      )}
                      onClick={() => {
                        setCompareDialogOpen(true);
                      }}
                    >
                      Open
                    </button>
                  </div>
                ) : null}
                <CompareModeButton enabled={compareMode} onToggle={toggleCompareMode} />
              </div>
              <TagGraphVisualizationButton
                filteredProjects={filteredProjects}
                allCategories={allCategories}
                selectedCategories={selectedCategories}
                onToggleCategory={toggleCategory}
                categoryTagMatchMode={categoryTagMatchMode}
                onCategoryTagMatchModeChange={setCategoryTagMatchMode}
              />
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
                <GithubIcon className="size-5" aria-hidden />
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
              compareMode={compareMode}
              compareSelectedKeys={compareSelectedSet}
              onCompareToggleRow={toggleCompareRow}
            />
          </div>
        </section>
      </div>
      <CompareProjectsDialog
        projects={compareResolvedProjects}
        open={compareDialogOpen && compareResolvedProjects.length >= 2}
        onClose={() => setCompareDialogOpen(false)}
      />
    </div>
  );
}
