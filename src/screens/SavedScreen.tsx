import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import ParkingCard from "../components/ParkingCard";
import { EmptyState, Screen } from "../components/ui";
import { parkingById } from "../data/parkings";
import { useNav } from "../navigation/Navigator";
import { useApp } from "../state/AppState";
import { useCurrentPlace } from "../state/listings";
import { space, type } from "../theme";
import { distanceKm } from "../utils/geo";

/** Locally saved parking places (PRD FR-13). Tap the heart to remove, with undo. */
export default function SavedScreen() {
  const { t, n, favorites } = useApp();
  const nav = useNav();
  const place = useCurrentPlace();

  const items = useMemo(
    () =>
      favorites
        .map((id) => parkingById(id))
        .filter((p): p is NonNullable<typeof p> => !!p)
        .map((p) => ({ ...p, km: distanceKm(place.lat, place.lng, p.lat, p.lng) })),
    [favorites, place],
  );

  return (
    <Screen>
      <View style={{ paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.md }}>
        <Text style={type.display} accessibilityRole="header">
          {t("savedTitle")}
        </Text>
        {items.length > 0 && <Text style={type.small}>{items.length === 1 ? t("oneResult") : t("results", { count: n(items.length) })}</Text>}
      </View>
      {items.length === 0 ? (
        <EmptyState icon="heart" title={t("noSavedTitle")} body={t("noSavedBody")} action={t("findParking")} onAction={() => nav.goTab("explore")} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: space.xl, paddingTop: space.sm, gap: space.md }}
          renderItem={({ item }) => <ParkingCard parking={item} onPress={() => nav.push({ name: "Details", id: item.id })} />}
        />
      )}
    </Screen>
  );
}
