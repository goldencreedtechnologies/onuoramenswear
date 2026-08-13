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

const correctedColourImages: Partial<Record<string, string[]>> = {
  ndb6: [
    "/brand/products/button/ndb7/ndb7-front.png",
    "/brand/products/button/ndb7/ndb7-studio.png",
    "/brand/products/button/ndb7/ndb7-back.png"
  ],
  ndb7: [
    "/brand/products/button/ndb6/ndb6-front.png",
    "/brand/products/button/ndb6/ndb6-side.png",
    "/brand/products/button/ndb6/ndb6-back.png"
  ],
  nd6: [
    "/brand/products/buttonless/nd7/nd7-front.png",
    "/brand/products/buttonless/nd7/nd7-studio.png",
    "/brand/products/buttonless/nd7/nd7-back.png"
  ],
  nd7: [
    "/brand/products/buttonless/nd6/nd6-front.png",
    "/brand/products/buttonless/nd6/nd6-back.png"
  ]
};

export const phaseOneImagePairs = {
  original: {
    front: "/brand/products/original/aja/aja-front.png",
    hover: "/brand/products/original/aja/aja-side.png"
  },
  withButton: {
    front: "/brand/products/button/ndb5/ndb5-front.png",
    hover: "/brand/products/button/ndb7/ndb7-front.png"
  },
  withoutButton: {
    front: "/brand/products/buttonless/nd4/nd4-front.png",
    hover: "/brand/products/buttonless/nd3/nd3-angle.png"
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
    .map((product) => {
      const images = correctedColourImages[product.slug] ?? product.images;
      return {
        id: product.slug,
        name: collectionLabel,
        color: product.colorName,
        colorValue: product.colorValue,
        description: collectionLabel,
        images: {
          front: images[0],
          hover: images.find((image) => image.includes("-angle.") || image.includes("-side.") || image.includes("studio")) ?? images[1] ?? images[0]
        },
        prices,
        href: `/products/${product.slug}`
      };
    });
}

const heritage = COLLECTIONS[0];
const cowrie = COLLECTIONS[1];
const resort = COLLECTIONS[2];

export const phaseOneCollections: PhaseOneCollection[] = [
  {
    id: "original",
    eyebrow: heritage.igboName,
    title: heritage.englishName,
    description: heritage.description,
    products: collectionProducts("original", regionalPriceSets.original, heritage.englishName)
  },
  {
    id: "with-button",
    eyebrow: cowrie.igboName,
    title: cowrie.englishName,
    description: cowrie.description,
    products: collectionProducts("button", regionalPriceSets.withButton, cowrie.englishName)
  },
  {
    id: "without-button",
    eyebrow: resort.igboName,
    title: resort.englishName,
    description: resort.description,
    products: collectionProducts("buttonless", regionalPriceSets.withoutButton, resort.englishName)
  }
];

export const homepageCollectionCards = [
  {
    id: "original",
    eyebrow: heritage.igboName,
    title: heritage.englishName,
    description: heritage.description,
    href: "/collection/heritage",
    images: phaseOneImagePairs.original
  },
  {
    id: "with-button",
    eyebrow: cowrie.igboName,
    title: cowrie.englishName,
    description: cowrie.description,
    href: "/collection/cowrie",
    images: phaseOneImagePairs.withButton
  },
  {
    id: "without-button",
    eyebrow: resort.igboName,
    title: resort.englishName,
    description: resort.description,
    href: "/collection/resort",
    images: phaseOneImagePairs.withoutButton
  }
];

const activeCampaign = PROMOTIONS.campaigns[PROMOTIONS.activeCampaign];

export const newArrivalsPromotion = {
  title: "Current Offer",
  offer: activeCampaign.title,
  explanation: "Shipping is calculated separately.",
  href: "/collection",
  fullPriceQuantity: 2,
  discountedPosition: 3,
  discountPercent: activeCampaign.discountPercent
};
