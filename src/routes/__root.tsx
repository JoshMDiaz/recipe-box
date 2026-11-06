import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster position="top-center" />
    </>
  );
}

const primaryButton =
  "mt-8 flex h-12 items-center justify-center rounded-2xl bg-blue px-6 text-[17px] font-semibold text-white transition-transform active:scale-[0.98]";

function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-4 text-center">
      <p className="font-rounded text-[72px] leading-none font-bold tracking-tight text-label-3">
        404
      </p>
      <h1 className="mt-4 text-[22px] font-bold tracking-tight">That page isn't in the box</h1>
      <p className="mt-1 text-[15px] text-label-2">It may have been deleted or moved.</p>
      <Link to="/" className={primaryButton}>
        Back to Recipes
      </Link>
    </main>
  );
}

function ErrorView({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-4 text-center">
      <h1 className="text-[22px] font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-1 text-[15px] text-label-2">
        {error instanceof Error ? error.message : "Please try again."}
      </p>
      <button
        type="button"
        className={primaryButton}
        onClick={() => {
          reset();
          void router.invalidate();
        }}
      >
        Try Again
      </button>
    </main>
  );
}
