"use client";

import {
  createEmptyProgress,
  recordAssessmentAttempt,
  starterCatalog,
  type AssessmentResult,
  type LearnerProgress,
} from "@project42/platform";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const storageKey = "project42.progress.v1";
type StorageStatus = "ready" | "unavailable" | "write-error";

interface ProgressContextValue {
  progress: LearnerProgress;
  hydrated: boolean;
  storageStatus: StorageStatus;
  recordResult: (pathId: string, moduleId: string, result: AssessmentResult) => void;
  replaceProgress: (progress: LearnerProgress) => void;
  rename: (displayName: string) => void;
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function safeReadProgress(): {
  progress: LearnerProgress;
  storageStatus: StorageStatus;
} {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return { progress: createEmptyProgress(), storageStatus: "ready" };
    const parsed = JSON.parse(raw) as Partial<LearnerProgress>;
    if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.attempts)) {
      return { progress: createEmptyProgress(), storageStatus: "unavailable" };
    }
    return { progress: parsed as LearnerProgress, storageStatus: "ready" };
  } catch {
    return { progress: createEmptyProgress(), storageStatus: "unavailable" };
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<LearnerProgress>(() => createEmptyProgress());
  const [hydrated, setHydrated] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>("ready");

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const stored = safeReadProgress();
      setProgress(stored.progress);
      setStorageStatus(stored.storageStatus);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let nextStatus: StorageStatus = "ready";
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      nextStatus = "write-error";
    }
    const statusTimer = window.setTimeout(() => setStorageStatus(nextStatus), 0);
    return () => window.clearTimeout(statusTimer);
  }, [hydrated, progress]);

  const recordResult = useCallback(
    (pathId: string, moduleId: string, result: AssessmentResult) => {
      const completedAt = new Date().toISOString();
      const attemptId =
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${moduleId}-${Date.now()}`;
      setProgress((current) =>
        recordAssessmentAttempt(current, starterCatalog, {
          attemptId,
          pathId,
          moduleId,
          completedAt,
          result,
        }),
      );
    },
    [],
  );

  const rename = useCallback((displayName: string) => {
    setProgress((current) => ({
      ...current,
      displayName: displayName.trim() || "Explorer",
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const replaceProgress = useCallback((replacement: LearnerProgress) => {
    setProgress(structuredClone(replacement));
  }, []);

  const reset = useCallback(() => {
    setProgress(createEmptyProgress());
  }, []);

  const value = useMemo(
    () => ({
      progress,
      hydrated,
      storageStatus,
      recordResult,
      replaceProgress,
      rename,
      reset,
    }),
    [
      progress,
      hydrated,
      storageStatus,
      recordResult,
      replaceProgress,
      rename,
      reset,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used inside ProgressProvider");
  return context;
}
