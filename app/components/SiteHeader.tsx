import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="Project 42 home">
          <BrandMark />
          <span>
            Project <strong>42</strong>
          </span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/learn">Learn</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/diagrams">Visual guides</Link>
          <Link href="/profile">My progress</Link>
          <Link href="/about">About</Link>
        </nav>
        <Link className="header-action" href="/learn/ai-foundations">
          Start learning
        </Link>
      </div>
    </header>
  );
}
