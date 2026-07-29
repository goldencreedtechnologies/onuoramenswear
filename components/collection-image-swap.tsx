import Image from "next/image";
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
      />
      <Image
        src={images.hover}
        alt=""
        aria-hidden="true"
        fill
        sizes={sizes}
        quality={90}
        className={`collection-image-hover ${className}`}
      />
    </>
  );
}
