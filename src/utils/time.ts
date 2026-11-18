import { digits, type Lang } from "./format";

/**
 * All times in the app are Bangladesh Standard Time (UTC+6, no daylight
 * saving), whatever time zone the device is set to.
 */
const BST_OFFSET_MS = 6 * 60 * 60 * 1000;

/** A Date whose UTC fields read as the current wall-clock time in Dhaka. */
export function dhakaNow(): Date {
  return new Date(Date.now() + BST_OFFSET_MS);
}

/** Minutes after midnight in Dhaka right now. */
export function dhakaMinutes(): number {
  const d = dhakaNow();
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/** YYYY-MM-DD for today in Dhaka, plus an optional day offset. */
export function dhakaDateKey(offsetDays = 0): string {
  const d = new Date(dhakaNow().getTime() + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}

/** Absolute timestamp (ms) for a Dhaka date key + minutes after midnight. */
export function dhakaTimestamp(dateKey: string, minutes: number): number {
  return Date.parse(dateKey + "T00:00:00Z") - BST_OFFSET_MS + minutes * 60000;
}

const MONTHS = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  bn: ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"],
};
const WEEKDAYS = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  bn: ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"],
};

export function weekday(dateKey: string, lang: Lang): string {
  return WEEKDAYS[lang][new Date(dateKey + "T00:00:00Z").getUTCDay()];
}

export function dayOfMonth(dateKey: string, lang: Lang): string {
  return digits(new Date(dateKey + "T00:00:00Z").getUTCDate(), lang);
}

/** "Thu, 19 Nov" / "বৃহঃ, ১৯ নভে" */
export function formatDate(dateKey: string, lang: Lang): string {
  const d = new Date(dateKey + "T00:00:00Z");
  return `${weekday(dateKey, lang)}, ${digits(d.getUTCDate(), lang)} ${MONTHS[lang][d.getUTCMonth()]}`;
}

/** 570 → "9:30 AM" / "সকাল ৯:৩০" */
export function formatTime(minutes: number, lang: Lang): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  if (lang === "bn") {
    const part = h24 < 5 ? "রাত" : h24 < 12 ? "সকাল" : h24 < 16 ? "দুপুর" : h24 < 18 ? "বিকাল" : h24 < 20 ? "সন্ধ্যা" : "রাত";
    return `${part} ${digits(`${h12}:${mm}`, lang)}`;
  }
  return `${h12}:${mm} ${h24 < 12 ? "AM" : "PM"}`;
}

export function isOpenAt(opens: number, closes: number, minutes: number): boolean {
  if (opens === 0 && closes >= 1440) return true;
  return minutes >= opens && minutes < closes;
}

export function is24h(opens: number, closes: number): boolean {
  return opens === 0 && closes >= 1440;
}
