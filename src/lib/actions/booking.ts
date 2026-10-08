"use server";

import { submitBookingCore, type BookingActionState } from "@/lib/booking/submit-core";

export type { BookingActionState };

/**
 * Public online-booking Server Action.
 *
 * Mirrors `submitEstimate`: a thin `"use server"` entry over the testable
 * core. No operator session — this is a customer-facing door, like the
 * estimate form — and every write it triggers is validated and re-priced
 * server-side inside the core before anything touches the database.
 */
export async function submitBooking(
  _prev: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  return submitBookingCore(formData);
}
