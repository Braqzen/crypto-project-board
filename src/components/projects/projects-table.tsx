import { useCallback, useEffect, useId, useState } from "react";
import type { MouseEventHandler } from "react";
import { Globe } from "lucide-react";
import type { Project } from "types/project";
import { TwitterIcon } from "components/icons/twitter-icon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table";
import {
  OptionalProjectIconLink,
  ProjectIconLink,
} from "components/projects/project-icon-link";
import { ProjectCategoryBadge } from "components/projects/project-category-badge";
import { projectNoteParagraphs, projectRowKey } from "lib/project-row-key";
import { mergeTailwindClasses } from "lib/utils";

type InteractiveCellIsolation =
  | { onMouseDown: MouseEventHandler<HTMLTableCellElement>; onClick: MouseEventHandler<HTMLTableCellElement> }
  | Record<string, never>;

function interactiveIsolation(compareMode: boolean): InteractiveCellIsolation {
  if (!compareMode) return {};
  return {
    onMouseDown: (event) => event.stopPropagation(),
    onClick: (event) => event.stopPropagation(),
  };
}

type ProjectsTableProps = {
  projects: readonly Project[];
  emptyLabel?: string;
  selectedCategories: ReadonlySet<string>;
  onToggleCategory: (category: string) => void;
  compareMode?: boolean;
  compareSelectedKeys?: ReadonlySet<string>;
  onCompareToggleRow?: (project: Project) => void;
};

