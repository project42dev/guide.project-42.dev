import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href="https://project-42.dev" aria-label="Project 42 home">
          <BrandMark />
          <span>
            Project <strong>42</strong>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="https://learn.project-42.dev">Learn</a>
          <Link href="/resources">Field Guide</Link>
          <Link href="/diagrams">Visual guides</Link>
          <a href="https://learn.project-42.dev/profile">My progress</a>
          <a href="https://project-42.dev/about">About</a>
        </nav>
        <Link className="header-action" href="/resources">Open the guide</Link>
      </div>
    </header>
  );
}
