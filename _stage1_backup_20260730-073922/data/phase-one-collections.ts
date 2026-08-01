import { products, type ProductFamily } from "@/data/catalog";

export type RegionalCurrency = "NGN" | "USD" | "GBP";

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
  id: "without-button" | "with-button";
  eyebrow: string;
  title: string;
  description: string;
  products: PhaseOneCollectionProduct[];
};

export const phaseOneImagePairs = {
  withoutButton: {
    front: "/brand/products/buttonless/nd1/nd1-studio-registered.webp",
    hover: "/brand/products/buttonless/nd3/nd3-studio-registered.webp"
  },
  withButton: {
    front: "/brand/products/button/ndb1/ndb1-studio-registered.webp",
    hover: "/brand/products/button/ndb3/ndb3-studio-registered.webp"
  },
  original: {
    front: "/brand/products/original/ndu/ndu-studio-idris.webp",
    hover: "/brand/products/original/aja/aja-angle.webp"
  }
} satisfies Record<string, CollectionImagePair>;

export const regionalPriceSets = {
  withoutButton: {
    NGN: 120000,
    USD: 125,
    GBP: 100
  },
  withButton: {
    NGN: 125000,
    USD: 120,
    GBP: 105
  },
  original: {
    NGN: 100000,
    USD: 100,
    GBP: 75
  }
} satisfies Record<string, RegionalPrices>;

function collectionProducts(
  family: ProductFamily,
  prices: RegionalPrices
): PhaseOneCollectionProduct[] {
  return products
    .filter((product) => product.family === family)
    .map((product) => ({
      id: product.slug,
      name: product.name,
      color: product.colorName,
      colorValue: product.colorValue,
      description: product.meaning,
      images: {
        front: product.image,
        hover: product.images.find((image) => image.includes("-angle.")) ?? product.images[1]
      },
      prices,
      href: `/products/${product.slug}`
    }));
}

export const phaseOneCollections: PhaseOneCollection[] = [
  {
    id: "without-button",
    eyebrow: "Resort Collection",
    title: "Uzọ",
    description:
      "A clean interpretation of modern African tailoring across five considered colourways.",
    products: collectionProducts("buttonless", regionalPriceSets.withoutButton)
  },
  {
    id: "with-button",
    eyebrow: "Cowrie Collection",
    title: "Ọzọ",
    description:
      "Our signature three-cowry resort set, finished with relaxed structure.",
    products: collectionProducts("button", regionalPriceSets.withButton)
  }
];

export const homepageCollectionCards = [
  {
    id: "without-button",
    eyebrow: "Resort Collection",
    title: "Uzọ",
    description: "A clean interpretation of modern African tailoring.",
    href: "/collection#without-button",
    images: phaseOneImagePairs.withoutButton
  },
  {
    id: "with-button",
    eyebrow: "Cowrie Collection",
    title: "Ọzọ",
    description: "Our signature three-cowry resort set.",
    href: "/collection#with-button",
    images: phaseOneImagePairs.withButton
  },
  {
    id: "original",
    eyebrow: "Heritage Collection",
    title: "Nkwọ",
    description: "The original silhouette that established ỌNUỌRA.",
    href: "/collection#original",
    images: phaseOneImagePairs.original
  }
];

export const newArrivalsPromotion = {
  title: "NEW ARRIVALS",
  offer: "Buy 2 outfits and get 50% OFF the 3rd.",
  explanation:
    "The offer repeats across the order: the 3rd and 6th outfits each receive 50% off when six are purchased.",
  href: "/collection#without-button",
  fullPriceQuantity: 2,
  discountedPosition: 3,
  discountPercent: 50
};
