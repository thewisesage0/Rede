import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { FloatingQuotes } from "@/components/site/FloatingQuotes";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-strong rounded-2xl p-10">
        <h1 className="font-serif text-7xl rose-text">404</h1>
        <h2 className="mt-4 font-serif text-2xl">Lost between chapters</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page wandered off the manuscript. Let's get you back to the library.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-blush-glow px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-strong rounded-2xl p-10">
        <h1 className="font-serif text-2xl">A page out of place</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong while turning the page.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-gradient-to-r from-primary to-blush-glow px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >Try again</button>
          <a href="/" className="rounded-full border border-border px-5 py-2.5 text-sm">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kyef — Acquisition Editor for Webnovel Authors" },
      { name: "description", content: "Kyef, a boutique acquisition editor, helps webnovel authors get signed by top publishing platforms." },
      { property: "og:title", content: "Kyef — Acquisition Editor for Webnovel Authors" },
      { property: "og:description", content: "Kyef, a boutique acquisition editor, helps webnovel authors get signed by top publishing platforms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Kyef — Acquisition Editor for Webnovel Authors" },
      { name: "twitter:description", content: "Kyef, a boutique acquisition editor, helps webnovel authors get signed by top publishing platforms." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/7a2c5d81-f3b4-4803-a2b6-558c3d7df84f" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/7a2c5d81-f3b4-4803-a2b6-558c3d7df84f" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      // Plus Jakarta Sans used to be the base font, but the cute theme's
      // Fredoka/Jua stack is applied site-wide now and fully overrides it —
      // fetching it too was dead weight on every page load.
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Jua&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  // Kyef's cute k-pop theme is the site's theme now (not just the AE
  // dashboard), so the "ae-jk" class lives permanently on <html> — every
  // page, public or signed-in, picks up the same palette in src/styles.css.
  return (
    <html lang="en" className="ae-jk">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <FloatingQuotes />
      <Toaster theme="dark" position="top-right" toastOptions={{ className: "glass-strong" }} />
    </QueryClientProvider>
  );
}
