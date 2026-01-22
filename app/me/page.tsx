import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

import { MeClient } from "./MeClient";

export default async function MePage() {
  return (
    <>
      <Header />
      <main className="gradient-bg min-h-screen px-4 pt-32 pb-20">
        <div className="mx-auto max-w-6xl">
          <MeClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
