import { ThemeProvider } from "@/components/theme-provider";
import { AppNavbar } from "@/components/app-navbar";
import { Toaster } from "sonner";

export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-pulse-bg">
        <AppNavbar />
        {children}
        <Toaster position="top-right" richColors />
      </div>
    </ThemeProvider>
  );
}
