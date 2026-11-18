import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { colors } from "../theme";

/**
 * Illustrative QR-style pattern derived from the booking reference (PRD
 * FR-11). It is deliberately NOT a scannable QR code, and it carries a
 * visible DEMO stamp, so it can't be mistaken for a real entry pass.
 */
const N = 25;

function seeded(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
}

function inFinder(x: number, y: number) {
  const near = (a: number, b: number) => a >= b && a < b + 8;
  return (near(x, 0) && near(y, 0)) || (near(x, N - 8) && near(y, 0)) || (near(x, 0) && near(y, N - 8));
}

export default function QrMock({ value, size = 180, stamp = "DEMO" }: { value: string; size?: number; stamp?: string }) {
  const d = useMemo(() => {
    const rand = seeded(value);
    let out = "";
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (inFinder(x, y)) continue;
        if (rand() > 0.52) out += `M${x} ${y}h1v1h-1z`;
      }
    }
    return out;
  }, [value]);

  const finder = (x: number, y: number) => (
    <React.Fragment key={`${x}-${y}`}>
      <Rect x={x} y={y} width={7} height={7} fill={colors.navy} />
      <Rect x={x + 1} y={y + 1} width={5} height={5} fill={colors.white} />
      <Rect x={x + 2} y={y + 2} width={3} height={3} fill={colors.navy} />
    </React.Fragment>
  );

  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={`Illustrative QR pattern for ${value}. Not a valid pass.`}>
      <Svg width={size} height={size} viewBox={`-1 -1 ${N + 2} ${N + 2}`}>
        <Rect x={-1} y={-1} width={N + 2} height={N + 2} fill={colors.white} />
        <Path d={d} fill={colors.navy} />
        {finder(0, 0)}
        {finder(N - 7, 0)}
        {finder(0, N - 7)}
      </Svg>
      <View style={styles.stampWrap} pointerEvents="none">
        <View style={styles.stamp}>
          <Text style={styles.stampText}>{stamp}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stampWrap: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  stamp: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.red,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    transform: [{ rotate: "-12deg" }],
  },
  stampText: { color: colors.red, fontWeight: "900", fontSize: 16, letterSpacing: 2 },
});
