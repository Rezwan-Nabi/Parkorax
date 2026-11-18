import React, { useCallback, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import TabBar from "./src/components/TabBar";
import { ToastProvider } from "./src/components/Toast";
import { NavigationRoot, useNav, type Route, type Tab } from "./src/navigation/Navigator";
import AuthScreen from "./src/screens/AuthScreen";
import BookingScreen from "./src/screens/BookingScreen";
import BookingsScreen from "./src/screens/BookingsScreen";
import ConfirmationScreen from "./src/screens/ConfirmationScreen";
import DetailsScreen from "./src/screens/DetailsScreen";
import ExploreScreen from "./src/screens/ExploreScreen";
import HelpScreen from "./src/screens/HelpScreen";
import HomeScreen from "./src/screens/HomeScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SavedScreen from "./src/screens/SavedScreen";
import SplashScreen from "./src/screens/SplashScreen";
import VehicleSelectScreen from "./src/screens/VehicleSelectScreen";
import { AppStateProvider, useApp } from "./src/state/AppState";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <ToastProvider>
          <Root />
        </ToastProvider>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

/**
 * Launch flow (PRD §8.1): Splash → Onboarding → Login/Signup → Vehicle →
 * main app. Finished steps are remembered on the device.
 */
function Root() {
  const { onboarded, user, guest, vehicle, set } = useApp();
  const [splashDone, setSplashDone] = useState(false);
  const finishSplash = useCallback(() => setSplashDone(true), []);

  let screen: React.ReactNode;
  if (!splashDone) screen = <SplashScreen onDone={finishSplash} />;
  else if (!onboarded) screen = <OnboardingScreen onDone={() => set("onboarded", true)} />;
  else if (!user && !guest) screen = <AuthScreen onDone={() => {}} />;
  else if (!vehicle) screen = <VehicleSelectScreen onDone={() => {}} />;
  else screen = <NavigationRoot renderTab={renderTab} renderRoute={(r) => <RouteScreen route={r} />} tabBar={<TabBar />} />;

  return (
    <>
      <StatusBar style={splashDone ? "dark" : "light"} />
      {screen}
    </>
  );
}

function renderTab(tab: Tab) {
  switch (tab) {
    case "home":
      return <HomeScreen />;
    case "explore":
      return <ExploreScreen />;
    case "bookings":
      return <BookingsScreen />;
    case "saved":
      return <SavedScreen />;
    case "profile":
      return <ProfileScreen />;
  }
}

function RouteScreen({ route }: { route: Route }) {
  const nav = useNav();
  switch (route.name) {
    case "Details":
      return <DetailsScreen id={route.id} />;
    case "Booking":
      return <BookingScreen id={route.id} />;
    case "Payment":
      return <PaymentScreen draft={route.draft} />;
    case "Confirmation":
      return <ConfirmationScreen bookingId={route.bookingId} fresh={route.fresh} />;
    case "Help":
      return <HelpScreen reportFor={route.reportFor} />;
    case "Vehicle":
      return <VehicleSelectScreen onDone={nav.pop} onBack={nav.pop} />;
  }
}
