import { cn } from "@/lib/utils";

/** The app's cookie icon (public/icon.svg) as an iOS-style rounded tile. */
export function AppIcon({ className }: { className?: string }) {
  return (
    <img
      src="/icon.svg"
      alt=""
      draggable={false}
      className={cn(
        "block rounded-[22.5%] shadow-[0_12px_28px_-10px_rgba(0,0,0,0.5)] select-none",
        className,
      )}
    />
  );
}
