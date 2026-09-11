import {
  formatContactPhotoCaption,
  formatContactTelegramMessage,
  type ContactNotificationContext,
} from "@/lib/telegram/format-contact-message";
import {
  readTelegramConfig,
  TelegramClient,
  type TelegramFetch,
} from "@/lib/telegram/client";

export interface NotifyContactInput {
  context: ContactNotificationContext;
  photos: File[];
  fetchImpl?: TelegramFetch;
}

export interface NotifyContactResult {
  requestId: string;
  leadDelivered: boolean;
  photosDelivered: boolean;
  configMissing: boolean;
}

export async function notifyContact({
  context,
  photos,
  fetchImpl,
}: NotifyContactInput): Promise<NotifyContactResult> {
  const { requestId } = context;
  const configResult = readTelegramConfig();

  if (!configResult.ok) {
    console.error(`[telegram][${requestId}] configuration missing`);
    return {
      requestId,
      leadDelivered: false,
      photosDelivered: false,
      configMissing: true,
    };
  }

  const client = new TelegramClient(configResult.config, fetchImpl);
  const message = formatContactTelegramMessage(context);
  const leadResponse = await client.sendMessage(message, requestId);

  if (!leadResponse.ok) {
    return {
      requestId,
      leadDelivered: false,
      photosDelivered: false,
      configMissing: false,
    };
  }

  if (photos.length === 0) {
    return {
      requestId,
      leadDelivered: true,
      photosDelivered: true,
      configMissing: false,
    };
  }

  const caption = formatContactPhotoCaption(requestId);
  const photoResponse =
    photos.length === 1
      ? await client.sendPhoto(photos[0], caption, requestId)
      : await client.sendMediaGroup(photos, caption, requestId);

  return {
    requestId,
    leadDelivered: true,
    photosDelivered: photoResponse.ok,
    configMissing: false,
  };
}
