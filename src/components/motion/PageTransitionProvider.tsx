"use client";

import "./motion.css";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { RouteTransitionOverlay } from "@/components/motion/RouteTransitionOverlay";
import { isEligibleTransitionHref } from "@/lib/motion/navigation";
import { MOTION_MS } from "@/lib/motion/tokens";

export type TransitionPhase = "idle" | "leaving" | "doorway" | "entering";

interface PageTransitionContextValue {
  phase: TransitionPhase;
  navigate: (href: string) => void;
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<TransitionPhase>("idle");

  const firstLoadRef = useRef(true);
  const pendingNavigationRef = useRef(false);
  const busyRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const pathnameRef = useRef(pathname);
  const doorwayStartedAtRef = useRef(0);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }
    timersRef.current = [];
    document.body.style.overflow = "";
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const finishTransition = useCallback(() => {
    clearTimers();
    busyRef.current = false;
    pendingNavigationRef.current = false;
    setPhase("idle");
  }, [clearTimers]);

  const runEnterPhase = useCallback(() => {
    if (prefersReducedMotion()) {
      schedule(finishTransition, 120);
      return;
    }

    setPhase("entering");
    schedule(finishTransition, MOTION_MS.enter);
  }, [finishTransition, schedule]);

  const navigate = useCallback(
    async (href: string) => {
      if (busyRef.current) return;
      if (!isEligibleTransitionHref(href, pathnameRef.current)) {
        router.push(href as never);
        return;
      }

      busyRef.current = true;
      pendingNavigationRef.current = true;
      document.body.style.overflow = "hidden";

      schedule(() => {
        if (!pendingNavigationRef.current) return;
        pendingNavigationRef.current = false;
        finishTransition();
      }, MOTION_MS.pageMax);

      if (prefersReducedMotion()) {
        setPhase("leaving");
        doorwayStartedAtRef.current = Date.now();
        router.push(href as never);
        return;
      }

      setPhase("leaving");
      await wait(MOTION_MS.leave);
      setPhase("doorway");
      doorwayStartedAtRef.current = Date.now();
      router.push(href as never);
    },
    [finishTransition, router, schedule],
  );

  useEffect(() => {
    pathnameRef.current = pathname;

    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }

    if (pendingNavigationRef.current) {
      pendingNavigationRef.current = false;
      const elapsed = Date.now() - doorwayStartedAtRef.current;
      const remainingDoorway = prefersReducedMotion()
        ? 0
        : Math.max(0, MOTION_MS.doorway - elapsed);

      clearTimers();
      schedule(runEnterPhase, remainingDoorway);
      return;
    }

    if (!busyRef.current) {
      document.body.style.overflow = "hidden";
      busyRef.current = true;
      setPhase("entering");
      schedule(finishTransition, prefersReducedMotion() ? 120 : MOTION_MS.enter);
    }
  }, [pathname, clearTimers, finishTransition, runEnterPhase, schedule]);

  useEffect(
    () => () => {
      clearTimers();
      document.body.style.overflow = "";
    },
    [clearTimers],
  );

  return (
    <PageTransitionContext.Provider value={{ phase, navigate }}>
      {children}
      <RouteTransitionOverlay phase={phase} />
    </PageTransitionContext.Provider>
  );
}

export function PageTransitionContent({ children }: { children: ReactNode }) {
  const { phase } = usePageTransition();

  return (
    <div
      data-phase={phase}
      className="page-transition-content flex min-h-0 flex-1 flex-col min-w-0"
    >
      {children}
    </div>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error("usePageTransition must be used within PageTransitionProvider");
  }
  return context;
}
