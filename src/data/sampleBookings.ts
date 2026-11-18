import type { Booking } from "../state/AppState";
import { dhakaDateKey } from "../utils/time";

/**
 * Demo booking history shown on first launch so the Bookings screen isn't
 * empty. Dates are relative to today so statuses always make sense.
 */
export function seedBookings(): Booking[] {
  const now = Date.now();
  return [
    {
      id: "seed-1",
      ref: "PKX-D3MO7Q",
      parkingId: "gulshan-2",
      vehicle: "car",
      date: dhakaDateKey(2),
      start: 10 * 60,
      hours: 3,
      rate: 50,
      total: 150,
      method: "bkash",
      createdAt: now - 86400000,
    },
    {
      id: "seed-2",
      ref: "PKX-8HK2WN",
      parkingId: "bashundhara-city",
      vehicle: "car",
      date: dhakaDateKey(-4),
      start: 15 * 60,
      hours: 2,
      rate: 50,
      total: 100,
      method: "cash",
      createdAt: now - 6 * 86400000,
    },
    {
      id: "seed-3",
      ref: "PKX-R5TJ4C",
      parkingId: "dhanmondi",
      vehicle: "motorcycle",
      date: dhakaDateKey(-11),
      start: 18 * 60 + 30,
      hours: 2,
      rate: 15,
      total: 30,
      method: "nagad",
      cancelled: true,
      createdAt: now - 12 * 86400000,
    },
  ];
}
