import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function WatchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-18">{children}</main>
      <Footer />
    </>
  );
}
