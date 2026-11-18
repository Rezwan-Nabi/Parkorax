import React, { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import Icon from "./Icon";
import { distanceKm } from "../utils/geo";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";
import { availabilityOf, places, type Vehicle } from "../data/parkings";
import type { Listing } from "../state/listings";
import { useApp } from "../state/AppState";
import { colors } from "../theme";
import { bdt } from "../utils/format";

/**
 * Map-style canvas with sample markers (PRD §11 "map mock"). It needs no API
 * key, so it always works offline. The streets are a simplified illustration
 * of central Dhaka, not to scale. Drag to pan; use + and − to zoom. To use
 * a real map, swap this component for react-native-maps with the same props.
 */

type LatLng = [number, number];

// Simplified geography, in [lat, lng].
const WATER: LatLng[][] = [
  // Buriganga, along the south-west
  [[23.712, 90.33], [23.705, 90.37], [23.7, 90.4], [23.698, 90.45], [23.68, 90.45], [23.682, 90.4], [23.69, 90.36], [23.698, 90.33]],
  // Turag, along the west
  [[23.7, 90.33], [23.76, 90.343], [23.81, 90.345], [23.86, 90.355], [23.9, 90.36], [23.9, 90.35], [23.86, 90.345], [23.81, 90.336], [23.76, 90.334], [23.7, 90.322]],
  // Balu, along the east
  [[23.72, 90.455], [23.78, 90.45], [23.83, 90.452], [23.9, 90.458], [23.9, 90.47], [23.83, 90.464], [23.78, 90.462], [23.72, 90.467]],
  // Gulshan–Banani lake
  [[23.783, 90.408], [23.792, 90.405], [23.802, 90.407], [23.808, 90.415], [23.806, 90.418], [23.799, 90.41], [23.79, 90.41], [23.785, 90.412]],
  // Hatirjheel
  [[23.752, 90.397], [23.758, 90.405], [23.768, 90.413], [23.772, 90.42], [23.769, 90.422], [23.764, 90.414], [23.755, 90.406], [23.75, 90.399]],
  // Dhanmondi lake
  [[23.737, 90.372], [23.745, 90.375], [23.752, 90.379], [23.751, 90.381], [23.744, 90.377], [23.736, 90.374]],
];

const PARKS: LatLng[][] = [
  // Ramna / Suhrawardy Udyan
  [[23.733, 90.395], [23.74, 90.396], [23.741, 90.403], [23.734, 90.403]],
  // National Botanical Garden
  [[23.815, 90.345], [23.825, 90.347], [23.823, 90.356], [23.814, 90.354]],
  // Cantonment green
  [[23.808, 90.38], [23.83, 90.385], [23.832, 90.4], [23.81, 90.398]],
];

const MAJOR_ROADS: LatLng[][] = [
  // Kazi Nazrul Islam Ave → Airport Road
  [[23.733, 90.396], [23.751, 90.393], [23.7577, 90.3897], [23.766, 90.392], [23.778, 90.4], [23.795, 90.402], [23.83, 90.405], [23.851, 90.408], [23.876, 90.398]],
  // Mirpur Road
  [[23.736, 90.384], [23.756, 90.376], [23.78, 90.371], [23.807, 90.369], [23.83, 90.365]],
  // Progoti Sarani
  [[23.76, 90.422], [23.781, 90.426], [23.8135, 90.424], [23.836, 90.418], [23.851, 90.408]],
];

const ROADS: LatLng[][] = [
  [[23.733, 90.417], [23.735, 90.405], [23.738, 90.396]],
  [[23.7577, 90.3897], [23.762, 90.4], [23.77, 90.41], [23.78, 90.416], [23.797, 90.415], [23.8, 90.425]],
  [[23.778, 90.38], [23.79, 90.374], [23.807, 90.369]],
  [[23.807, 90.369], [23.835, 90.372], [23.845, 90.395], [23.851, 90.408]],
  [[23.746, 90.36], [23.746, 90.39], [23.744, 90.415], [23.742, 90.43]],
  [[23.876, 90.398], [23.875, 90.38], [23.87, 90.365]],
  [[23.733, 90.417], [23.76, 90.422]],
];

const KM_PER_LAT = 110.6;
const KM_PER_LNG = 101.9; // at ~23.8° N

type Props = {
  listings: Listing[];
  vehicle: Vehicle;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Marker presses disabled, e.g. on the Home preview. */
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export default function MapMock({ listings, vehicle, selectedId, onSelect, interactive = true, style, compact }: Props) {
  const { lang, placeId, t } = useApp();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const origin = places.find((p) => p.id === placeId) ?? places[0];

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (Math.abs(width - size.w) > 1 || Math.abs(height - size.h) > 1) setSize({ w: width, h: height });
  };

  // New results or a new search point: go back to the fitted view.
  const resultKey = listings.map((l) => l.id).join(",") + origin.id;
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [resultKey]);

  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) + Math.abs(g.dy) > 6,
      onPanResponderMove: (_e, g) => setDrag({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (_e, g) => {
        setPan((p) => ({ x: p.x + g.dx, y: p.y + g.dy }));
        setDrag({ x: 0, y: 0 });
      },
      onPanResponderTerminate: () => setDrag({ x: 0, y: 0 }),
    }),
  ).current;

  const zoomBy = (f: number) => {
    const next = Math.min(Math.max(zoom * f, 0.5), 4);
    const k = next / zoom;
    setPan((p) => ({ x: p.x * k, y: p.y * k }));
    setZoom(next);
  };

  // Fit to the search point plus nearby results (within 7 km); far-away
  // results stay reachable by dragging or zooming out.
  const view = useMemo(() => {
    const near = listings.filter((l) => distanceKm(origin.lat, origin.lng, l.lat, l.lng) <= 7);
    const focus = near.length >= 2 ? near : listings;
    const pts: LatLng[] = [[origin.lat, origin.lng], ...focus.map((l) => [l.lat, l.lng] as LatLng)];
    const lats = pts.map((p) => p[0]);
    const lngs = pts.map((p) => p[1]);
    const cLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const cLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const spanY = Math.max((Math.max(...lats) - Math.min(...lats)) * KM_PER_LAT, 2.5);
    const spanX = Math.max((Math.max(...lngs) - Math.min(...lngs)) * KM_PER_LNG, 2.5);
    const padX = compact ? 40 : 48;
    const padTop = compact ? 44 : 64;
    const padBottom = compact ? 16 : 40;
    const usableW = Math.max(size.w - padX * 2, 40);
    const usableH = Math.max(size.h - padTop - padBottom, 40);
    const kmPerPx = Math.max(spanX / usableW, spanY / usableH);
    const offsetY = (padTop - padBottom) / 2;
    return { cLat, cLng, kmPerPx, offsetY };
  }, [listings, origin, size, compact]);

  const scale = view.kmPerPx / zoom;
  const ox = pan.x + drag.x;
  const oy = pan.y + drag.y;
  const project = ([lat, lng]: LatLng) => ({
    x: ((lng - view.cLng) * KM_PER_LNG) / scale + size.w / 2 + ox,
    y: ((view.cLat - lat) * KM_PER_LAT) / scale + size.h / 2 + view.offsetY + oy,
  });
  const path = (pts: LatLng[], close = false) =>
    pts.map((p, i) => {
      const { x, y } = project(p);
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ") + (close ? " Z" : "");

  const roadScale = Math.min(Math.max(0.02 / scale, 0.6), 1.8);
  const me = project([origin.lat, origin.lng]);

  return (
    <View style={[styles.wrap, style]} onLayout={onLayout} accessibilityLabel={t("sampleMarkers")} {...(interactive ? responder.panHandlers : {})}>
      {size.w > 0 && (
        <>
          <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill}>
            {PARKS.map((p, i) => (
              <Path key={`p${i}`} d={path(p, true)} fill={colors.park} />
            ))}
            {WATER.map((w, i) => (
              <Path key={`w${i}`} d={path(w, true)} fill={colors.water} />
            ))}
            {ROADS.map((r, i) => (
              <Path key={`r${i}`} d={path(r)} stroke={colors.road} strokeWidth={5 * roadScale} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {MAJOR_ROADS.map((r, i) => (
              <Path key={`mo${i}`} d={path(r)} stroke="#E8CF94" strokeWidth={10 * roadScale} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {MAJOR_ROADS.map((r, i) => (
              <Path key={`m${i}`} d={path(r)} stroke={colors.roadMajor} strokeWidth={7.5 * roadScale} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {!compact &&
              places
                .filter((p) => p.id !== origin.id)
                .map((p) => {
                  const { x, y } = project([p.lat, p.lng]);
                  return (
                    <SvgText key={p.id} x={x} y={y + 18} fontSize={11} fontWeight="600" fill={colors.navyMuted} textAnchor="middle">
                      {p.name[lang]}
                    </SvgText>
                  );
                })}
            <Circle cx={me.x} cy={me.y} r={18} fill="#1A56C4" opacity={0.14} />
            <Circle cx={me.x} cy={me.y} r={7} fill="#1A56C4" stroke={colors.white} strokeWidth={2.5} />
          </Svg>

          {listings.map((l) => {
            const rate = l.vehicles[vehicle];
            const state = availabilityOf(rate);
            const { x, y } = project([l.lat, l.lng]);
            const selected = l.id === selectedId;
            const bg = selected ? colors.navy : state === "available" ? colors.green : state === "limited" ? "#C27C0E" : "#8A93A6";
            const markerStyle = [styles.marker, { left: x - 32, top: y - 40, zIndex: selected ? 3 : 2 }];
            const body = (
              <>
                <View style={[styles.pill, { backgroundColor: bg }, selected && styles.pillSelected]}>
                  <Text style={styles.pillText}>{rate ? bdt(rate.rate, lang) : "—"}</Text>
                </View>
                <View style={[styles.tip, { borderTopColor: bg }]} />
              </>
            );
            // On the Home preview the whole card is the button, so markers are decoration.
            return interactive ? (
              <Pressable
                key={l.id}
                onPress={() => onSelect?.(l.id)}
                accessibilityRole="button"
                accessibilityLabel={`${l.name[lang]}, ${rate ? bdt(rate.rate, lang) : ""}, ${t(state)}`}
                hitSlop={8}
                style={markerStyle}
              >
                {body}
              </Pressable>
            ) : (
              <View key={l.id} style={markerStyle} pointerEvents="none">
                {body}
              </View>
            );
          })}

          {interactive && !compact && (
            <View style={styles.zoom}>
              <Pressable onPress={() => zoomBy(1.5)} accessibilityRole="button" accessibilityLabel={t("zoomIn")} style={styles.zoomBtn}>
                <Text style={styles.zoomText}>+</Text>
              </Pressable>
              <View style={styles.zoomDivider} />
              <Pressable onPress={() => zoomBy(1 / 1.5)} accessibilityRole="button" accessibilityLabel={t("zoomOut")} style={styles.zoomBtn}>
                <Text style={styles.zoomText}>−</Text>
              </Pressable>
              <View style={styles.zoomDivider} />
              <Pressable
                onPress={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                accessibilityRole="button"
                accessibilityLabel={t("recenter")}
                style={styles.zoomBtn}
              >
                <Icon name="locate" size={20} color={colors.navy} />
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.land, overflow: "hidden" },
  marker: { position: "absolute", width: 64, height: 44, alignItems: "center", justifyContent: "flex-end", paddingBottom: 4 },
  pill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.white,
    minWidth: 46,
    alignItems: "center",
  },
  pillSelected: { paddingHorizontal: 11, paddingVertical: 6 },
  pillText: { color: colors.white, fontSize: 13, fontWeight: "800" },
  zoom: {
    position: "absolute",
    right: 12,
    top: 56,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    zIndex: 5,
  },
  zoomBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  zoomText: { fontSize: 22, fontWeight: "500", color: colors.navy, lineHeight: 26 },
  zoomDivider: { height: 1, backgroundColor: colors.line, marginHorizontal: 8 },
  tip: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -1,
  },
});
