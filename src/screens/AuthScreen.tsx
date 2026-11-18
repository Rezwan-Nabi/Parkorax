import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Icon from "../components/Icon";
import { LogoMark } from "../components/Logo";
import { Button, Chip, Notice, Screen, TextField } from "../components/ui";
import { useApp } from "../state/AppState";
import { colors, space, type } from "../theme";
import { formatBdPhone, isBdMobile, isEmail, normalizeBdPhone } from "../utils/format";

/**
 * Demo login / signup (PRD FR-02). Fields are validated on the device only.
 * No OTP is sent, nothing is uploaded, and the password is never stored.
 */
export default function AuthScreen({ onDone }: { onDone: () => void }) {
  const { t, set } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const signup = mode === "signup";

  const validate = () => {
    const e: Record<string, string> = {};
    if (signup && !name.trim()) e.name = t("errName");
    if (signup || method === "phone") {
      if (!isBdMobile(phone)) e.phone = t("errPhone");
    }
    if ((!signup && method === "email") || (signup && email.trim())) {
      if (!isEmail(email)) e.email = t("errEmail");
    }
    if (password.length < 6) e.password = t("errPassword");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    setBusy(true);
    // Short pause so the button's busy state is visible; nothing is sent anywhere.
    setTimeout(() => {
      set("user", {
        name: signup ? name.trim() : "",
        phone: phone ? normalizeBdPhone(phone) : "",
        email: email.trim(),
      });
      set("guest", false);
      setBusy(false);
      onDone();
    }, 500);
  };

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    setErrors({});
  };

  return (
    <Screen bg={colors.white}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <LogoMark size={52} />
          <Text style={[type.display, { marginTop: space.xl }]} accessibilityRole="header">
            {signup ? t("createAccount") : t("welcomeBack")}
          </Text>

          <View style={styles.modeRow} accessibilityRole="tablist">
            {(["login", "signup"] as const).map((m) => (
              <Pressable
                key={m}
                onPress={() => switchMode(m)}
                accessibilityRole="tab"
                accessibilityState={{ selected: mode === m }}
                style={[styles.modeTab, mode === m && styles.modeOn]}
              >
                <Text style={[styles.modeText, mode === m && { color: colors.navy }]}>{t(m)}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ gap: space.lg }}>
            {signup && (
              <TextField
                label={t("fullName")}
                value={name}
                onChangeText={setName}
                autoComplete="name"
                textContentType="name"
                error={errors.name}
              />
            )}

            {!signup && (
              <View style={{ flexDirection: "row", gap: space.sm }}>
                <Chip label={t("usePhone")} icon="phone" selected={method === "phone"} onPress={() => setMethod("phone")} />
                <Chip label={t("useEmail")} icon="mail" selected={method === "email"} onPress={() => setMethod("email")} />
              </View>
            )}

            {(signup || method === "phone") && (
              <TextField
                label={t("phone")}
                value={phone}
                onChangeText={(v) => setPhone(v.replace(/[^\d+\-\s]/g, ""))}
                onBlur={() => isBdMobile(phone) && setPhone(formatBdPhone(phone))}
                placeholder={t("phonePlaceholder")}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                maxLength={17}
                error={errors.phone}
                hint={t("phoneHint")}
              />
            )}

            {(signup || method === "email") && (
              <TextField
                label={signup ? t("emailOptional") : t("email")}
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                error={errors.email}
              />
            )}

            <TextField
              label={t("password")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              autoCapitalize="none"
              autoComplete={signup ? "new-password" : "current-password"}
              error={errors.password}
              right={
                <Pressable
                  onPress={() => setShowPw(!showPw)}
                  accessibilityRole="button"
                  accessibilityLabel={showPw ? t("hidePassword") : t("showPassword")}
                  style={styles.eye}
                >
                  <Icon name={showPw ? "eyeOff" : "eye"} size={20} color={colors.navySoft} />
                </Pressable>
              }
            />

            <Notice text={t("authDemoNote")} icon="info" />

            <Button label={signup ? t("signup") : t("login")} onPress={submit} loading={busy} />
            <Button
              label={t("continueGuest")}
              variant="ghost"
              onPress={() => {
                set("guest", true);
                onDone();
              }}
            />
          </View>

          <Text style={[type.small, { textAlign: "center", marginTop: space.md }]}>
            {signup ? t("haveAccount") : t("noAccount")}{" "}
            <Text style={styles.link} onPress={() => switchMode(signup ? "login" : "signup")} accessibilityRole="link">
              {signup ? t("login") : t("signup")}
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl, paddingBottom: 48 },
  modeRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginTop: space.xl,
    marginBottom: space.xl,
  },
  modeTab: { flex: 1, minHeight: 44, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  modeOn: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  modeText: { fontSize: 15, fontWeight: "700", color: colors.navySoft },
  eye: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  link: { color: colors.green, fontWeight: "700" },
});
