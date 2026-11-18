import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path, Rect, Text as SvgText } from "react-native-svg";
import { Button, Screen } from "../components/ui";
import { Wordmark } from "../components/Logo";
import { useApp } from "../state/AppState";
import { colors, space, type } from "../theme";
import type { StringKey } from "../i18n/strings";

const SLIDES: { title: StringKey; body: StringKey; art: React.FC }[] = [
  { title: "ob1Title", body: "ob1Body", art: MapArt },
  { title: "ob2Title", body: "ob2Body", art: VehicleArt },
  { title: "ob3Title", body: "ob3Body", art: TicketArt },
];

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { t, n } = useApp();
  const [i, setI] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const last = i === SLIDES.length - 1;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, [i, fade]);

  const slide = SLIDES[i];
  const Art = slide.art;

  return (
    <Screen bg={colors.white}>
      <View style={styles.top}>
        <Wordmark size={20} />
        {!last && (
          <Pressable onPress={onDone} hitSlop={12} accessibilityRole="button" style={styles.skip}>
            <Text style={styles.skipText}>{t("skip")}</Text>
          </Pressable>
        )}
      </View>

      <Animated.View style={[styles.body, { opacity: fade }]}>
        <View style={styles.art}>
          <Art />
        </View>
        <Text style={[type.display, styles.center]} accessibilityRole="header">
          {t(slide.title)}
        </Text>
        <Text style={[type.body, styles.center, { color: colors.navySoft, marginTop: space.md }]}>{t(slide.body)}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dots} accessible accessibilityLabel={`${n(i + 1)} / ${n(SLIDES.length)}`}>
          {SLIDES.map((_, k) => (
            <View key={k} style={[styles.dot, k === i && styles.dotOn]} />
          ))}
        </View>
        <Button label={last ? t("getStarted") : t("next")} onPress={() => (last ? onDone() : setI(i + 1))} />
      </View>
    </Screen>
  );
}

function MapArt() {
  return (
    <Svg width={260} height={200} viewBox="0 0 260 200">
      <Rect x={10} y={10} width={240} height={180} rx={24} fill={colors.land} />
      <Path d="M10 140 C 70 120 120 160 250 120 L250 150 C 130 185 70 150 10 170 Z" fill={colors.water} />
      <Path d="M40 10 L 110 190" stroke={colors.roadMajor} strokeWidth={12} />
      <Path d="M10 70 L 250 60" stroke={colors.white} strokeWidth={7} />
      <Path d="M170 10 L 200 190" stroke={colors.white} strokeWidth={7} />
      {[
        [70, 52, colors.green, "৳50"],
        [180, 40, "#C27C0E", "৳60"],
        [150, 104, colors.green, "৳40"],
      ].map(([x, y, c, label]) => (
        <G key={String(label)}>
          <Rect x={(x as number) - 26} y={(y as number) - 14} width={52} height={28} rx={14} fill={c as string} stroke="#fff" strokeWidth={2} />
          <SvgText x={x as number} y={(y as number) + 5} fontSize={14} fontWeight="800" fill="#fff" textAnchor="middle">
            {label as string}
          </SvgText>
        </G>
      ))}
      <Circle cx={110} cy={80} r={16} fill="#1A56C4" opacity={0.15} />
      <Circle cx={110} cy={80} r={7} fill="#1A56C4" stroke="#fff" strokeWidth={2.5} />
    </Svg>
  );
}

function VehicleArt() {
  return (
    <Svg width={260} height={200} viewBox="0 0 260 200">
      <Rect x={10} y={10} width={240} height={180} rx={24} fill={colors.surface} />
      <Rect x={10} y={150} width={240} height={40} fill={colors.surfaceAlt} />
      <G transform="translate(28 88) scale(2)">
        <Path d="M4 18 L10 8 Q12 5 16 5 H34 Q38 5 40 8 L46 18 Q50 19 50 23 V27 H0 V23 Q0 19 4 18 Z" fill={colors.navy} />
        <Path d="M12 9 Q13 8 16 8 H24 V17 H8 Z" fill="#fff" opacity={0.5} />
        <Path d="M27 8 H34 Q36 8 37 9 L41 17 H27 Z" fill="#fff" opacity={0.5} />
        <Circle cx={11} cy={27} r={5} fill="#1E2433" />
        <Circle cx={39} cy={27} r={5} fill="#1E2433" />
      </G>
      <G transform="translate(150 104)" stroke={colors.green} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Circle cx={16} cy={46} r={14} />
        <Circle cx={78} cy={46} r={14} />
        <Path d="M30 46 h20 l14 -22" />
        <Path d="M16 46 l18 -22 h24" />
        <Path d="M64 24 l-8 -16 h-10" />
      </G>
    </Svg>
  );
}

function TicketArt() {
  return (
    <Svg width={260} height={200} viewBox="0 0 260 200">
      <Rect x={50} y={14} width={160} height={176} rx={18} fill={colors.white} stroke={colors.line} strokeWidth={2} />
      <Rect x={70} y={36} width={80} height={10} rx={5} fill={colors.navy} />
      <Rect x={70} y={56} width={120} height={8} rx={4} fill={colors.surfaceAlt} />
      <Rect x={70} y={72} width={100} height={8} rx={4} fill={colors.surfaceAlt} />
      <Rect x={90} y={96} width={80} height={72} rx={6} fill={colors.surface} />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => ((r + c) % 2 === 0 ? <Rect key={`${r}${c}`} x={100 + c * 15} y={104 + r * 14} width={11} height={10} fill={colors.navy} /> : null)),
      )}
      <G transform="rotate(-14 130 132)">
        <Rect x={84} y={118} width={92} height={30} rx={6} fill="#fff" stroke={colors.red} strokeWidth={3} />
        <SvgText x={130} y={140} fontSize={18} fontWeight="900" fill={colors.red} textAnchor="middle" letterSpacing={3}>
          DEMO
        </SvgText>
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  top: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.xl,
  },
  skip: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  skipText: { fontSize: 15, fontWeight: "700", color: colors.navySoft },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: space.xxl },
  art: { marginBottom: space.xxl },
  center: { textAlign: "center" },
  footer: { padding: space.xl, gap: space.xl },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  dotOn: { width: 24, backgroundColor: colors.green },
});
