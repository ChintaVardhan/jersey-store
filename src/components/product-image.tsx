"use client";

import Image from "next/image";
import { JerseySilhouette } from "@/components/jersey-silhouette";
import { hasProductImage, parseImageColors } from "@/lib/utils";

type Props = {
  image?: string | null;
  imageColors: string;
  alt: string;
  className?: string;
  tilt?: number;
  name?: string;
  number?: string;
  priority?: boolean;
};

export function ProductImage({
  image,
  imageColors,
  alt,
  className = "",
  tilt = -8,
  name,
  number,
  priority,
}: Props) {
  const colors = parseImageColors(imageColors);

  if (hasProductImage(image)) {
    return (
      <div className={`relative overflow-hidden bg-mint/70 ${className}`}>
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-mint/70 ${className}`}>
      <JerseySilhouette
        primary={colors.primary}
        secondary={colors.secondary}
        accent={colors.accent}
        tilt={tilt}
        name={name}
        number={number}
        className="h-[78%] w-[70%]"
      />
    </div>
  );
}
