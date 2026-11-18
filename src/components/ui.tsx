import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, shadow, space, TOUCH, type } from "../theme";
import { availabilityOf, type Vehicle, type VehicleRate } from "../data/parkings";
import { useApp } from "../state/AppState";
import Icon, { type IconName } from "./Icon";

// ---------------------------------------------------------------- Screen

/** Page wrapper: safe-area top padding and the light grey background. */
export function Screen({
  children,
  style,
  bg = colors.surface,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bg?: string;
}) {
  const insets = useSafeAreaInsets();
  return <View style={[{ flex: 1, backgroundColor: bg, paddingTop: insets.top }, style]}>{children}</View>;
}

/** Top bar for pushed screens: back button, title and an optional action. */
export function Header({
  title,
  onBack,
  right,
}: {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const { t } = useApp();
  return (
    <View style={s.header}>
      {onBack ? (
        <IconButton icon="chevronLeft" label={t("back")} onPress={onBack} />
      ) : (
        <View style={{ width: TOUCH }} />
      )}
      <Text style={s.headerTitle} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      <View style={{ minWidth: TOUCH, alignItems: "flex-end" }}>{right}</View>
    </View>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  color = colors.navy,
  fill,
  bg = "transparent",
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  fill?: string;
  bg?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [s.iconBtn, { backgroundColor: bg }, pressed && { opacity: 0.6 }]}
    >
      <Icon name={icon} color={color} fill={fill} />
    </Pressable>
  );
}

// ---------------------------------------------------------------- Buttons

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = "primary", icon, disabled, loading, style }: ButtonProps) {
  const v = buttonVariants[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: v.bg, borderColor: v.border },
        inactive && { backgroundColor: v.disabledBg, borderColor: v.disabledBg },
        pressed && !inactive && { backgroundColor: v.pressed },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : icon ? (
        <Icon name={icon} size={20} color={inactive ? colors.navyMuted : v.fg} />
      ) : null}
      <Text style={[s.btnText, { color: inactive ? colors.navyMuted : v.fg }]}>{label}</Text>
    </Pressable>
  );
}

