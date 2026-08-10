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
import {
  DELIVERY_COPY,
  PRODUCT_INCLUSION_LABEL,
  PRODUCT_PRICES,
  PRODUCT_TYPE_LABEL
} from "@/data/site-config";

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

type ProductSeed = {
  slug: string;
  name: string;
  edition: string;
  meaning: string;
  palette: string;
  pageText: string;
  pageMuted: string;
  pagePanel: string;
  family: ProductFamily;
  colorName: string;
  colorValue: string;
  modelName: string;
};

const CURRENT_PRODUCT_IMAGES: Record<string, string[]> = {
  ebube: [
    "/brand/products/original/ebube/ebube-front.png",
    "/brand/products/original/ebube/ebube-mid.png",
    "/brand/products/original/ebube/ebube-angle.png",
    "/brand/products/original/ebube/ebube-back.png"
  ],
  ohuru: [
    "/brand/products/original/ohuru/ohuru-front.png",
    "/brand/products/original/ohuru/ohuru-detail.png",
    "/brand/products/original/ohuru/ohuru-lifestyle.png",
    "/brand/products/original/ohuru/ohuru.back.png"
  ],
  ndu: [
    "/brand/products/original/ndu/ndu-front.png",
    "/brand/products/original/ndu/ndu-angle.png",
    "/brand/products/original/ndu/ndu-lifestyle.png",
    "/brand/products/original/ndu/ndu-back.png"
  ],
  ijeoma: [
    "/brand/products/original/ijeoma/ijeoma-front.png",
    "/brand/products/original/ijeoma/ijeoma-mid.png",
    "/brand/products/original/ijeoma/ijeoma-detail.png",
    "/brand/products/original/ijeoma/ijeoma-back.png"
  ],
  aja: [
    "/brand/products/original/aja/aja-front.png",
    "/brand/products/original/aja/aja-mid.png",
    "/brand/products/original/aja/aja-side.png",
    "/brand/products/original/aja/ajah-grid.png"
  ],
  nsuo: [
    "/brand/products/original/nsuo/nsuo-front.png",
    "/brand/products/original/nsuo/nsuo-lifestyle.png",
    "/brand/products/original/nsuo/nsuo-back.png"
  ],
  ndb1: [
    "/brand/products/button/ndb1/ndb1-front.png",
    "/brand/products/button/ndb1/ndb1-angle.png",
    "/brand/products/button/ndb1/ndb1-back.png"
  ],
  ndb2: [
    "/brand/products/button/ndb2/ndb2-front.png",
    "/brand/products/button/ndb2/ndb2-angle.png",
    "/brand/products/button/ndb2/nd2-detail.png"
  ],
  ndb3: [
    "/brand/products/button/ndb3/ndb3-front.png",
    "/brand/products/button/ndb3/ndb3-angle.png",
    "/brand/products/button/ndb3/ndb3-back.png"
  ],
  ndb4: [
    "/brand/products/button/ndb4/ndb4-front.png",
    "/brand/products/button/ndb4/ndb4-mid.png",
    "/brand/products/button/ndb4/ndb4-angle.png",
    "/brand/products/button/ndb4/ndb4-back.png"
  ],
  ndb5: [
    "/brand/products/button/ndb5/ndb5-front.png",
    "/brand/products/button/ndb5/ndb5-angle.png",
    "/brand/products/button/ndb5/nd5-lifestyle.png",
    "/brand/products/button/ndb5/ndb5-back.png"
  ],
  ndb6: [
    "/brand/products/button/ndb6/ndb6-front.png",
    "/brand/products/button/ndb6/ndb6-side.png",
    "/brand/products/button/ndb6/ndb6-back.png"
  ],
  ndb7: [
    "/brand/products/button/ndb7/ndb7-front.png",
    "/brand/products/button/ndb7/ndb7-studio.png",
    "/brand/products/button/ndb7/ndb7-back.png"
  ],
  nd1: [
    "/brand/products/buttonless/nd1/nd1-front.png",
    "/brand/products/buttonless/nd1/nd1-mid.png",
    "/brand/products/buttonless/nd1/nd1-lifestyle.png",
    "/brand/products/buttonless/nd1/nd1-back.png"
  ],
  nd2: [
    "/brand/products/buttonless/nd2/nd2-front.png",
    "/brand/products/buttonless/nd2/nd2-back.png"
  ],
  nd3: [
    "/brand/products/buttonless/nd3/nd3-front.png",
    "/brand/products/buttonless/nd3/nd3-angle.png",
    "/brand/products/buttonless/nd3/nd3-detail.png",
    "/brand/products/buttonless/nd3/nd3-back.png"
  ],
  nd4: [
    "/brand/products/buttonless/nd4/nd4-front.png",
    "/brand/products/buttonless/nd4/nd4-mid.png",
    "/brand/products/buttonless/nd4/nd4-angle.png"
  ],
  nd5: [
    "/brand/products/buttonless/nd5/nd5-front.png",
    "/brand/products/buttonless/nd5/nd5-angle.png",
    "/brand/products/buttonless/nd5/nd5-back.png"
  ],
  nd6: [
    "/brand/products/buttonless/nd6/nd6-front.png",
    "/brand/products/buttonless/nd6/nd6-back.png"
  ],
  nd7: [
    "/brand/products/buttonless/nd7/nd7-front.png",
    "/brand/products/buttonless/nd7/nd7-studio.png",
    "/brand/products/buttonless/nd7/nd7-back.png"
  ]
};

