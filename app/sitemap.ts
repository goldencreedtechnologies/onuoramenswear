import type { MetadataRoute } from "next";
import { products } from "@/data/catalog";

const siteUrl = "https://onuoramenswear.com";

const publicRoutes = [
  "",
  "/about",
  "/collection",
  "/collections",
  "/contact",
  "/journal",
  "/privacy",
  "/returns",
  "/services",
  "/shipping",
  "/terms"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...publicRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      changeFrequency: route === "" ? "weekly" as const : "monthly" as const,
      priority: route === "" ? 1 : 0.7
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8
    }))
  ];
}
