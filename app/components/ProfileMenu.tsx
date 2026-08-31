"use client";

export function ProfileMenu() {
  return (
    <a
      aria-label="Open your Project 42 profile"
      className="profile-trigger"
      href="https://project-42.dev/profile"
    >
      <svg aria-hidden="true" className="profile-icon" focusable="false" viewBox="0 0 24 24">
        <circle cx="12" cy="8.2" fill="currentColor" r="3.6" />
        <path
          d="M4.6 20.2c0-3.9 3.3-6.6 7.4-6.6s7.4 2.7 7.4 6.6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2.1"
        />
      </svg>
    </a>
  );
}
