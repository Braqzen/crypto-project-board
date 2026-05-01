import type { ReactNode } from "react";

type ProjectIconLinkProps = {
  href: string;
  "aria-label": string;
  children: ReactNode;
};

export function ProjectIconLink({ href, "aria-label": ariaLabel, children }: ProjectIconLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center justify-center text-foreground hover:text-primary"
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}

type OptionalProjectIconLinkProps = {
  href: string;
  "aria-label": string;
  children: ReactNode;
};

export function OptionalProjectIconLink({
  href,
  "aria-label": ariaLabel,
  children,
}: OptionalProjectIconLinkProps) {
  if (!href.trim()) {
    return <span className="inline-flex h-5 items-center justify-center text-muted-foreground">-</span>;
  }
  return (
    <ProjectIconLink href={href} aria-label={ariaLabel}>
      {children}
    </ProjectIconLink>
  );
}
