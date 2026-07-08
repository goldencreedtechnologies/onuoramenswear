import {
  BadgeCheck,
  Crown,
  Globe2,
  Hand,
  Ruler,
  Scissors,
  ShieldCheck,
  Sparkles,
  Truck
} from "lucide-react";

export type Product = {
  slug: string;
  name: string;
  edition: string;
  meaning: string;
  price: string;
  image: string;
  images: string[];
  palette: string;
  pageText: string;
  pageMuted: string;
  pagePanel: string;
  darkPage: boolean;
  story: string;
  storyKicker: string;
  storyTitle: string;
  occasion: string;
};

export const products: Product[] = [
  {
    slug: "ebube",
    name: "EBUBE",
    edition: "Black Edition",
    meaning: "Glory",
    price: "$100",
    image: "/brand/product-ebube.png",
    images: ["/brand/product-ebube.png"],
    palette: "#1F1F1F",
    pageText: "#F7F3E8",
    pageMuted: "#D9CDAF",
    pagePanel: "#2C2823",
    darkPage: true,
    story:
      "The black edition speaks in authority. EBUBE is for the man whose entrance changes the room, carrying glory, ceremony, and a sharp evening presence without effort.",
    storyKicker: "EBUBE / Glory",
    storyTitle: "Power that enters softly, then stays in the room.",
    occasion: "Evening, ceremony, command presence"
  },
  {
    slug: "ohuru",
    name: "ỌHỤRỤ",
    edition: "Cream Edition",
    meaning: "Fresh",
    price: "$100",
    image: "/brand/product-ohuru.png",
    images: ["/brand/product-ohuru.png"],
    palette: "#E2D2B1",
    pageText: "#1F1F1F",
    pageMuted: "#5A3A28",
    pagePanel: "#F7F3E8",
    darkPage: false,
    story:
      "Freshness becomes the point of view here. ỌHỤRỤ reads as a clean arrival, a new chapter, and a man moving with clarity, lightness, and calm precision.",
    storyKicker: "ỌHỤRỤ / Fresh",
    storyTitle: "A clean arrival, cut for the man starting again with intention.",
    occasion: "Travel, daytime luxury, resort"
  },
  {
    slug: "ndu",
    name: "NDỤ",
    edition: "Burgundy Edition",
    meaning: "Life",
    price: "$100",
    image: "/brand/product-ndu.png",
    images: ["/brand/product-ndu.png"],
    palette: "#5B1E2D",
    pageText: "#F7F3E8",
    pageMuted: "#E2D2B1",
    pagePanel: "#6B2A3A",
    darkPage: true,
    story:
      "The burgundy edition is a declaration of life. NDỤ carries bloodline, passion, and vitality in a tone that feels warm, expressive, and rooted in legacy.",
    storyKicker: "NDỤ / Life",
    storyTitle: "A rich burgundy pulse for the man who moves with legacy.",
    occasion: "Dinner, celebration, heritage moments"
  },
  {
    slug: "ijeoma",
    name: "IJEỌMA",
    edition: "Blue Edition",
    meaning: "Safe journey",
    price: "$100",
    image: "/brand/product-ijeoma.png",
    images: ["/brand/product-ijeoma.png"],
    palette: "#1C2C46",
    pageText: "#F7F3E8",
    pageMuted: "#D6C9AA",
    pagePanel: "#263954",
    darkPage: true,
    story:
      "Blue carries the feeling of safe passage. IJEỌMA is tailored for travel, destiny, and steady progress, keeping the wearer composed wherever he goes.",
    storyKicker: "IJEỌMA / Safe journey",
    storyTitle: "Travel with calm authority and a sense of direction.",
    occasion: "Travel, work, destination occasions"
  },
  {
    slug: "aja",
    name: "AJA",
    edition: "Forest Edition",
    meaning: "Forest, Sanctuary",
    price: "$100",
    image: "/brand/product-aja.png",
    images: ["/brand/product-aja.png"],
    palette: "#183A2E",
    pageText: "#F7F3E8",
    pageMuted: "#D7C9A9",
    pagePanel: "#21483A",
    darkPage: true,
    story:
      "Forest green turns into sanctuary here. AJA is grounded, protective, and wise, made for a man whose style feels connected to nature and ancestry.",
    storyKicker: "AJA / Sanctuary",
    storyTitle: "Grounded in forest tones, protected by ancestral calm.",
    occasion: "Quiet luxury, day events, creative work"
  },
  {
    slug: "nsuo",
    name: "NSỤO",
    edition: "White Edition",
    meaning: "Water",
    price: "$100",
    image: "/brand/product-nsuo.png",
    images: ["/brand/product-nsuo.png"],
    palette: "#F7F3E8",
    pageText: "#1F1F1F",
    pageMuted: "#5A3A28",
    pagePanel: "#E2D2B1",
    darkPage: false,
    story:
      "Water becomes the mood of the piece. NSỤO is adaptable, calm, and clear, made for men who want softness, confidence, and ritual ease in one look.",
    storyKicker: "NSỤO / Water",
    storyTitle: "Fluid, clear, and composed for effortless ceremony.",
    occasion: "Ceremony, resort, warm-weather elegance"
  }
];

export const craftSteps = [
  { label: "Story", text: "Each piece begins with an Igbo name and a masculine mood." },
  { label: "Fabric", text: "Smooth breathable 4-way stretch selected for comfort and drape." },
  { label: "Cut", text: "Proportions are shaped for a sharp line without stiffness." },
  { label: "Finish", text: "Gold embroidery and hand-finishing bring the house mark forward." },
  { label: "Inspect", text: "Every garment is checked for movement, fit, and finish." }
];

export const valuePillars = [
  { icon: Hand, title: "Handmade in Nigeria", text: "Craft rooted in home, designed for the diaspora and the world." },
  { icon: Ruler, title: "Stretch-tailored fit", text: "A refined silhouette that moves with the body." },
  { icon: Truck, title: "Global dispatch", text: "Tracked fulfilment with a premium post-purchase rhythm." },
  { icon: Crown, title: "Limited runs", text: "Scarcity that protects the meaning of every garment." }
];

export const trustSignals = [
  { icon: ShieldCheck, title: "Secure checkout" },
  { icon: Globe2, title: "International shipping" },
  { icon: BadgeCheck, title: "Inspected finish" },
  { icon: Sparkles, title: "Premium stretch fabric" },
  { icon: Scissors, title: "Hand-finished details" }
];

export const journalPosts = [
  {
    title: "The New Language of African Luxury",
    tag: "Heritage",
    excerpt: "Why modern masculinity can be soft, rooted, mobile, and exacting all at once."
  },
  {
    title: "How Stretch Tailoring Changes the Occasion Set",
    tag: "Craft",
    excerpt: "A technical note on movement, heat, posture, and the end of tailor stress."
  },
  {
    title: "Six Names, Six Ways to Arrive",
    tag: "Style",
    excerpt: "A guide to choosing the edition that matches your mood and moment."
  }
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
