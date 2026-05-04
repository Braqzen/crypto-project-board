import { Columns2 } from "lucide-react";
import { mergeTailwindClasses } from "lib/utils";

type CompareModeButtonProps = {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
};

const activeSurface =
  "bg-muted-foreground/28 text-foreground dark:bg-muted-foreground/36 hover:bg-muted-foreground/34 dark:hover:bg-muted-foreground/42";

export function CompareModeButton({ enabled, onToggle, className }: CompareModeButtonProps) {
  return (
    <button
      type="button"
      className={mergeTailwindClasses(
        "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        enabled
          ? mergeTailwindClasses("border border-elevated", activeSurface)
          : "table-elevated-surface text-foreground hover:bg-muted",
        className,
      )}
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Exit compare mode" : "Enter compare mode"}
      title={enabled ? "Exit compare mode" : "Compare projects (click a row)"}
    >
      <Columns2 className="size-5" aria-hidden />
    </button>
  );
}
