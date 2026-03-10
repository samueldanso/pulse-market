"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MarketCard } from "@/components/markets/market-card";
import { CreateMarketModal } from "@/components/markets/create-market-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useMarkets, useMarketCount } from "@/hooks/use-pulse-market";
import { MarketStatus } from "@/types";

const PAGE_SIZE = 12n;

type FilterTab = "all" | "active" | "resolved";

export default function MarketsPage() {
  const [filter, setFilter]         = useState<FilterTab>("all");
  const [page, setPage]             = useState(0n);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { count }              = useMarketCount();
  const { markets, isLoading, refetch } = useMarkets(page * PAGE_SIZE, PAGE_SIZE);

  const filtered = markets.filter((m) => {
    if (filter === "active")   return m.status === MarketStatus.Active;
    if (filter === "resolved") return m.status === MarketStatus.Resolved;
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all",      label: "All Markets" },
    { key: "active",   label: "Active"      },
    { key: "resolved", label: "Resolved"    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-pulse-black dark:text-white">
            Prediction Markets
          </h1>
          <p className="mt-2 text-pulse-gray">
            Bet YES or NO on on-chain markets. Winners split the pool.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-pulse-red-500 hover:bg-pulse-red-600 font-semibold text-white"
        >
          + Create Market
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setFilter(tab.key); setPage(0n); }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
              filter === tab.key
                ? "bg-pulse-red-500 text-white"
                : "border border-white/10 bg-white/3 text-pulse-gray hover:text-pulse-black dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto text-sm text-pulse-gray">
          {count.toString()} total
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 text-5xl">📊</div>
          <p className="text-lg font-medium text-pulse-black dark:text-white">No markets yet</p>
          <p className="mt-1 text-sm text-pulse-gray">Be the first to create a prediction market!</p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 bg-pulse-red-500 hover:bg-pulse-red-600 text-white"
          >
            Create First Market
          </Button>
        </div>
      ) : (
        <motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((market) => (
              <motion.div
                key={market.id.toString()}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <MarketCard market={market} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination */}
      {count > PAGE_SIZE && (
        <div className="mt-10 flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPage((p) => p - 1n)}
            disabled={page === 0n}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-pulse-gray">
            Page {(page + 1n).toString()}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1n)}
            disabled={(page + 1n) * PAGE_SIZE >= count}
          >
            Next
          </Button>
        </div>
      )}

      <CreateMarketModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); refetch(); }}
      />
    </main>
  );
}
