"use server";

import {
  submitContactCore,
  type ContactActionState,
} from "@/lib/contact/submit-core";

export type { ContactActionState };

export async function submitContact(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  try {
    return await submitContactCore(formData);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown error";
    console.error("[contact] server action failed:", reason);
    return {
      ok: false,
      message:
        "We couldn't send your message just now. Your information is still here — please try again.",
    };
  }
}
