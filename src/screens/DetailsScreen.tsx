import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon, { type IconName } from "../components/Icon";
import ParkingPhoto from "../components/ParkingPhoto";
import { FavoriteButton } from "../components/ParkingCard";
import { AvailabilityBadge, Button, EmptyState, IconButton, Notice, Screen, VehicleSwitch } from "../components/ui";
import { availabilityOf, parkingById, type Facility } from "../data/parkings";
import { useNav } from "../navigation/Navigator";
import { useApp, useVehicle } from "../state/AppState";
import { useCurrentPlace } from "../state/listings";
import { colors, radius, space, type } from "../theme";
import { bdt, km, rating } from "../utils/format";
import { distanceKm } from "../utils/geo";
import { dhakaMinutes, formatTime, is24h, isOpenAt } from "../utils/time";
import type { StringKey } from "../i18n/strings";

const FACILITY_ICON: Record<Facility, IconName> = {
  cctv: "cctv",
  guard: "guard",
  covered: "covered",
  ev: "ev",
  restroom: "restroom",
  accessible: "accessible",
  night: "night",
  valet: "valet",
};

const PHOTOS = [0, 1, 2];

/** Facility info, vehicle-specific sample rate, availability, facilities, CTA (PRD FR-08). */
export default function DetailsScreen({ id }: { id: string }) {
  const { t, lang, n, favorites } = useApp();
  const vehicle = useVehicle();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const place = useCurrentPlace();
  const [photo, setPhoto] = useState(0);
  const [photoW, setPhotoW] = useState(0);

  const p = parkingById(id);
  if (!p) {
    return (
      <Screen>
        <EmptyState icon="alert" title={t("somethingWrong")} body={t("noResultsBody")} action={t("back")} onAction={nav.pop} />
      </Screen>
    );
  }

  const rate = p.vehicles[vehicle];
  const state = availabilityOf(rate);
  const openNow = isOpenAt(p.opens, p.closes, dhakaMinutes());
  const dist = distanceKm(place.lat, place.lng, p.lat, p.lng);
  const canBook = !!rate && state !== "full";

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (photoW > 0) setPhoto(Math.round(e.nativeEvent.contentOffset.x / photoW));
  };

  return (
    <Screen bg={colors.white} style={{ paddingTop: 0 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View onLayout={(e) => setPhotoW(e.nativeEvent.layout.width)}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={onPhotoScroll} scrollEventThrottle={32}>
            {PHOTOS.map((v) => (
              <ParkingPhoto key={v} parking={p} variant={v} style={{ width: photoW || 360, height: 240 + insets.top }} />
            ))}
          </ScrollView>
          <View style={[styles.topBar, { top: insets.top + 4 }]}>
            <IconButton icon="chevronLeft" label={t("back")} onPress={nav.pop} bg="rgba(255,255,255,0.94)" />
            <FavoriteButton id={p.id} saved={favorites.includes(p.id)} />
          </View>
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {n(photo + 1)}/{n(PHOTOS.length)}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={type.title} accessibilityRole="header">
            {p.name[lang]}
          </Text>
          <View style={styles.metaRow}>
            <Icon name="star" size={15} color="#D98A00" fill="#F2B233" />
            <Text style={styles.metaStrong}>{rating(p.rating, lang)}</Text>
            <Text style={styles.meta}>({t("reviews", { count: p.reviews })})</Text>
            <Text style={styles.meta}>·</Text>
            <Text style={styles.meta}>
              {km(dist, lang)} {t("away")}
            </Text>
          </View>

          <View style={styles.addr}>
            <Icon name="pin" size={18} color={colors.navySoft} />
            <Text style={[type.body, { flex: 1, color: colors.navySoft }]}>
              {p.area[lang]}, {p.landmark[lang]}, {t("dhaka")}
            </Text>
          </View>

          <View style={styles.availRow}>
            <AvailabilityBadge rate={rate} />
            <Text style={type.small}>
              {!rate ? t("notForVehicle", { vehicle: t(vehicle) }) : rate.free > 0 ? t("spacesFree", { count: rate.free }) : t("noSpaces")}
            </Text>
          </View>

          <VehicleSwitch style={{ marginTop: space.lg }} />

          <Text style={[type.heading, styles.h]}>{t("rates")}</Text>
          <View style={styles.rates}>
            {(["car", "motorcycle"] as const).map((v) => {
              const r = p.vehicles[v];
              const on = v === vehicle;
              return (
                <View key={v} style={[styles.rateBox, on && styles.rateOn]}>
                  <Icon name={v} size={22} color={on ? colors.greenDark : colors.navySoft} />
                  <Text style={[type.small, on && { color: colors.navy, fontWeight: "700" }]}>{t(v)}</Text>
                  {r ? (
                    <Text style={styles.rateValue}>
                      {bdt(r.rate, lang)}
                      <Text style={styles.per}>{t("perHour")}</Text>
                    </Text>
                  ) : (
                    <Text style={[type.small, { marginTop: 4 }]}>—</Text>
                  )}
                </View>
              );
            })}
          </View>

          <Text style={[type.heading, styles.h]}>{t("hours")}</Text>
          <View style={styles.hours}>
            <Icon name="clock" size={20} color={colors.navySoft} />
            <Text style={[type.body, { flex: 1 }]}>
              {is24h(p.opens, p.closes) ? t("open24") : `${formatTime(p.opens, lang)} – ${formatTime(p.closes, lang)}`}
            </Text>
            <Text style={[styles.openTag, { color: openNow ? colors.greenDark : colors.red }]}>
              {openNow ? t("openNow") : t("closedNow")}
            </Text>
          </View>

          <Text style={[type.heading, styles.h]}>{t("facilities")}</Text>
          <View style={styles.facilities}>
            {p.facilities.map((f) => (
              <View key={f} style={styles.facility}>
                <Icon name={FACILITY_ICON[f]} size={20} color={colors.navy} />
                <Text style={styles.facilityText}>{t(`fac_${f}` as StringKey)}</Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: space.xl, gap: space.md }}>
            <Notice text={t("sampleListing")} tone="warn" icon="alert" />
            <Pressable
              onPress={() => nav.push({ name: "Help", reportFor: p.id })}
              accessibilityRole="button"
              style={styles.report}
            >
              <Icon name="flag" size={18} color={colors.navySoft} />
              <Text style={styles.reportText}>{t("reportListing")}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.cta, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        {rate && (
          <View>
            <Text style={styles.ctaPrice}>
              {bdt(rate.rate, lang)}
              <Text style={styles.per}>{t("perHour")}</Text>
            </Text>
            <Text style={type.small}>
              {t(vehicle)} · {t("sample")}
            </Text>
          </View>
        )}
        <Button
          label={
            !rate
              ? t("notSupportedCta", { vehicle: t(vehicle) })
              : state === "full"
                ? t("fullCta", { vehicle: t(vehicle) })
                : t("bookNow")
          }
          disabled={!canBook}
          onPress={() => nav.push({ name: "Booking", id: p.id })}
          style={{ flex: 1 }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { position: "absolute", left: space.md, right: space.md, flexDirection: "row", justifyContent: "space-between" },
  counter: {
    position: "absolute",
    right: space.md,
    bottom: space.md,
    backgroundColor: "rgba(15,30,61,0.72)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  counterText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  body: { padding: space.xl },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6, flexWrap: "wrap" },
  metaStrong: { fontSize: 14, fontWeight: "700", color: colors.navy },
  meta: { fontSize: 14, color: colors.navySoft },
  addr: { flexDirection: "row", gap: 8, marginTop: space.md },
  availRow: { flexDirection: "row", alignItems: "center", gap: space.sm, marginTop: space.lg, flexWrap: "wrap" },
  h: { marginTop: space.xxl, marginBottom: space.md },
  rates: { flexDirection: "row", gap: space.md },
  rateBox: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    gap: 4,
  },
  rateOn: { borderColor: colors.green, borderWidth: 2, backgroundColor: "#F4FBF8" },
  rateValue: { fontSize: 22, fontWeight: "800", color: colors.navy, marginTop: 2 },
  per: { fontSize: 13, fontWeight: "500", color: colors.navySoft },
  hours: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  openTag: { fontSize: 13, fontWeight: "700" },
  facilities: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  facility: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    minHeight: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  facilityText: { fontSize: 14, fontWeight: "600", color: colors.navy },
  report: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44 },
  reportText: { fontSize: 14, fontWeight: "600", color: colors.navySoft, textDecorationLine: "underline" },
  cta: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  ctaPrice: { fontSize: 20, fontWeight: "800", color: colors.navy },
});
