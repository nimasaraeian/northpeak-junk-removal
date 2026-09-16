export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function phoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

export function formatPhoneHref(phone: string) {
  const digits = phoneDigits(phone);
  return digits ? `tel:+${digits.replace(/^\+?/, "")}` : "tel:";
}

export function whatsAppHref(phone: string, message?: string) {
  const digits = phoneDigits(phone);
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return digits ? `https://wa.me/${digits}${query}` : "https://wa.me/";
}

export function telegramHref(phone: string) {
  const digits = phoneDigits(phone);
  return digits ? `https://t.me/+${digits}` : "https://t.me/";
}
