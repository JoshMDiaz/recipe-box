import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useUser } from "./auth";

/** The signed-in user's avatar, with sign-out behind it. */
export function UserMenu() {
  const user = useUser();
  if (!user) return null;
  const name = user.displayName ?? user.email ?? "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account"
        className="flex size-9 shrink-0 items-center justify-center rounded-full transition-transform focus-visible:ring-2 focus-visible:ring-blue/40 focus-visible:outline-none active:scale-90"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            referrerPolicy="no-referrer"
            className="size-9 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0a84ff,#5e5ce6)] text-[15px] font-semibold text-white">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="elevated w-60 rounded-2xl p-1.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)] ring-0"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate px-2.5 py-1.5 text-[13px] font-normal text-label-2">
            {user.email ?? name}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="rounded-xl px-2.5 py-2 text-[17px]"
          onClick={() =>
            signOut().catch((err: Error) =>
              toast.error("Couldn't sign out", { description: err.message }),
            )
          }
        >
          <LogOutIcon /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
