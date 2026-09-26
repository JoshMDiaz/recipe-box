import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { CookingPotIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
});

function RootLayout() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
          <Link to="/" className="flex items-center gap-2 font-heading text-xl font-semibold">
            <CookingPotIcon className="size-5 text-primary" aria-hidden />
            Recipe Box
          </Link>
        </div>
      </header>
      <Outlet />
      <Toaster position="top-center" />
    </>
  );
}

function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="font-heading text-6xl font-semibold">404</p>
      <h1 className="mt-4 text-lg font-semibold">That page isn't in the box</h1>
      <p className="mt-2 text-sm text-muted-foreground">It may have been deleted or moved.</p>
      <Link to="/" className={buttonVariants({ className: "mt-6 rounded-full px-4" })}>
        Back to recipes
      </Link>
    </main>
  );
}

function ErrorView({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="font-heading text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "Please try again."}
      </p>
      <Button
        className="mt-6 rounded-full px-4"
        onClick={() => {
          reset();
          void router.invalidate();
        }}
      >
        Try again
      </Button>
    </main>
  );
}
