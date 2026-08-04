import type { Metadata } from "next";
import { starterCatalog } from "@project42/platform";
import { ResourceExplorer } from "./components/ResourceExplorer";
import { ContentUseNotice } from "./components/ContentUseNotice";

export const metadata: Metadata = {
  title: "Project 42 Field Guide",
  description:
    "Search practical AI references, workflows, commands, comparisons, and decision guides.",
};

export default function FieldGuideHome() {
  const asOf = new Date().toISOString().slice(0, 10);

  return (
    <main className="page-shell shell">
      <header className="page-hero">
        <p className="eyebrow">Project 42 Field Guide</p>
        <h1>Answers for the work in front of you.</h1>
        <p>
          Practical references with visible sources and verification dates. Check a
          workflow, copy a reusable template, troubleshoot a failure, or compare
          providers without working through a full course.
        </p>
      </header>
      {/*
        This used to appear only on /resources, which was a duplicate of this
        page. The duplicate is gone and the notice moved here, to the page
        people actually land on. It is the content-use notice: shipping the
        catalog without it was the real defect behind the double hop.
      */}
      <ContentUseNotice artifact="resource" />
      <ResourceExplorer asOf={asOf} resources={starterCatalog.resources} />
    </main>
  );
}
