"use client";

import {
  buildPortableLearnerRecord,
  buildTranscript,
  buildTranscriptCsv,
  serializePortableLearnerRecord,
  starterCatalog,
} from "@project42/platform";
import Link from "next/link";
import { useMemo } from "react";
import { useProgress } from "./ProgressProvider";

export function ProfileDashboard() {
  const { progress, hydrated, rename, reset } = useProgress();
  const transcript = useMemo(
    () => buildTranscript(starterCatalog, progress),
    [progress],
  );
  const exportDate = new Date().toISOString().slice(0, 10);

  const downloadRecord = () => {
    const record = buildPortableLearnerRecord(starterCatalog, progress);
    downloadTextFile(
      `project-42-learning-record-${exportDate}.json`,
      serializePortableLearnerRecord(record),
      "application/json",
    );
  };

  const downloadTranscript = () => {
    downloadTextFile(
      `project-42-transcript-${exportDate}.csv`,
      buildTranscriptCsv(starterCatalog, progress),
      "text/csv",
    );
  };

  if (!hydrated) {
    return <div className="profile-loading">Loading your device-local record…</div>;
  }

  return (
    <div className="profile-dashboard">
      <section className="profile-card profile-identity">
        <p className="eyebrow">Learner profile</p>
        <h2>{progress.displayName}</h2>
        <p>
          This MVP stores your record in this browser. Account-based, cross-device
          progress is planned for a later release.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            rename(String(form.get("displayName") ?? ""));
          }}
        >
          <label htmlFor="display-name">Display name</label>
          <div className="name-row">
            <input
              defaultValue={progress.displayName}
              id="display-name"
              key={progress.displayName}
              name="displayName"
            />
            <button className="button button-secondary" type="submit">
              Save
            </button>
          </div>
        </form>
      </section>

      <section className="profile-stats" aria-label="Learning statistics">
        <div>
          <span>{progress.completedModuleIds.length}</span>
          <small>Modules completed</small>
        </div>
        <div>
          <span>{progress.attempts.length}</span>
          <small>Knowledge checks</small>
        </div>
        <div>
          <span>{progress.badges.length}</span>
          <small>Badges earned</small>
        </div>
      </section>

      <section className="transcript-section">
        <div className="section-heading section-heading-inline">
          <div>
            <p className="eyebrow">Transcript</p>
            <h2>Your paths</h2>
          </div>
          <Link className="text-link" href="/learn">
            Continue learning
          </Link>
        </div>
        <div className="transcript-list">
          {transcript.map((entry) => (
            <article key={entry.pathId}>
              <div>
                <h3>{entry.pathTitle}</h3>
                <p>
                  {entry.completedModules} of {entry.totalModules} modules
                  {entry.bestScorePercent === null
                    ? ""
                    : ` · Best check ${entry.bestScorePercent}%`}
                </p>
              </div>
              <div
                aria-label={`${entry.pathTitle} completion`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={entry.completionPercent}
                className="transcript-progress"
                role="progressbar"
              >
                <span style={{ width: `${entry.completionPercent}%` }} />
              </div>
              <strong>{entry.completionPercent}%</strong>
            </article>
          ))}
        </div>
        <div className="profile-export" aria-labelledby="export-heading">
          <div>
            <h3 id="export-heading">Take your record with you</h3>
            <p>
              Download a complete portable record or a spreadsheet-friendly transcript.
              Files are created locally in this browser.
            </p>
          </div>
          <div className="button-row">
            <button className="button button-secondary" onClick={downloadRecord} type="button">
              Download JSON record
            </button>
            <button
              className="button button-secondary"
              onClick={downloadTranscript}
              type="button"
            >
              Download CSV transcript
            </button>
          </div>
        </div>
      </section>

      <section className="badge-section">
        <div className="section-heading">
          <p className="eyebrow">Badges</p>
          <h2>Evidence of the work</h2>
        </div>
        {progress.badges.length ? (
          <div className="badge-grid">
            {progress.badges.map((badge) => (
              <article key={badge.id}>
                <div className="badge-medallion">42</div>
                <h3>{badge.name}</h3>
                <p>{badge.description}</p>
                <small>Earned {new Date(badge.earnedAt).toLocaleDateString()}</small>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Your first badge is waiting.</h3>
            <p>Pass every knowledge check in a path to earn its mastery badge.</p>
            <Link className="button button-primary" href="/learn/ai-foundations">
              Start AI Foundations
            </Link>
          </div>
        )}
      </section>

      {progress.attempts.length ? (
        <details className="reset-panel">
          <summary>Manage local learning data</summary>
          <p>Resetting removes progress, scores, and badges from this browser.</p>
          <button
            className="button button-danger"
            onClick={() => {
              if (window.confirm("Reset all Project 42 progress on this device?")) reset();
            }}
            type="button"
          >
            Reset local record
          </button>
        </details>
      ) : null}
    </div>
  );
}

function downloadTextFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
