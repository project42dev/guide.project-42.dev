import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Orchard",
  description:
    "Orchard is the open-source content lifecycle engine behind Project 42: two evidence tracks, two human gates, and an honest record of what is built and what is not.",
};

const REPO = "https://github.com/project42dev/orchard";

type DocLink = {
  href: string;
  title: string;
  summary: string;
};

const documentation: DocLink[] = [
  {
    href: `${REPO}/blob/main/docs/status.md`,
    title: "Status",
    summary:
      "What is designed, what is on the default branch, what is wired into a path that executes, and what has actually been observed working. Four separate columns, on purpose.",
  },
  {
    href: `${REPO}/blob/main/docs/install.md`,
    title: "Install guide",
    summary:
      "Prerequisites, the environment contract, and a first run against a model endpoint you own.",
  },
  {
    href: `${REPO}/blob/main/docs/lifecycle.md`,
    title: "Lifecycle",
    summary:
      "One content item, from the moment a discovery pass first notices the topic to the moment it is retired.",
  },
  {
    href: `${REPO}/blob/main/docs/workflow-orchestration.md`,
    title: "Workflow orchestration",
    summary:
      "Two independent evidence tracks, what each one is allowed to write, and the boundary audit that removed the workflows that overreached.",
  },
  {
    href: `${REPO}/blob/main/docs/decisions.md`,
    title: "Decisions",
    summary:
      "The reasoning, organised by theme, with the failure that produced each decision recorded alongside it.",
  },
  {
    href: `${REPO}/blob/main/docs/adr/index.md`,
    title: "Decision records",
    summary:
      "Thirteen accepted architecture decisions, one page each, written to stand alone.",
  },
];

const principles = [
  {
    title: "Two tracks that fail separately",
    body: "Discovery looks outward at approved primary sources and asks what the world teaches that we do not. Currency looks inward and asks what has stopped being true. Neither blocks the other, because they are different questions.",
  },
  {
    title: "Two gates, and the second binds to bytes",
    body: "Nothing reaches a model until a person approves it, which makes the gate an editorial control and a spend control at once. Nothing is published until a person approves the exact artifact digest, so an approval means these bytes rather than this idea.",
  },
  {
    title: "Files are the truth, the database is derived",
    body: "Content lives in reviewable files. The database is compiled from them and holds one small authoritative core: what a human decided, and what was actually produced.",
  },
  {
    title: "A silent check is worse than no check",
    body: "The rule underneath all of it. A check that quietly measures the wrong thing returns a confident answer and is believed. Orchard is shaped by six of those, found in three days, every one exiting zero.",
  },
];

export default function OrchardPage() {
  return (
    <main className="page-shell shell">
      <header className="page-hero">
        <p className="eyebrow">Open source · Apache 2.0</p>
        <h1>Orchard keeps this library honest.</h1>
        <p>
          Orchard is the content lifecycle engine behind Project 42. It watches
          an approved list of primary sources, inspects what is already
          published, and proposes work. It never publishes anything a person has
          not approved twice.
        </p>
        <p>
          <a href={REPO}>Read the source on GitHub →</a>
        </p>
      </header>

      <section aria-labelledby="orchard-status-title">
        <div className="section-heading">
          <p className="eyebrow">Where it stands</p>
          <h2 id="orchard-status-title">Not running anywhere, on purpose</h2>
        </div>
        <p>
          The reference deployment was built, ran, and was torn down. Orchard has
          since been reset to a never-run state ahead of its first full
          start-to-finish test, so it starts from the same place a new adopter
          starts. Nothing has yet completed the lifecycle end to end.
        </p>
        <p>
          That is stated here rather than buried because a project that describes
          intentions in the present tense is how a team comes to believe a
          pipeline is running when it is not.{" "}
          <a href={`${REPO}/blob/main/docs/status.md`}>
            The status page keeps built, deployed and proven in separate columns.
          </a>
        </p>
      </section>

      <section aria-labelledby="orchard-diagram-title">
        <div className="section-heading">
          <p className="eyebrow">Interactive</p>
          <h2 id="orchard-diagram-title">Walk the lifecycle</h2>
        </div>
        <p>
          Nineteen steps, from the schedule firing to a published item verified
          live, including both gates and the request intake path. Every step
          links to the documentation that governs it.
        </p>
        <p>
          <Link href="/diagrams/orchard-lifecycle">
            Open the interactive lifecycle diagram →
          </Link>
        </p>
      </section>

      <section aria-labelledby="orchard-principles-title">
        <div className="section-heading">
          <p className="eyebrow">How it thinks</p>
          <h2 id="orchard-principles-title">Four ideas that shape everything else</h2>
        </div>
        <div className="diagram-grid">
          {principles.map((principle) => (
            <article className="diagram-card" key={principle.title}>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="orchard-docs-title">
        <div className="section-heading">
          <p className="eyebrow">Documentation</p>
          <h2 id="orchard-docs-title">Everything, in the open</h2>
        </div>
        <p>
          Orchard is public and so is its documentation. Candid early analysis
          lives in a private planning repository by deliberate decision, and the
          accepted decisions are published here in full, written to stand alone.
          No page links to anything you cannot open.
        </p>
        <div className="diagram-grid">
          {documentation.map((doc) => (
            <article className="diagram-card" key={doc.href}>
              <h3>
                <a href={doc.href}>{doc.title}</a>
              </h3>
              <p>{doc.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="orchard-adopt-title">
        <div className="section-heading">
          <p className="eyebrow">Run it yourself</p>
          <h2 id="orchard-adopt-title">It expects your endpoint, not ours</h2>
        </div>
        <p>
          Orchard consumes an OpenAI-compatible endpoint and never provisions
          one. It is deliberately not coupled to any cloud: the container image
          is the portable artifact, and the deployment contract is written as
          capabilities rather than product names, so a profile can be judged on
          whether it provides them.
        </p>
        <p>
          Project 42 continues to maintain the core content. Running Orchard
          yourself means pointing it at your own models and your own corpus.{" "}
          <a href={`${REPO}/blob/main/docs/install.md`}>Start with the install guide.</a>
        </p>
      </section>
    </main>
  );
}
