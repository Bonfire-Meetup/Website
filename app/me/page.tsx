import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MeClient } from "./MeClient";

export default async function MePage() {
  return (
    <>
      <Header />
      <main className="gradient-bg min-h-screen pt-32 pb-20 px-4">
        <div className="mx-auto max-w-6xl">
          <MeClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
