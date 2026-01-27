import { MeClient } from "./MeClient";

export default async function MePage() {
  return (
    <main className="gradient-bg-static min-h-screen px-4 pt-32 pb-20">
      <div className="mx-auto max-w-6xl">
        <MeClient />
      </div>
    </main>
  );
}
