// PRD §9: white / light-grey surfaces, dark navy text, green primary actions,
// amber for limited, red for full. Contrast checked against WCAG AA.
export const colors = {
  white: "#FFFFFF",
  surface: "#F3F5F8", // light grey page background
  surfaceAlt: "#E9EDF2",
  line: "#E1E6ED",
  navy: "#0F1E3D", // headings and body text (15.8:1 on white)
  navySoft: "#4B5875", // secondary text (7.0:1 on white)
  navyMuted: "#6B7690", // tertiary text, used ≥14px (4.7:1 on white)
  green: "#0E7C55", // primary actions, Available (5.3:1 with white text)
  greenDark: "#0A6143",
  greenTint: "#E2F4EC",
  amber: "#9A5B00", // Limited text (5.6:1 on its tint)
  amberTint: "#FFF1D6",
  red: "#B42318", // Full / errors (6.5:1 on white)
  redTint: "#FDE7E5",
  // Map mock
  land: "#EEF1EC",
  water: "#CFE3F1",
  park: "#DDEBD9",
  road: "#FFFFFF",
  roadMajor: "#F7E3B5",
};

export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 };

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

export const type = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: "800" as const, color: colors.navy },
  title: { fontSize: 22, lineHeight: 28, fontWeight: "700" as const, color: colors.navy },
  heading: { fontSize: 17, lineHeight: 23, fontWeight: "700" as const, color: colors.navy },
  body: { fontSize: 15, lineHeight: 22, color: colors.navy },
  small: { fontSize: 13, lineHeight: 18, color: colors.navySoft },
  label: { fontSize: 14, lineHeight: 19, fontWeight: "600" as const, color: colors.navy },
};

export const shadow = {
  card: {
    shadowColor: "#0F1E3D",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  raised: {
    shadowColor: "#0F1E3D",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};

/** Minimum touch target (Android guidance: 48dp). */
export const TOUCH = 48;
