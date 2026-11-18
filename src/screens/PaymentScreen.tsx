import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon, { type IconName } from "../components/Icon";
import { Button, Card, Header, Screen } from "../components/ui";
import { parkingById } from "../data/parkings";
import { useNav } from "../navigation/Navigator";
import { useApp, type PayMethod } from "../state/AppState";
import { colors, radius, space, type } from "../theme";
import { bdt, bookingRef } from "../utils/format";
import { formatDate, formatTime } from "../utils/time";
import type { BookingDraft } from "./BookingScreen";
import type { StringKey } from "../i18n/strings";

const METHODS: { key: PayMethod; icon: IconName }[] = [
  { key: "bkash", icon: "wallet" },
  { key: "nagad", icon: "wallet" },
  { key: "card", icon: "card" },
  { key: "cash", icon: "cash" },
];

/**
 * Mock payment (PRD §5, §13): method selection only. There are no card,
 * wallet or PIN fields, and confirming never starts a transaction.
 */
export default function PaymentScreen({ draft }: { draft: BookingDraft }) {
  const { t, lang, addBooking } = useApp();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState<PayMethod>("bkash");
  const [busy, setBusy] = useState(false);
  const p = parkingById(draft.parkingId);

  const confirm = () => {
    setBusy(true);
    setTimeout(() => {
      const id = `b-${Date.now()}`;
      addBooking({ ...draft, id, ref: bookingRef(), method, createdAt: Date.now() });
      nav.resetTo({ name: "Confirmation", bookingId: id, fresh: true });
    }, 900);
  };

  return (
    <Screen>
      <Header title={t("payment")} onBack={nav.pop} />
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingTop: space.sm, paddingBottom: 140, gap: space.xl }}>
        <View style={styles.demo}>
          <View style={styles.demoIcon}>
            <Icon name="alert" size={22} color={colors.amber} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[type.heading, { color: "#6B3F00" }]}>{t("paymentDemoTitle")}</Text>
            <Text style={[type.small, { color: "#6B3F00", marginTop: 2 }]}>{t("paymentDemoBody")}</Text>
          </View>
        </View>

        <Card style={{ gap: space.sm }}>
          <Row label={t("where")} value={p ? p.name[lang] : "—"} />
          <Row label={t("when")} value={`${formatDate(draft.date, lang)}, ${formatTime(draft.start, lang)} – ${formatTime(draft.start + draft.hours * 60, lang)}`} />
          <Row label={t("vehicle")} value={t(draft.vehicle)} />
          <View style={styles.divider} />
          <Row label={t("total")} value={bdt(draft.total, lang)} strong />
        </Card>

        <View>
          <Text style={[type.label, { marginBottom: space.sm }]}>{t("payMethod")}</Text>
          <View style={{ gap: space.sm }} accessibilityRole="radiogroup">
            {METHODS.map((m) => {
              const on = method === m.key;
              return (
                <Pressable
                  key={m.key}
                  onPress={() => setMethod(m.key)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  style={[styles.method, on && styles.methodOn]}
                >
                  <View style={styles.methodIcon}>
                    <Icon name={m.icon} size={22} color={colors.navy} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={type.label}>{t(`pm_${m.key}` as StringKey)}</Text>
                    <Text style={type.small}>{t(`pm_${m.key}_d` as StringKey)}</Text>
                  </View>
                  <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.radioDot} />}</View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.cta, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <Button label={busy ? t("confirming") : t("confirmDemo")} onPress={confirm} loading={busy} />
      </View>
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
  demo: {
    flexDirection: "row",
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.amberTint,
    borderWidth: 1,
    borderColor: "#F3D9A4",
  },
  demoIcon: { paddingTop: 2 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 4 },
  strong: { fontSize: 20, fontWeight: "800", color: colors.navy },
  method: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.md,
    minHeight: 68,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  methodOn: { borderColor: colors.green, borderWidth: 2 },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: colors.green },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.green },
  cta: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
