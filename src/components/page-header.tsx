import type { ReactNode } from "react";

const today = () =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(
    new Date(),
  );

/** The iOS large-title header from Bucket Budgets: a date caption, controls, and a big title. */
export function PageHeader({ title, actions }: { title: ReactNode; actions?: ReactNode }) {
  return (
    <header className="pt-3">
      <div className="flex min-h-9 items-center justify-between gap-2">
        <p className="text-[13px] font-semibold tracking-wide text-label-2 uppercase">{today()}</p>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <h1 className="mt-1 text-[34px] leading-tight font-bold tracking-tight">{title}</h1>
    </header>
  );
}
