/**
 * Dhaka-only SAMPLE parking dataset (PRD §7).
 *
 * Every name, rate, opening time, rating and space count below is fictional
 * placeholder data for UI demonstration. Listing names are illustrative labels
 * and do not claim that any operator offers public parking at these rates.
 * Verify everything with parking operators before any public launch.
 */

export type Vehicle = "car" | "motorcycle";
export type Availability = "available" | "limited" | "full";
export type Facility =
  | "cctv"
  | "guard"
  | "covered"
  | "ev"
  | "restroom"
  | "accessible"
  | "night"
  | "valet";

export type Bilingual = { en: string; bn: string };

export type VehicleRate = {
  /** Sample hourly rate in BDT. */
  rate: number;
  /** Sample spaces shown as free right now. */
  free: number;
  /** Sample total spaces for this vehicle type. */
  total: number;
};

export type Parking = {
  id: string;
  name: Bilingual;
  area: Bilingual;
  /** Road or landmark, shown as "Area, road/landmark, Dhaka". */
  landmark: Bilingual;
  lat: number;
  lng: number;
  /** Minutes after midnight, Bangladesh Standard Time. 0–1440 means 24 hours. */
  opens: number;
  closes: number;
  rating: number;
  reviews: number;
  vehicles: Partial<Record<Vehicle, VehicleRate>>;
  facilities: Facility[];
  /** Two tones used by the illustrated sample photo. */
  tone: [string, string];
  featured?: boolean;
};

