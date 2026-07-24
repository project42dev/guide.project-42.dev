import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Why Project 42 exists and how the open-source learning platform works.",
};

export default function AboutPage() {
  return (
    <main className="page-shell shell">
      <header className="page-hero">
        <p className="eyebrow">About Project 42</p>
        <h1>A free place to become fluent in AI.</h1>
        <p>
          Project 42 is for the person asking their first AI question and the
          practitioner building their hundredth workflow. It pairs a practical field
          guide with learning paths that show what you understand—not just what you
          clicked.
        </p>
      </header>

      <div className="about-grid">
        <section>
          <span className="about-number">01</span>
          <h2>Beginner first, no ceiling</h2>
          <p>
            Every subject begins in plain language, then opens into practical and
            advanced material. Accessible does not mean shallow.
          </p>
        </section>
        <section>
          <span className="about-number">02</span>
          <h2>Concepts before vendors</h2>
          <p>
            We teach ideas that transfer, then explain how Anthropic, OpenAI, Google,
            and other selected providers implement them.
          </p>
        </section>
        <section>
          <span className="about-number">03</span>
          <h2>Evidence before freshness claims</h2>
          <p>
            Volatile material carries sources and verification dates. Future
            automation will propose evidence-backed updates, never publish unchecked
            AI output.
          </p>
        </section>
        <section>
          <span className="about-number">04</span>
          <h2>Hosted now, portable by design</h2>
          <p>
            Project42dev operates the first instance. The platform core and starter
            curriculum are open so teams can eventually run and extend their own.
          </p>
        </section>
      </div>

      <section className="open-source-banner">
        <div>
          <p className="eyebrow">Built in public</p>
          <h2>Use it. Improve it. Teach with it.</h2>
          <p>
            Software is Apache-2.0. Project 42 curriculum is CC BY 4.0. Private learner
            data and internal operations are never part of the public repositories.
          </p>
        </div>
        <div className="button-row">
          <a
            className="button button-primary"
            href="https://github.com/project42dev/project42-platform"
          >
            Platform source
          </a>
          <Link className="button button-secondary" href="/learn">
            Start learning
          </Link>
        </div>
      </section>
    </main>
  );
}
