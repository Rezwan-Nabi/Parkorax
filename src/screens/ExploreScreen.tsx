import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import FilterSheet from "../components/FilterSheet";
import Icon from "../components/Icon";
import MapMock from "../components/MapMock";
import ParkingCard from "../components/ParkingCard";
import { Chip, EmptyState, Notice, Screen, Skeleton, VehicleSwitch } from "../components/ui";
import { useNav } from "../navigation/Navigator";
import { useApp, useVehicle } from "../state/AppState";
import {
  activeFilterCount,
  DEFAULT_FILTERS,
  filterListings,
  useListings,
  type Filters,
  type Sort,
} from "../state/listings";
import { colors, radius, shadow, space, type } from "../theme";

/** Search results, sort, filters and the map/list switch (PRD FR-05 – FR-07). */
export default function ExploreScreen() {
  const { t, n, placeId } = useApp();
  const vehicle = useVehicle();
  const nav = useNav();
  const params = nav.exploreParams;

  const [query, setQuery] = useState(params?.query ?? "");
  const [view, setView] = useState<"list" | "map">(params?.view ?? "list");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<Sort>("nearest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Arriving from Home with a search or "open map".
  useEffect(() => {
    if (!params) return;
    if (params.query != null) setQuery(params.query);
    if (params.view) setView(params.view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.key]);

  const results = useListings(query, filters, sort);

  // Brief loading state whenever the result set changes (sample data is instant).
  const signature = results.map((r) => r.id).join(",");
  useEffect(() => {
    setLoading(true);
    const id = setTimeout(() => setLoading(false), 280);
    return () => clearTimeout(id);
  }, [signature]);

  useEffect(() => {
    if (selected && !results.some((r) => r.id === selected)) setSelected(null);
  }, [results, selected]);

  const countFor = useCallback(
    (f: Filters) => filterListings(vehicle, placeId, query, f, sort).length,
    [vehicle, placeId, query, sort],
  );

  const nFilters = activeFilterCount(filters);
  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    setQuery("");
  };
  const open = (id: string) => nav.push({ name: "Details", id });
  const sel = results.find((r) => r.id === selected) ?? null;

  const sorts: { key: Sort; label: string }[] = [
    { key: "nearest", label: t("sortNearest") },
    { key: "price", label: t("sortPrice") },
    { key: "rating", label: t("sortRating") },
  ];

  return (
    <Screen>
      <View style={styles.head}>
        <View style={styles.search}>
          <Icon name="search" size={20} color={colors.navySoft} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("searchPlaceholder")}
            placeholderTextColor={colors.navyMuted}
            returnKeyType="search"
            accessibilityLabel={t("searchPlaceholder")}
            style={styles.input}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} accessibilityRole="button" accessibilityLabel={t("clearFilters")} style={styles.clear}>
              <Icon name="x" size={18} color={colors.navySoft} />
            </Pressable>
          )}
        </View>

        <VehicleSwitch />

        <View style={styles.row}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }} style={{ flex: 1 }}>
            {sorts.map((s) => (
              <Chip key={s.key} label={s.label} selected={sort === s.key} onPress={() => setSort(s.key)} />
            ))}
          </ScrollView>
          <View style={styles.viewToggle} accessibilityRole="tablist">
            {(["list", "map"] as const).map((v) => (
              <Pressable
                key={v}
                onPress={() => setView(v)}
                accessibilityRole="tab"
                accessibilityLabel={v === "list" ? t("listView") : t("mapView")}
                accessibilityState={{ selected: view === v }}
                style={[styles.viewBtn, view === v && styles.viewOn]}
              >
                <Icon name={v} size={20} color={view === v ? colors.white : colors.navySoft} />
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => setFilterOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`${t("filters")}${nFilters ? `, ${nFilters}` : ""}`}
            style={[styles.filterBtn, nFilters > 0 && { borderColor: colors.green }]}
          >
            <Icon name="sliders" size={20} color={colors.navy} />
            {nFilters > 0 && (
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>{n(nFilters)}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <Text style={[type.small, { marginTop: space.sm }]} accessibilityLiveRegion="polite">
          {results.length === 1 ? t("oneResult") : t("results", { count: results.length })} · {t("sampleData")}
        </Text>
      </View>

      {results.length === 0 ? (
        <EmptyState
          icon="search"
          title={t("noResultsTitle")}
          body={t("noResultsBody")}
          action={t("clearFilters")}
          onAction={clearAll}
        />
      ) : view === "list" ? (
        loading ? (
          <View style={{ padding: space.xl, gap: space.md }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={112} />
            ))}
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(p) => p.id}
            renderItem={({ item }) => <ParkingCard parking={item} onPress={() => open(item.id)} />}
            ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
            contentContainerStyle={{ padding: space.xl, paddingTop: space.md }}
            ListFooterComponent={<View style={{ marginTop: space.xl }}><Notice text={t("demoNotice")} /></View>}
          />
        )
      ) : (
        <View style={{ flex: 1 }}>
          <MapBoundary fallback={<MapFallback onList={() => setView("list")} />}>
            <MapMock listings={results} vehicle={vehicle} selectedId={selected} onSelect={setSelected} style={{ flex: 1 }} />
          </MapBoundary>
          <View style={styles.mapLegend} pointerEvents="none">
            <Text style={styles.mapLegendText}>{t("sampleMarkers")}</Text>
          </View>
          {sel && (
            <View style={styles.mapCard}>
              <ParkingCard parking={sel} onPress={() => open(sel.id)} />
            </View>
          )}
        </View>
      )}

      <FilterSheet visible={filterOpen} value={filters} onApply={setFilters} onClose={() => setFilterOpen(false)} countFor={countFor} />
    </Screen>
  );
}

/** Falls back to a message if the map fails to render (PRD §12 reliability). */
class MapBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function MapFallback({ onList }: { onList: () => void }) {
  const { t } = useApp();
  return <EmptyState icon="map" title={t("somethingWrong")} body={t("mapUnavailable")} action={t("listView")} onAction={onList} />;
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.sm, gap: space.sm },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingLeft: 14,
    minHeight: 52,
  },
  input: { flex: 1, fontSize: 16, color: colors.navy, paddingVertical: 12 },
  clear: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: space.sm },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 3,
    gap: 2,
  },
  viewBtn: { width: 40, height: 40, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  viewOn: { backgroundColor: colors.navy },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  filterCount: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  filterCountText: { color: colors.white, fontSize: 11, fontWeight: "800" },
  mapLegend: {
    position: "absolute",
    top: space.md,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  mapLegendText: { fontSize: 12.5, fontWeight: "600", color: colors.navySoft },
  mapCard: { position: "absolute", left: space.lg, right: space.lg, bottom: space.lg, ...shadow.raised },
});
