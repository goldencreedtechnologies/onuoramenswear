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

import { DELIVERY_COPY, PRODUCT_INCLUSION_LABEL, PRODUCT_PRICES, PRODUCT_TYPE_LABEL } from "@/data/site-config";

export type ProductFamily = "original" | "button" | "buttonless";

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
  family: ProductFamily;
  colorName: string;
  colorValue: string;
  modelName: string;
  details: string;
  fit: string;
  fabricCare: string;
  delivery: string;
};

type ProductInput = Omit<Product, "image" | "images" | "darkPage" | "price" | "delivery"> & {
  includeOriginalRender?: boolean;
  leadImages?: string[];
};

function productImages(
  family: ProductFamily,
  slug: string,
  includeOriginalRender = false
) {
  const base = `/brand/products/${family}/${slug}/${slug}`;
  const images = [
    `${base}-front.webp`,
    `${base}-mid.webp`,
    `${base}-angle.webp`,
    `${base}-back.webp`
  ];

  if (includeOriginalRender) {
    images.push(`${base}-original.png`);
  }

  return images;
}

function createProduct(input: ProductInput): Product {
  const { leadImages = [], includeOriginalRender, ...product } = input;
  const images = [
    ...leadImages,
    ...productImages(input.family, input.slug, includeOriginalRender)
  ];

  const cleanFabricCare = product.fabricCare
    .replace(/\bpremium\s+/gi, "")
    .replace(/\bluxury\s+/gi, "");

  return {
    ...product,
    price: `$${PRODUCT_PRICES.USD}`,
    details: `${PRODUCT_TYPE_LABEL}. ${PRODUCT_INCLUSION_LABEL}. ${product.details}`,
    fabricCare: cleanFabricCare,
    delivery: DELIVERY_COPY,
    image: images[0],
    images,
    darkPage: product.pageText.toLowerCase() !== "#1f1f1f"
  };
}

