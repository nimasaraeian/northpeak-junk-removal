"use client";

import { useEffect } from "react";

/** New Cap-style slide-over. Renders a scrim + panel; `open` drives both. */
export function Drawer({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`scrim${open ? " on" : ""}`} onClick={onClose} aria-hidden />
      <aside className={`drawer${open ? " on" : ""}`} role="dialog" aria-modal="true" aria-hidden={!open}>
        <header>
          <h3>{title}</h3>
          <button className="x" onClick={onClose} aria-label="close">
            ×
          </button>
        </header>
        <div className="body">{open ? children : null}</div>
        {footer ? <footer>{footer}</footer> : null}
      </aside>
    </>
  );
}
