import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { PortfolioChatBot } from "../components/PortfolioChatBot";
import { Toaster } from "@/components/ui/sonner";
import { ThreeDBackground } from "@/components/ui/three-d-background";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Try again</button>
          <a href="/" className="rounded-md border border-input px-4 py-2 text-sm">Go home</a>
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
      { title: "Ganesh Kaithoju — Full Stack Developer & Software Engineer" },
      { name: "description", content: "Portfolio of Ganesh Kaithoju — Full Stack Developer, Software Engineer, and ECE student building scalable, elegant web applications." },
      { name: "author", content: "Ganesh Kaithoju" },
      { name: "keywords", content: "Ganesh Kaithoju, Full Stack Developer, Software Engineer, Python, Java, React, Node.js, Portfolio, Hyderabad" },
      { property: "og:title", content: "Ganesh Kaithoju — Full Stack Developer & Software Engineer" },
      { property: "og:description", content: "Portfolio of Ganesh Kaithoju — Full Stack Developer, Software Engineer, and ECE student building scalable, elegant web applications." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Ganesh Kaithoju" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ganesh Kaithoju — Full Stack Developer & Software Engineer" },
      { name: "twitter:description", content: "Portfolio of Ganesh Kaithoju — Full Stack Developer, Software Engineer, and ECE student building scalable, elegant web applications." },
      { name: "theme-color", content: "#0d1220" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/7c244fe7-0e9a-43c6-9e22-a0ca767713bb" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/7c244fe7-0e9a-43c6-9e22-a0ca767713bb" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Ganesh Kaithoju",
          jobTitle: "Full Stack Developer & Software Engineer",
          address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressRegion: "Telangana", addressCountry: "IN" },
          alumniOf: "Narsimha Reddy Engineering College",
          sameAs: ["https://www.linkedin.com/in/ganesh-kaithoju/"],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThreeDBackground />
      <Outlet />
      <PortfolioChatBot />
      <Toaster />
    </QueryClientProvider>
  );
}
