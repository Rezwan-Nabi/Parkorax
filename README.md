# ParkoraX

Find Your Spot. Park with Ease.

Frontend-only mobile prototype for finding parking in Dhaka, built from the ParkoraX PRD with **React Native + Expo + TypeScript** (the PRD's §11 alternative stack). Android-first, Bangla and English, BDT pricing, and no backend.

> Every listing, rate, rating, opening time and availability label is **sample data**. The app labels it as such everywhere. Bookings are practice runs stored on the phone, and the payment screen collects nothing.

## Run it

```bash
npm install
npx expo install --fix   # aligns package versions with your installed Expo SDK
npx expo start           # press "a" for an Android emulator, or scan the QR with Expo Go
```

Type-check with `npm run typecheck`.

To try it in a browser as well: `npx expo install react-dom react-native-web @expo/metro-runtime`, then `npx expo start --web`.

## What's in it

| PRD | Where |
| --- | --- |
| FR-01 Onboarding, splash | `SplashScreen`, `OnboardingScreen` |
| FR-02 Demo login / signup with client-side validation, BD phone format | `AuthScreen`, `utils/format.ts` |
| FR-03 Car / Motorcycle, one shared state | `VehicleSelectScreen`, `VehicleSwitch` in `components/ui.tsx` |
| FR-04 Home: greeting, search, location, vehicle switch, map preview, suggestions | `HomeScreen`, `LocationSheet` |
| FR-05 Search by name, area, road or landmark (English or Bangla, either digit set) | `state/listings.ts` |
| FR-06 Map / list switch | `ExploreScreen`, `MapMock` (drag to pan, + / − to zoom) |
| FR-07 Filters: vehicle, sample price, distance, availability | `FilterSheet` |
| FR-08 Details: photos, address, rates, facilities, hours | `DetailsScreen`, `ParkingPhoto` |
| FR-09 Available / Limited / Full labels, marked as sample | `AvailabilityBadge` |
| FR-10 Booking: date, start time, duration, estimated total, closing-time check | `BookingScreen` |
| Mock payment, no credential fields | `PaymentScreen` |
| FR-11 Demo reference + illustrative (non-scannable) QR | `ConfirmationScreen`, `QrMock` |
| FR-12 Upcoming / past bookings, demo cancel | `BookingsScreen` |
| FR-13 Saved places with undo | `SavedScreen`, `FavoriteButton` |
| FR-14 Profile edit, default vehicle, language, settings | `ProfileScreen` |
| FR-15 FAQ, contact, report-incorrect-listing form | `HelpScreen` |
| §6 Five-tab navigation, Android back button | `navigation/Navigator.tsx`, `TabBar` |
| §10 Bangla / English, ৳, Bangla digits, Bangladesh Standard Time | `i18n/strings.ts`, `utils/format.ts`, `utils/time.ts` |
| §12 Empty, loading, error and no-results states | `EmptyState`, `Skeleton`, `MapBoundary` in `ExploreScreen` |
| §13 Local persistence (favorites, vehicle, language, bookings, profile) | `state/AppState.tsx` via AsyncStorage |

## Project layout

```
App.tsx                 launch flow: splash → onboarding → auth → vehicle → tabs
src/data/parkings.ts    the 10 Dhaka sample listings (edit rates, hours, spaces here)
src/data/sampleBookings.ts  demo booking history shown on first launch
src/i18n/strings.ts     every UI string in English and Bangla
src/state/              app state + persistence, search/filter/sort logic
src/navigation/         small tab + stack navigator (no extra dependency)
src/components/         UI kit, map mock, QR mock, sheets, cards, icons
src/screens/            one file per PRD screen
src/theme/              colours, type, spacing (white/grey, navy, green/amber/red)
```

## Notes and limits

- **Map:** `MapMock` draws a simplified, not-to-scale illustration of central Dhaka, so it needs no API key and works offline. To switch to real tiles, replace it with `react-native-maps` (needs a Google Maps key on Android) and keep the same props. Markers and data stay sample content.
- **Location privacy:** the app never asks for device location. "Use my current location" picks a sample point in Farmgate and says so.
- **Photos:** listings show labelled illustrations, because real photos need each operator's permission.
- **Navigation:** a ~100-line built-in navigator keeps dependencies minimal. Swapping to React Navigation later is straightforward: each route in `Navigator.tsx` maps to one screen.
- **Before any public launch:** verify every rate, opening hour and listing name with the operators, as the PRD requires.