function collectionCopy(family: ProductFamily) {
  if (family === "original") return "Heritage Collection";
  if (family === "button") return "Cowrie Collection";
  return "Resort Collection";
}

function createProduct(seed: ProductSeed): Product {
  const collection = collectionCopy(seed.family);
  const images = CURRENT_PRODUCT_IMAGES[seed.slug];

  return {
    ...seed,
    price: `$${PRODUCT_PRICES.USD}`,
    story: `${seed.name} expresses ${seed.meaning.toLowerCase()} through a considered ${seed.colorName.toLowerCase()} silhouette from the ${collection}.`,
    storyKicker: `${seed.name} / ${seed.meaning}`,
    storyTitle: `${seed.colorName} tailoring shaped with clarity and intention.`,
    occasion: "work, travel, celebrations and considered everyday dressing",
    details: `${PRODUCT_TYPE_LABEL}. ${PRODUCT_INCLUSION_LABEL}. A coordinated top and tapered trouser with functional pockets and signature ỌNUỌRA detailing.`,
    fit: "A balanced contemporary fit with a clean shoulder, considered ease through the body and a refined trouser taper.",
    fabricCare: "Wash gently in cold water with mild detergent, reshape while damp, dry flat in shade and cool iron inside out. Do not bleach or tumble dry.",
    delivery: DELIVERY_COPY,
    image: images[0],
    images,
    darkPage: seed.pageText.toLowerCase() !== "#1f1f1f"
  };
}

const bluePalette = {
  palette: "#06058C",
  pageText: "#F7F3E8",
  pageMuted: "#D6D5FF",
  pagePanel: "#17166A",
  colorName: "Blue",
  colorValue: "#06058C"
} as const;

const burntOrangePalette = {
  palette: "#D9582E",
  pageText: "#1F1F1F",
  pageMuted: "#6C2D18",
  pagePanel: "#F2A080",
  colorName: "Burnt Orange",
  colorValue: "#D9582E"
} as const;

const paleBeigePalette = {
  palette: "#DBAC76",
  pageText: "#1F1F1F",
  pageMuted: "#654321",
  pagePanel: "#F3D5B4",
  colorName: "Pale Beige",
  colorValue: "#DBAC76"
} as const;

