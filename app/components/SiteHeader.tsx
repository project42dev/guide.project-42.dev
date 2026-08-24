import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { HeaderMenu, MenuChevron } from "./HeaderMenu";
import { ProfileMenu } from "./ProfileMenu";
import { siteFacts } from "../lib/siteFacts";

const LEARN = "https://learn.project-42.dev";
const supportHref = `${siteFacts.repositories.site}/blob/main/SUPPORT.md`;

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
          <a href={LEARN}>Learn</a>
          <Link href="/">Field Guide</Link>
          <Link href="/diagrams">Visual guides</Link>
          <HeaderMenu
            label={
              <>
                About
                <MenuChevron />
              </>
            }
          >
            <ul className="header-menu-list">
              <li>
                <a href="https://project-42.dev/about">About Project 42</a>
              </li>
              <li>
                <a href="https://project-42.dev/platform">Open-source platform &amp; docs</a>
              </li>
              <li>
                <a href="https://github.com/project42dev/project42-gallery" target="_blank" rel="noopener noreferrer">Theme Gallery &amp; Studio</a>
              </li>
              <li>
                <a href="https://project-42.dev/releases">Release notes</a>
              </li>
              <li>
                <a href="https://project-42.dev/roadmap">Roadmap</a>
              </li>
              <li>
                <a href="https://project-42.dev/support">Support &amp; Content Requests</a>
              </li>
              <li>
                <a href="https://project-42.dev/legal-transparency">
                  Legal and transparency
                </a>
              </li>
            </ul>
          </HeaderMenu>
        </nav>
        <div className="header-actions">
          <a className="header-action" href={LEARN}>
            Start learning
          </a>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
