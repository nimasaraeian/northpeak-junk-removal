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
  return submitContactCore(formData);
}