export const parkings: Parking[] = [
  {
    id: "bashundhara-city",
    name: { en: "Bashundhara City Area", bn: "বসুন্ধরা সিটি এলাকা" },
    area: { en: "Panthapath", bn: "পান্থপথ" },
    landmark: { en: "Panthapath Road, near Bashundhara City", bn: "পান্থপথ রোড, বসুন্ধরা সিটির কাছে" },
    lat: 23.7509,
    lng: 90.3905,
    opens: 9 * 60,
    closes: 22 * 60,
    rating: 4.4,
    reviews: 312,
    vehicles: {
      car: { rate: 50, free: 46, total: 220 },
      motorcycle: { rate: 20, free: 18, total: 160 },
    },
    facilities: ["cctv", "guard", "covered", "restroom", "accessible"],
    tone: ["#2E6F9E", "#A9CBE3"],
    featured: true,
  },
  {
    id: "jamuna-future-park",
    name: { en: "Jamuna Future Park Area", bn: "যমুনা ফিউচার পার্ক এলাকা" },
    area: { en: "Kuril", bn: "কুড়িল" },
    landmark: { en: "Progoti Sarani, near Jamuna Future Park", bn: "প্রগতি সরণি, যমুনা ফিউচার পার্কের কাছে" },
    lat: 23.8135,
    lng: 90.424,
    opens: 10 * 60,
    closes: 22 * 60,
    rating: 4.6,
    reviews: 541,
    vehicles: {
      car: { rate: 60, free: 120, total: 400 },
      motorcycle: { rate: 25, free: 64, total: 250 },
    },
    facilities: ["cctv", "guard", "covered", "ev", "restroom", "accessible", "valet"],
    tone: ["#5B4B9A", "#C9C0EA"],
    featured: true,
  },
  {
    id: "dhanmondi",
    name: { en: "Dhanmondi Parking Demo", bn: "ধানমন্ডি পার্কিং ডেমো" },
    area: { en: "Dhanmondi", bn: "ধানমন্ডি" },
    landmark: { en: "Satmasjid Road, near Road 27", bn: "সাতমসজিদ রোড, রোড ২৭-এর কাছে" },
    lat: 23.7461,
    lng: 90.3742,
    opens: 8 * 60,
    closes: 23 * 60,
    rating: 4.2,
    reviews: 128,
    vehicles: {
      car: { rate: 40, free: 6, total: 60 },
      motorcycle: { rate: 15, free: 22, total: 80 },
    },
    facilities: ["cctv", "guard", "night"],
    tone: ["#2F7D5B", "#B9DEC9"],
    featured: true,
  },
  {
    id: "gulshan-2",
    name: { en: "Gulshan Parking Demo", bn: "গুলশান পার্কিং ডেমো" },
    area: { en: "Gulshan 2", bn: "গুলশান ২" },
    landmark: { en: "Gulshan Avenue, near Gulshan 2 Circle", bn: "গুলশান এভিনিউ, গুলশান ২ গোলচত্বরের কাছে" },
    lat: 23.7948,
    lng: 90.4143,
    opens: 0,
    closes: 1440,
    rating: 4.5,
    reviews: 207,
    vehicles: {
      car: { rate: 50, free: 31, total: 140 },
      motorcycle: { rate: 20, free: 4, total: 40 },
    },
    facilities: ["cctv", "guard", "covered", "ev", "night", "valet"],
    tone: ["#1F3B6E", "#AFC1E0"],
  },
  {
    id: "mirpur-10",
    name: { en: "Mirpur Parking Demo", bn: "মিরপুর পার্কিং ডেমো" },
    area: { en: "Mirpur 10", bn: "মিরপুর ১০" },
    landmark: { en: "Begum Rokeya Sarani, near Mirpur 10 Circle", bn: "বেগম রোকেয়া সরণি, মিরপুর ১০ গোলচত্বরের কাছে" },
    lat: 23.8069,
    lng: 90.3687,
    opens: 7 * 60,
    closes: 23 * 60,
    rating: 3.9,
    reviews: 96,
    vehicles: {
      car: { rate: 40, free: 14, total: 50 },
      motorcycle: { rate: 15, free: 58, total: 120 },
    },
    facilities: ["cctv", "guard", "night"],
    tone: ["#8A5A2B", "#E8CFB2"],
  },
  {
    id: "mohakhali",
    name: { en: "Mohakhali Parking Demo", bn: "মহাখালী পার্কিং ডেমো" },
    area: { en: "Mohakhali", bn: "মহাখালী" },
    landmark: { en: "Bir Uttam AK Khandakar Road, near Mohakhali Flyover", bn: "বীর উত্তম এ কে খন্দকার সড়ক, মহাখালী ফ্লাইওভারের কাছে" },
    lat: 23.7781,
    lng: 90.4006,
    opens: 8 * 60,
    closes: 22 * 60,
    rating: 4.0,
    reviews: 74,
    vehicles: {
      car: { rate: 40, free: 0, total: 45 },
      motorcycle: { rate: 15, free: 9, total: 60 },
    },
    facilities: ["cctv", "covered", "restroom"],
    tone: ["#6B6F7A", "#D3D6DD"],
  },
  {
    id: "banani",
    name: { en: "Banani Parking Demo", bn: "বনানী পার্কিং ডেমো" },
    area: { en: "Banani", bn: "বনানী" },
    landmark: { en: "Road 11, near Banani Lake", bn: "রোড ১১, বনানী লেকের কাছে" },
    lat: 23.7937,
    lng: 90.4066,
    opens: 10 * 60,
    closes: 24 * 60,
    rating: 4.3,
    reviews: 158,
    vehicles: {
      car: { rate: 50, free: 9, total: 70 },
      motorcycle: { rate: 20, free: 25, total: 60 },
    },
    facilities: ["cctv", "guard", "valet", "night", "accessible"],
    tone: ["#A1453D", "#EBC2BD"],
  },
  {
    id: "uttara",
    name: { en: "Uttara Parking Demo", bn: "উত্তরা পার্কিং ডেমো" },
    area: { en: "Uttara", bn: "উত্তরা" },
    landmark: { en: "Sector 7, near Rabindra Sarani", bn: "সেক্টর ৭, রবীন্দ্র সরণির কাছে" },
    lat: 23.8759,
    lng: 90.3795,
    opens: 7 * 60,
    closes: 22 * 60,
    rating: 4.1,
    reviews: 83,
    vehicles: {
      car: { rate: 40, free: 38, total: 90 },
      motorcycle: { rate: 15, free: 40, total: 100 },
    },
    facilities: ["cctv", "guard", "covered", "restroom"],
    tone: ["#2C7A7B", "#B6E0DF"],
  },
  {
    id: "motijheel",
    name: { en: "Motijheel Parking Demo", bn: "মতিঝিল পার্কিং ডেমো" },
    area: { en: "Motijheel", bn: "মতিঝিল" },
    landmark: { en: "Commercial Area, near Shapla Chattar", bn: "বাণিজ্যিক এলাকা, শাপলা চত্বরের কাছে" },
    lat: 23.733,
    lng: 90.4172,
    opens: 8 * 60,
    closes: 20 * 60,
    rating: 3.8,
    reviews: 61,
    vehicles: {
      car: { rate: 40, free: 0, total: 80 },
      motorcycle: { rate: 15, free: 0, total: 70 },
    },
    facilities: ["cctv", "guard"],
    tone: ["#4A4F63", "#C8CCD8"],
  },
  {
    id: "tejgaon",
    name: { en: "Tejgaon Parking Demo", bn: "তেজগাঁও পার্কিং ডেমো" },
    area: { en: "Tejgaon", bn: "তেজগাঁও" },
    landmark: { en: "Tejgaon Link Road, near Satrasta", bn: "তেজগাঁও লিংক রোড, সাতরাস্তার কাছে" },
    lat: 23.7639,
    lng: 90.4005,
    opens: 0,
    closes: 1440,
    rating: 4.0,
    reviews: 49,
    vehicles: {
      car: { rate: 40, free: 22, total: 60 },
      motorcycle: { rate: 15, free: 30, total: 50 },
    },
    facilities: ["cctv", "guard", "night", "ev"],
    tone: ["#3C6E3F", "#C3DEC4"],
  },
];

