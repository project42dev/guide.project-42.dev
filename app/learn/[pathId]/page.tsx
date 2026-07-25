import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearningModule, getLearningPath, starterCatalog } from "@project42/platform";
import { PathModuleList } from "../../components/PathModuleList";

interface PathPageProps {
  params: Promise<{ pathId: string }>;
}

export function generateStaticParams() {
  return starterCatalog.paths.map((path) => ({ pathId: path.id }));
}

export async function generateMetadata({ params }: PathPageProps): Promise<Metadata> {
  const { pathId } = await params;
  const path = getLearningPath(pathId);
  return path
    ? { title: path.title, description: path.summary }
    : { title: "Learning path not found" };
}

export default async function PathPage({ params }: PathPageProps) {
  const { pathId } = await params;
  const path = getLearningPath(pathId);
  if (!path) notFound();
  const modules = path.moduleIds.flatMap((moduleId) => {
    const learningModule = getLearningModule(moduleId);
    return learningModule ? [learningModule] : [];
  });
  const totalMinutes = modules.reduce(
    (total, module) => total + (module?.estimatedMinutes ?? 0),
    0,
  );

  return (
    <main className="page-shell shell">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/learn">Learning paths</Link>
        <span>/</span>
        <span aria-current="page">{path.title}</span>
      </nav>
      <header className="path-hero">
        <div>
          <p className="eyebrow">Guided path · {path.level}</p>
          <h1>{path.title}</h1>
          <p>{path.summary}</p>
          <div className="path-facts">
            <span>{path.moduleIds.length} modules</span>
            <span>{totalMinutes} minutes</span>
            <span>{path.badge.name} badge</span>
          </div>
        </div>
        <div className="path-badge-preview">
          <div className="badge-medallion">42</div>
          <small>Complete the path to earn</small>
          <strong>{path.badge.name}</strong>
        </div>
      </header>

      <section className="path-objective">
        <p className="eyebrow">Who this is for</p>
        <p>{path.audience}</p>
      </section>

      <section aria-labelledby="module-list-title">
        <div className="section-heading">
          <p className="eyebrow">Your route</p>
          <h2 id="module-list-title">Modules</h2>
        </div>
        <PathModuleList pathId={path.id} modules={modules} />
      </section>
    </main>
  );
}
