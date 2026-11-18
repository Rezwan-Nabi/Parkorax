import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import Icon, { type IconName } from "../components/Icon";
import { useToast } from "../components/Toast";
import { Button, ConfirmDialog, Screen, Sheet, TextField } from "../components/ui";
import { useNav } from "../navigation/Navigator";
import { useApp } from "../state/AppState";
import { colors, radius, space, type } from "../theme";
import { formatBdPhone, isBdMobile, isEmail, normalizeBdPhone, type Lang } from "../utils/format";

/** Demo profile, vehicle preference, language and settings (PRD FR-14). */
export default function ProfileScreen() {
  const app = useApp();
  const { t, lang, user, vehicle, reminders, set, logOut, resetDemo } = app;
  const nav = useNav();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const display = user?.name || (user ? formatBdPhone(user.phone, lang) || user.email : t("guest"));
  const initials = (user?.name || (user ? "P" : "G"))
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: 48 }}>
        <Text style={type.display} accessibilityRole="header">
          {t("profile")}
        </Text>

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.heading} numberOfLines={1}>
              {display}
            </Text>
            {user ? (
              <Text style={type.small} numberOfLines={1}>
                {[user.name && user.phone ? formatBdPhone(user.phone, lang) : "", user.name || user.phone ? user.email : ""].filter(Boolean).join(" · ") || t("demo")}
              </Text>
            ) : (
              <Text style={type.small}>{t("guestNote")}</Text>
            )}
          </View>
        </View>
        {user ? (
          <Button label={t("editProfile")} icon="edit" variant="secondary" onPress={() => setEditing(true)} style={{ marginTop: space.md }} />
        ) : (
          <Button label={t("signIn")} onPress={logOut} style={{ marginTop: space.md }} />
        )}

        <Group title={t("settings")}>
          <Row
            icon={vehicle === "motorcycle" ? "motorcycle" : "car"}
            label={t("defaultVehicle")}
            value={t(vehicle ?? "car")}
            onPress={() => nav.push({ name: "Vehicle" })}
          />
          <View style={styles.row}>
            <Icon name="globe" size={22} color={colors.navy} />
            <Text style={[type.body, { flex: 1 }]}>{t("language")}</Text>
            <View style={styles.langSwitch} accessibilityRole="radiogroup" accessibilityLabel={t("language")}>
              {(["en", "bn"] as Lang[]).map((l) => (
                <Pressable
                  key={l}
                  onPress={() => set("lang", l)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: lang === l }}
                  style={[styles.langBtn, lang === l && styles.langOn]}
                >
                  <Text style={[styles.langText, lang === l && { color: colors.white }]}>{l === "en" ? "English" : "বাংলা"}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.row}>
            <Icon name="bell" size={22} color={colors.navy} />
            <View style={{ flex: 1 }}>
              <Text style={type.body}>{t("reminders")}</Text>
              <Text style={type.small}>{t("remindersDesc")}</Text>
            </View>
            <Switch
              value={reminders}
              onValueChange={(v) => set("reminders", v)}
              trackColor={{ true: colors.green, false: colors.line }}
              thumbColor={colors.white}
              accessibilityLabel={t("reminders")}
            />
          </View>
        </Group>

        <Group title={t("helpSupport")}>
          <Row icon="help" label={t("help")} onPress={() => nav.push({ name: "Help" })} />
          <Row icon="flag" label={t("reportListing")} onPress={() => nav.push({ name: "Help", reportFor: "" })} />
        </Group>

        <Group title={t("aboutApp")}>
          <Text style={[type.small, { paddingVertical: space.sm }]}>{t("demoNotice")}</Text>
          <Row icon="trash" label={t("resetDemo")} sub={t("resetDemoDesc")} onPress={() => setConfirmReset(true)} danger />
          {user && <Row icon="logout" label={t("logOut")} onPress={logOut} />}
        </Group>

        <Text style={[type.small, { textAlign: "center", marginTop: space.xl }]}>{t("version", { v: "1.0.0" })}</Text>
      </ScrollView>

      <EditProfileSheet
        visible={editing}
        onClose={() => setEditing(false)}
        onSaved={() => toast.show({ message: t("profileSaved") })}
      />
      <ConfirmDialog
        visible={confirmReset}
        title={t("resetConfirm")}
        body={t("resetDemoDesc")}
        confirmLabel={t("reset")}
        cancelLabel={t("cancel")}
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          resetDemo();
        }}
      />
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: space.xxl }}>
      <Text style={[type.small, { fontWeight: "700", marginBottom: space.sm }]}>{title}</Text>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  sub,
  value,
  onPress,
  danger,
}: {
  icon: IconName;
  label: string;
  sub?: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surface }]}>
      <Icon name={icon} size={22} color={danger ? colors.red : colors.navy} />
      <View style={{ flex: 1 }}>
        <Text style={[type.body, danger && { color: colors.red }]}>{label}</Text>
        {sub && <Text style={type.small}>{sub}</Text>}
      </View>
      {value && <Text style={[type.small, { fontWeight: "700" }]}>{value}</Text>}
      <Icon name="chevronRight" size={18} color={colors.navyMuted} />
    </Pressable>
  );
}

function EditProfileSheet({ visible, onClose, onSaved }: { visible: boolean; onClose: () => void; onSaved: () => void }) {
  const { t, user, set } = useApp();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ? formatBdPhone(user.phone) : "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (visible) {
      setName(user?.name ?? "");
      setPhone(user?.phone ? formatBdPhone(user.phone) : "");
      setEmail(user?.email ?? "");
      setErrors({});
    }
  }, [visible, user]);

  const save = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t("errName");
    if (phone.trim() && !isBdMobile(phone)) e.phone = t("errPhone");
    if (email.trim() && !isEmail(email)) e.email = t("errEmail");
    setErrors(e);
    if (Object.keys(e).length) return;
    set("user", { name: name.trim(), phone: phone ? normalizeBdPhone(phone) : "", email: email.trim() });
    onClose();
    onSaved();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t("editProfile")}
      footer={<Button label={t("saveChanges")} onPress={save} />}
    >
      <View style={{ gap: space.lg, paddingTop: space.sm }}>
        <TextField label={t("fullName")} value={name} onChangeText={setName} error={errors.name} autoComplete="name" />
        <TextField
          label={t("phone")}
          value={phone}
          onChangeText={setPhone}
          onBlur={() => isBdMobile(phone) && setPhone(formatBdPhone(phone))}
          keyboardType="phone-pad"
          placeholder={t("phonePlaceholder")}
          hint={t("phoneHint")}
          error={errors.phone}
        />
        <TextField
          label={t("emailOptional")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    marginTop: space.xl,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.white, fontSize: 20, fontWeight: "800" },
  group: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, paddingHorizontal: space.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: 60,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  langSwitch: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 10, padding: 3 },
  langBtn: { minHeight: 36, paddingHorizontal: 12, borderRadius: 8, justifyContent: "center" },
  langOn: { backgroundColor: colors.navy },
  langText: { fontSize: 14, fontWeight: "700", color: colors.navySoft },
});