export const products: Product[] = [
  createProduct({
    slug: "ebube", name: "EBUBE", edition: "Black Edition", meaning: "Glory",
    palette: "#1F1F1F", pageText: "#F7F3E8", pageMuted: "#D9CDAF", pagePanel: "#2C2823",
    family: "original", colorName: "Black", colorValue: "#1F1F1F", modelName: "Kharn"
  }),
  createProduct({
    slug: "ohuru", name: "ỌHỤRỤ", edition: "Sahara Beige Edition", meaning: "Fresh",
    palette: "#F5E6C8", pageText: "#1F1F1F", pageMuted: "#654321", pagePanel: "#FFF9ED",
    family: "original", colorName: "Sahara Beige", colorValue: "#F5E6C8", modelName: "Charlie"
  }),
  createProduct({
    slug: "ndu", name: "NDỤ", edition: "Burgundy Edition", meaning: "Life",
    palette: "#3B0A1A", pageText: "#F7F3E8", pageMuted: "#E6C7B6", pagePanel: "#551427",
    family: "original", colorName: "Burgundy", colorValue: "#3B0A1A", modelName: "Idris"
  }),
  createProduct({
    slug: "ijeoma", name: "IJEỌMA", edition: "Blue Edition", meaning: "Safe Journey",
    ...bluePalette, family: "original", modelName: "Charlie"
  }),
  createProduct({
    slug: "aja", name: "AJA", edition: "Forest Edition", meaning: "Sanctuary",
    palette: "#0B1516", pageText: "#F7F3E8", pageMuted: "#C9D4C9", pagePanel: "#18302B",
    family: "original", colorName: "Forest", colorValue: "#0B1516", modelName: "Edson"
  }),
  createProduct({
    slug: "nsuo", name: "NSỤO", edition: "Off-White Edition", meaning: "Water",
    palette: "#F7F3E8", pageText: "#1F1F1F", pageMuted: "#654321", pagePanel: "#FFFFFF",
    family: "original", colorName: "Off-White", colorValue: "#F7F3E8", modelName: "Edson"
  }),
  createProduct({
    slug: "ndb1", name: "NDB1", edition: "Blue Edition", meaning: "Composure",
    ...bluePalette, family: "button", modelName: "Kharn"
  }),
  createProduct({
    slug: "ndb2", name: "NDB2", edition: "Brown Edition", meaning: "Grounded",
    palette: "#654321", pageText: "#F7F3E8", pageMuted: "#E7D4C1", pagePanel: "#79553A",
    family: "button", colorName: "Brown", colorValue: "#654321", modelName: "Edson"
  }),
  createProduct({
    slug: "ndb3", name: "NDB3", edition: "Burgundy Edition", meaning: "Conviction",
    palette: "#3B0A1A", pageText: "#F7F3E8", pageMuted: "#E6C7B6", pagePanel: "#551427",
    family: "button", colorName: "Burgundy", colorValue: "#3B0A1A", modelName: "Idris"
  }),
  createProduct({
    slug: "ndb4", name: "NDB4", edition: "Black Edition", meaning: "Authority",
    palette: "#1F1F1F", pageText: "#F7F3E8", pageMuted: "#D7D2C7", pagePanel: "#303030",
    family: "button", colorName: "Black", colorValue: "#1F1F1F", modelName: "Edson"
  }),
  createProduct({
    slug: "ndb5", name: "NDB5", edition: "Purple Edition", meaning: "Presence",
    palette: "#4A294F", pageText: "#F7F3E8", pageMuted: "#DECDE2", pagePanel: "#603768",
    family: "button", colorName: "Purple", colorValue: "#4A294F", modelName: "Idris"
  }),
  createProduct({
    slug: "ndb6", name: "NDB6", edition: "Burnt Orange Edition", meaning: "Warmth",
    ...burntOrangePalette, family: "button", modelName: "Studio model"
  }),
  createProduct({
    slug: "ndb7", name: "NDB7", edition: "Pale Beige Edition", meaning: "Balance",
    ...paleBeigePalette, family: "button", modelName: "Studio model"
  }),
  createProduct({
    slug: "nd1", name: "ND1", edition: "Blue Edition", meaning: "Direction",
    ...bluePalette, family: "buttonless", modelName: "Kharn"
  }),
  createProduct({
    slug: "nd2", name: "ND2", edition: "Brown Edition", meaning: "Foundation",
    palette: "#654321", pageText: "#F7F3E8", pageMuted: "#E7D4C1", pagePanel: "#79553A",
    family: "buttonless", colorName: "Brown", colorValue: "#654321", modelName: "Edson"
  }),
  createProduct({
    slug: "nd3", name: "ND3", edition: "Burgundy Edition", meaning: "Vitality",
    palette: "#3B0A1A", pageText: "#F7F3E8", pageMuted: "#E6C7B6", pagePanel: "#551427",
    family: "buttonless", colorName: "Burgundy", colorValue: "#3B0A1A", modelName: "Charlie"
  }),
  createProduct({
    slug: "nd4", name: "ND4", edition: "Black Edition", meaning: "Resolve",
    palette: "#1F1F1F", pageText: "#F7F3E8", pageMuted: "#D7D2C7", pagePanel: "#303030",
    family: "buttonless", colorName: "Black", colorValue: "#1F1F1F", modelName: "Kharn"
  }),
  createProduct({
    slug: "nd5", name: "ND5", edition: "Purple Edition", meaning: "Distinction",
    palette: "#4A294F", pageText: "#F7F3E8", pageMuted: "#DECDE2", pagePanel: "#603768",
    family: "buttonless", colorName: "Purple", colorValue: "#4A294F", modelName: "Idris"
  }),
  createProduct({
    slug: "nd6", name: "ND6", edition: "Burnt Orange Edition", meaning: "Warmth",
    ...burntOrangePalette, family: "buttonless", modelName: "Studio model"
  }),
  createProduct({
    slug: "nd7", name: "ND7", edition: "Pale Beige Edition", meaning: "Balance",
    ...paleBeigePalette, family: "buttonless", modelName: "Studio model"
  })
];

