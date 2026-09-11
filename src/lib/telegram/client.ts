export const TELEGRAM_API_TIMEOUT_MS = 20_000;

export interface TelegramApiResponse {
  ok: boolean;
  description?: string;
  result?: unknown;
}

export interface TelegramClientConfig {
  token: string;
  chatId: string;
}

export type TelegramFetch = typeof fetch;

function sanitizeTelegramError(description: string | undefined): string {
  return description?.trim() || "Unknown Telegram API error";
}

export class TelegramClient {
  private readonly token: string;
  private readonly chatId: string;
  private readonly fetchImpl: TelegramFetch;

  constructor(config: TelegramClientConfig, fetchImpl: TelegramFetch = fetch) {
    this.token = config.token;
    this.chatId = config.chatId;
    this.fetchImpl = fetchImpl;
  }

  private endpoint(method: string): string {
    return `https://api.telegram.org/bot${this.token}/${method}`;
  }

  private async post(
    method: string,
    body: FormData | URLSearchParams,
    requestId: string,
  ): Promise<TelegramApiResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TELEGRAM_API_TIMEOUT_MS);

    try {
      const response = await this.fetchImpl(this.endpoint(method), {
        method: "POST",
        body,
        signal: controller.signal,
      });

      let payload: TelegramApiResponse;
      try {
        payload = (await response.json()) as TelegramApiResponse;
      } catch {
        console.error(`[telegram][${requestId}] ${method} failed: invalid JSON response`);
        return { ok: false, description: "Invalid Telegram API response" };
      }

      if (!response.ok || !payload.ok) {
        console.error(
          `[telegram][${requestId}] ${method} failed: ${sanitizeTelegramError(payload.description)}`,
        );
        return {
          ok: false,
          description: sanitizeTelegramError(payload.description),
        };
      }

      return payload;
    } catch (error) {
      const reason =
        error instanceof Error && error.name === "AbortError"
          ? "request timed out"
          : error instanceof Error
            ? error.message
            : "network error";
      console.error(`[telegram][${requestId}] ${method} failed: ${reason}`);
      return { ok: false, description: reason };
    } finally {
      clearTimeout(timeout);
    }
  }

  async sendMessage(text: string, requestId: string): Promise<TelegramApiResponse> {
    const body = new URLSearchParams({
      chat_id: this.chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: "true",
    });
    return this.post("sendMessage", body, requestId);
  }

  async sendPhoto(file: File, caption: string, requestId: string): Promise<TelegramApiResponse> {
    const body = new FormData();
    body.append("chat_id", this.chatId);
    body.append("photo", file, file.name || "photo.jpg");
    body.append("caption", caption);
    body.append("parse_mode", "HTML");
    return this.post("sendPhoto", body, requestId);
  }

  async sendMediaGroup(
    files: File[],
    caption: string,
    requestId: string,
  ): Promise<TelegramApiResponse> {
    const body = new FormData();
    body.append("chat_id", this.chatId);

    const media = files.map((_, index) => ({
      type: "photo",
      media: `attach://photo${index}`,
      ...(index === 0 ? { caption, parse_mode: "HTML" } : {}),
    }));

    body.append("media", JSON.stringify(media));
    files.forEach((file, index) => {
      body.append(`photo${index}`, file, file.name || `photo-${index + 1}.jpg`);
    });

    return this.post("sendMediaGroup", body, requestId);
  }
}

export function readTelegramConfig():
  | { ok: true; config: TelegramClientConfig }
  | { ok: false; reason: "missing_token" | "missing_chat_id" | "missing_both" } {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();

  if (!token && !chatId) return { ok: false, reason: "missing_both" };
  if (!token) return { ok: false, reason: "missing_token" };
  if (!chatId) return { ok: false, reason: "missing_chat_id" };

  return { ok: true, config: { token, chatId } };
}
