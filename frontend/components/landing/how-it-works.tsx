"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { SceneContainer } from "@/components/scene/scene-container";
import { Button } from "@/components/ui/button";

function ArrowRight() {
  return (
    <HugeiconsIcon
      icon={ArrowRight01Icon}
      size={14}
      color="currentColor"
      strokeWidth={1.5}
      className="translate-y-px"
    />
  );
}

export function HowitWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative mx-auto mb-32 max-w-[1100px] px-6"
    >
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-10 shadow-sm dark:border-white/10 dark:bg-zinc-950 md:p-16">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          <div>
            <h2 className="mb-5 text-3xl font-medium text-pulse-black dark:text-white md:text-4xl">
              UP or DOWN on attention.
            </h2>
            <p className="mb-10 max-w-sm text-base font-medium leading-relaxed text-pulse-gray">
              Pick a narrative market (e.g. Will Elon Musk tweet about crypto this week?). Bet UP if you
              think the hype will spike, DOWN if you think it won&apos;t. Winners split the pot
              proportionally when the market resolves.
            </p>
            <Button asChild className="h-12 flex items-center gap-2.5 rounded-xl bg-pulse-black px-7 py-3.5 text-xs font-semibold text-white transition-opacity hover:bg-black/80 dark:bg-pulse-red-500 dark:text-white dark:shadow-none dark:hover:bg-pulse-red-400">
              <Link href="/markets">
                Explore Markets <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="relative flex h-[350px] items-center justify-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 border-b border-gray-200 pb-2 font-mono text-[10px] uppercase tracking-widest text-pulse-gray">
              Settlement Contract
            </div>
            <div className="pointer-events-none size-full">
              <SceneContainer type="agent" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-16 right-0 left-0 hidden border-t border-dashed border-gray-200 md:block" />
    </section>
  );
}
