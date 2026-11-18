import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Parking } from "../data/parkings";
import { useApp, useVehicle } from "../state/AppState";
import { useToast } from "./Toast";
import { colors, radius, shadow, space, type } from "../theme";
import { bdt, km as fmtKm, rating as fmtRating } from "../utils/format";
import Icon from "./Icon";
import ParkingPhoto from "./ParkingPhoto";
import { AvailabilityBadge } from "./ui";

type Props = { parking: Parking & { km?: number }; onPress: () => void; layout?: "row" | "tall" };

export default function ParkingCard({ parking: p, onPress, layout = "row" }: Props) {
  const { lang, t, favorites } = useApp();
  const vehicle = useVehicle();
  const rate = p.vehicles[vehicle];
  const tall = layout === "tall";
  const meta = [p.area[lang], p.km != null ? fmtKm(p.km, lang) : null].filter(Boolean).join(" · ");
  const saved = favorites.includes(p.id);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${p.name[lang]}, ${meta}, ${rate ? bdt(rate.rate, lang) + t("perHour") : t("notForVehicle", { vehicle: t(vehicle) })}`}
      style={({ pressed }) => [styles.card, tall ? styles.tall : styles.row, pressed && { opacity: 0.85 }]}
    >
      <View>
        <ParkingPhoto parking={p} style={tall ? styles.photoTall : styles.photoRow} showLabel={tall} />
        <FavoriteButton id={p.id} saved={saved} floating />
      </View>
      <View style={[styles.body, tall && { padding: space.md }]}>
        <Text style={styles.name} numberOfLines={1}>
          {p.name[lang]}
        </Text>
        <View style={styles.metaRow}>
          <Icon name="pin" size={14} color={colors.navyMuted} />
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
          <Icon name="star" size={13} color="#D98A00" fill="#F2B233" />
          <Text style={styles.meta}>{fmtRating(p.rating, lang)}</Text>
        </View>
        <View style={styles.bottom}>
          {rate ? (
            <Text style={styles.price}>
              {bdt(rate.rate, lang)}
              <Text style={styles.per}>{t("perHour")}</Text>
            </Text>
          ) : (
            <Text style={type.small}>{t("notForVehicle", { vehicle: t(vehicle) })}</Text>
          )}
          <AvailabilityBadge rate={rate} compact />
        </View>
      </View>
    </Pressable>
  );
}

export function FavoriteButton({ id, saved, floating }: { id: string; saved: boolean; floating?: boolean }) {
  const { toggleFavorite, t } = useApp();
  const toast = useToast();
  return (
    <Pressable
      onPress={() => {
        const nowSaved = toggleFavorite(id);
        toast.show(
          nowSaved
            ? { message: t("savedToast") }
            : { message: t("removedToast"), action: { label: t("undo"), onPress: () => toggleFavorite(id) } },
        );
      }}
      accessibilityRole="button"
      accessibilityLabel={saved ? t("remove") : t("save")}
      accessibilityState={{ selected: saved }}
      hitSlop={6}
      style={({ pressed }) => [floating ? styles.favFloat : styles.fav, pressed && { transform: [{ scale: 0.92 }] }]}
    >
      <Icon name="heart" size={20} color={saved ? colors.red : colors.navy} fill={saved ? colors.red : "none"} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  row: { flexDirection: "row", ...shadow.card },
  tall: { width: 248, ...shadow.card },
  photoRow: { width: 104, height: "100%", minHeight: 112 },
  photoTall: { width: "100%", height: 124 },
  body: { flex: 1, padding: space.md, gap: 6, justifyContent: "center" },
  name: { ...type.label, fontSize: 15.5 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { fontSize: 13, color: colors.navySoft, flexShrink: 1, marginRight: 4 },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 2 },
  price: { fontSize: 18, fontWeight: "800", color: colors.navy },
  per: { fontSize: 13, fontWeight: "500", color: colors.navySoft },
  favFloat: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.94)",
    alignItems: "center",
    justifyContent: "center",
  },
  fav: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
});
