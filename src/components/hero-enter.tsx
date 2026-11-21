"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HangingRack, type RackJersey } from "@/components/hanging-rack";

export function HeroEnter({ jerseys }: { jerseys: RackJersey[] }) {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1 }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.55)_0%,_transparent_62%)]"
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <div className="flex flex-1 flex-col items-center justify-center pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] sm:pt-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-2 px-4 text-center text-[9px] uppercase tracking-[0.28em] text-neutral-500 sm:text-[10px] sm:tracking-[0.35em]"
          >
            Football · Cricket · Custom
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="font-display px-4 text-center text-[2.75rem] leading-[0.95] tracking-tight text-black sm:text-7xl md:text-8xl"
          >
            Jersey Store
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-3 max-w-md px-6 text-center text-[13px] leading-relaxed text-neutral-600 sm:text-sm"
          >
            Master copies. Fan editions. Custom builds. Matchday ready — drop culture energy.
          </motion.p>

          <div className="relative mt-3 h-[38vh] w-full max-w-6xl sm:mt-6 sm:h-[50vh]">
            <HangingRack jerseys={jerseys} />
          </div>
          <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-neutral-400 sm:hidden">Swipe the rack →</p>
        </div>

        <div className="relative z-20 flex flex-col items-center gap-3 pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] sm:gap-4 sm:pb-16">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/shop"
              className="inline-flex min-h-11 items-center rounded-full border border-black px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-black hover:text-lime"
            >
              See Availability
            </Link>
          </motion.div>
          <Link
            href="/drops"
            className="inline-flex min-h-10 items-center text-[10px] uppercase tracking-[0.28em] text-neutral-500 hover:text-black"
          >
            Enter Drop →
          </Link>
        </div>
      </div>
    </section>
  );
}
