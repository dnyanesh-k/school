/**
 * Build a WhatsApp click-to-chat link using the parent's phone number.
 * Format: https://wa.me/919876543210?text=...
 */

export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.slice(1)}`;
  }

  if (digits.length > 10) {
    return `91${digits.slice(-10)}`;
  }

  return digits;
}

export function buildWaMeUrl(phone: string, message?: string): string {
  const normalized = normalizePhoneForWhatsApp(phone);
  const base = `https://wa.me/${normalized}`;

  if (!message) {
    return base;
  }

  return `${base}?text=${encodeURIComponent(message)}`;
}
