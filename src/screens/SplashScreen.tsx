import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { LogoMark, Wordmark } from "../components/Logo";
import { useApp } from "../state/AppState";
import { colors } from "../theme";

/** Logo, tagline and a short launch transition, then hands over. */
export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const { t, hydrated } = useApp();
  const mark = useRef(new Animated.Value(0)).current;
  const words = useRef(new Animated.Value(0)).current;
  const done = useRef(false);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(mark, { toValue: 1, duration: 520, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }),
      Animated.timing(words, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [mark, words]);

  // Wait for both the animation and saved settings before leaving.
  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => {
      if (!done.current) {
        done.current = true;
        onDone();
      }
    }, 1500);
    return () => clearTimeout(id);
  }, [hydrated, onDone]);

  return (
    <View style={styles.root} accessibilityLabel={`ParkoraX. ${t("tagline")}`}>
      <Animated.View
        style={{
          opacity: mark,
          transform: [{ scale: mark.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
        }}
      >
        <LogoMark size={84} onDark />
      </Animated.View>
      <Animated.View
        style={{
          alignItems: "center",
          marginTop: 22,
          opacity: words,
          transform: [{ translateY: words.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
        }}
      >
        <Wordmark size={34} onDark />
        <Text style={styles.tagline}>{t("tagline")}</Text>
      </Animated.View>
      <Text style={styles.footer}>{t("dhaka")} · {t("demo")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center" },
  tagline: { color: "#C6CFE0", fontSize: 16, marginTop: 8 },
  footer: { position: "absolute", bottom: 40, color: "#8D99B3", fontSize: 13, fontWeight: "600" },
});
