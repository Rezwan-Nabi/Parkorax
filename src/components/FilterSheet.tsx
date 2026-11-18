import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useApp, useVehicle } from "../state/AppState";
import { DEFAULT_FILTERS, KM_STEPS, PRICE_STEPS, type AvailFilter, type Filters } from "../state/listings";
import { space, type } from "../theme";
import { bdt, digits } from "../utils/format";
import { Button, Chip, Sheet, VehicleSwitch } from "./ui";

/**
 * Filters (PRD FR-07): vehicle type, sample price, distance, availability.
 * Vehicle type writes the shared app-wide vehicle so every screen agrees.
 * `countFor` previews how many results the draft filters would give.
 */
export default function FilterSheet({
  visible,
  value,
  onApply,
  onClose,
  countFor,
}: {
  visible: boolean;
  value: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
  countFor: (f: Filters) => number;
}) {
  const { t, lang } = useApp();
  const vehicle = useVehicle();
  const [draft, setDraft] = useState<Filters>(value);
  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  // Price steps differ per vehicle; drop a price cap that no longer fits.
  useEffect(() => {
    setDraft((d) => (d.maxPrice != null && !PRICE_STEPS[vehicle].includes(d.maxPrice) ? { ...d, maxPrice: null } : d));
  }, [vehicle]);

  const count = countFor(draft);
  const avail: { key: AvailFilter; label: string }[] = [
    { key: "all", label: t("showAll") },
    { key: "available", label: t("availableOnly") },
    { key: "hideFull", label: t("hideFull") },
  ];

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t("filters")}
      footer={
        <View style={{ flexDirection: "row", gap: space.sm }}>
          <Button label={t("reset")} variant="secondary" onPress={() => setDraft(DEFAULT_FILTERS)} style={{ flex: 1 }} />
          <Button
            label={count === 0 ? t("noResultsTitle") : t("apply", { count })}
            disabled={count === 0}
            onPress={() => {
              onApply(draft);
              onClose();
            }}
            style={{ flex: 2 }}
          />
        </View>
      }
    >
      <Group title={t("vehicle")}>
        <VehicleSwitch />
      </Group>

      <Group title={t("maxPrice")}>
        <View style={styles.chips}>
          <Chip label={t("anyPrice")} selected={draft.maxPrice == null} onPress={() => setDraft({ ...draft, maxPrice: null })} />
          {PRICE_STEPS[vehicle].map((p) => (
            <Chip
              key={p}
              label={t("upTo", { price: bdt(p, lang) })}
              selected={draft.maxPrice === p}
              onPress={() => setDraft({ ...draft, maxPrice: p })}
            />
          ))}
        </View>
      </Group>

      <Group title={t("distance")}>
        <View style={styles.chips}>
          <Chip label={t("anyDistance")} selected={draft.maxKm == null} onPress={() => setDraft({ ...draft, maxKm: null })} />
          {KM_STEPS.map((k) => (
            <Chip
              key={k}
              label={t("within", { km: `${digits(k, lang)} ${lang === "bn" ? "কিমি" : "km"}` })}
              selected={draft.maxKm === k}
              onPress={() => setDraft({ ...draft, maxKm: k })}
            />
          ))}
        </View>
      </Group>

      <Group title={t("availability")}>
        <View style={styles.chips}>
          {avail.map((a) => (
            <Chip key={a.key} label={a.label} selected={draft.avail === a.key} onPress={() => setDraft({ ...draft, avail: a.key })} />
          ))}
        </View>
        <Text style={[type.small, { marginTop: space.sm }]}>{t("demoNotice")}</Text>
      </Group>
    </Sheet>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: space.lg }}>
      <Text style={[type.label, { marginBottom: space.sm }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
});
