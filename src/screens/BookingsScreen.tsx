import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "../components/Icon";
import { EmptyState, Screen } from "../components/ui";
import { parkingById } from "../data/parkings";
import { useNav } from "../navigation/Navigator";
import { bookingStatus, useApp, type Booking, type BookingStatus } from "../state/AppState";
import { colors, radius, space, type } from "../theme";
import { bdt } from "../utils/format";
import { dhakaTimestamp, formatDate, formatTime } from "../utils/time";
import type { StringKey } from "../i18n/strings";

/** Upcoming and past demo bookings (PRD FR-12). */
export default function BookingsScreen() {
  const { t, n, bookings } = useApp();
  const nav = useNav();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const { upcoming, past } = useMemo(() => {
    const at = (b: Booking) => dhakaTimestamp(b.date, b.start);
    const up = bookings.filter((b) => bookingStatus(b) === "upcoming").sort((a, b) => at(a) - at(b));
    const pa = bookings.filter((b) => bookingStatus(b) !== "upcoming").sort((a, b) => at(b) - at(a));
    return { upcoming: up, past: pa };
  }, [bookings]);

  const list = tab === "upcoming" ? upcoming : past;

  return (
    <Screen>
      <View style={styles.head}>
        <Text style={type.display} accessibilityRole="header">
          {t("bookings")}
        </Text>
        <View style={styles.tabs} accessibilityRole="tablist">
          {(["upcoming", "past"] as const).map((k) => {
            const on = tab === k;
            const count = k === "upcoming" ? upcoming.length : past.length;
            return (
              <Pressable
                key={k}
                onPress={() => setTab(k)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                style={[styles.tab, on && styles.tabOn]}
              >
                <Text style={[styles.tabText, on && { color: colors.navy }]}>
                  {t(k)} ({n(count)})
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {list.length === 0 ? (
        <EmptyState
          icon="calendar"
          title={tab === "upcoming" ? t("noUpcomingTitle") : t("noPastTitle")}
          body={tab === "upcoming" ? t("noUpcomingBody") : t("noPastBody")}
          action={tab === "upcoming" ? t("findParking") : undefined}
          onAction={() => nav.goTab("explore")}
        />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ padding: space.xl, paddingTop: space.sm, gap: space.md }}
          renderItem={({ item }) => (
            <BookingRow booking={item} onPress={() => nav.push({ name: "Confirmation", bookingId: item.id, fresh: false })} />
          )}
        />
      )}
    </Screen>
  );
}

const STATUS_STYLE: Record<BookingStatus, { bg: string; fg: string }> = {
  upcoming: { bg: colors.greenTint, fg: colors.greenDark },
  completed: { bg: colors.surfaceAlt, fg: colors.navySoft },
  cancelled: { bg: colors.redTint, fg: colors.red },
};

function BookingRow({ booking: b, onPress }: { booking: Booking; onPress: () => void }) {
  const { t, lang } = useApp();
  const p = parkingById(b.parkingId);
  const status = bookingStatus(b);
  const st = STATUS_STYLE[status];
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <View style={styles.cardTop}>
        <View style={styles.vehicle}>
          <Icon name={b.vehicle} size={22} color={colors.navy} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={type.label} numberOfLines={1}>
            {p?.name[lang] ?? "—"}
          </Text>
          <Text style={type.small}>
            {formatDate(b.date, lang)} · {formatTime(b.start, lang)} – {formatTime(b.start + b.hours * 60, lang)}
          </Text>
        </View>
        <View style={[styles.status, { backgroundColor: st.bg }]}>
          <Text style={[styles.statusText, { color: st.fg }]}>{t(`status_${status}` as StringKey)}</Text>
        </View>
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.ref}>
          {b.ref} · {t("demo")}
        </Text>
        <Text style={styles.total}>{bdt(b.total, lang)}</Text>
        {status === "upcoming" && (
          <View style={styles.qrHint}>
            <Icon name="qr" size={16} color={colors.green} />
            <Text style={styles.qrText}>{t("showQr")}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.md, gap: space.lg },
  tabs: { flexDirection: "row", backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 4 },
  tab: { flex: 1, minHeight: 44, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  tabOn: { backgroundColor: colors.white },
  tabText: { fontSize: 15, fontWeight: "700", color: colors.navySoft },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: space.lg, gap: space.md },
  cardTop: { flexDirection: "row", alignItems: "center", gap: space.md },
  vehicle: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  status: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12.5, fontWeight: "700" },
  cardBottom: { flexDirection: "row", alignItems: "center", gap: space.md, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: space.md },
  ref: { flex: 1, fontSize: 13, color: colors.navySoft, fontWeight: "600" },
  total: { fontSize: 16, fontWeight: "800", color: colors.navy },
  qrHint: { flexDirection: "row", alignItems: "center", gap: 4 },
  qrText: { fontSize: 13, fontWeight: "700", color: colors.green },
});
