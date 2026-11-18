import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "../components/Icon";
import { Button, Header, Screen } from "../components/ui";
import type { Vehicle } from "../data/parkings";
import { useApp } from "../state/AppState";
import { colors, radius, space, type } from "../theme";

/** Car / Motorcycle selection cards (PRD FR-03). */
export default function VehicleSelectScreen({ onDone, onBack }: { onDone: () => void; onBack?: () => void }) {
  const { t, vehicle, set } = useApp();
  const [choice, setChoice] = useState<Vehicle | null>(vehicle);

  return (
    <Screen bg={colors.white}>
      {onBack ? <Header title={t("defaultVehicle")} onBack={onBack} /> : <View style={{ height: 32 }} />}
      <View style={styles.body}>
        <Text style={type.display} accessibilityRole="header">
          {t("chooseVehicle")}
        </Text>
        <Text style={[type.body, { color: colors.navySoft, marginTop: space.sm }]}>{t("chooseVehicleBody")}</Text>

        <View style={styles.cards} accessibilityRole="radiogroup">
          {(["car", "motorcycle"] as const).map((v) => {
            const on = choice === v;
            return (
              <Pressable
                key={v}
                onPress={() => setChoice(v)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={({ pressed }) => [styles.card, on && styles.cardOn, pressed && { opacity: 0.85 }]}
              >
                <View style={[styles.iconCircle, on && { backgroundColor: colors.green }]}>
                  <Icon name={v} size={34} color={on ? colors.white : colors.navy} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={type.title}>{t(v)}</Text>
                  <Text style={type.small}>{t(v === "car" ? "carDesc" : "motorcycleDesc")}</Text>
                </View>
                <View style={[styles.radio, on && styles.radioOn]}>{on && <Icon name="check" size={16} color={colors.white} strokeWidth={3} />}</View>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={{ padding: space.xl }}>
        <Button
          label={t("continue")}
          disabled={!choice}
          onPress={() => {
            if (!choice) return;
            set("vehicle", choice);
            onDone();
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: space.xl },
  cards: { gap: space.md, marginTop: space.xxl },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.white,
    minHeight: 96,
  },
  cardOn: { borderColor: colors.green, backgroundColor: "#F4FBF8" },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { backgroundColor: colors.green, borderColor: colors.green },
});
