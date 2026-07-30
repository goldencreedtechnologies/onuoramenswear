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

export type PhaseOneCollection = {
  id: "original" | "with-button" | "without-button";
  eyebrow: string;
  title: string;
  description: string;
  products: PhaseOneCollectionProduct[];
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

function collectionProducts(
  family: ProductFamily,
  prices: RegionalPrices,
  collectionLabel: string
): PhaseOneCollectionProduct[] {
  return products
    .filter((product) => product.family === family)
    .map((product) => ({
      id: product.slug,
      name: product.name,
      color: product.colorName,
      colorValue: product.colorValue,
      description: collectionLabel,
      images: {
        front: product.image,
        hover: product.images.find((image) => image.includes("-angle.")) ?? product.images[1]
      },
      prices,
      href: `/products/${product.slug}`
    }));
}

const heritage = COLLECTIONS[0];
const cowrie = COLLECTIONS[1];
const resort = COLLECTIONS[2];

export const phaseOneCollections: PhaseOneCollection[] = [
  {
    id: "original",
    eyebrow: heritage.englishName,
    title: heritage.igboName,
    description: heritage.description,
    products: collectionProducts("original", regionalPriceSets.original, heritage.englishName)
  },
  {
    id: "with-button",
    eyebrow: cowrie.englishName,
    title: cowrie.igboName,
    description: cowrie.description,
    products: collectionProducts("button", regionalPriceSets.withButton, cowrie.englishName)
  },
  {
    id: "without-button",
    eyebrow: resort.englishName,
    title: resort.igboName,
    description: resort.description,
    products: collectionProducts("buttonless", regionalPriceSets.withoutButton, resort.englishName)
  }
];

export const homepageCollectionCards = [
  {
    id: "without-button",
    eyebrow: resort.englishName,
    title: resort.igboName,
    description: resort.description,
    href: "/collection#without-button",
    images: phaseOneImagePairs.withoutButton
  },
  {
    id: "with-button",
    eyebrow: cowrie.englishName,
    title: cowrie.igboName,
    description: cowrie.description,
    href: "/collection#with-button",
    images: phaseOneImagePairs.withButton
  },
  {
    id: "original",
    eyebrow: heritage.englishName,
    title: heritage.igboName,
    description: heritage.description,
    href: "/collection#original",
    images: phaseOneImagePairs.original
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
