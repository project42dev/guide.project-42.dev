import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found shell">
      <p className="eyebrow">404 / Off the map</p>
      <h1>This path has not been charted.</h1>
      <p>Search the Field Guide or continue to Project 42 Learn.</p>
      <div className="button-row">
        <Link className="button button-primary" href="/">
          Field Guide
        </Link>
        <a className="button button-secondary" href="https://learn.project-42.dev">
          Project 42 Learn
        </a>
      </div>
    </main>
  );
}
