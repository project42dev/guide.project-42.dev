"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HeaderMenu } from "./HeaderMenu";

const LEARN = "https://learn.project-42.dev";
const API_ORIGIN = process.env.NEXT_PUBLIC_PROJECT42_API_ORIGIN || "https://api.project-42.dev";

interface UserAccount {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  roles: string[];
}

function ProfileIcon() {
  return (
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
  );
}

function initialsFor(name: string): string {
  const words = name
    .replace(/@.*$/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);
  if (words.length === 0) return "";
  return words.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const authCacheKey = "project42.auth-cache.v1";

function readCachedAccount(): UserAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(authCacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.account && parsed.account.id) {
      if (Date.now() - (parsed.savedAt || 0) < 7 * 86400 * 1000) {
        return parsed.account;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function writeCachedAccount(account: UserAccount | null) {
  if (typeof window === "undefined") return;
  try {
    if (account) {
      localStorage.setItem(
        authCacheKey,
        JSON.stringify({ account, savedAt: Date.now() }),
      );
    } else {
      localStorage.removeItem(authCacheKey);
    }
  } catch {
    // Best-effort
  }
}

export function ProfileMenu() {
  const [account, setAccount] = useState<UserAccount | null>(() => readCachedAccount());

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const res = await fetch(`${API_ORIGIN}/v1/auth/session`, {
          credentials: "include",
          headers: { "content-type": "application/json" },
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.account) {
            setAccount(data.account);
            writeCachedAccount(data.account);
          }
        } else if (res.status === 401) {
          if (!cancelled) {
            setAccount(null);
            writeCachedAccount(null);
          }
        }
      } catch {
        // Fallback: keep cached state if offline
      }
    }
    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignIn = () => {
    const returnTo = typeof window !== "undefined" ? window.location.href : "https://guide.project-42.dev";
    window.location.replace(`${API_ORIGIN}/v1/auth/start?return_to=${encodeURIComponent(returnTo)}`);
  };

  const handleSignOut = async () => {
    try {
      writeCachedAccount(null);
      const returnTo = typeof window !== "undefined" ? window.location.href : "https://guide.project-42.dev";
      await fetch(`${API_ORIGIN}/v1/auth/signout?return_to=${encodeURIComponent(returnTo)}`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setAccount(null);
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  };

  const signedIn = Boolean(account);
  const displayName = account?.displayName || account?.primaryEmail || "Learner";
  const initials = initialsFor(displayName);

  return (
    <HeaderMenu
      accessibleLabel={signedIn && account ? `Your account, ${displayName}` : "Your account"}
      align="end"
      label={
        signedIn && initials ? (
          <span style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #38bdf8, #818cf8)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "12px",
            color: "#070b12"
          }}>
            {initials}
          </span>
        ) : (
          <ProfileIcon />
        )
      }
      triggerClassName="profile-trigger"
    >
      <ul className="header-menu-list">
        {signedIn ? (
          <>
            <li style={{ padding: "8px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "12.5px" }}>
              <strong style={{ display: "block", color: "#ffffff" }}>{displayName}</strong>
              {account?.primaryEmail && (
                <span style={{ color: "#94a3b8", fontSize: "11.5px" }}>{account.primaryEmail}</span>
              )}
            </li>
            <li>
              <a href={`${LEARN}/profile`}>My progress &amp; transcript</a>
            </li>
            <li>
              <a href={`${LEARN}/account`}>Account settings</a>
            </li>
            <li>
              <a href={`${LEARN}/learner-data`}>Learner data</a>
            </li>
            {account?.roles?.includes("owner") && (
              <li>
                <a href="https://admin.project-42.dev/admin">Admin Console</a>
              </li>
            )}
            <li style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "4px" }}>
              <button
                onClick={() => void handleSignOut()}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  font: "inherit",
                  padding: "0.5rem 1rem",
                  textAlign: "left",
                  width: "100%",
                }}
                type="button"
              >
                Sign out
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <a href={`${LEARN}/account`}>Sign in</a>
            </li>
            <li>
              <a href={`${LEARN}/profile`}>My progress</a>
            </li>
            <li>
              <a href={`${LEARN}/account`}>Account</a>
            </li>
            <li>
              <a href={`${LEARN}/learner-data`}>Learner data</a>
            </li>
          </>
        )}
      </ul>
    </HeaderMenu>
  );
}
