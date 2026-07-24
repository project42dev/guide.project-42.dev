import type { LessonSection } from "@project42/platform";

export function LessonSections({ sections }: { sections: LessonSection[] }) {
  return (
    <div className="lesson-sections">
      {sections.map((section, index) => (
        <section className="lesson-block" id={section.id} key={section.id}>
          <div className="lesson-block-index">{String(index + 1).padStart(2, "0")}</div>
          <div>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.callout ? <aside className="lesson-callout">{section.callout}</aside> : null}
            {section.code ? (
              <div className="code-example">
                <div className="code-label">
                  <span>{section.code.label}</span>
                  <span>{section.code.language}</span>
                </div>
                <pre>
                  <code>{section.code.code}</code>
                </pre>
              </div>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
