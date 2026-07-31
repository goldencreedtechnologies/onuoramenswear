import Image from "next/image";
import type { CSSProperties } from "react";
import type { CollectionImagePair } from "@/data/phase-one-collections";

type CollectionImageSwapProps = {
  images: CollectionImagePair;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function CollectionImageSwap({
  images,
  alt,
  sizes,
  priority = false,
  className = "object-cover object-center"
}: CollectionImageSwapProps) {
  const preserveHomepageHeadroom =
    images.front === "/brand/products/buttonless/nd3/nd3-front.webp" &&
    alt === "Uzọ: Resort Collection";

  const imageStyle: CSSProperties | undefined = preserveHomepageHeadroom
    ? {
        objectFit: "cover",
        objectPosition: "50% 0%",
        transform: "scale(1)",
        transformOrigin: "50% 0%"
      }
    : undefined;

  return (
    <>
      <Image
        src={images.front}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={90}
        className={`collection-image-primary ${className}`}
        style={imageStyle}
      />
      <Image
        src={images.hover}
        alt=""
        aria-hidden="true"
        fill
        sizes={sizes}
        quality={90}
        className={`collection-image-hover ${className}`}
        style={imageStyle}
      />
    </>
  );
}
