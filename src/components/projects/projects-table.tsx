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
import { ProjectTagBadge } from "components/projects/project-tag-badge";
type ProjectsTableProps = {
  projects: readonly Project[];
  emptyLabel?: string;
};

export function ProjectsTable({
  projects,
  emptyLabel = "No projects match your filters.",
}: ProjectsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[13%] max-w-[11rem] pe-1">Name</TableHead>
          <TableHead className="min-w-0 ps-1">Description</TableHead>
          <TableHead className="w-14 text-center">Twitter</TableHead>
          <TableHead className="w-14 pe-8 text-center">Website</TableHead>
          <TableHead className="w-[26%] min-w-[12rem] ps-10">Tags</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="h-24 text-center text-muted-foreground"
            >
              {emptyLabel}
            </TableCell>
          </TableRow>
        ) : (
          projects.map((project) => (
            <TableRow key={projectRowKey(project)}>
              <TableCell className="align-middle py-2.5 font-medium pe-1">{project.name}</TableCell>
              <TableCell className="align-middle py-2.5 whitespace-normal text-muted-foreground ps-1 leading-relaxed">
                {project.description}
              </TableCell>
              <TableCell className="align-middle py-2.5 text-center">
                <OptionalProjectIconLink
                  href={(project.twitter ?? "").trim()}
                  aria-label={`${project.name} on Twitter`}
                >
                  <TwitterIcon className="size-5" />
                </OptionalProjectIconLink>
              </TableCell>
              <TableCell className="align-middle py-2.5 pe-8 text-center">
                <OptionalProjectIconLink
                  href={(project.website ?? "").trim()}
                  aria-label={`${project.name} website`}
                >
                  <Globe className="size-5" aria-hidden />
                </OptionalProjectIconLink>
              </TableCell>
              <TableCell className="align-middle py-2.5 ps-10">
                <div className="flex flex-wrap items-center gap-2">
                  {project.tags.map((tag) => (
                    <ProjectTagBadge key={tag} label={tag} />
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
