"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { JerseySilhouette } from "@/components/jersey-silhouette";

export type RackJersey = {
  id: string;
  slug: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  image?: string | null;
  tilt: number;
};

type Props = {
  jerseys: RackJersey[];
};

export function HangingRack({ jerseys }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 40, damping: 20 });
  const rackShift = useTransform(springX, [-200, 200], [40, -40]);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left - rect.width / 2;
    x.set(px * 0.35);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => x.set(0)}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
    >
      <motion.div
        style={{ x: rackShift }}
        className="absolute top-[18%] left-1/2 z-10 h-[3px] w-[min(92vw,1100px)] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-neutral-400 to-transparent shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
      />
      <motion.div
        style={{ x: rackShift }}
        className="absolute top-[18%] left-1/2 z-20 flex w-[min(96vw,1180px)] -translate-x-1/2 items-start justify-between gap-1 px-2 sm:gap-2 sm:px-6"
      >
        {jerseys.map((j, i) => (
          <motion.div
            key={j.id}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex w-[13%] min-w-[64px] max-w-[160px] flex-col items-center"
          >
            <div className="mb-0 h-5 w-px bg-neutral-500/80 sm:h-7" />
            <Link
              href={`/product/${j.slug}`}
              className="block w-full transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105"
            >
              {j.image ? (
                <div
                  className="relative aspect-[5/6] w-full overflow-hidden rounded-sm bg-mint/80"
                  style={{ transform: `rotateY(${j.tilt}deg) rotateZ(-2deg)`, transformStyle: "preserve-3d" }}
                >
                  <Image
                    src={j.image}
                    alt={j.name}
                    fill
                    sizes="160px"
                    className="object-contain drop-shadow-xl"
                    priority={i < 4}
                  />
                </div>
              ) : (
                <JerseySilhouette
                  primary={j.primary}
                  secondary={j.secondary}
                  accent={j.accent}
                  tilt={j.tilt}
                  className="aspect-[5/6] w-full"
                />
              )}
              <p className="mt-2 truncate text-center text-[9px] font-medium uppercase tracking-[0.14em] text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100 sm:text-[10px]">
                {j.name}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
