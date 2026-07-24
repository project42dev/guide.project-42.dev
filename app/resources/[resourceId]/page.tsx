import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getResource, starterCatalog } from "@project42/platform";
import { LessonSections } from "../../components/LessonSections";
import { ProviderPills } from "../../components/ProviderPills";

interface ResourcePageProps {
  params: Promise<{ resourceId: string }>;
}

export function generateStaticParams() {
  return starterCatalog.resources.map((resource) => ({ resourceId: resource.id }));
}

export async function generateMetadata({ params }: ResourcePageProps): Promise<Metadata> {
  const { resourceId } = await params;
  const resource = getResource(resourceId);
  return resource
    ? { title: resource.title, description: resource.summary }
    : { title: "Resource not found" };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { resourceId } = await params;
  const resource = getResource(resourceId);
  if (!resource) notFound();

  return (
    <main className="resource-detail shell">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/resources">Field guide</Link>
        <span>/</span>
        <span aria-current="page">{resource.title}</span>
      </nav>
      <header className="resource-detail-hero">
        <div>
          <p className="eyebrow">{resource.category}</p>
          <h1>{resource.title}</h1>
          <p>{resource.summary}</p>
          <ProviderPills providers={resource.providers} />
        </div>
        <div className="verification-card">
          <span>Last verified</span>
          <strong>{resource.lastVerified}</strong>
          <small>Content version {starterCatalog.contentVersion}</small>
        </div>
      </header>
      <div className="resource-body">
        <LessonSections sections={resource.sections} />
        <aside className="source-panel">
          <p className="eyebrow">Primary sources</p>
          {resource.sources.map((source) => (
            <a href={source.url} key={source.url} rel="noreferrer" target="_blank">
              <strong>{source.title}</strong>
              <span>{source.publisher} ↗</span>
            </a>
          ))}
        </aside>
      </div>
    </main>
  );
}
