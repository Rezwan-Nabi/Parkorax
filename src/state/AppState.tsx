import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_PLACE, type Vehicle } from "../data/parkings";
import { seedBookings } from "../data/sampleBookings";
import { strings, type StringKey } from "../i18n/strings";
import { digits, type Lang } from "../utils/format";
import { dhakaTimestamp } from "../utils/time";

export type PayMethod = "bkash" | "nagad" | "card" | "cash";

export type Booking = {
  id: string;
  ref: string;
  parkingId: string;
  vehicle: Vehicle;
  /** Dhaka date, YYYY-MM-DD. */
  date: string;
  /** Minutes after midnight, Dhaka time. */
  start: number;
  hours: number;
  rate: number;
  total: number;
  method: PayMethod;
  cancelled?: boolean;
  createdAt: number;
};

export type BookingStatus = "upcoming" | "completed" | "cancelled";

export function bookingStatus(b: Booking, now = Date.now()): BookingStatus {
  if (b.cancelled) return "cancelled";
  const end = dhakaTimestamp(b.date, b.start + b.hours * 60);
  return end < now ? "completed" : "upcoming";
}

export type User = { name: string; phone: string; email: string };

export type Report = { parkingId: string; issue: string; text: string; at: number };

type Persisted = {
  onboarded: boolean;
  user: User | null;
  guest: boolean;
  lang: Lang;
  vehicle: Vehicle | null;
  placeId: string;
  favorites: string[];
  bookings: Booking[];
  reminders: boolean;
  reports: Report[];
};

const STORAGE_KEY = "parkorax:v1";

const initial = (): Persisted => ({
  onboarded: false,
  user: null,
  guest: false,
  lang: "en",
  vehicle: null,
  placeId: DEFAULT_PLACE,
  favorites: ["bashundhara-city"],
  bookings: seedBookings(),
  reminders: true,
  reports: [],
});

type AppState = Persisted & {
  hydrated: boolean;
  set: <K extends keyof Persisted>(key: K, value: Persisted[K]) => void;
  toggleFavorite: (id: string) => boolean;
  addBooking: (b: Booking) => void;
  cancelBooking: (id: string) => void;
  addReport: (r: Report) => void;
  logOut: () => void;
  resetDemo: () => void;
  t: (key: StringKey, params?: Record<string, string | number>) => string;
  n: (value: string | number) => string;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Persisted>(initial);
  const [hydrated, setHydrated] = useState(false);
  const loaded = useRef(false);

  // Load saved state once. Corrupt or missing storage falls back to defaults.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setData({ ...initial(), ...(JSON.parse(raw) as Partial<Persisted>) });
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setHydrated(true);
      });
  }, []);

  // Persist on every change after the first load.
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  const set = useCallback(<K extends keyof Persisted>(key: K, value: Persisted[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  }, []);

  const favRef = useRef(data.favorites);
  favRef.current = data.favorites;

  const toggleFavorite = useCallback((id: string) => {
    const nowSaved = !favRef.current.includes(id);
    setData((d) => ({
      ...d,
      favorites: d.favorites.includes(id) ? d.favorites.filter((f) => f !== id) : [id, ...d.favorites],
    }));
    return nowSaved;
  }, []);

  const addBooking = useCallback((b: Booking) => setData((d) => ({ ...d, bookings: [b, ...d.bookings] })), []);

  const cancelBooking = useCallback(
    (id: string) =>
      setData((d) => ({
        ...d,
        bookings: d.bookings.map((b) => (b.id === id ? { ...b, cancelled: true } : b)),
      })),
    [],
  );

  const addReport = useCallback((r: Report) => setData((d) => ({ ...d, reports: [r, ...d.reports] })), []);

  const logOut = useCallback(() => setData((d) => ({ ...d, user: null, guest: false })), []);

  const resetDemo = useCallback(
    () => setData((d) => ({ ...initial(), onboarded: true, lang: d.lang, vehicle: d.vehicle, guest: true })),
    [],
  );

  const lang = data.lang;
  const n = useCallback((v: string | number) => digits(v, lang), [lang]);
  const t = useCallback(
    (key: StringKey, params?: Record<string, string | number>) => {
      let s = strings[lang][key] ?? strings.en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          s = s.replace(`{${k}}`, typeof v === "number" ? digits(v, lang) : v);
        }
      }
      return s;
    },
    [lang],
  );

  const value = useMemo<AppState>(
    () => ({ ...data, hydrated, set, toggleFavorite, addBooking, cancelBooking, addReport, logOut, resetDemo, t, n }),
    [data, hydrated, set, toggleFavorite, addBooking, cancelBooking, addReport, logOut, resetDemo, t, n],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppStateProvider");
  return v;
}

/** The vehicle every screen should use. Defaults to car before one is chosen. */
export function useVehicle(): Vehicle {
  return useApp().vehicle ?? "car";
}
