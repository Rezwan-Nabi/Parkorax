import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Icon from "../components/Icon";
import QrMock from "../components/QrMock";
import { Button, ConfirmDialog, EmptyState, Header, Screen } from "../components/ui";
import { parkingById } from "../data/parkings";
import { useNav } from "../navigation/Navigator";
import { bookingStatus, useApp } from "../state/AppState";
import { colors, radius, shadow, space, type } from "../theme";
import { bdt } from "../utils/format";
import { formatDate, formatTime } from "../utils/time";
import type { StringKey } from "../i18n/strings";

/**
 * Demo booking ID, illustrative QR, location and summary (PRD FR-11).
 * Shown right after a demo booking (`fresh`) and when opened from Bookings.
 */
export default function ConfirmationScreen({ bookingId, fresh }: { bookingId: string; fresh: boolean }) {
  const { t, lang, bookings, cancelBooking } = useApp();
  const nav = useNav();
  const [asking, setAsking] = useState(false);
  const b = bookings.find((x) => x.id === bookingId);
  const p = b ? parkingById(b.parkingId) : undefined;

  if (!b || !p) {
    return (
      <Screen>
        <Header onBack={nav.pop} />
        <EmptyState icon="alert" title={t("somethingWrong")} body="" action={t("backHome")} onAction={() => nav.goTab("home")} />
      </Screen>
    );
  }

  const status = bookingStatus(b);

  return (
    <Screen>
      {fresh ? <View style={{ height: space.lg }} /> : <Header title={t("reference")} onBack={nav.pop} />}
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingTop: space.sm, paddingBottom: 48 }}>
        {fresh && (
          <View style={styles.hero}>
            <View style={styles.check}>
              <Icon name="check" size={34} color={colors.white} strokeWidth={3} />
            </View>
            <Text style={[type.title, { textAlign: "center", marginTop: space.lg }]} accessibilityRole="header">
              {t("confirmedTitle")}
            </Text>
            <Text style={[type.small, { textAlign: "center", marginTop: 6, maxWidth: 300 }]}>{t("confirmedBody")}</Text>
          </View>
        )}

        <View style={styles.ticket}>
          <View style={styles.ticketTop}>
            <Text style={type.small}>{t("reference")}</Text>
            <Text style={styles.ref} selectable>
              {b.ref}
            </Text>
            <View style={styles.qr}>
              <QrMock value={b.ref} size={168} stamp={lang === "bn" ? "ডেমো" : "DEMO"} />
            </View>
            <Text style={[type.small, { textAlign: "center" }]}>{t("qrNote")}</Text>
          </View>

          <View style={styles.perforation}>
            <View style={[styles.notch, { left: -12 }]} />
            <View style={styles.dash}>
              {Array.from({ length: 28 }, (_, i) => (
                <View key={i} style={styles.dashSeg} />
              ))}
            </View>
            <View style={[styles.notch, { right: -12 }]} />
          </View>

          <View style={{ padding: space.xl, gap: space.md }}>
            <Row label={t("where")} value={`${p.name[lang]}\n${p.area[lang]}, ${t("dhaka")}`} />
            <Row
              label={t("when")}
              value={`${formatDate(b.date, lang)}\n${formatTime(b.start, lang)} – ${formatTime(b.start + b.hours * 60, lang)}`}
            />
            <Row label={t("vehicle")} value={t(b.vehicle)} />
            <Row label={t("method")} value={`${t(`pm_${b.method}` as StringKey)} (${t("demo")})`} />
            <Row label={t("total")} value={bdt(b.total, lang)} strong />
            {!fresh && <Row label={t("status")} value={t(`status_${status}` as StringKey)} />}
          </View>
        </View>

        <View style={{ gap: space.sm, marginTop: space.xl }}>
          {fresh ? (
            <>
              <Button label={t("viewBookings")} onPress={() => nav.goTab("bookings")} />
              <Button label={t("backHome")} variant="secondary" onPress={() => nav.goTab("home")} />
            </>
          ) : (
            status === "upcoming" && <Button label={t("cancelBooking")} variant="danger" onPress={() => setAsking(true)} />
          )}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={asking}
        title={t("cancelConfirm")}
        body={b.ref}
        confirmLabel={t("yesCancel")}
        cancelLabel={t("keep")}
        danger
        onCancel={() => setAsking(false)}
        onConfirm={() => {
          cancelBooking(b.id);
          setAsking(false);
        }}
      />
    </Screen>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: space.lg }}>
      <Text style={type.small}>{label}</Text>
      <Text style={[strong ? styles.strong : type.label, { flexShrink: 1, textAlign: "right" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", marginBottom: space.xl },
  check: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  ticket: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, ...shadow.card },
  ticketTop: { alignItems: "center", padding: space.xl, gap: 4 },
  ref: { fontSize: 26, fontWeight: "800", color: colors.navy, letterSpacing: 1.5 },
  qr: { padding: space.md, marginVertical: space.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line },
  perforation: { height: 24, justifyContent: "center" },
  notch: { position: "absolute", width: 24, height: 24, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  dash: { marginHorizontal: space.xl, flexDirection: "row", justifyContent: "space-between", overflow: "hidden" },
  dashSeg: { width: 6, height: 2, borderRadius: 1, backgroundColor: colors.line },
  strong: { fontSize: 20, fontWeight: "800", color: colors.navy },
});
