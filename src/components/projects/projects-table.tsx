import { useCallback, useEffect, useId, useState } from "react";
import { Globe } from "lucide-react";
import type { Project } from "types/project";
import { TwitterIcon } from "components/icons/twitter-icon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "components/ui/table";
import {
  OptionalProjectIconLink,
  ProjectIconLink,
} from "components/projects/project-icon-link";
import { ProjectCategoryBadge } from "components/projects/project-category-badge";
import { mergeTailwindClasses } from "lib/utils";

type ProjectsTableProps = {
  projects: readonly Project[];
  emptyLabel?: string;
  selectedCategories: ReadonlySet<string>;
  onToggleCategory: (category: string) => void;
};

export function ProjectsTable({
  projects,
  emptyLabel = "No projects match your filters.",
  selectedCategories,
  onToggleCategory,
}: ProjectsTableProps) {
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const detailTitleId = useId();

  const closeDetail = useCallback(() => setDetailProject(null), []);

  const detailNoteParagraphs = detailProject ? noteParagraphsFromProject(detailProject) : [];

  useEffect(() => {
    if (!detailProject) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetail();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailProject, closeDetail]);

  return (
    <>
      <Table className="min-w-full">
        <TableHeader className="sticky top-0 z-[1] [&_th]:bg-card [&_th]:h-auto [&_th]:min-h-10 [&_th]:py-3 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground">
          <TableRow className="border-b-2 border-border hover:bg-transparent [&_th:not(:first-child)]:border-l [&_th:not(:first-child)]:border-border">
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
            projects.map((project, index) => (
              <TableRow
                key={projectRowKey(project)}
                className="[&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-border"
              >
                <TableCell className="px-3 py-2.5 text-center align-middle tabular-nums font-medium">
                  {index + 1}
                </TableCell>
                <TableCell className="ps-4 pe-1 py-2.5 align-middle font-medium">
                  {project.name}
                </TableCell>
                <TableCell className="p-0 align-middle">
                  <button
                    type="button"
                    onClick={() => setDetailProject(project)}
                    className={mergeTailwindClasses(
                      "w-full cursor-pointer rounded-sm px-0 py-2.5 text-left text-muted-foreground",
                      "ps-4 pe-2 leading-relaxed whitespace-normal transition-colors outline-offset-2",
                      "hover:bg-muted/45 hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                    aria-expanded={
                      detailProject !== null &&
                      projectRowKey(detailProject) === projectRowKey(project)
                    }
                    aria-haspopup="dialog"
                    aria-label={`More about ${project.name}`}
                  >
                    {project.summary}
                  </button>
                </TableCell>
                <TableCell className="w-14 min-w-[3.75rem] px-3 py-2.5 text-center align-middle">
                  <OptionalProjectIconLink
                    href={(project.twitter ?? "").trim()}
                    aria-label={`${project.name} on Twitter`}
                  >
                    <TwitterIcon className="size-5" />
                  </OptionalProjectIconLink>
                </TableCell>
                <TableCell className="w-14 min-w-[3.75rem] px-3 py-2.5 text-center align-middle">
                  <OptionalProjectIconLink
                    href={(project.website ?? "").trim()}
                    aria-label={`${project.name} website`}
                  >
                    <Globe className="size-5" aria-hidden />
                  </OptionalProjectIconLink>
                </TableCell>
                <TableCell className="ps-4 pe-2 py-2.5 align-middle">
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
            ))
          )}
        </TableBody>
      </Table>

      {detailProject ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetail();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={detailTitleId}
            className="flex max-h-[min(90dvh,36rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg sm:max-h-[min(92dvh,40rem)] sm:max-w-[54rem]"
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
                  <div className="space-y-3 text-sm font-normal leading-relaxed text-foreground/86 sm:text-[0.953125rem]">
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

function projectRowKey(project: Project): string {
  return `${project.name}\0${project.website ?? ""}\0${project.twitter ?? ""}`;
}

function noteParagraphsFromProject(project: Project): string[] {
  const raw = project.notes ?? [];
  return raw.map((n) => n.trim()).filter((n) => n.length > 0);
}