export const parkingById = (id: string) => parkings.find((p) => p.id === id);

/** Sample availability label, derived from the sample free/total counts. */
export function availabilityOf(v?: VehicleRate): Availability {
  if (!v || v.free <= 0) return "full";
  if (v.free / v.total <= 0.15 || v.free <= 5) return "limited";
  return "available";
}

/**
 * Reference points for the location selector. Distances are measured from the
 * selected point. The device's GPS is never read.
 */
export type Place = { id: string; name: Bilingual; lat: number; lng: number };

export const places: Place[] = [
  { id: "farmgate", name: { en: "Farmgate", bn: "ফার্মগেট" }, lat: 23.7577, lng: 90.3897 },
  { id: "panthapath", name: { en: "Panthapath", bn: "পান্থপথ" }, lat: 23.7509, lng: 90.3905 },
  { id: "dhanmondi", name: { en: "Dhanmondi", bn: "ধানমন্ডি" }, lat: 23.7461, lng: 90.3742 },
  { id: "gulshan", name: { en: "Gulshan", bn: "গুলশান" }, lat: 23.7925, lng: 90.4163 },
  { id: "banani", name: { en: "Banani", bn: "বনানী" }, lat: 23.7937, lng: 90.4066 },
  { id: "mohakhali", name: { en: "Mohakhali", bn: "মহাখালী" }, lat: 23.7781, lng: 90.4006 },
  { id: "mirpur", name: { en: "Mirpur 10", bn: "মিরপুর ১০" }, lat: 23.8069, lng: 90.3687 },
  { id: "kuril", name: { en: "Kuril", bn: "কুড়িল" }, lat: 23.8135, lng: 90.424 },
  { id: "uttara", name: { en: "Uttara", bn: "উত্তরা" }, lat: 23.8759, lng: 90.3795 },
  { id: "motijheel", name: { en: "Motijheel", bn: "মতিঝিল" }, lat: 23.733, lng: 90.4172 },
  { id: "tejgaon", name: { en: "Tejgaon", bn: "তেজগাঁও" }, lat: 23.7639, lng: 90.4005 },
];

export const DEFAULT_PLACE = "farmgate";
