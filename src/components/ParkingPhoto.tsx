import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import type { Parking } from "../data/parkings";
import { colors } from "../theme";
import { useApp } from "../state/AppState";

/**
 * Illustrated stand-in for a facility photo. Real photos need permission from
 * each operator, so the prototype draws a labelled illustration instead.
 * `variant` gives each of the detail screen's photos a different scene.
 */
export default function ParkingPhoto({
  parking,
  variant = 0,
  style,
  showLabel = true,
}: {
  parking: Parking;
  variant?: number;
  style?: StyleProp<ViewStyle>;
  showLabel?: boolean;
}) {
  const { t } = useApp();
  const [deep, light] = parking.tone;
  const gid = `g-${parking.id}-${variant}`;
  return (
    <View style={[styles.wrap, style]} accessible accessibilityLabel={`${t("samplePhoto")}: ${parking.name.en}`}>
      <Svg width="100%" height="100%" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={light} />
            <Stop offset="1" stopColor="#FFFFFF" />
          </LinearGradient>
        </Defs>
        <Rect width={320} height={180} fill={`url(#${gid})`} />
        {variant % 3 === 0 && <Exterior deep={deep} light={light} />}
        {variant % 3 === 1 && <Interior deep={deep} light={light} />}
        {variant % 3 === 2 && <Entrance deep={deep} light={light} />}
      </Svg>
      {showLabel && (
        <View style={styles.label}>
          <Text style={styles.labelText}>{t("samplePhoto")}</Text>
        </View>
      )}
    </View>
  );
}

function Car({ x, y, color, s = 1 }: { x: number; y: number; color: string; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M4 18 L10 8 Q12 5 16 5 H34 Q38 5 40 8 L46 18 Q50 19 50 23 V27 H0 V23 Q0 19 4 18 Z" fill={color} />
      <Path d="M12 9 Q13 8 16 8 H24 V17 H8 Z" fill="#FFFFFF" opacity={0.55} />
      <Path d="M27 8 H34 Q36 8 37 9 L41 17 H27 Z" fill="#FFFFFF" opacity={0.55} />
      <Circle cx={11} cy={27} r={5} fill="#1E2433" />
      <Circle cx={39} cy={27} r={5} fill="#1E2433" />
    </G>
  );
}

function Exterior({ deep, light }: { deep: string; light: string }) {
  return (
    <G>
      <Rect x={40} y={34} width={240} height={120} rx={6} fill={deep} />
      {[0, 1, 2].map((i) => (
        <Rect key={i} x={52} y={46 + i * 34} width={216} height={22} rx={3} fill={light} opacity={0.5} />
      ))}
      <Rect x={143} y={8} width={34} height={40} rx={8} fill="#1A56C4" />
      <Path d="M154 40 V16 h7 a6 6 0 0 1 0 12 h-7" stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Rect x={0} y={154} width={320} height={26} fill="#C9CED6" />
      <Rect x={0} y={165} width={320} height={3} fill="#FFFFFF" opacity={0.8} />
      <Car x={70} y={128} color="#E2574C" s={0.85} />
      <Car x={170} y={128} color="#F2F4F7" s={0.85} />
    </G>
  );
}

function Interior({ deep, light }: { deep: string; light: string }) {
  return (
    <G>
      <Rect x={0} y={0} width={320} height={46} fill={deep} />
      {[30, 110, 190, 270].map((x) => (
        <Rect key={x} x={x} y={46} width={16} height={100} fill={deep} opacity={0.85} />
      ))}
      {[60, 140, 220].map((x) => (
        <Rect key={x} x={x - 30} y={36} width={60} height={5} rx={2} fill="#FFF8D6" />
      ))}
      <Rect x={0} y={146} width={320} height={34} fill="#B9BFC9" />
      {[0, 64, 128, 192, 256, 320].map((x) => (
        <Rect key={x} x={x - 1.5} y={146} width={3} height={34} fill="#FFFFFF" />
      ))}
      <Car x={8} y={120} color={light} s={0.9} />
      <Car x={136} y={120} color="#3B4252" s={0.9} />
      <Car x={262} y={120} color="#F2F4F7" s={0.9} />
    </G>
  );
}

function Entrance({ deep, light }: { deep: string; light: string }) {
  return (
    <G>
      <Rect x={0} y={20} width={320} height={130} fill={deep} />
      <Path d="M90 150 V70 a70 50 0 0 1 140 0 V150 Z" fill="#1E2433" />
      <Rect x={60} y={96} width={200} height={8} fill="#F4C430" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <Rect key={i} x={60 + i * 20} y={96} width={10} height={8} fill="#1E2433" />
      ))}
      <Rect x={50} y={92} width={12} height={58} fill="#9AA3B2" />
      <Rect x={250} y={34} width={46} height={26} rx={5} fill={light} />
      <Rect x={0} y={150} width={320} height={30} fill="#C9CED6" />
      <Rect x={14} y={60} width={26} height={60} rx={4} fill={light} opacity={0.6} />
    </G>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden", backgroundColor: colors.surfaceAlt },
  label: {
    position: "absolute",
    left: 10,
    bottom: 10,
    backgroundColor: "rgba(15,30,61,0.72)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  labelText: { color: colors.white, fontSize: 11, fontWeight: "600" },
});
