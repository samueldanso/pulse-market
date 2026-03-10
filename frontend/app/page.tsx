"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { Navbar } from "@/components/landing/navbar";
import { PartnersSection } from "@/components/landing/partners-section";

const HeroSection = dynamic(
  () =>
    import("@/components/landing/hero-section").then((mod) => mod.HeroSection),
  { ssr: false },
);

const FeaturesSection = dynamic(
  () =>
    import("@/components/landing/features-section").then(
      (mod) => mod.FeaturesSection,
    ),
  { ssr: false },
);

const HowitWorksSection = dynamic(
  () =>
    import("@/components/landing/how-it-works").then(
      (mod) => mod.HowitWorksSection,
    ),
  { ssr: false },
);

export default function Page() {
  const router = useRouter();
  const address = useUserStore((state) => state.address);

  useEffect(() => {
    if (address) {
      router.replace("/markets");
    }
  }, [address, router]);

  return (
    <div className="min-h-screen bg-pulse-bg font-sans text-pulse-black selection:bg-pulse-red-300/20 dark:bg-black dark:text-white">
      <Navbar />
      <main className="relative overflow-hidden">
        <HeroSection />
        <FeaturesSection />
        <HowitWorksSection />
        <PartnersSection />
      </main>
    </div>
  );
}
