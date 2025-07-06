/**
 * ✅ Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * ✅ Generates a URL-safe slug from a given string (max 50 chars)
 */
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')     // Trim starting/ending hyphens
    .substring(0, 50);           // Limit length for safety
}

/**
 * ✅ Validates a 10-digit Indian phone number with or without +91
 */
export function isValidPhone(phone: string): boolean {
  return /^(\+91)?[6-9]\d{9}$/.test(phone.trim());
}

/**
 * ✅ Creates a WhatsApp message link with a prefilled message
 */
export function createWhatsAppMessageLink(phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  const cleanedPhone = phone.replace(/[^+\d]/g, ''); // Remove non-digit characters except +
  return `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
}

/**
 * ✅ Trims string values in an object and removes empty ones
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {};
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed !== '') cleaned[key] = trimmed;
    } else if (value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * ✅ Waits for given milliseconds (e.g., await wait(1000))
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
