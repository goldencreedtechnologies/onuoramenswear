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
  leadImages?: string[];
  includeOriginalRender?: boolean;
};

function productImages(family: ProductFamily, slug: string, includeOriginalRender = false) {
  const base = `/brand/products/${family}/${slug}/${slug}`;
  const images = [
    `${base}-front.webp`,
    `${base}-mid.webp`,
    `${base}-angle.webp`,
    `${base}-back.webp`
  ];
  if (includeOriginalRender) images.push(`${base}-original.png`);
  return images;
}

function collectionCopy(family: ProductFamily) {
  if (family === "original") return "Heritage Collection";
  if (family === "button") return "Cowrie Collection";
  return "Resort Collection";
}

function createProduct(seed: ProductSeed): Product {
  const collection = collectionCopy(seed.family);
  const images = [
    ...(seed.leadImages ?? []),
    ...productImages(seed.family, seed.slug, seed.includeOriginalRender)
  ];

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

export const products: Product[] = [
  createProduct({
    slug: "ebube", name: "EBUBE", edition: "Black Edition", meaning: "Glory",
    palette: "#1F1F1F", pageText: "#F7F3E8", pageMuted: "#D9CDAF", pagePanel: "#2C2823",
    family: "original", colorName: "Black", colorValue: "#1F1F1F", modelName: "Kharn", includeOriginalRender: true
  }),
  createProduct({
    slug: "ohuru", name: "ỌHỤRỤ", edition: "Cream Edition", meaning: "Fresh",
    palette: "#F5E6C8", pageText: "#1F1F1F", pageMuted: "#654321", pagePanel: "#FFF9ED",
    family: "original", colorName: "Cream", colorValue: "#F5E6C8", modelName: "Charlie", includeOriginalRender: true
  }),
  createProduct({
    slug: "ndu", name: "NDỤ", edition: "Burgundy Edition", meaning: "Life",
    palette: "#3B0A1A", pageText: "#F7F3E8", pageMuted: "#E6C7B6", pagePanel: "#551427",
    family: "original", colorName: "Burgundy", colorValue: "#3B0A1A", modelName: "Idris",
    leadImages: ["/brand/products/original/ndu/ndu-studio-idris.webp"], includeOriginalRender: true
  }),
  createProduct({
    slug: "ijeoma", name: "IJEỌMA", edition: "Blue Edition", meaning: "Safe Journey",
    palette: "#0D3B66", pageText: "#F7F3E8", pageMuted: "#C9D9E7", pagePanel: "#154D7A",
    family: "original", colorName: "Blue", colorValue: "#0D3B66", modelName: "Charlie", includeOriginalRender: true
  }),
  createProduct({
    slug: "aja", name: "AJA", edition: "Forest Edition", meaning: "Sanctuary",
    palette: "#0B1516", pageText: "#F7F3E8", pageMuted: "#C9D4C9", pagePanel: "#18302B",
    family: "original", colorName: "Forest Green", colorValue: "#0B1516", modelName: "Edson", includeOriginalRender: true
  }),
  createProduct({
    slug: "nsuo", name: "NSỤO", edition: "White Edition", meaning: "Water",
    palette: "#F7F3E8", pageText: "#1F1F1F", pageMuted: "#654321", pagePanel: "#FFFFFF",
    family: "original", colorName: "White", colorValue: "#F7F3E8", modelName: "Edson", includeOriginalRender: true
  }),
  createProduct({
    slug: "ndb1", name: "NDB1", edition: "Blue Edition", meaning: "Composure",
    palette: "#0D3B66", pageText: "#F7F3E8", pageMuted: "#C9D9E7", pagePanel: "#154D7A",
    family: "button", colorName: "Blue", colorValue: "#0D3B66", modelName: "Kharn",
    leadImages: ["/brand/products/button/ndb1/ndb1-studio-registered.webp"]
  }),
  createProduct({
    slug: "ndb2", name: "NDB2", edition: "Brown Edition", meaning: "Grounded",
    palette: "#654321", pageText: "#F7F3E8", pageMuted: "#E7D4C1", pagePanel: "#79553A",
    family: "button", colorName: "Brown", colorValue: "#654321", modelName: "Edson",
    leadImages: ["/brand/products/button/ndb2/ndb2-studio-registered.webp"]
  }),
  createProduct({
    slug: "ndb3", name: "NDB3", edition: "Burgundy Edition", meaning: "Conviction",
    palette: "#3B0A1A", pageText: "#F7F3E8", pageMuted: "#E6C7B6", pagePanel: "#551427",
    family: "button", colorName: "Burgundy", colorValue: "#3B0A1A", modelName: "Idris",
    leadImages: ["/brand/products/button/ndb3/ndb3-studio-registered.webp"]
  }),
  createProduct({
    slug: "ndb4", name: "NDB4", edition: "Black Edition", meaning: "Authority",
    palette: "#1F1F1F", pageText: "#F7F3E8", pageMuted: "#D7D2C7", pagePanel: "#303030",
    family: "button", colorName: "Black", colorValue: "#1F1F1F", modelName: "Edson",
    leadImages: ["/brand/products/button/ndb4/ndb4-studio-registered.webp"]
  }),
  createProduct({
    slug: "ndb5", name: "NDB5", edition: "Purple Edition", meaning: "Presence",
    palette: "#4A294F", pageText: "#F7F3E8", pageMuted: "#DECDE2", pagePanel: "#603768",
    family: "button", colorName: "Purple", colorValue: "#4A294F", modelName: "Idris",
    leadImages: ["/brand/products/button/ndb5/ndb5-studio-registered.webp"]
  }),
  createProduct({
    slug: "nd1", name: "ND1", edition: "Blue Edition", meaning: "Direction",
    palette: "#0D3B66", pageText: "#F7F3E8", pageMuted: "#C9D9E7", pagePanel: "#154D7A",
    family: "buttonless", colorName: "Blue", colorValue: "#0D3B66", modelName: "Kharn",
    leadImages: ["/brand/products/buttonless/nd1/nd1-studio-registered.webp"]
  }),
  createProduct({
    slug: "nd2", name: "ND2", edition: "Brown Edition", meaning: "Foundation",
    palette: "#654321", pageText: "#F7F3E8", pageMuted: "#E7D4C1", pagePanel: "#79553A",
    family: "buttonless", colorName: "Brown", colorValue: "#654321", modelName: "Edson",
    leadImages: ["/brand/products/buttonless/nd2/nd2-studio-registered.webp"]
  }),
  createProduct({
    slug: "nd3", name: "ND3", edition: "Burgundy Edition", meaning: "Vitality",
    palette: "#3B0A1A", pageText: "#F7F3E8", pageMuted: "#E6C7B6", pagePanel: "#551427",
    family: "buttonless", colorName: "Burgundy", colorValue: "#3B0A1A", modelName: "Charlie",
    leadImages: ["/brand/products/buttonless/nd3/nd3-studio-registered.webp"]
  }),
  createProduct({
    slug: "nd4", name: "ND4", edition: "Black Edition", meaning: "Resolve",
    palette: "#1F1F1F", pageText: "#F7F3E8", pageMuted: "#D7D2C7", pagePanel: "#303030",
    family: "buttonless", colorName: "Black", colorValue: "#1F1F1F", modelName: "Kharn",
    leadImages: ["/brand/products/buttonless/nd4/nd4-studio-registered.webp"]
  }),
  createProduct({
    slug: "nd5", name: "ND5", edition: "Purple Edition", meaning: "Distinction",
    palette: "#4A294F", pageText: "#F7F3E8", pageMuted: "#DECDE2", pagePanel: "#603768",
    family: "buttonless", colorName: "Purple", colorValue: "#4A294F", modelName: "Idris",
    leadImages: ["/brand/products/buttonless/nd5/nd5-studio-registered.webp"]
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
    title: "The New Language Of Contemporary African Menswear",
    tag: "Behind the Collections",
    excerpt: "How modern African tailoring can feel rooted, precise and relevant now."
  },
  {
    title: "Inside The Making Of An ỌNUỌRA Outfit",
    tag: "African Craftsmanship",
    excerpt: "A closer look at proportion, construction, finishing and Nigerian authorship."
  },
  {
    title: "The Permanent Collections Campaign",
    tag: "Campaigns",
    excerpt: "Three collections, one philosophy and a wardrobe designed for different occasions."
  }
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
