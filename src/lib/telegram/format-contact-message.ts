import { escapeTelegramHtml } from "@/lib/telegram/escape-html";

export interface ContactDraft {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface ContactNotificationContext {
  draft: ContactDraft;
  requestId: string;
  submittedAt: Date;
  photoCount: number;
}

function formatSubmittedAt(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(date);
}

export function formatContactTelegramMessage(context: ContactNotificationContext): string {
  const { draft, requestId, submittedAt, photoCount } = context;

  const lines = [
    "💬 <b>NEW NORTHPEAK CONTACT MESSAGE</b>",
    "",
    `🆔 <b>Reference:</b> ${escapeTelegramHtml(requestId)}`,
    `🕒 <b>Submitted:</b> ${escapeTelegramHtml(formatSubmittedAt(submittedAt))}`,
    "",
    "👤 <b>Name</b>",
    escapeTelegramHtml(draft.name),
    "",
    "📧 <b>Email</b>",
    escapeTelegramHtml(draft.email),
  ];

  if (draft.phone.trim()) {
    lines.push("", "📞 <b>Phone</b>", escapeTelegramHtml(draft.phone));
  }

  lines.push("", "📝 <b>Message</b>", escapeTelegramHtml(draft.message));

  lines.push(
    "",
    "📸 <b>Photos</b>",
    photoCount > 0 ? `${photoCount} attached` : "None attached",
  );

  return lines.join("\n");
}

export function formatContactPhotoCaption(
  requestId: string,
  index = 1,
  total = 1,
): string {
  const count =
    total > 1
      ? `${index}/${total} · `
      : "";
  return `📸 Contact photo ${count}${escapeTelegramHtml(requestId)}`;
}
