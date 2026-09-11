const HTML_ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

export function escapeTelegramHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => HTML_ESCAPE[char] ?? char);
}
