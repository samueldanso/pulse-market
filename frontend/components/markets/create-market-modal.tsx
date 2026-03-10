"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { parseEventLogs } from "viem";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateMarket } from "@/hooks/use-market-actions";
import { PULSE_MARKET_ABI } from "@/lib/contracts/abis";
import { CREATION_BOND_ETH, DURATION_OPTIONS } from "@/constants";
import { useUserStore } from "@/stores/user-store";
import type { CreateMarketForm } from "@/types";

interface CreateMarketModalProps {
  isOpen:  boolean;
  onClose: () => void;
}

const DEFAULT_FORM: CreateMarketForm = {
  question:        "",
  durationSeconds: 300,
};

export function CreateMarketModal({ isOpen, onClose }: CreateMarketModalProps) {
  const address = useUserStore((state) => state.address);
  const [form, setForm] = useState<CreateMarketForm>(DEFAULT_FORM);
  const [createdId, setCreatedId] = useState<bigint | null>(null);

  const {
    createMarket,
    receipt,
    isPending,
    isSuccess,
    error,
    reset,
  } = useCreateMarket();

  useEffect(() => {
    if (isSuccess && receipt) {
      try {
        const logs = parseEventLogs({
          abi:       PULSE_MARKET_ABI,
          eventName: "MarketCreated",
          logs:      receipt.logs,
        });
        if (logs.length > 0) {
          const id = (logs[0].args as { marketId: bigint }).marketId;
          setCreatedId(id);
          toast.success(`Market #${id} created!`);
        }
      } catch {}
    }
  }, [isSuccess, receipt]);

  function handleClose() {
    setForm(DEFAULT_FORM);
    setCreatedId(null);
    reset();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.question.trim()) return;
    createMarket(form);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md border-white/[0.08] bg-white dark:bg-zinc-950">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-pulse-black dark:text-white">
            Create Market
          </DialogTitle>
          <p className="text-xs text-pulse-gray">
            Requires {CREATION_BOND_ETH} AVAX creation bond (counts as your UP bet)
          </p>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleSubmit}
              className="space-y-5 pt-2"
            >
              {/* Question */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-pulse-black dark:text-white">
                  Market Question *
                </label>
                <textarea
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-pulse-black dark:text-white placeholder:text-pulse-gray outline-none focus:border-pulse-red-500/50 h-24"
                  placeholder="Will Elon Musk tweet about crypto this week?"
                  maxLength={280}
                  required
                />
                <p className="text-right text-xs text-pulse-gray">
                  {form.question.length}/280
                </p>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-pulse-black dark:text-white">
                  Duration
                </label>
                <select
                  value={form.durationSeconds}
                  onChange={(e) => setForm((f) => ({ ...f, durationSeconds: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-pulse-black dark:text-white outline-none focus:border-pulse-red-500/50"
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Cost notice */}
              <div className="flex items-center gap-2 rounded-lg border border-pulse-red-500/20 bg-pulse-red-500/5 px-3 py-2.5 text-xs text-pulse-gray">
                <svg className="size-4 shrink-0 text-pulse-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Creation bond:{" "}
                <strong className="text-pulse-black dark:text-white ml-1">
                  {CREATION_BOND_ETH} AVAX
                </strong>
                <span className="text-pulse-gray ml-1">— your initial UP position.</span>
              </div>

              {error && (
                <p className="text-xs text-pulse-down">
                  {(error as {shortMessage?: string}).shortMessage ?? error.message}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={!address || isPending || !form.question.trim()}
                className="w-full bg-pulse-red-500 hover:bg-pulse-red-600 font-bold text-white disabled:opacity-40"
              >
                {!address
                  ? "Connect Wallet First"
                  : isPending
                    ? "Creating..."
                    : "Create Market →"}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-6 text-center"
            >
              <div className="flex size-16 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20">
                <svg className="size-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-pulse-black dark:text-white">
                  Market Created!
                </h3>
                {createdId !== null && (
                  <p className="mt-1 text-sm text-pulse-gray">Market #{createdId.toString()}</p>
                )}
              </div>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
