import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { InstallPrompt } from "@/components/ui/InstallPrompt";
import GlobalAudio from "@/components/ui/GlobalAudio";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <GlobalAudio />
      <Footer />
      <InstallPrompt />
    </div>
  );
}