export function ProjectsTable({
  projects,
  emptyLabel = "No projects match your filters.",
  selectedCategories,
  onToggleCategory,
  compareMode = false,
  compareSelectedKeys = new Set(),
  onCompareToggleRow,
}: ProjectsTableProps) {
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const detailTitleId = useId();

  const closeDetail = useCallback(() => setDetailProject(null), []);

  const detailNoteParagraphs = detailProject ? projectNoteParagraphs(detailProject) : [];

  useEffect(() => {
    if (!detailProject) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetail();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailProject, closeDetail]);

  const isolate = interactiveIsolation(compareMode);

  return (
    <>
      <Table className="min-w-full">
        <TableHeader className="sticky top-0 z-[1] [&_th]:bg-card [&_th]:h-auto [&_th]:min-h-10 [&_th]:py-3 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground">
          <TableRow className="border-b-2 border-foreground/16 hover:bg-transparent dark:border-foreground/22 [&_th:not(:first-child)]:border-l [&_th:not(:first-child)]:border-foreground/14 dark:[&_th:not(:first-child)]:border-foreground/20">
            <TableHead className="w-10 shrink-0 px-3 text-center tabular-nums">#</TableHead>
            <TableHead className="max-w-[11rem] w-[13%] ps-4 pe-1">Name</TableHead>
            <TableHead className="min-w-0 ps-4 pe-2">Summary</TableHead>
            <TableHead className="w-14 min-w-[3.75rem] px-3 text-center">Twitter</TableHead>
            <TableHead className="w-14 min-w-[3.75rem] px-3 text-center">Website</TableHead>
            <TableHead className="min-w-[12rem] w-[26%] ps-4">Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                {emptyLabel}
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project, index) => {
              const key = projectRowKey(project);
              const rowSelectedForCompare = compareSelectedKeys.has(key);
              const compareRowInteract =
                compareMode &&
                mergeTailwindClasses(
                  "cursor-pointer outline-none focus-visible:z-[1] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  rowSelectedForCompare
                    ? "aria-selected:[&_td]:!bg-muted-foreground/14 aria-selected:[&_td:hover]:!bg-muted-foreground/20 dark:aria-selected:[&_td]:!bg-muted-foreground/16 dark:aria-selected:[&_td:hover]:!bg-muted-foreground/22"
                    : "[&_td:hover]:!bg-muted/52 dark:[&_td:hover]:!bg-muted/45",
                );
              return (
                <TableRow
                  key={key}
                  tabIndex={compareMode ? 0 : undefined}
                  aria-selected={compareMode ? rowSelectedForCompare : undefined}
                  aria-label={
                    compareMode
                      ? `${rowSelectedForCompare ? "Deselect" : "Select"} ${project.name} for comparison`
                      : undefined
                  }
                  className={mergeTailwindClasses(
                    "[&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-foreground/14 dark:[&_td:not(:first-child)]:border-foreground/20 transition-colors",
                    compareRowInteract,
                  )}
                  onClick={
                    compareMode && onCompareToggleRow ? () => onCompareToggleRow(project) : undefined
                  }
                  onKeyDown={
                    compareMode && onCompareToggleRow
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onCompareToggleRow(project);
                          }
                        }
                      : undefined
                  }
                >
                  <TableCell className="px-3 py-2.5 text-center align-middle tabular-nums font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell className="ps-4 pe-1 py-2.5 align-middle font-medium">{project.name}</TableCell>
                  <TableCell className="align-middle leading-relaxed p-0">
                    {compareMode ? (
                      <p className="text-muted-foreground px-0 py-2.5 ps-4 pe-2 whitespace-normal">
                        {project.summary}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailProject(project);
                        }}
                        className={mergeTailwindClasses(
                          "w-full cursor-pointer rounded-sm px-0 py-2.5 text-left text-muted-foreground",
                          "ps-4 pe-2 leading-relaxed whitespace-normal transition-colors outline-offset-2",
                          "hover:bg-muted/45 hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring",
                        )}
                        aria-expanded={
                          detailProject !== null && projectRowKey(detailProject) === key
                        }
                        aria-haspopup="dialog"
                        aria-label={`More about ${project.name}`}
                      >
                        {project.summary}
                      </button>
                    )}
                  </TableCell>
                  <TableCell
                    className="w-14 min-w-[3.75rem] px-3 py-2.5 text-center align-middle"
                    {...isolate}
                  >
                    <OptionalProjectIconLink
                      href={(project.twitter ?? "").trim()}
                      aria-label={`${project.name} on Twitter`}
                    >
                      <TwitterIcon className="size-5" />
                    </OptionalProjectIconLink>
                  </TableCell>
                  <TableCell
                    className="w-14 min-w-[3.75rem] px-3 py-2.5 text-center align-middle"
                    {...isolate}
                  >
                    <OptionalProjectIconLink
                      href={(project.website ?? "").trim()}
                      aria-label={`${project.name} website`}
                    >
                      <Globe className="size-5" aria-hidden />
                    </OptionalProjectIconLink>
                  </TableCell>
                  <TableCell className="ps-4 pe-2 py-2.5 align-middle" {...isolate}>
                    <div className="flex flex-wrap items-center gap-2">
                      {[...project.category]
                        .sort((a, b) => a.localeCompare(b))
                        .map((category) => (
                          <ProjectCategoryBadge
                            key={category}
                            label={category}
                            selected={selectedCategories.has(category)}
                            onToggle={() => {
                              onToggleCategory(category);
                            }}
                          />
                        ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {detailProject ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/48 p-3 backdrop-blur-sm dark:bg-background/54 sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetail();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={detailTitleId}
            className="flex min-h-[min(22rem,48dvh)] max-h-[min(90dvh,36rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg sm:min-h-[min(24rem,46dvh)] sm:max-h-[min(92dvh,40rem)] sm:max-w-[54rem]"
          >
            <div className="min-h-0 flex-1 overflow-y-auto border-border bg-muted/35 px-4 pt-5 pb-6 text-base leading-relaxed sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <h2
                  id={detailTitleId}
                  className="min-w-0 flex-1 text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl"
                >
                  {detailProject.name}
                </h2>
                {(detailProject.twitter ?? "").trim() || (detailProject.website ?? "").trim() ? (
                  <div className="flex shrink-0 items-center gap-4">
                    {(detailProject.twitter ?? "").trim() ? (
                      <ProjectIconLink
                        href={(detailProject.twitter ?? "").trim()}
                        aria-label={`${detailProject.name} on Twitter`}
                      >
                        <TwitterIcon className="size-[1.3125rem]" />
                      </ProjectIconLink>
                    ) : null}
                    {(detailProject.website ?? "").trim() ? (
                      <ProjectIconLink
                        href={(detailProject.website ?? "").trim()}
                        aria-label={`${detailProject.name} website`}
                      >
                        <Globe className="size-[1.3125rem]" aria-hidden />
                      </ProjectIconLink>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="mt-3 flex flex-col">
                <section className="border-b border-border pb-4 leading-relaxed">
                  <p className="text-base font-normal text-foreground">{detailProject.summary}</p>
                </section>
                <section className="pt-6" aria-label="Additional project details">
                  <div className="min-h-[10.5rem] space-y-3 text-sm font-normal leading-relaxed text-foreground/86 sm:min-h-[12rem] sm:text-[0.953125rem]">
                    {detailNoteParagraphs.length > 0 ? (
                      detailNoteParagraphs.map((text, i) => <p key={i}>{text}</p>)
                    ) : (
                      <p>There are no project notes added at this time.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
