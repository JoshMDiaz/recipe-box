import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { FirebaseError } from "firebase/app";
import { CookingPotIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { getCurrentUser, safeRedirect, signInWithGoogle } from "@/features/auth/auth";

const searchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/sign-in")({
  validateSearch: searchSchema,
  beforeLoad: async ({ search }) => {
    if (await getCurrentUser()) throw redirect({ href: safeRedirect(search.redirect) });
  },
  component: SignIn,
});

/** The user closed the popup or opened a second one; nothing to report. */
const CANCELLED = new Set(["auth/popup-closed-by-user", "auth/cancelled-popup-request"]);

function SignIn() {
  const { redirect: target } = Route.useSearch();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signIn = async () => {
    setPending(true);
    try {
      await signInWithGoogle();
      await router.navigate({ href: safeRedirect(target), replace: true });
    } catch (err) {
      if (err instanceof FirebaseError && CANCELLED.has(err.code)) return;
      toast.error("Couldn't sign in", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-sm flex-col items-center px-4 py-24 text-center">
      <CookingPotIcon className="size-10 text-primary" aria-hidden />
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight">
        Welcome to Recipe Box
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to save recipes and see them on any device.
      </p>
      <Button size="lg" className="mt-8 rounded-full px-5" disabled={pending} onClick={signIn}>
        <GoogleIcon data-icon="inline-start" />
        Continue with Google
      </Button>
    </main>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
