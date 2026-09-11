import {
  formatEstimateTelegramMessage,
  formatPhotoCaption,
  type EstimateNotificationContext,
} from "@/lib/telegram/format-estimate-message";
import {
  readTelegramConfig,
  TelegramClient,
  type TelegramFetch,
} from "@/lib/telegram/client";

export interface NotifyEstimateInput {
  context: EstimateNotificationContext;
  photos: File[];
  fetchImpl?: TelegramFetch;
}

export interface NotifyEstimateResult {
  requestId: string;
  leadDelivered: boolean;
  photosDelivered: boolean;
  configMissing: boolean;
}

export async function notifyEstimate({
  context,
  photos,
  fetchImpl,
}: NotifyEstimateInput): Promise<NotifyEstimateResult> {
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
  const message = formatEstimateTelegramMessage(context);
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

  const caption = formatPhotoCaption(requestId);
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
