import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DEFAULT_PLACE, places } from "../data/parkings";
import { useApp } from "../state/AppState";
import { colors, radius, space, type } from "../theme";
import Icon from "./Icon";
import { Notice, Sheet } from "./ui";

/**
 * Location selector. PRD §12 privacy rule: the device location is never
 * requested. "Use my current location" picks a sample point and says so.
 */
export default function LocationSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t, lang, placeId, set } = useApp();
  const choose = (id: string) => {
    set("placeId", id);
    onClose();
  };
  return (
    <Sheet visible={visible} onClose={onClose} title={t("chooseLocation")}>
      <Pressable onPress={() => choose(DEFAULT_PLACE)} style={styles.current} accessibilityRole="button">
        <View style={styles.currentIcon}>
          <Icon name="locate" size={20} color="#1A56C4" />
        </View>
        <Text style={[type.label, { flex: 1 }]}>{t("useCurrentLocation")}</Text>
      </Pressable>
      <Notice text={t("locationDemoNote")} />
      <Text style={[type.small, { marginTop: space.xl, marginBottom: space.sm, fontWeight: "700" }]}>{t("dhakaAreas")}</Text>
      {places.map((p) => {
        const on = p.id === placeId;
        return (
          <Pressable
            key={p.id}
            onPress={() => choose(p.id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surface }]}
          >
            <Icon name="pin" size={20} color={on ? colors.green : colors.navyMuted} />
            <Text style={[type.body, { flex: 1 }, on && { fontWeight: "700" }]}>
              {p.name[lang]}, {t("dhaka")}
            </Text>
            {on && <Icon name="check" size={20} color={colors.green} />}
          </Pressable>
        );
      })}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  current: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: 56,
    marginBottom: space.md,
  },
  currentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5EEFC",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingHorizontal: 4,
    borderRadius: radius.sm,
  },
});
