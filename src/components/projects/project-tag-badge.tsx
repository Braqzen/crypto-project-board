import { mergeTailwindClasses } from "lib/utils";

type ProjectTagBadgeProps = {
  label: string;
};

export function ProjectTagBadge({ label }: ProjectTagBadgeProps) {
  return (
    <span
      className={mergeTailwindClasses(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-normal leading-none",
        "bg-secondary text-secondary-foreground",
      )}
    >
      {label}
    </span>
  );
}
