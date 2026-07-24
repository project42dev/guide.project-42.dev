"use client";

import type { Resource } from "@project42/platform";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProviderPills } from "./ProviderPills";

export function ResourceExplorer({ resources }: { resources: Resource[] }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesText =
        !normalized ||
        [resource.title, resource.summary, resource.category, ...resource.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesLevel = level === "all" || resource.level === level;
      return matchesText && matchesLevel;
    });
  }, [level, query, resources]);

  return (
    <>
      <div className="resource-controls">
        <label>
          <span>Search the field guide</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “agents” or “prompt”"
            type="search"
            value={query}
          />
        </label>
        <label>
          <span>Level</span>
          <select onChange={(event) => setLevel(event.target.value)} value={level}>
            <option value="all">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
      </div>
      <p className="results-count" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "resource" : "resources"}
      </p>
      <div className="resource-grid">
        {filtered.map((resource) => (
          <article className="resource-card" key={resource.id}>
            <div className="resource-meta">
              <span>{resource.category}</span>
              <span>{resource.level}</span>
            </div>
            <h2>{resource.title}</h2>
            <p>{resource.summary}</p>
            <ProviderPills providers={resource.providers} />
            <div className="resource-foot">
              <small>Verified {resource.lastVerified}</small>
              <Link href={`/resources/${resource.id}`}>Open →</Link>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <h2>No exact match yet.</h2>
          <p>Try a broader word or reset the level filter.</p>
        </div>
      ) : null}
    </>
  );
}
