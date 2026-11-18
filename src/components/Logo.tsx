import React from "react";
import { Text, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { colors } from "../theme";

/** App mark: a parking "P" whose bowl doubles as a map pin. */
export function LogoMark({ size = 48, onDark = false }: { size?: number; onDark?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width={48} height={48} rx={14} fill={onDark ? colors.white : colors.navy} />
      <Path
        d="M15 37V11h8a7.5 7.5 0 0 1 0 15H15"
        stroke={onDark ? colors.navy : colors.white}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M33 33.5l4 5.5 4-5.5a5 5 0 1 0-8 0z" fill={colors.green} />
    </Svg>
  );
}

export function Wordmark({ size = 24, onDark = false }: { size?: number; onDark?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline" }} accessible accessibilityLabel="ParkoraX">
      <Text style={{ fontSize: size, fontWeight: "800", color: onDark ? colors.white : colors.navy, letterSpacing: -0.5 }}>
        Parkora
      </Text>
      <Text style={{ fontSize: size, fontWeight: "800", color: onDark ? "#6EE0AE" : colors.green, letterSpacing: -0.5 }}>X</Text>
    </View>
  );
}
