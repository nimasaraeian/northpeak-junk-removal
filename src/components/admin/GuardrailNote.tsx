/**
 * A small, repeated reminder of the rules the panel keeps around AI actions.
 * Shown wherever the assistant drafts something, so the human-in-the-loop
 * promise is visible at the point it matters, not buried in a settings page.
 */
export function GuardrailNote({ lines }: { lines: string[] }) {
  return (
    <div
      className="rounded-lg border border-[var(--ops-border)] bg-[var(--ops-surface-2)] p-3 text-xs leading-5 text-[var(--ops-muted)]"
      role="note"
    >
      <p className="mb-1 font-semibold text-[var(--ops-navy)]">How the assistant behaves</p>
      <ul className="grid gap-1">
        {lines.map((line) => (
          <li key={line} className="flex gap-2">
            <span aria-hidden className="text-[var(--ops-gold-ink)]">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
