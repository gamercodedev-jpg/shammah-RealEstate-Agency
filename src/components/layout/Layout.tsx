import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AccreditationTrust } from "./AccreditationTrust";
import { InstallPrompt } from "@/components/ui/InstallPrompt";
import GlobalAudio from "@/components/ui/GlobalAudio";
import { usePlotsRealtime } from "@/hooks/usePlots";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  usePlotsRealtime();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <GlobalAudio />
      <AccreditationTrust />
      <Footer />
      <InstallPrompt />
    </div>
  );
}
