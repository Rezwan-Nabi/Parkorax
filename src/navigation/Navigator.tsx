import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, BackHandler, Easing, StyleSheet, View } from "react-native";
import type { BookingDraft } from "../screens/BookingScreen";

/**
 * A small dependency-free navigator: five bottom tabs (PRD §6) with a stack
 * of detail screens pushed on top. Android's back button pops the stack,
 * then returns to Home, then leaves the app.
 */

export type Tab = "home" | "explore" | "bookings" | "saved" | "profile";

export type ExploreParams = { query?: string; view?: "list" | "map"; key: number };

export type Route =
  | { name: "Details"; id: string }
  | { name: "Booking"; id: string }
  | { name: "Payment"; draft: BookingDraft }
  | { name: "Confirmation"; bookingId: string; fresh: boolean }
  | { name: "Help"; reportFor?: string }
  | { name: "Vehicle" };

type Nav = {
  tab: Tab;
  stack: Route[];
  exploreParams: ExploreParams | null;
  push: (r: Route) => void;
  pop: () => void;
  /** Replace every pushed screen with one route (e.g. after a confirmed booking). */
  resetTo: (r: Route) => void;
  /** Leave all pushed screens and go to a tab. */
  goTab: (tab: Tab) => void;
  openExplore: (p: Omit<ExploreParams, "key">) => void;
};

const NavCtx = createContext<Nav | null>(null);

export function useNav(): Nav {
  const v = useContext(NavCtx);
  if (!v) throw new Error("useNav must be used inside NavigationRoot");
  return v;
}

type Props = {
  renderTab: (tab: Tab) => React.ReactNode;
  renderRoute: (route: Route) => React.ReactNode;
  tabBar: React.ReactNode;
};

export function NavigationRoot({ renderTab, renderRoute, tabBar }: Props) {
  const [tab, setTab] = useState<Tab>("home");
  const [stack, setStack] = useState<Route[]>([]);
  const [exploreParams, setExploreParams] = useState<ExploreParams | null>(null);

  const push = useCallback((r: Route) => setStack((s) => [...s, r]), []);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const resetTo = useCallback((r: Route) => setStack([r]), []);
  const goTab = useCallback((t: Tab) => {
    setStack([]);
    setExploreParams(null);
    setTab(t);
  }, []);
  const openExplore = useCallback((p: Omit<ExploreParams, "key">) => {
    setExploreParams({ ...p, key: Date.now() });
    setStack([]);
    setTab("explore");
  }, []);

  const state = useRef({ tab, depth: stack.length });
  state.current = { tab, depth: stack.length };

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (state.current.depth > 0) {
        pop();
        return true;
      }
      if (state.current.tab !== "home") {
        setTab("home");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [pop]);

  const nav = useMemo<Nav>(
    () => ({ tab, stack, exploreParams, push, pop, resetTo, goTab, openExplore }),
    [tab, stack, exploreParams, push, pop, resetTo, goTab, openExplore],
  );

  const top = stack[stack.length - 1];

  return (
    <NavCtx.Provider value={nav}>
      <View style={styles.root}>
        {top ? (
          <SlideIn key={stack.length + top.name}>{renderRoute(top)}</SlideIn>
        ) : (
          <>
            <View style={styles.flex}>{renderTab(tab)}</View>
            {tabBar}
          </>
        )}
      </View>
    </NavCtx.Provider>
  );
}

/** Pushed screens slide in a short distance from the right. */
function SlideIn({ children }: { children: React.ReactNode }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress]);
  return (
    <Animated.View
      style={[
        styles.flex,
        {
          opacity: progress,
          transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
});
