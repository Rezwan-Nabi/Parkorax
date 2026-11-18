export type Lang = "en" | "bn";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Swaps ASCII digits for Bangla digits when the UI is in Bangla. */
export function digits(input: string | number, lang: Lang): string {
  const s = String(input);
  return lang === "bn" ? s.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]) : s;
}

/** Bangladeshi Taka, whole amounts: ৳1,250 / ৳১,২৫০ */
export function bdt(amount: number, lang: Lang): string {
  const grouped = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return "৳" + digits(grouped, lang);
}

export function km(value: number, lang: Lang): string {
  const v = value < 10 ? value.toFixed(1) : Math.round(value).toString();
  return digits(v, lang) + (lang === "bn" ? " কিমি" : " km");
}

export function rating(value: number, lang: Lang): string {
  return digits(value.toFixed(1), lang);
}

// ---------- Bangladesh phone numbers ----------

/** Reduces "+880 1712-345678", "8801712345678" or "01712 345678" to "01712345678". */
export function normalizeBdPhone(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("880")) d = "0" + d.slice(3);
  return d;
}

/** Valid Bangladesh mobile number: 01 + operator digit 3–9 + 8 digits. */
export function isBdMobile(input: string): boolean {
  return /^01[3-9]\d{8}$/.test(normalizeBdPhone(input));
}

/** Display format: +880 1712-345678 */
export function formatBdPhone(input: string, lang: Lang = "en"): string {
  const d = normalizeBdPhone(input);
  if (d.length !== 11) return digits(input, lang);
  return digits(`+880 ${d.slice(1, 5)}-${d.slice(5)}`, lang);
}

export function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.trim());
}

/** Demo booking reference, e.g. PKX-7K3Q9D. Avoids look-alike characters. */
export function bookingRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "PKX-" + s;
}
