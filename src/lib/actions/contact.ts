"use server";

export interface ContactActionState {
  ok: boolean;
  message: string;
}

export async function submitContact(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (name.length < 2 || !email.includes("@") || message.length < 8) {
    return {
      ok: false,
      message: "Add your name, a valid email, and a short message.",
    };
  }

  // Future: write to Supabase `inquiries` or a transactional email provider.
  console.info("[contact]", { name, email, phone, message });

  return {
    ok: true,
    message: "Message received. We will reply within one business day.",
  };
}
