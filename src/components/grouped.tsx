import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * iOS Settings-style grouped section: a caption above, rows on a rounded
 * card, and an explanation below.
 */
export function Group({
  header,
  action,
  footer,
  children,
  className,
  onAnimationEnd,
}: {
  onAnimationEnd?: () => void;
  header?: ReactNode;
  /** Small control on the right of the header, e.g. "Uncheck all". */
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-6", className)} onAnimationEnd={onAnimationEnd}>
      {(header || action) && (
        <div className="flex items-end justify-between gap-3 px-4 pb-1.5">
          {header && <h2 className="text-[13px] text-label-2 uppercase">{header}</h2>}
          {action}
        </div>
      )}
      <div className="divide-y divide-separator overflow-hidden rounded-2xl bg-surface">
        {children}
      </div>
      {footer && <div className="px-4 pt-1.5 text-[13px] leading-snug text-label-2">{footer}</div>}
    </section>
  );
}

/** A tappable list row. `destructive` centers it in red, like iOS. */
export function Row({
  children,
  onClick,
  destructive,
}: {
  children: ReactNode;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-12 w-full items-center gap-3 px-4 text-left text-[17px] text-blue focus-visible:bg-fill focus-visible:outline-none active:bg-fill",
        destructive && "justify-center text-red",
      )}
    >
      {children}
    </button>
  );
}

/** Text-button styling for the small blue actions in group headers. */
export const headerAction =
  "rounded-md text-[13px] font-medium text-blue focus-visible:ring-2 focus-visible:ring-blue/40 focus-visible:outline-none active:opacity-50";

/** Input styling for fields sitting directly on a grouped row. */
export const rowInput =
  "w-full min-w-0 bg-transparent px-4 py-3 text-[17px] text-label outline-none placeholder:text-label-3";

/** Round icon button on a fill, like the + in Bucket Budgets' header. */
export const roundButton =
  "flex size-9 shrink-0 items-center justify-center rounded-full bg-fill text-blue transition-transform focus-visible:ring-2 focus-visible:ring-blue/40 focus-visible:outline-none active:scale-90";
