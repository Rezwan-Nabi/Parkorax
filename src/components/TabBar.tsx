import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNav, type Tab } from "../navigation/Navigator";
import { useApp } from "../state/AppState";
import { colors } from "../theme";
import Icon, { type IconName } from "./Icon";
import type { StringKey } from "../i18n/strings";

const TABS: { key: Tab; icon: IconName; label: StringKey }[] = [
  { key: "home", icon: "home", label: "tabHome" },
  { key: "explore", icon: "compass", label: "tabExplore" },
  { key: "bookings", icon: "calendar", label: "tabBookings" },
  { key: "saved", icon: "heart", label: "tabSaved" },
  { key: "profile", icon: "user", label: "tabProfile" },
];

export default function TabBar() {
  const { tab, goTab } = useNav();
  const { t } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]} accessibilityRole="tablist">
      {TABS.map((item) => {
        const on = tab === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => goTab(item.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t(item.label)}
            style={styles.item}
          >
            <View style={[styles.iconWrap, on && styles.iconOn]}>
              <Icon name={item.icon} size={22} color={on ? colors.greenDark : colors.navyMuted} strokeWidth={on ? 2.2 : 1.9} />
            </View>
            <Text style={[styles.label, on && styles.labelOn]} numberOfLines={1}>
              {t(item.label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 6,
  },
  item: { flex: 1, alignItems: "center", gap: 2, minHeight: 56, justifyContent: "center" },
  iconWrap: { width: 56, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  iconOn: { backgroundColor: colors.greenTint },
  label: { fontSize: 12, fontWeight: "600", color: colors.navyMuted },
  labelOn: { color: colors.greenDark, fontWeight: "700" },
});
