import {
  formatBookingTelegramMessage,
  type BookingNotificationContext,
} from "@/lib/telegram/format-booking-message";
import {
  readTelegramConfig,
  TelegramClient,
  type TelegramFetch,
} from "@/lib/telegram/client";

export interface NotifyBookingInput {
  context: BookingNotificationContext;
  fetchImpl?: TelegramFetch;
}

export interface NotifyBookingResult {
  reference: string;
  delivered: boolean;
  configMissing: boolean;
}

/**
 * Best-effort Telegram ping for a new online booking.
 *
 * Unlike the estimate flow — where Telegram is the primary store and a failure
 * fails the submission — a booking is already saved in the CRM before this
 * runs. So this only reports whether the ping went out; the caller never lets
 * a failure here flip the booking result to an error.
 */
export async function notifyBooking({
  context,
  fetchImpl,
}: NotifyBookingInput): Promise<NotifyBookingResult> {
  const { reference } = context;
  const configResult = readTelegramConfig();

  if (!configResult.ok) {
    console.error(`[telegram][${reference}] booking notification config missing`);
    return { reference, delivered: false, configMissing: true };
  }

  const client = new TelegramClient(configResult.config, fetchImpl);
  const message = formatBookingTelegramMessage(context);
  const response = await client.sendMessage(message, reference);

  return { reference, delivered: response.ok, configMissing: false };
}
