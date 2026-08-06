import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { HeaderMenu, MenuChevron } from "./HeaderMenu";
import { siteFacts } from "../lib/siteFacts";

const LEARN = "https://learn.project-42.dev";

// Support is the only About item without a page, so it points at the
// canonical file in the repository. Releases and roadmap are real pages now.
const supportHref = `${siteFacts.repositories.site}/blob/main/SUPPORT.md`;

function ProfileIcon() {
  return (
    <svg aria-hidden="true" className="profile-icon" focusable="false" viewBox="0 0 24 24">
      <circle cx="12" cy="8.2" fill="currentColor" r="3.6" />
      <path
        d="M4.6 20.2c0-3.9 3.3-6.6 7.4-6.6s7.4 2.7 7.4 6.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.1"
      />
    </svg>
  );
}

// Primary navigation is four items: Learn, Field Guide, Visual guides, About.
// The learner's own things live behind the profile icon on the right. This site
// has no session of its own, so those are absolute links to Learn, which owns
// the account, sign-in flow, and learning record.
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
          {/* The guide IS this site's root. Pointing this at /resources sent
              you to a second copy of the page you were already reading. */}
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
                <a href="https://project-42.dev/releases">Release notes</a>
              </li>
              <li>
                <a href="https://project-42.dev/roadmap">Roadmap</a>
              </li>
              <li>
                <a href={supportHref}>Support</a>
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
          <HeaderMenu
            accessibleLabel="Your account"
            align="end"
            label={<ProfileIcon />}
            triggerClassName="profile-trigger"
          >
            <ul className="header-menu-list">
              <li>
                <a href={`${LEARN}/account`}>Sign in</a>
              </li>
              <li>
                <a href={`${LEARN}/profile`}>My progress</a>
              </li>
              <li>
                <a href={`${LEARN}/account`}>Account</a>
              </li>
              <li>
                <a href={`${LEARN}/learner-data`}>Learner data</a>
              </li>
            </ul>
          </HeaderMenu>
        </div>
      </div>
    </header>
  );
}
