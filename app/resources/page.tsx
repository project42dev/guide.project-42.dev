import type { Metadata } from "next";
import { starterCatalog } from "@project42/platform";
import { ResourceExplorer } from "../components/ResourceExplorer";
import { ContentUseNotice } from "../components/ContentUseNotice";

export const metadata: Metadata = {
  title: "AI field guide",
  description: "Searchable Project 42 AI references, checklists, and decision tools.",
};

export default function ResourcesPage() {
  const asOf = new Date().toISOString().slice(0, 10);
  return (
    <main className="page-shell shell">
      <header className="page-hero">
        <p className="eyebrow">Project 42 Field Guide</p>
        <h1>Answers for the work in front of you.</h1>
        <p>
          Practical references with visible sources and verification dates. Learn a
          concept, check a workflow, or compare providers without digging through a
          full course.
        </p>
      </header>
      <ContentUseNotice artifact="resource" />
      <ResourceExplorer asOf={asOf} resources={starterCatalog.resources} />
    </main>
  );
}
