import { Globe } from "lucide-react";
import type { Project } from "types/project";
import { TwitterIcon } from "components/icons/twitter-icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import { OptionalProjectIconLink } from "components/projects/project-icon-link";
import { ProjectCategoryBadge } from "components/projects/project-category-badge";
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
  return (
    <Table className="min-w-full">
      <TableHeader className="sticky top-0 z-[1] [&_th]:bg-card [&_th]:h-auto [&_th]:min-h-10 [&_th]:py-3 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground">
        <TableRow className="border-b-2 border-border hover:bg-transparent [&_th:not(:first-child)]:border-l [&_th:not(:first-child)]:border-border">
          <TableHead className="w-10 shrink-0 px-3 text-center tabular-nums">#</TableHead>
          <TableHead className="max-w-[11rem] w-[13%] ps-4 pe-1">
            Name
          </TableHead>
          <TableHead className="min-w-0 ps-4 pe-2">Description</TableHead>
          <TableHead className="w-14 min-w-[3.75rem] px-3 text-center">
            Twitter
          </TableHead>
          <TableHead className="w-14 min-w-[3.75rem] px-3 text-center">
            Website
          </TableHead>
          <TableHead className="min-w-[12rem] w-[26%] ps-4">
            Category
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="h-24 text-center text-muted-foreground"
            >
              {emptyLabel}
            </TableCell>
          </TableRow>
        ) : (
          projects.map((project, index) => (
            <TableRow key={projectRowKey(project)} className="[&_td:not(:first-child)]:border-l [&_td:not(:first-child)]:border-border">
              <TableCell className="px-3 py-2.5 text-center align-middle tabular-nums font-medium">
                {index + 1}
              </TableCell>
              <TableCell className="ps-4 pe-1 py-2.5 align-middle font-medium">{project.name}</TableCell>
              <TableCell className="text-muted-foreground ps-4 pe-2 py-2.5 align-middle whitespace-normal leading-relaxed">
                {project.description}
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
  );
}

function projectRowKey(project: Project): string {
  return `${project.name}\0${project.website ?? ""}\0${project.twitter ?? ""}`;
}
