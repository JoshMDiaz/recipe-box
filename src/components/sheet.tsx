import { Drawer } from "@base-ui/react/drawer";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * iOS-style bottom sheet with a grabber; swipe down to dismiss. The same
 * look as Bucket Budgets and Family Bank. Built on Base UI's Drawer.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Screen-reader title. Show a visible one with <SheetNav>. */
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.VirtualKeyboardProvider>
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-overlay opacity-[calc(1-var(--drawer-swipe-progress))] backdrop-blur-[2px] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute" />
          <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
            <Drawer.Popup
              className={cn(
                "elevated -mb-12 flex max-h-[calc(94dvh+3rem)] w-full max-w-lg [transform:translateY(var(--drawer-swipe-movement-y))] flex-col rounded-t-[28px] bg-bg pb-12 text-label shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.4)] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform outline-none data-ending-style:[transform:translateY(calc(100%-3rem+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:[transform:translateY(calc(100%-3rem+2px))] data-swiping:select-none",
                className,
              )}
            >
              <div className="mx-auto mt-2 mb-1 h-[5px] w-9 shrink-0 rounded-full bg-fill-2" />
              <Drawer.Title className="sr-only">{title}</Drawer.Title>
              <Drawer.Content className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(env(safe-area-inset-bottom),20px)]">
                {children}
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.VirtualKeyboardProvider>
    </Drawer.Root>
  );
}

/** Cancel · Title · Action — the iOS sheet navigation bar. Sticks to the top as the sheet scrolls. */
export function SheetNav({
  left,
  title,
  right,
}: {
  left?: ReactNode;
  title?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-10 -mx-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-bg/90 px-4 py-2 backdrop-blur-md">
      <div className="justify-self-start">{left}</div>
      <span className="max-w-[55vw] truncate text-[17px] font-semibold">{title}</span>
      <div className="justify-self-end">{right}</div>
    </div>
  );
}

export function NavButton({
  children,
  onClick,
  disabled,
  bold,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  bold?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1 rounded-md text-[17px] text-blue transition-opacity focus-visible:ring-2 focus-visible:ring-blue/40 focus-visible:outline-none active:opacity-50 disabled:text-label-3",
        bold && "font-semibold",
      )}
    >
      {children}
    </button>
  );
}

/** A yes/no sheet for destructive actions, in place of an alert dialog. */
export function ConfirmSheet({
  open,
  onOpenChange,
  title,
  action,
  pending,
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  action: string;
  pending?: boolean;
  onConfirm: () => void;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={title}>
      <div className="px-2 pt-4 pb-2 text-center">
        <p className="text-[20px] font-semibold tracking-tight">{title}</p>
        <p className="mt-2 text-[15px] leading-snug text-label-2">{children}</p>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={onConfirm}
        className="mt-4 h-12 w-full rounded-2xl bg-red text-[17px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        {pending ? "Deleting…" : action}
      </button>
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="mt-2 h-12 w-full rounded-2xl text-[17px] font-semibold text-blue active:bg-fill"
      >
        Cancel
      </button>
    </Sheet>
  );
}
