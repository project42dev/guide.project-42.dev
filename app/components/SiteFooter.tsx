import Link from "next/link";
import { starterCatalog } from "@project42/platform";
import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <div className="brand footer-brand">
            <BrandMark />
            <span>Project 42</span>
          </div>
          <p>Free, open AI learning for curious people and capable teams.</p>
        </div>
        <div>
          <strong>Explore</strong>
          <Link href="/learn">Learning paths</Link>
          <Link href="/resources">Field guide</Link>
          <Link href="/diagrams">Visual guides</Link>
          <Link href="/profile">Your transcript</Link>
        </div>
        <div>
          <strong>Project</strong>
          <Link href="/about">About and roadmap</Link>
          <a href="https://github.com/project42dev/project42-platform">Open-source platform</a>
          <a href="https://github.com/project42dev/project-42.dev">Public site source</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>Project 42 · Content v{starterCatalog.contentVersion}</span>
        <span>Code Apache-2.0 · Curriculum CC BY 4.0</span>
      </div>
    </footer>
  );
}
