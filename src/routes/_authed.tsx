import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "@/features/auth/auth";

/** Everything under this layout needs a signed-in user. */
export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    if (!(await getCurrentUser())) {
      throw redirect({ to: "/sign-in", search: { redirect: location.href } });
    }
  },
});
