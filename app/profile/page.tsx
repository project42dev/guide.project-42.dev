import type { Metadata } from "next";
import { ProfileDashboard } from "../components/ProfileDashboard";

export const metadata: Metadata = {
  title: "My progress",
  description: "Your Project 42 learning progress, scores, badges, and transcript.",
};

export default function ProfilePage() {
  return (
    <main className="page-shell shell">
      <header className="page-hero profile-hero">
        <p className="eyebrow">My progress</p>
        <h1>Your work, made visible.</h1>
        <p>
          Track completed modules, knowledge-check scores, and badges. This first
          release keeps the record privately in your browser.
        </p>
      </header>
      <ProfileDashboard />
    </main>
  );
}
