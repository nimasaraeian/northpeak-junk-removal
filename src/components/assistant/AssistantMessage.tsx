import Link from "next/link";
import type { Route } from "next";
import { resolveAssistantActions } from "@/lib/assistant/navigation";
import type { AssistantActionKey, AssistantRole } from "@/lib/assistant/types";
import { cx } from "@/lib/utils";

export function AssistantMessage({
  role,
  content,
  actions = [],
}: {
  role: AssistantRole;
  content: string;
  actions?: AssistantActionKey[];
}) {
  const resolvedActions = resolveAssistantActions(actions);

  return (
    <div className={cx("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cx(
          "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6",
          role === "user"
            ? "bg-[#1A3041] text-[#EDEBE8]"
            : "border border-[#888887]/25 bg-white text-[#1A3041]",
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {role === "assistant" && resolvedActions.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {resolvedActions.map((action) => (
              <li key={action.key}>
                <Link
                  href={action.href as Route}
                  className="inline-flex min-h-9 items-center rounded-full border border-[#D6762B]/35 bg-[#D6762B]/10 px-3.5 text-xs font-semibold text-[#1A3041] transition hover:border-[#D6762B]/60 hover:bg-[#D6762B]/16"
                >
                  {action.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
