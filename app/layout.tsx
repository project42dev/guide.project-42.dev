import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { ProgressProvider } from "./components/ProgressProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://project-42.dev"),
  title: {
    default: "Project 42 — Learn AI with confidence",
    template: "%s · Project 42",
  },
  description:
    "Free, open, provider-neutral AI learning paths, knowledge checks, and practical field guides.",
  applicationName: "Project 42",
  keywords: [
    "AI learning",
    "agentic AI",
    "Anthropic",
    "OpenAI",
    "Claude",
    "ChatGPT",
    "free training",
  ],
  openGraph: {
    type: "website",
    siteName: "Project 42",
    title: "Project 42 — Learn AI with confidence",
    description:
      "Free learning paths and practical resources from first principles to reliable agents.",
    images: [
      {
        url: "/og.png",
        width: 1743,
        height: 909,
        alt: "Project 42 — Start curious. Become capable.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Project 42 — Learn AI with confidence",
    description:
      "Free learning paths and practical resources from first principles to reliable agents.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <ProgressProvider>
          <SiteHeader />
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
          <SiteFooter />
        </ProgressProvider>
      </body>
    </html>
  );
}
