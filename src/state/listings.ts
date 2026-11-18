import { useMemo } from "react";
import { availabilityOf, parkings, places, type Parking, type Vehicle } from "../data/parkings";
import { distanceKm } from "../utils/geo";
import { useApp } from "./AppState";

export type Sort = "nearest" | "price" | "rating";
export type AvailFilter = "all" | "available" | "hideFull";

export type Filters = {
  /** Max sample hourly rate, or null for any. */
  maxPrice: number | null;
  /** Max distance in km, or null for any. */
  maxKm: number | null;
  avail: AvailFilter;
};

export const DEFAULT_FILTERS: Filters = { maxPrice: null, maxKm: null, avail: "all" };

/** Price steps shown in the filter sheet, per vehicle (matches the sample rates). */
export const PRICE_STEPS: Record<Vehicle, number[]> = { car: [40, 50, 60], motorcycle: [15, 20, 25] };
export const KM_STEPS = [2, 5, 10];

export type Listing = Parking & { km: number };

export function activeFilterCount(f: Filters): number {
  return (f.maxPrice != null ? 1 : 0) + (f.maxKm != null ? 1 : 0) + (f.avail !== "all" ? 1 : 0);
}

/** Lower-case, and fold Bangla/English digits so "মিরপুর ১০" matches "mirpur 10". */
function norm(s: string): string {
  return s.toLowerCase().replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).trim();
}

export function matchesQuery(p: Parking, query: string): boolean {
  const q = norm(query);
  if (!q) return true;
  const hay = norm(
    [p.name.en, p.name.bn, p.area.en, p.area.bn, p.landmark.en, p.landmark.bn, "dhaka", "ঢাকা"].join(" | "),
  );
  return q.split(/\s+/).every((word) => hay.includes(word));
}

/** Search, filter and sort the local sample dataset. Pure, so it can preview counts. */
export function filterListings(v: Vehicle, placeId: string, query: string, filters: Filters, sort: Sort): Listing[] {
  const origin = places.find((p) => p.id === placeId) ?? places[0];
  const list = parkings
    .filter((p) => p.vehicles[v])
    .filter((p) => matchesQuery(p, query))
    .map((p) => ({ ...p, km: distanceKm(origin.lat, origin.lng, p.lat, p.lng) }))
    .filter((p) => filters.maxPrice == null || p.vehicles[v]!.rate <= filters.maxPrice)
    .filter((p) => filters.maxKm == null || p.km <= filters.maxKm)
    .filter((p) => {
      const a = availabilityOf(p.vehicles[v]);
      if (filters.avail === "available") return a === "available";
      if (filters.avail === "hideFull") return a !== "full";
      return true;
    });
  const by: Record<Sort, (a: Listing, b: Listing) => number> = {
    nearest: (a, b) => a.km - b.km,
    price: (a, b) => a.vehicles[v]!.rate - b.vehicles[v]!.rate || a.km - b.km,
    rating: (a, b) => b.rating - a.rating,
  };
  return list.sort(by[sort]);
}

/**
 * Listings for the shared vehicle and selected location. Places that don't
 * take the selected vehicle are left out.
 */
export function useListings(query: string, filters: Filters, sort: Sort): Listing[] {
  const { vehicle, placeId } = useApp();
  const v: Vehicle = vehicle ?? "car";
  return useMemo(() => filterListings(v, placeId, query, filters, sort), [v, placeId, query, filters, sort]);
}

export function useCurrentPlace() {
  const { placeId } = useApp();
  return places.find((p) => p.id === placeId) ?? places[0];
}
