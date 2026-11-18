import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Icon from "../components/Icon";
import LocationSheet from "../components/LocationSheet";
import MapMock from "../components/MapMock";
import ParkingCard from "../components/ParkingCard";
import { LogoMark } from "../components/Logo";
import { Notice, Screen, SectionTitle, Skeleton, VehicleSwitch } from "../components/ui";
import { useNav } from "../navigation/Navigator";
import { useApp, useVehicle } from "../state/AppState";
import { DEFAULT_FILTERS, useCurrentPlace, useListings } from "../state/listings";
import { colors, radius, shadow, space, type } from "../theme";
import { dhakaMinutes } from "../utils/time";
import { formatBdPhone } from "../utils/format";

const QUICK = [
  { en: "Gulshan", bn: "গুলশান" },
  { en: "Dhanmondi", bn: "ধানমন্ডি" },
  { en: "Mirpur", bn: "মিরপুর" },
  { en: "Uttara", bn: "উত্তরা" },
  { en: "Banani", bn: "বনানী" },
];

/** Greeting, search, location, vehicle switch, map preview, suggestions (PRD FR-04). */
export default function HomeScreen() {
  const { t, lang, user } = useApp();
  const vehicle = useVehicle();
  const nav = useNav();
  const place = useCurrentPlace();
  const [query, setQuery] = useState("");
  const [locOpen, setLocOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const nearest = useListings("", DEFAULT_FILTERS, "nearest");
  const featured = nearest.filter((p) => p.featured);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(id);
  }, []);

  const mins = dhakaMinutes();
  const greeting = mins < 12 * 60 ? t("greetingMorning") : mins < 17 * 60 ? t("greetingAfternoon") : t("greetingEvening");
  const name = user ? user.name.split(" ")[0] || formatBdPhone(user.phone, lang) || user.email : t("guest");

  const search = (q: string) => nav.openExplore({ query: q.trim(), view: "list" });
  const open = (id: string) => nav.push({ name: "Details", id });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.top}>
          <View style={{ flex: 1 }}>
            <Text style={type.small}>{greeting},</Text>
            <Text style={type.title} numberOfLines={1}>
              {name}
            </Text>
          </View>
          <LogoMark size={40} />
        </View>

        <Pressable
          onPress={() => setLocOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`${t("parkingNear")} ${place.name[lang]}. ${t("changeLocation")}`}
          style={styles.location}
        >
          <Icon name="pin" size={18} color={colors.green} />
          <Text style={styles.locLabel}>{t("parkingNear")}</Text>
          <Text style={styles.locValue} numberOfLines={1}>
            {place.name[lang]}, {t("dhaka")}
          </Text>
          <Icon name="chevronDown" size={18} color={colors.navySoft} />
        </Pressable>

        <View style={styles.search}>
          <Icon name="search" size={20} color={colors.navySoft} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => search(query)}
            placeholder={t("searchPlaceholder")}
            placeholderTextColor={colors.navyMuted}
            returnKeyType="search"
            accessibilityLabel={t("searchPlaceholder")}
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <Pressable onPress={() => search(query)} accessibilityRole="button" accessibilityLabel={t("explore")} style={styles.go}>
              <Icon name="arrowRight" size={20} color={colors.white} />
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quick}>
          {QUICK.map((q) => (
            <Pressable key={q.en} onPress={() => search(q.en)} style={styles.quickChip} accessibilityRole="button">
              <Text style={styles.quickText}>{q[lang]}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <VehicleSwitch style={{ marginTop: space.lg }} />

        <Pressable
          onPress={() => nav.openExplore({ view: "map" })}
          accessibilityRole="button"
          accessibilityLabel={t("openMap")}
          style={styles.mapCard}
        >
          <MapMock listings={nearest.slice(0, 5)} vehicle={vehicle} interactive={false} compact style={{ height: 168 }} />
          <View style={styles.mapFoot}>
            <Text style={type.label}>{t("openMap")}</Text>
            <Text style={[type.small, { flex: 1 }]} numberOfLines={1}>
              {" "}· {t("sampleMarkers")}
            </Text>
            <Icon name="chevronRight" size={18} color={colors.navySoft} />
          </View>
        </Pressable>

        <View style={styles.section}>
          <SectionTitle title={t("featured")} />
          {loading ? (
            <View style={{ flexDirection: "row", gap: space.md }}>
              <Skeleton height={210} width={248} />
              <Skeleton height={210} width={80} />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md, paddingRight: space.xl }} style={styles.bleed}>
              {featured.map((p) => (
                <ParkingCard key={p.id} parking={p} layout="tall" onPress={() => open(p.id)} />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <SectionTitle title={t("nearby")} action={t("seeAll")} onAction={() => nav.openExplore({ view: "list" })} />
          <View style={{ gap: space.md }}>
            {loading
              ? [0, 1, 2].map((i) => <Skeleton key={i} height={112} />)
              : nearest.slice(0, 4).map((p) => <ParkingCard key={p.id} parking={p} onPress={() => open(p.id)} />)}
          </View>
        </View>

        <View style={{ marginTop: space.xl }}>
          <Notice text={t("demoNotice")} />
        </View>
      </ScrollView>
      <LocationSheet visible={locOpen} onClose={() => setLocOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl, paddingBottom: space.xxl },
  top: { flexDirection: "row", alignItems: "center", gap: space.md },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    marginTop: space.md,
  },
  locLabel: { fontSize: 14, color: colors.navySoft },
  locValue: { fontSize: 14, fontWeight: "700", color: colors.navy, flexShrink: 1 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingLeft: 14,
    paddingRight: 6,
    minHeight: 54,
    marginTop: space.sm,
    ...shadow.card,
  },
  searchInput: { flex: 1, fontSize: 16, color: colors.navy, paddingVertical: 12 },
  go: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" },
  quick: { gap: space.sm, paddingTop: space.md },
  quickChip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: "center",
  },
  quickText: { fontSize: 14, fontWeight: "600", color: colors.navy },
  mapCard: {
    marginTop: space.lg,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  mapFoot: { flexDirection: "row", alignItems: "center", paddingHorizontal: space.lg, minHeight: 48 },
  section: { marginTop: space.xxl },
  bleed: { marginRight: -space.xl },
});