const buttonVariants = {
  primary: { bg: colors.green, fg: colors.white, border: colors.green, pressed: colors.greenDark, disabledBg: colors.surfaceAlt },
  secondary: { bg: colors.white, fg: colors.navy, border: colors.line, pressed: colors.surface, disabledBg: colors.surfaceAlt },
  ghost: { bg: "transparent", fg: colors.green, border: "transparent", pressed: colors.greenTint, disabledBg: "transparent" },
  danger: { bg: colors.white, fg: colors.red, border: colors.line, pressed: colors.redTint, disabledBg: colors.surfaceAlt },
};

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [s.chip, selected && s.chipOn, pressed && { opacity: 0.75 }]}
    >
      {icon && <Icon name={icon} size={16} color={selected ? colors.white : colors.navy} />}
      <Text style={[s.chipText, selected && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------- Labels

const AVAIL = {
  available: { bg: colors.greenTint, fg: colors.greenDark, dot: colors.green },
  limited: { bg: colors.amberTint, fg: colors.amber, dot: "#D98A00" },
  full: { bg: colors.redTint, fg: colors.red, dot: colors.red },
};

/** Available / Limited / Full, always marked as sample data (PRD §7.1). */
export function AvailabilityBadge({ rate, compact }: { rate?: VehicleRate; compact?: boolean }) {
  const { t } = useApp();
  const state = availabilityOf(rate);
  const c = AVAIL[state];
  return (
    <View
      style={[s.badge, { backgroundColor: c.bg }]}
      accessible
      accessibilityLabel={`${t(state)}, ${t("sampleData")}`}
    >
      <View style={[s.dot, { backgroundColor: c.dot }]} />
      <Text style={[s.badgeText, { color: c.fg }]}>
        {t(state)}
        {!compact && <Text style={s.badgeSample}> · {t("sample")}</Text>}
      </Text>
    </View>
  );
}

export function DemoTag({ label, tone = "navy" }: { label?: string; tone?: "navy" | "light" }) {
  const { t } = useApp();
  const light = tone === "light";
  return (
    <View style={[s.demoTag, light && { backgroundColor: "rgba(255,255,255,0.18)", borderColor: "rgba(255,255,255,0.35)" }]}>
      <Text style={[s.demoTagText, light && { color: colors.white }]}>{label ?? t("demo")}</Text>
    </View>
  );
}

/** Explanatory banner used wherever mock data could be mistaken for real. */
export function Notice({ text, icon = "info", tone = "info" }: { text: string; icon?: IconName; tone?: "info" | "warn" }) {
  const warn = tone === "warn";
  return (
    <View style={[s.notice, warn && { backgroundColor: colors.amberTint, borderColor: "#F3D9A4" }]}>
      <Icon name={icon} size={18} color={warn ? colors.amber : colors.navySoft} />
      <Text style={[s.noticeText, warn && { color: "#6B3F00" }]}>{text}</Text>
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={s.sectionTitle}>
      <Text style={type.heading} accessibilityRole="header">
        {title}
      </Text>
      {action && onAction && (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button" style={{ minHeight: 32, justifyContent: "center" }}>
          <Text style={s.link}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ---------------------------------------------------------------- Vehicle switch

/** Shared Car / Motorcycle switch. Reads and writes the one app-wide vehicle. */
export function VehicleSwitch({ style }: { style?: StyleProp<ViewStyle> }) {
  const { vehicle, set, t } = useApp();
  const current: Vehicle = vehicle ?? "car";
  return (
    <View style={[s.segment, style]} accessibilityRole="radiogroup" accessibilityLabel={t("vehicle")}>
      {(["car", "motorcycle"] as const).map((v) => {
        const on = current === v;
        return (
          <Pressable
            key={v}
            onPress={() => set("vehicle", v)}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            style={[s.segmentItem, on && s.segmentOn]}
          >
            <Icon name={v} size={20} color={on ? colors.white : colors.navySoft} />
            <Text style={[s.segmentText, on && { color: colors.white }]}>{t(v)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------- Form

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  right?: React.ReactNode;
};

export function TextField({ label, error, hint, right, style, ...rest }: FieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={type.label}>{label}</Text>
      <View style={[s.field, !!error && { borderColor: colors.red }]}>
        <TextInput
          {...rest}
          accessibilityLabel={label}
          placeholderTextColor={colors.navyMuted}
          style={[s.input, rest.multiline && { minHeight: 96, textAlignVertical: "top", paddingTop: 12 }, style]}
        />
        {right}
      </View>
      {error ? (
        <Text style={s.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={type.small}>{hint}</Text>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------- States

export function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Icon name={icon} size={28} color={colors.navySoft} />
      </View>
      <Text style={[type.heading, { textAlign: "center" }]}>{title}</Text>
      <Text style={[type.small, { textAlign: "center", maxWidth: 280 }]}>{body}</Text>
      {action && onAction && <Button label={action} onPress={onAction} variant="secondary" style={{ marginTop: 8 }} />}
    </View>
  );
}

/** Grey placeholder block that pulses while sample data "loads". */
export function Skeleton({ height, width = "100%", style }: { height: number; width?: number | `${number}%`; style?: StyleProp<ViewStyle> }) {
  const pulse = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.55, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return <Animated.View style={[{ height, width, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, opacity: pulse }, style]} />;
}

// ---------------------------------------------------------------- Sheet

/** Bottom sheet built on Modal. Tapping the scrim or Android back closes it. */
export function Sheet({
  visible,
  onClose,
  title,
  children,
  footer,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useApp();
  const y = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (visible) {
      y.setValue(1);
      Animated.timing(y, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }
  }, [visible, y]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={s.scrimWrap}>
        <Pressable style={s.scrim} onPress={onClose} accessibilityLabel={t("close")} />
        <Animated.View
          style={[
            s.sheet,
            { paddingBottom: Math.max(insets.bottom, space.lg) },
            { transform: [{ translateY: y.interpolate({ inputRange: [0, 1], outputRange: [0, 420] }) }] },
          ]}
        >
          <View style={s.grabber} />
          <View style={s.sheetHead}>
            <Text style={type.title} accessibilityRole="header">
              {title}
            </Text>
            <IconButton icon="x" label={t("close")} onPress={onClose} />
          </View>
          <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: space.md }}>
            {children}
          </ScrollView>
          {footer && <View style={{ paddingHorizontal: space.xl, paddingTop: space.md }}>{footer}</View>}
        </Animated.View>
      </View>
    </Modal>
  );
}

/** Small centred confirm dialog (used instead of Alert so it can be translated and styled). */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger,
}: {
  visible: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[s.scrimWrap, { justifyContent: "center", padding: space.xxl }]}>
        <Pressable style={s.scrim} onPress={onCancel} />
        <View style={s.dialog} accessibilityViewIsModal>
          <Text style={type.heading}>{title}</Text>
          {body && <Text style={[type.small, { marginTop: 6 }]}>{body}</Text>}
          <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.xl }}>
            <Button label={cancelLabel} onPress={onCancel} variant="secondary" style={{ flex: 1 }} />
            <Button label={confirmLabel} onPress={onConfirm} variant={danger ? "danger" : "primary"} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

// ---------------------------------------------------------------- Styles

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.sm,
    height: 56,
  },
  headerTitle: { ...type.heading, flex: 1, textAlign: "center" },
  iconBtn: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: TOUCH / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: space.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  btnText: { fontSize: 16, fontWeight: "700" },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { fontSize: 14, fontWeight: "600", color: colors.navy },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12.5, fontWeight: "700" },
  badgeSample: { fontWeight: "500" },
  demoTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  demoTagText: { fontSize: 11.5, fontWeight: "700", color: colors.navySoft, letterSpacing: 0.3 },
  notice: {
    flexDirection: "row",
    gap: 10,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  noticeText: { ...type.small, flex: 1 },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.md,
  },
  link: { fontSize: 14, fontWeight: "700", color: colors.green },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  segmentOn: { backgroundColor: colors.navy },
  segmentText: { fontSize: 15, fontWeight: "700", color: colors.navySoft },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    minHeight: 52,
  },
  input: { flex: 1, fontSize: 16, color: colors.navy, paddingHorizontal: 14, paddingVertical: 12 },
  error: { fontSize: 13, lineHeight: 18, color: colors.red },
  empty: { alignItems: "center", gap: space.sm, paddingVertical: 48, paddingHorizontal: space.xl },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
  },
  scrimWrap: { flex: 1, justifyContent: "flex-end" },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,30,61,0.45)" },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "88%",
    ...shadow.raised,
  },
  grabber: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line, marginTop: 8 },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: space.xl,
    paddingRight: space.sm,
    paddingVertical: space.xs,
  },
  dialog: { backgroundColor: colors.white, borderRadius: radius.lg, padding: space.xl, ...shadow.raised },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: space.lg },
});
