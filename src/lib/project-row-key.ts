import type { Project } from "types/project";

export const COMPARE_PROJECT_MAX = 4;

export function projectRowKey(project: Project): string {
  return `${project.name}\0${project.website ?? ""}\0${project.twitter ?? ""}`;
}

export function projectNoteParagraphs(project: Project): string[] {
  const raw = project.notes ?? [];
  return raw.map((n) => n.trim()).filter((n) => n.length > 0);
}
