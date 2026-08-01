import { products, type ProductFamily } from "@/data/catalog";
import {
  COLLECTIONS,
  PRODUCT_PRICES,
  PROMOTIONS,
  type CurrencyCode
} from "@/data/site-config";

export type RegionalCurrency = CurrencyCode;
export type RegionalPrices = Record<RegionalCurrency, number>;

export type CollectionImagePair = {
  front: string;
  hover: string;
};

export type PhaseOneCollectionProduct = {
  id: string;
  name: string;
  color: string;
  colorValue: string;
  description: string;
  images: CollectionImagePair;
  prices: RegionalPrices;
  href?: string;
};

export type CollectionVariant = {
  slug: string;
  name: string;
  color: string;
  colorValue: string;
};

export type PhaseOneCollection = {
  id: "heritage" | "cowrie" | "resort";
  legacyId: "original" | "with-button" | "without-button";
  eyebrow: string;
  title: string;
  description: string;
  images: CollectionImagePair;
  href: string;
  variants: CollectionVariant[];
};

export const phaseOneImagePairs = {
  withoutButton: {
    front: "/brand/products/buttonless/nd3/nd3-studio-registered.webp",
    hover: "/brand/products/buttonless/nd3/nd3-angle.webp"
  },
  withButton: {
    front: "/brand/products/button/ndb2/ndb2-angle.webp",
    hover: "/brand/products/button/ndb4/ndb4-studio-registered.webp"
  },
  original: {
    front: "/brand/products/original/ndu/ndu-studio-idris.webp",
    hover: "/brand/products/original/ndu/ndu-angle.webp"
  }
} satisfies Record<string, CollectionImagePair>;

export const regionalPriceSets = {
  original: PRODUCT_PRICES,
  withButton: PRODUCT_PRICES,
  withoutButton: PRODUCT_PRICES
} satisfies Record<string, RegionalPrices>;

function collectionVariants(family: ProductFamily): CollectionVariant[] {
  return products
    .filter((product) => product.family === family)
    .map((product) => ({
      slug: product.slug,
      name: product.name,
      color: product.colorName,
      colorValue: product.colorValue
    }));
}

const heritage = COLLECTIONS[0];
const cowrie = COLLECTIONS[1];
const resort = COLLECTIONS[2];

export const phaseOneCollections: PhaseOneCollection[] = [
  {
    id: "heritage",
    legacyId: "original",
    eyebrow: heritage.igboName,
    title: heritage.englishName,
    description: heritage.description,
    images: phaseOneImagePairs.original,
    href: "/products/ebube",
    variants: collectionVariants("original")
  },
  {
    id: "cowrie",
    legacyId: "with-button",
    eyebrow: cowrie.igboName,
    title: cowrie.englishName,
    description: cowrie.description,
    images: phaseOneImagePairs.withButton,
    href: "/products/ndb1",
    variants: collectionVariants("button")
  },
  {
    id: "resort",
    legacyId: "without-button",
    eyebrow: resort.igboName,
    title: resort.englishName,
    description: resort.description,
    images: phaseOneImagePairs.withoutButton,
    href: "/products/nd1",
    variants: collectionVariants("buttonless")
  }
];

export const homepageCollectionCards = [
  {
    id: "heritage",
    eyebrow: heritage.igboName,
    title: heritage.englishName,
    description: heritage.description,
    href: "/collection#heritage",
    images: phaseOneImagePairs.original
  },
  {
    id: "cowrie",
    eyebrow: cowrie.igboName,
    title: cowrie.englishName,
    description: cowrie.description,
    href: "/collection#cowrie",
    images: phaseOneImagePairs.withButton
  },
  {
    id: "resort",
    eyebrow: resort.igboName,
    title: resort.englishName,
    description: resort.description,
    href: "/collection#resort",
    images: phaseOneImagePairs.withoutButton
  }
];

const activeCampaign = PROMOTIONS.campaigns[PROMOTIONS.activeCampaign];

export const newArrivalsPromotion = {
  title: "Current Offer",
  offer: activeCampaign.title,
  explanation:
    "The discount applies to the lowest-priced qualifying outfit. Promotions do not stack, and shipping is excluded.",
  href: "/collection",
  fullPriceQuantity: 2,
  discountedPosition: 3,
  discountPercent: activeCampaign.discountPercent
};
