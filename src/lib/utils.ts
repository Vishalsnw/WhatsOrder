/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generates a slug from a given string
 */
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, '')     // trim starting/ending dashes
    .substring(0, 50);           // limit length for safety
}

/**
 * Validates a 10-digit Indian phone number or +91 format
 */
export function isValidPhone(phone: string): boolean {
  return /^(\+91)?[6-9]\d{9}$/.test(phone.trim());
}

/**
 * Encodes text for WhatsApp message
 */
export function createWhatsAppMessageLink(phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  const cleanedPhone = phone.replace(/[^+\d]/g, ''); // remove non-digits except +
  return `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
}

/**
 * Trims object values and removes empty entries
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
 * Wait for given milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
