import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AvailabilityBadge, Button, Card, Chip, EmptyState, Header, Notice, Screen, VehicleSwitch } from "../components/ui";
import { availabilityOf, parkingById, type Vehicle } from "../data/parkings";
import { useNav } from "../navigation/Navigator";
import { useApp, useVehicle } from "../state/AppState";
import { colors, space, type } from "../theme";
import { bdt } from "../utils/format";
import { dayOfMonth, dhakaDateKey, dhakaMinutes, formatTime, is24h, weekday } from "../utils/time";

export type BookingDraft = {
  parkingId: string;
  vehicle: Vehicle;
  date: string;
  start: number;
  hours: number;
  rate: number;
  total: number;
};

const DURATIONS = [1, 2, 3, 4, 6, 8];
const SLOT = 30;

/** Vehicle, date, start time, duration and an estimated total (PRD FR-10). */
export default function BookingScreen({ id }: { id: string }) {
  const { t, lang } = useApp();
  const vehicle = useVehicle();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const p = parkingById(id);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => dhakaDateKey(i)), []);
  const [date, setDate] = useState(days[0]);
  const [start, setStart] = useState<number | null>(null);
  const [hours, setHours] = useState(2);

  // Start-time slots inside opening hours; today's slots begin after "now".
  const slots = useMemo(() => {
    if (!p) return [];
    const allDay = is24h(p.opens, p.closes);
    const first = allDay ? 0 : p.opens;
    const last = allDay ? 1440 - SLOT : p.closes - 60; // leave at least an hour
    const nowNext = Math.ceil((dhakaMinutes() + 15) / SLOT) * SLOT;
    const out: number[] = [];
    for (let m = first; m <= last; m += SLOT) {
      if (date === days[0] && m < nowNext) continue;
      out.push(m);
    }
    return out;
  }, [p, date, days]);

  // Keep the chosen start valid when the date changes.
  useEffect(() => {
    if (start == null || !slots.includes(start)) setStart(slots[0] ?? null);
  }, [slots, start]);

  if (!p) {
    return (
      <Screen>
        <EmptyState icon="alert" title={t("somethingWrong")} body="" action={t("back")} onAction={nav.pop} />
      </Screen>
    );
  }

  const rate = p.vehicles[vehicle];
  const full = availabilityOf(rate) === "full";
  const allDay = is24h(p.opens, p.closes);
  const end = start != null ? start + hours * 60 : null;
  const overClose = !allDay && end != null && end > p.closes;
  const total = rate ? rate.rate * hours : 0;
  const valid = !!rate && !full && start != null && !overClose;

  const dayLabel = (d: string, i: number) => (i === 0 ? t("today") : i === 1 ? t("tomorrow") : weekday(d, lang));

  return (
    <Screen bg={colors.surface}>
      <Header title={t("booking")} onBack={nav.pop} />
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingTop: space.sm, paddingBottom: 140, gap: space.xl }}>
        <Notice text={t("bookingDemo")} icon="info" />

        <View>
          <Text style={type.title}>{p.name[lang]}</Text>
          <Text style={type.small}>
            {p.area[lang]}, {t("dhaka")}
          </Text>
        </View>

        <Section title={t("vehicle")}>
          <VehicleSwitch />
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, marginTop: space.sm }}>
            <AvailabilityBadge rate={rate} />
            {!rate && <Text style={[type.small, { color: colors.red }]}>{t("notForVehicle", { vehicle: t(vehicle) })}</Text>}
          </View>
        </Section>

        <Section title={t("date")}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
            {days.map((d, i) => {
              const on = d === date;
              return (
                <Chip key={d} label={`${dayLabel(d, i)} ${dayOfMonth(d, lang)}`} selected={on} onPress={() => setDate(d)} />
              );
            })}
          </ScrollView>
        </Section>

        <Section title={t("startTime")}>
          {slots.length === 0 ? (
            <Text style={[type.small, { color: colors.red }]}>{t("noSlots")}</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
              {slots.map((m) => (
                <Chip key={m} label={formatTime(m, lang)} selected={m === start} onPress={() => setStart(m)} />
              ))}
            </ScrollView>
          )}
        </Section>

        <Section title={t("duration")}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {DURATIONS.map((h) => (
              <Chip key={h} label={t("hoursN", { n: h })} selected={h === hours} onPress={() => setHours(h)} />
            ))}
          </View>
          {end != null && (
            <Text style={[type.small, { marginTop: space.sm }]}>{t("ends", { time: formatTime(end, lang) })}</Text>
          )}
          {overClose && (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {t("errClosed", { time: formatTime(p.closes, lang) })}
            </Text>
          )}
        </Section>

        <Card>
          <Text style={type.heading}>{t("summary")}</Text>
          {rate ? (
            <>
              <View style={styles.line}>
                <Text style={type.body}>{t("rateLine", { rate: bdt(rate.rate, lang), hours })}</Text>
                <Text style={type.body}>{bdt(total, lang)}</Text>
              </View>
              <View style={[styles.line, styles.totalLine]}>
                <Text style={type.heading}>{t("estimatedTotal")}</Text>
                <Text style={styles.total}>{bdt(total, lang)}</Text>
              </View>
              <Text style={[type.small, { marginTop: space.sm }]}>{t("estimateNote")}</Text>
            </>
          ) : (
            <Text style={[type.small, { marginTop: space.sm }]}>{t("notForVehicle", { vehicle: t(vehicle) })}</Text>
          )}
        </Card>
      </ScrollView>

      <View style={[styles.cta, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <Button
          label={t("continueToPayment")}
          disabled={!valid}
          onPress={() =>
            rate &&
            start != null &&
            nav.push({
              name: "Payment",
              draft: { parkingId: p.id, vehicle, date, start, hours, rate: rate.rate, total },
            })
          }
        />
      </View>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={[type.label, { marginBottom: space.sm }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  error: { fontSize: 13, lineHeight: 18, color: colors.red, marginTop: space.sm },
  line: { flexDirection: "row", justifyContent: "space-between", marginTop: space.md },
  totalLine: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: space.md },
  total: { fontSize: 22, fontWeight: "800", color: colors.navy },
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
