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

export function whatsAppHref(phone: string) {
  const digits = phoneDigits(phone);
  return digits ? `https://wa.me/${digits}` : "https://wa.me/";
}

export function telegramHref(phone: string) {
  const digits = phoneDigits(phone);
  return digits ? `https://t.me/+${digits}` : "https://t.me/";
}