export const products: Product[] = [
  createProduct({
    slug: "ebube",
    name: "EBUBE",
    edition: "Black Edition",
    meaning: "Glory",
    palette: "#1F1F1F",
    pageText: "#F7F3E8",
    pageMuted: "#D9CDAF",
    pagePanel: "#2C2823",
    family: "original",
    colorName: "Black",
    colorValue: "#1F1F1F",
    modelName: "Kharn",
    includeOriginalRender: true,
    story:
      "EBUBE translates glory into restraint. Its black field sharpens the gold house mark and gives the wearer the quiet authority of ceremonial dress without the stiffness. It is made for the man who does not announce his presence; the room does that for him.",
    storyKicker: "EBUBE / Glory",
    storyTitle: "Power that enters softly, then stays in the room.",
    occasion: "evening receptions, ceremonies, and command-presence dressing",
    details:
      "A two-piece black stretch-tailored set with a clean V neckline, three-quarter sleeve, discreet chest pocket, tapered trouser, and the ỌNUỌRA gold signature placed as a mark of earned distinction.",
    fit:
      "Straight through the shoulder with considered ease at the torso and a softly tapered trouser. The stretch structure keeps the line precise while allowing seated comfort and unrestricted movement.",
    fabricCare:
      "breathable four-way stretch suiting. Gentle cold wash with similar dark colours, reshape while damp, dry flat, and cool iron inside out. Do not bleach or tumble dry.",
  }),
  createProduct({
    slug: "ohuru",
    name: "ỌHỤRỤ",
    edition: "Cream Edition",
    meaning: "Fresh",
    palette: "#F5E6C8",
    pageText: "#1F1F1F",
    pageMuted: "#654321",
    pagePanel: "#FFF9ED",
    family: "original",
    colorName: "Cream",
    colorValue: "#F5E6C8",
    modelName: "Charlie",
    includeOriginalRender: true,
    story:
      "ỌHỤRỤ is the feeling of beginning well. Cream softens the tailored line without weakening it, creating a look that feels open, optimistic, and assured. It belongs to clear mornings, new chapters, and the kind of arrival that carries no old weight.",
    storyKicker: "ỌHỤRỤ / Fresh",
    storyTitle: "A clean arrival, cut for the man beginning with intention.",
    occasion: "day ceremonies, travel, resort settings, and considered celebrations",
    details:
      "A cream two-piece set defined by an open V neckline, balanced three-quarter sleeve, practical chest pocket, tapered trouser, and gold ỌNUỌRA embroidery that sits warmly against the pale cloth.",
    fit:
      "Relaxed-tailored through the body with a clean shoulder and controlled trouser taper. Four-way stretch creates ease without the excess volume of conventional resort dressing.",
    fabricCare:
      "Breathable stretch suiting in a light cream tone. Wash gently and separately, avoid optical brighteners, dry flat away from direct heat, and press on a cool setting inside out.",
  }),
  createProduct({
    slug: "ndu",
    name: "NDỤ",
    edition: "Burgundy Edition",
    meaning: "Life",
    palette: "#3B0A1A",
    pageText: "#F7F3E8",
    pageMuted: "#E6C7B6",
    pagePanel: "#551427",
    family: "original",
    colorName: "Burgundy",
    colorValue: "#3B0A1A",
    modelName: "Idris",
    leadImages: ["/brand/products/original/ndu/ndu-studio-idris.webp"],
    includeOriginalRender: true,
    story:
      "NDỤ is cut around the pulse of life: bloodline, appetite, movement, and memory. Burgundy gives the silhouette emotional depth, while the precise line keeps its passion composed. It is an outfit for celebrating what has been inherited and what is still becoming.",
    storyKicker: "NDỤ / Life",
    storyTitle: "A deep burgundy pulse for the man who moves with legacy.",
    occasion: "dinners, milestone celebrations, weddings, and heritage moments",
    details:
      "A burgundy stretch-tailored top and trouser with a sculpted V neckline, three-quarter sleeve, chest pocket, tapered leg, and signature gold embroidery positioned as a point of light.",
    fit:
      "An easy tailored body sits cleanly over the waistband, while the trouser narrows gradually through the leg. Stretch recovery preserves the shape through long celebrations and travel.",
    fabricCare:
      "Colour-rich four-way stretch suiting. Cold gentle wash with like colours, use mild detergent, dry flat in shade, and cool iron inside out to protect the burgundy depth and gold finish.",
  }),
  createProduct({
    slug: "ijeoma",
    name: "IJEỌMA",
    edition: "Blue Edition",
    meaning: "Safe journey",
    palette: "#0D3B66",
    pageText: "#F7F3E8",
    pageMuted: "#C9D9E7",
    pagePanel: "#154D7A",
    family: "original",
    colorName: "Blue",
    colorValue: "#0D3B66",
    modelName: "Charlie",
    includeOriginalRender: true,
    story:
      "IJEỌMA carries the Igbo blessing for a safe journey. Its blue is steady rather than loud: a colour of direction, distance, and composure. The silhouette is designed for a man whose life crosses rooms, cities, and borders without losing its centre.",
    storyKicker: "IJEỌMA / Safe journey",
    storyTitle: "Travel with calm authority and a clear sense of direction.",
    occasion: "travel days, work, destination events, and formal daytime plans",
    details:
      "A blue two-piece travel-minded set with a clean V neckline, three-quarter sleeve, chest pocket, tapered trouser, and gold ỌNUỌRA insignia. The uncluttered construction makes it easy to style across destinations.",
    fit:
      "Cut with enough room for movement through the shoulder, seat, and thigh, then refined through the leg. The fabric rebounds after sitting, helping the outfit arrive as composed as its wearer.",
    fabricCare:
      "Breathable four-way stretch fabric selected for travel resilience. Gentle cold wash, dry flat, steam lightly or cool iron inside out, and store on a broad hanger between journeys.",
  }),
  createProduct({
    slug: "aja",
    name: "AJA",
    edition: "Forest Edition",
    meaning: "Forest, sanctuary",
    palette: "#0B1516",
    pageText: "#F7F3E8",
    pageMuted: "#C9D4C9",
    pagePanel: "#18302B",
    family: "original",
    colorName: "Forest",
    colorValue: "#0B1516",
    modelName: "Edson",
    includeOriginalRender: true,
    story:
      "AJA turns forest green into sanctuary. The colour feels grounded, protective, and quietly wise, connecting modern dress to the steadiness of land and ancestry. It is made for a man whose confidence comes from knowing where he stands.",
    storyKicker: "AJA / Sanctuary",
    storyTitle: "Grounded in forest tones, protected by ancestral calm.",
    occasion: "creative work, day events, private gatherings, and quiet confidence",
    details:
      "A forest-toned stretch set with a clean V neckline, three-quarter sleeve, functional chest pocket, precise trouser taper, and gold ỌNUỌRA mark set against the deep green.",
    fit:
      "Balanced through the torso with a relaxed shoulder and controlled hem. The trouser follows the body without clinging, supported by four-way movement and reliable shape recovery.",
    fabricCare:
      "stretch suiting with a deep forest finish. Wash cold with dark colours, avoid bleach, dry flat in shade, and press from the reverse on a cool setting.",
  }),
  createProduct({
    slug: "nsuo",
    name: "NSỤO",
    edition: "White Edition",
    meaning: "Water",
    palette: "#F7F3E8",
    pageText: "#1F1F1F",
    pageMuted: "#654321",
    pagePanel: "#FFFFFF",
    family: "original",
    colorName: "White",
    colorValue: "#F7F3E8",
    modelName: "Edson",
    includeOriginalRender: true,
    story:
      "NSỤO takes its character from water: clear, adaptable, and composed. White gives the garment a ceremonial stillness, while stretch construction keeps it fluid in motion. It is softness with discipline, designed for men who understand that ease can carry authority.",
    storyKicker: "NSỤO / Water",
    storyTitle: "Fluid, clear, and composed for effortless ceremony.",
    occasion: "traditional ceremonies, warm-weather events, resort, and celebration",
    details:
      "A white two-piece set with a refined V neckline, three-quarter sleeve, chest pocket, tapered trouser, and a gold embroidered house signature that gives the clean surface its focal point.",
    fit:
      "A smooth line through the chest and waist with natural ease at the hip and thigh. Four-way stretch supports fluid movement while the tapered hem keeps the finish formal.",
    fabricCare:
      "Breathable white stretch suiting. Wash separately on a gentle cold cycle with mild detergent, never use chlorine bleach, dry flat, and cool iron inside out beneath a clean cloth.",
  }),
  createProduct({
    slug: "ndb1",
    name: "NDB1",
    edition: "Cobalt Button Edition",
    meaning: "Composure",
    palette: "#0D3B66",
    pageText: "#F7F3E8",
    pageMuted: "#C9D9E7",
    pagePanel: "#154D7A",
    family: "button",
    colorName: "Blue",
    colorValue: "#0D3B66",
    modelName: "Kharn",
    leadImages: ["/brand/products/button/ndb1/ndb1-studio-registered.webp"],
    story:
      "NDB1 brings structure to blue without making it severe. The structured front introduces a measured rhythm, while the cobalt tone carries calm confidence from daytime commitments into evening plans.",
    storyKicker: "NDB1 / Composure",
    storyTitle: "Cobalt clarity, held together by precise detail.",
    occasion: "smart travel, business occasions, dinners, and destination events",
    details:
      "A short-sleeve structured-front stretch shirt with an open collar, coordinated tapered trouser, discreet side pockets, and gold ỌNUỌRA signatures at the chest and leg.",
    fit:
      "Relaxed through the chest with a clean, straight hem; tapered through the trouser without restricting the thigh. Designed to sit polished whether worn open at the neck or fully composed.",
    fabricCare:
      "Smooth four-way stretch suiting. Fasten buttons before a gentle cold wash, dry flat, and press inside out on low heat. Avoid bleach and prolonged direct sunlight.",
  }),
  createProduct({
    slug: "ndb2",
    name: "NDB2",
    edition: "Earth Button Edition",
    meaning: "Grounded",
    palette: "#654321",
    pageText: "#F7F3E8",
    pageMuted: "#E7D4C1",
    pagePanel: "#79553A",
    family: "button",
    colorName: "Brown",
    colorValue: "#654321",
    modelName: "Edson",
    leadImages: ["/brand/products/button/ndb2/ndb2-studio-registered.webp"],
    story:
      "NDB2 works in the register of earth and permanence. Brown gives the Cowrie Collection silhouette warmth and maturity, creating an assured uniform for the man who values substance over display.",
    storyKicker: "NDB2 / Grounded",
    storyTitle: "Earth-led tailoring with a calm, deliberate cadence.",
    occasion: "weekend engagements, travel, creative meetings, and understated dinners",
    details:
      "A brown short-sleeve structured-front set with an open collar, clean placket, coordinated tapered trouser, functional pockets, and restrained gold house marks.",
    fit:
      "Easy through the upper body with a straight shirt hem and balanced sleeve. The trouser follows a modern taper while stretch supports movement through the waist and seat.",
    fabricCare:
      "brown stretch fabric. Gentle cold wash with similar tones, dry flat in shade, and cool iron inside out. Store away from strong direct light to preserve colour.",
  }),
  createProduct({
    slug: "ndb3",
    name: "NDB3",
    edition: "Burgundy Button Edition",
    meaning: "Conviction",
    palette: "#3B0A1A",
    pageText: "#F7F3E8",
    pageMuted: "#E6C7B6",
    pagePanel: "#551427",
    family: "button",
    colorName: "Burgundy",
    colorValue: "#3B0A1A",
    modelName: "Idris",
    leadImages: ["/brand/products/button/ndb3/ndb3-studio-registered.webp"],
    story:
      "NDB3 gives the Cowrie Collection a richer emotional register. Burgundy speaks of conviction and lineage, balanced by a crisp placket and an easy collar that keep the look contemporary.",
    storyKicker: "NDB3 / Conviction",
    storyTitle: "A ceremonial colour, edited for modern movement.",
    occasion: "celebrations, evening receptions, date nights, and cultural events",
    details:
      "A burgundy short-sleeve structured-front shirt and tapered trouser, finished with an open collar, measured placket, practical pockets, and gold ỌNUỌRA embroidery.",
    fit:
      "Cut to skim rather than cling, with stretch across the shoulder and waist. The trouser is comfortable through the seat and narrows cleanly toward the ankle.",
    fabricCare:
      "Colour-saturated four-way stretch suiting. Wash cold with like colours, fasten buttons, dry flat in shade, and press inside out on a cool setting.",
  }),
  createProduct({
    slug: "ndb4",
    name: "NDB4",
    edition: "Onyx Button Edition",
    meaning: "Authority",
    palette: "#1F1F1F",
    pageText: "#F7F3E8",
    pageMuted: "#D7D2C7",
    pagePanel: "#303030",
    family: "button",
    colorName: "Black",
    colorValue: "#1F1F1F",
    modelName: "Edson",
    leadImages: ["/brand/products/button/ndb4/ndb4-studio-registered.webp"],
    story:
      "NDB4 is the sharpest expression of the Cowrie Collection line. Onyx black removes distraction, allowing proportion, movement, and the small gold signatures to carry the entire statement.",
    storyKicker: "NDB4 / Authority",
    storyTitle: "Black, exact, and built for effortless command.",
    occasion: "evenings, formal travel, private events, and elevated everyday wear",
    details:
      "An onyx short-sleeve structured-front shirt with open collar, coordinated tapered trouser, side pockets, and precisely placed gold ỌNUỌRA marks.",
    fit:
      "A clean relaxed-tailored shirt balances a controlled trouser taper. Four-way stretch and shape recovery keep the black silhouette crisp through extended wear.",
    fabricCare:
      "Deep black stretch suiting. Cold gentle wash inside out, use detergent for dark colours, dry flat away from sunlight, and cool iron from the reverse.",
  }),
  createProduct({
    slug: "ndb5",
    name: "NDB5",
    edition: "Royal Purple Button Edition",
    meaning: "Presence",
    palette: "#4A294F",
    pageText: "#F7F3E8",
    pageMuted: "#DECDE2",
    pagePanel: "#603768",
    family: "button",
    colorName: "Purple",
    colorValue: "#4A294F",
    modelName: "Idris",
    leadImages: ["/brand/products/button/ndb5/ndb5-studio-registered.webp"],
    story:
      "NDB5 treats purple as presence rather than ornament. The colour is regal but controlled, sharpened by the structured front into a look that feels expressive, assured, and entirely grown.",
    storyKicker: "NDB5 / Presence",
    storyTitle: "Royal colour, disciplined by a modern tailored line.",
    occasion: "creative occasions, celebrations, evening events, and statement travel",
    details:
      "A royal purple structured-front set with an open collar, short sleeve, tapered trouser, useful pockets, and gold ỌNUỌRA embroidery that amplifies the depth of the colour.",
    fit:
      "Relaxed through the shirt body with controlled shoulder placement and a straight hem. The trouser offers ease through the thigh before tapering toward the ankle.",
    fabricCare:
      "purple four-way stretch fabric. Wash separately in cold water, dry flat in shade, avoid bleach, and press inside out on a low setting.",
  }),
  createProduct({
    slug: "nd1",
    name: "ND1",
    edition: "Cobalt Seamless Edition",
    meaning: "Direction",
    palette: "#0D3B66",
    pageText: "#F7F3E8",
    pageMuted: "#C9D9E7",
    pagePanel: "#154D7A",
    family: "buttonless",
    colorName: "Blue",
    colorValue: "#0D3B66",
    modelName: "Kharn",
    leadImages: ["/brand/products/buttonless/nd1/nd1-studio-registered.webp"],
    story:
      "ND1 lets blue move without interruption. With an uninterrupted front, the front reads as one confident plane, creating a disciplined silhouette that feels calm, direct, and easy to wear.",
    storyKicker: "ND1 / Direction",
    storyTitle: "An uninterrupted blue line for the man moving forward.",
    occasion: "travel, modern work, destination dinners, and refined everyday wear",
    details:
      "A cobalt collarless short-sleeve top with a clean open collar, uninterrupted front, coordinated tapered trouser, practical pockets, and gold ỌNUỌRA signatures.",
    fit:
      "A smooth relaxed-tailored torso falls cleanly from the shoulder. The stretch trouser allows room through the seat and thigh before a neat taper at the hem.",
    fabricCare:
      "Breathable four-way stretch suiting. Gentle cold wash, reshape and dry flat, then cool iron inside out. Avoid bleach and high heat.",
  }),
  createProduct({
    slug: "nd2",
    name: "ND2",
    edition: "Earth Seamless Edition",
    meaning: "Foundation",
    palette: "#654321",
    pageText: "#F7F3E8",
    pageMuted: "#E7D4C1",
    pagePanel: "#79553A",
    family: "buttonless",
    colorName: "Brown",
    colorValue: "#654321",
    modelName: "Edson",
    leadImages: ["/brand/products/buttonless/nd2/nd2-studio-registered.webp"],
    story:
      "ND2 reduces the silhouette to line, texture, and earth. Its brown tone carries warmth and stability, while the seamless front makes the set feel architectural without becoming rigid.",
    storyKicker: "ND2 / Foundation",
    storyTitle: "Earth tones, distilled into a single confident line.",
    occasion: "private gatherings, travel, weekend occasions, and creative work",
    details:
      "A brown collarless short-sleeve top with open collar and uninterrupted front, paired with a tapered stretch trouser and finished with subtle gold ỌNUỌRA marks.",
    fit:
      "Easy through the chest and waist with a clean, straight fall. The trouser balances comfort at the upper leg with a precise taper below the knee.",
    fabricCare:
      "brown stretch suiting. Wash cold with similar colours, dry flat away from direct sun, and cool iron inside out. Do not tumble dry.",
  }),
  createProduct({
    slug: "nd3",
    name: "ND3",
    edition: "Burgundy Seamless Edition",
    meaning: "Vitality",
    palette: "#3B0A1A",
    pageText: "#F7F3E8",
    pageMuted: "#E6C7B6",
    pagePanel: "#551427",
    family: "buttonless",
    colorName: "Burgundy",
    colorValue: "#3B0A1A",
    modelName: "Charlie",
    leadImages: ["/brand/products/buttonless/nd3/nd3-studio-registered.webp"],
    story:
      "ND3 gives burgundy room to speak. The uninterrupted front holds the colour like a field of energy, balancing warmth and ceremony with a silhouette that remains calm in motion.",
    storyKicker: "ND3 / Vitality",
    storyTitle: "Burgundy depth, expressed without interruption.",
    occasion: "celebrations, evening occasions, cultural events, and elegant dinners",
    details:
      "A burgundy collarless top with a clean open collar, short sleeve, uninterrupted front, tapered trouser, functional pockets, and gold ỌNUỌRA embroidery.",
    fit:
      "Relaxed-tailored through the torso, with stretch at the shoulder and waist. The trouser sits comfortably through the seat before resolving into a clean ankle line.",
    fabricCare:
      "Rich burgundy four-way stretch fabric. Gentle cold wash with like colours, dry flat in shade, and press from the reverse using low heat.",
  }),
  createProduct({
    slug: "nd4",
    name: "ND4",
    edition: "Onyx Seamless Edition",
    meaning: "Resolve",
    palette: "#1F1F1F",
    pageText: "#F7F3E8",
    pageMuted: "#D7D2C7",
    pagePanel: "#303030",
    family: "buttonless",
    colorName: "Black",
    colorValue: "#1F1F1F",
    modelName: "Kharn",
    leadImages: ["/brand/products/buttonless/nd4/nd4-studio-registered.webp"],
    story:
      "ND4 is quiet resolve rendered in black. Removing the placket makes the front almost monolithic, turning a relaxed set into a clean statement of focus, restraint, and confidence.",
    storyKicker: "ND4 / Resolve",
    storyTitle: "One uninterrupted black plane. Nothing unnecessary.",
    occasion: "evening plans, modern ceremonies, travel, and elevated daily dressing",
    details:
      "An onyx collarless short-sleeve top with open collar and clean front, paired with a tapered trouser and finished with measured gold ỌNUỌRA signatures.",
    fit:
      "A straight, easy body creates a composed drape, while the trouser narrows without gripping. Four-way stretch keeps the dark silhouette smooth throughout wear.",
    fabricCare:
      "Deep black stretch suiting. Wash cold inside out with dark colours, dry flat away from sunlight, and press from the reverse on low heat.",
  }),
  createProduct({
    slug: "nd5",
    name: "ND5",
    edition: "Royal Purple Seamless Edition",
    meaning: "Distinction",
    palette: "#4A294F",
    pageText: "#F7F3E8",
    pageMuted: "#DECDE2",
    pagePanel: "#603768",
    family: "buttonless",
    colorName: "Purple",
    colorValue: "#4A294F",
    modelName: "Idris",
    leadImages: ["/brand/products/buttonless/nd5/nd5-studio-registered.webp"],
    story:
      "ND5 lets purple occupy the full silhouette. With no interruption across the surface, the colour feels richer and more intentional, offering distinction with the ease of a modern uniform.",
    storyKicker: "ND5 / Distinction",
    storyTitle: "A seamless field of royal colour, made to move.",
    occasion: "statement occasions, celebrations, creative gatherings, and evening travel",
    details:
      "A royal purple collarless top with open collar, short sleeve, uninterrupted front, coordinated tapered trouser, practical pockets, and gold ỌNUỌRA marks.",
    fit:
      "Relaxed through the chest with a controlled straight hem. The stretch trouser provides easy movement through the upper leg and a refined taper toward the ankle.",
    fabricCare:
      "purple four-way stretch suiting. Wash separately in cold water, dry flat in shade, avoid bleach, and cool iron from the reverse.",
  })
];

