import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { auth } from "@/lib/firebase";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  // Let TanStack Query own caching; the router just kicks off loads.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

// When the user signs in, out, or switches accounts, drop the previous user's
// cached recipes and rerun route guards (signing out lands on /sign-in).
void auth.authStateReady().then(() => {
  let uid = auth.currentUser?.uid;
  auth.onAuthStateChanged((user) => {
    if (user?.uid === uid) return;
    uid = user?.uid;
    queryClient.clear();
    void router.invalidate();
  });
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
