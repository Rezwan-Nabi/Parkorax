import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, space } from "../theme";

type ToastInput = { message: string; action?: { label: string; onPress: () => void } };
type ToastApi = { show: (t: ToastInput) => void };

const Ctx = createContext<ToastApi>({ show: () => {} });
export const useToast = () => useContext(Ctx);

/** One short message at a time, above the tab bar, with an optional action. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<(ToastInput & { id: number }) | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setToast(null));
  }, [opacity]);

  const show = useCallback(
    (t: ToastInput) => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ ...t, id: Date.now() });
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, t.action ? 4000 : 2600);
    },
    [hide, opacity],
  );

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {toast && (
        <View pointerEvents="box-none" style={styles.wrap}>
          <Animated.View style={[styles.toast, { opacity }]} accessibilityLiveRegion="polite" accessibilityRole="alert">
            <Text style={styles.text}>{toast.message}</Text>
            {toast.action && (
              <Pressable
                onPress={() => {
                  toast.action?.onPress();
                  hide();
                }}
                hitSlop={10}
                accessibilityRole="button"
              >
                <Text style={styles.action}>{toast.action.label}</Text>
              </Pressable>
            )}
          </Animated.View>
        </View>
      )}
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 96, alignItems: "center", paddingHorizontal: space.lg },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: space.lg,
    maxWidth: 420,
    width: "100%",
  },
  text: { flex: 1, color: colors.white, fontSize: 14, lineHeight: 20 },
  action: { color: "#7FE0B5", fontWeight: "700", fontSize: 14 },
});