export const craftSteps = [
  { label: "Story", text: "Each piece begins with an Igbo name and a masculine mood." },
  { label: "Fabric", text: "Smooth breathable four-way stretch selected for comfort and drape." },
  { label: "Cut", text: "Proportions are shaped for a sharp line without stiffness." },
  { label: "Finish", text: "Gold embroidery and hand-finishing bring the house mark forward." },
  { label: "Inspect", text: "Every garment is checked for movement, fit, and finish." }
];

export const valuePillars = [
  { icon: Hand, title: "Made In Nigeria", text: "Nigerian craftsmanship designed for customers at home and around the world." },
  { icon: Ruler, title: "Tailored Comfort", text: "A refined silhouette that moves with the body." },
  { icon: Truck, title: "Worldwide Delivery", text: "Tracked international delivery is available to supported destinations." },
  { icon: Crown, title: "Considered Production", text: "Thoughtful production with close attention to fit and finishing." }
];

export const trustSignals = [
  { icon: ShieldCheck, title: "Secure Checkout" },
  { icon: Globe2, title: "International Delivery" },
  { icon: BadgeCheck, title: "Refined Finishing" },
  { icon: Sparkles, title: "Stretch Cotton" },
  { icon: Scissors, title: "Considered Detailing" }
];

export const journalPosts = [
  {
    title: "The New Language Of Contemporary African Menswear",
    tag: "Heritage",
    excerpt: "How modern African tailoring can feel rooted, mobile and precise."
  },
  {
    title: "How Stretch Tailoring Changes The Occasion Set",
    tag: "Craft",
    excerpt: "A technical note on movement, heat, posture, and the end of tailor stress."
  },
  {
    title: "Six Names, Six Ways To Arrive",
    tag: "Style",
    excerpt: "A guide to choosing the edition that matches your mood and moment."
  }
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
