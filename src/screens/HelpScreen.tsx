import React, { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Icon from "../components/Icon";
import { Button, Card, Chip, Header, Notice, Screen, Sheet, TextField } from "../components/ui";
import { parkingById, parkings } from "../data/parkings";
import { useNav } from "../navigation/Navigator";
import { useApp } from "../state/AppState";
import { colors, radius, space, type } from "../theme";
import type { StringKey } from "../i18n/strings";

const FAQ: [StringKey, StringKey][] = [
  ["q1", "a1"],
  ["q2", "a2"],
  ["q3", "a3"],
  ["q4", "a4"],
  ["q5", "a5"],
];

const ISSUES = ["rate", "hours", "location", "closed", "other"] as const;

/** FAQ, contact and a report-incorrect-listing form (PRD FR-15). */
export default function HelpScreen({ reportFor }: { reportFor?: string }) {
  const { t, lang, addReport } = useApp();
  const nav = useNav();
  const [openQ, setOpenQ] = useState<number | null>(0);
  const [listing, setListing] = useState(reportFor ?? "");
  const [issue, setIssue] = useState<string>("");
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [picker, setPicker] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = () => {
    const e: Record<string, string> = {};
    if (!listing) e.listing = t("errListing");
    if (!issue) e.issue = t("errIssue");
    if (text.trim().length < 10) e.text = t("errDescribe");
    setErrors(e);
    if (Object.keys(e).length) return;
    addReport({ parkingId: listing, issue, text: text.trim(), at: Date.now() });
    setSent(true);
    setIssue("");
    setText("");
  };

  const chosen = listing ? parkingById(listing) : undefined;

  return (
    <Screen>
      <Header title={t("help")} onBack={nav.pop} />
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingTop: space.sm, paddingBottom: 48, gap: space.xxl }} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={[type.heading, { marginBottom: space.md }]}>{t("faq")}</Text>
          <View style={styles.faq}>
            {FAQ.map(([q, a], i) => {
              const open = openQ === i;
              return (
                <View key={q} style={[styles.faqItem, i === FAQ.length - 1 && { borderBottomWidth: 0 }]}>
                  <Pressable
                    onPress={() => setOpenQ(open ? null : i)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    style={styles.faqQ}
                  >
                    <Text style={[type.label, { flex: 1 }]}>{t(q)}</Text>
                    <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
                      <Icon name="chevronDown" size={20} color={colors.navySoft} />
                    </View>
                  </Pressable>
                  {open && <Text style={[type.body, styles.faqA]}>{t(a)}</Text>}
                </View>
              );
            })}
          </View>
        </View>

        <View>
          <Text style={[type.heading, { marginBottom: space.md }]}>{t("contact")}</Text>
          <Card style={{ gap: space.sm }}>
            <Pressable
              onPress={() => Linking.openURL(`mailto:${t("contactEmail")}`).catch(() => {})}
              accessibilityRole="link"
              style={styles.contactRow}
            >
              <Icon name="mail" size={22} color={colors.navy} />
              <Text style={[type.body, { flex: 1 }]}>{t("contactEmail")}</Text>
              <Icon name="chevronRight" size={18} color={colors.navyMuted} />
            </Pressable>
            <Text style={type.small}>{t("contactNote")}</Text>
          </Card>
        </View>

        <View>
          <Text style={type.heading}>{t("reportListing")}</Text>
          <Text style={[type.small, { marginTop: 4, marginBottom: space.md }]}>{t("reportBody")}</Text>
          <Card style={{ gap: space.lg }}>
            <View style={{ gap: 6 }}>
              <Text style={type.label}>{t("listing")}</Text>
              <Pressable
                onPress={() => setPicker(true)}
                accessibilityRole="button"
                accessibilityLabel={`${t("listing")}: ${chosen ? chosen.name[lang] : t("selectListing")}`}
                style={[styles.select, !!errors.listing && { borderColor: colors.red }]}
              >
                <Text style={[type.body, { flex: 1 }, !chosen && { color: colors.navyMuted }]} numberOfLines={1}>
                  {chosen ? chosen.name[lang] : t("selectListing")}
                </Text>
                <Icon name="chevronDown" size={20} color={colors.navySoft} />
              </Pressable>
              {errors.listing && <Text style={styles.error}>{errors.listing}</Text>}
            </View>

            <View style={{ gap: 6 }}>
              <Text style={type.label}>{t("issue")}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
                {ISSUES.map((k) => (
                  <Chip key={k} label={t(`issue_${k}` as StringKey)} selected={issue === k} onPress={() => setIssue(k)} />
                ))}
              </View>
              {errors.issue && <Text style={styles.error}>{errors.issue}</Text>}
            </View>

            <TextField
              label={t("describe")}
              value={text}
              onChangeText={(v) => {
                setText(v);
                setSent(false);
              }}
              placeholder={t("describePlaceholder")}
              multiline
              maxLength={500}
              error={errors.text}
            />

            {sent && <Notice text={t("reportSaved")} icon="check" />}
            <Button label={t("sendReport")} onPress={submit} />
          </Card>
        </View>
      </ScrollView>

      <Sheet visible={picker} onClose={() => setPicker(false)} title={t("selectListing")}>
        {parkings.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => {
              setListing(p.id);
              setPicker(false);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: listing === p.id }}
            style={styles.pickRow}
          >
            <View style={{ flex: 1 }}>
              <Text style={type.body}>{p.name[lang]}</Text>
              <Text style={type.small}>{p.area[lang]}</Text>
            </View>
            {listing === p.id && <Icon name="check" size={20} color={colors.green} />}
          </Pressable>
        ))}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  faq: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, paddingHorizontal: space.lg },
  faqItem: { borderBottomWidth: 1, borderBottomColor: colors.line },
  faqQ: { flexDirection: "row", alignItems: "center", gap: space.md, minHeight: 56 },
  faqA: { color: colors.navySoft, paddingBottom: space.lg },
  contactRow: { flexDirection: "row", alignItems: "center", gap: space.md, minHeight: 48 },
  select: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  error: { fontSize: 13, lineHeight: 18, color: colors.red },
  pickRow: { flexDirection: "row", alignItems: "center", minHeight: 60, borderBottomWidth: 1, borderBottomColor: colors.line, gap: space.md },
});
