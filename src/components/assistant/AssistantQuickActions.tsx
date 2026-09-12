"use client";

import { cx } from "@/lib/utils";

const quickActions = [
  { label: "What do you remove?", prompt: "What do you remove?" },
  { label: "Do you serve my area?", prompt: "Do you serve my area?" },
  { label: "How does pricing work?", prompt: "How does pricing work?" },
  { label: "Get an estimate", prompt: "I want to get an estimate." },
] as const;

export function AssistantQuickActions({
  disabled,
  onSelect,
}: {
  disabled?: boolean;
  onSelect: (prompt: string) => void;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {quickActions.map((action) => (
        <li key={action.label}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(action.prompt)}
            className={cx(
              "rounded-full border border-[#888887]/30 bg-[#EDEBE8]/70 px-3 py-2 text-xs font-semibold text-[#1A3041] transition",
              "hover:border-[#D6762B]/45 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {action.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