export const craftSteps = [
  { label: "Story", text: "Each piece begins with an Igbo name and a clear design intention." },
  { label: "Fabric", text: "Fabric is selected for structure, drape and long-term wear." },
  { label: "Cut", text: "Proportions are developed for a clean contemporary silhouette." },
  { label: "Finish", text: "Gold embroidery and considered finishing bring the house mark forward." },
  { label: "Inspect", text: "Every garment is checked for fit, construction and finish." }
];

export const valuePillars = [
  { icon: Hand, title: "Made In Nigeria", text: "Nigerian craftsmanship for customers at home and around the world." },
  { icon: Ruler, title: "Considered Fit", text: "A refined silhouette developed with attention to proportion." },
  { icon: Truck, title: "Worldwide Delivery", text: "Tracked international delivery is available to supported destinations." },
  { icon: Crown, title: "Considered Production", text: "Thoughtful production with close attention to fit and finishing." }
];

export const trustSignals = [
  { icon: ShieldCheck, title: "Secure Checkout" },
  { icon: Globe2, title: "International Delivery" },
  { icon: BadgeCheck, title: "Refined Finishing" },
  { icon: Sparkles, title: "Considered Fabric" },
  { icon: Scissors, title: "Nigerian Craftsmanship" }
];

export const journalPosts = [
  {
    title: "The New Language of Contemporary African Menswear",
    tag: "Behind the Collections",
    excerpt: "How modern African tailoring can feel rooted, precise and relevant now."
  },
  {
    title: "Inside the Making of an ỌNUỌRA Outfit",
    tag: "African Craftsmanship",
    excerpt: "A closer look at proportion, construction, finishing and Nigerian authorship."
  },
  {
    title: "The Permanent Collections",
    tag: "Campaigns",
    excerpt: "Three collections, one philosophy and a wardrobe designed for different occasions."
  }
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
