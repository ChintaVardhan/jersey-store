"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { JerseySilhouette } from "@/components/jersey-silhouette";
import { hasProductImage } from "@/lib/utils";

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
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
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
      className="relative flex h-full w-full items-center justify-center"
    >
      {/* Desktop rack */}
      <div className="absolute inset-0 hidden sm:block overflow-hidden">
        <motion.div
          style={{ x: rackShift }}
          className="absolute top-[18%] left-1/2 z-10 h-[3px] w-[min(92vw,1100px)] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-neutral-400 to-transparent shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
        />
        <motion.div
          style={{ x: rackShift }}
          className="absolute top-[18%] left-1/2 z-20 flex w-[min(96vw,1180px)] -translate-x-1/2 items-start justify-between gap-2 px-6"
        >
          {jerseys.map((j, i) => (
            <RackItem key={j.id} j={j} i={i} wide />
          ))}
        </motion.div>
      </div>

      {/* Mobile: swipeable larger jerseys */}
      <div className="absolute inset-0 sm:hidden">
        <div className="absolute top-[12%] left-1/2 z-10 h-[2px] w-[88%] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-neutral-400 to-transparent" />
        <div className="absolute inset-x-0 top-[12%] bottom-0 z-20 overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex h-full w-max snap-x snap-mandatory items-start gap-3 px-[18vw] pt-5">
            {jerseys.map((j, i) => (
              <div key={j.id} className="w-[42vw] max-w-[170px] shrink-0 snap-center">
                <RackItem j={j} i={i} wide={false} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RackItem({ j, i, wide }: { j: RackJersey; i: number; wide: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 + i * 0.06, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex flex-col items-center ${wide ? "w-[13%] min-w-[72px] max-w-[160px]" : "w-full"}`}
    >
      <div className={`mb-0 w-px bg-neutral-500/80 ${wide ? "h-7" : "h-4"}`} />
      <Link
        href={`/product/${j.slug}`}
        className="block w-full transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105 active:scale-[0.98]"
      >
        {hasProductImage(j.image) ? (
          <div
            className="relative aspect-[5/6] w-full overflow-hidden rounded-sm bg-mint/80"
            style={{ transform: `rotateY(${j.tilt * (wide ? 1 : 0.35)}deg) rotateZ(-2deg)`, transformStyle: "preserve-3d" }}
          >
            <Image
              src={j.image}
              alt={j.name}
              fill
              sizes={wide ? "160px" : "42vw"}
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
        <p
          className={`mt-2 truncate text-center text-[9px] font-medium uppercase tracking-[0.14em] text-neutral-600 sm:text-[10px] sm:text-neutral-500 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 ${
            wide ? "" : "opacity-100"
          }`}
        >
          {j.name}
        </p>
      </Link>
    </motion.div>
  );
}
