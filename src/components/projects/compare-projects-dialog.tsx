import { Globe } from "lucide-react";
import { useEffect } from "react";
import { TwitterIcon } from "components/icons/twitter-icon";
import { ProjectIconLink } from "components/projects/project-icon-link";
import { projectNoteParagraphs, projectRowKey } from "lib/project-row-key";
import type { Project } from "types/project";

type CompareProjectsDialogProps = {
  projects: readonly Project[];
  open: boolean;
  onClose: () => void;
};

export function CompareProjectsDialog({ projects, open, onClose }: CompareProjectsDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || projects.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/48 p-3 backdrop-blur-sm dark:bg-background/54 sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Compare project notes"
        className="flex min-h-[min(24rem,52dvh)] max-h-[min(92dvh,44rem)] w-full max-w-[min(96rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg sm:min-h-[min(26rem,50dvh)]"
      >
        <div className="hide-scrollbar flex min-h-0 flex-1 flex-col divide-y divide-border overflow-auto md:flex-row md:divide-x md:divide-y-0">
          {projects.map((project) => {
            const notes = projectNoteParagraphs(project);
            return (
              <div
                key={projectRowKey(project)}
                className="flex min-h-[min(14rem,36dvh)] min-w-0 flex-1 shrink-0 flex-col px-4 py-4 sm:min-h-[min(15rem,34dvh)] sm:px-5 sm:py-5"
              >
                <div className="shrink-0 pb-3 sm:pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 text-sm font-semibold leading-snug text-foreground sm:text-base">
                      {project.name}
                    </p>
                    {(project.twitter ?? "").trim() || (project.website ?? "").trim() ? (
                      <div className="flex shrink-0 items-center gap-3">
                        {(project.twitter ?? "").trim() ? (
                          <ProjectIconLink
                            href={(project.twitter ?? "").trim()}
                            aria-label={`${project.name} on Twitter`}
                          >
                            <TwitterIcon className="size-[1.0625rem] sm:size-[1.125rem]" />
                          </ProjectIconLink>
                        ) : null}
                        {(project.website ?? "").trim() ? (
                          <ProjectIconLink
                            href={(project.website ?? "").trim()}
                            aria-label={`${project.name} website`}
                          >
                            <Globe className="size-[1.0625rem] sm:size-[1.125rem]" aria-hidden />
                          </ProjectIconLink>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="min-h-[10.5rem] flex-1 space-y-2.5 border-t border-border pt-4 text-xs font-normal leading-relaxed text-foreground/86 sm:min-h-[12rem] sm:pt-5 sm:text-sm">
                  {notes.length > 0 ? (
                    notes.map((paragraph, i) => <p key={i}>{paragraph}</p>)
                  ) : (
                    <p className="text-muted-foreground">There are no project notes added at this time.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
