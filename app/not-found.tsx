import Link from "next/link";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { FireIcon } from "./components/shared/icons";
import { PAGE_ROUTES } from "./lib/routes/pages";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="gradient-bg flex min-h-screen flex-col items-center justify-center px-4 pt-18">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <FireIcon className="h-24 w-24 text-brand-500 opacity-20" />
              <span className="absolute inset-0 flex items-center justify-center text-5xl font-black text-brand-500">
                404
              </span>
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Page not found
          </h1>
          <p className="mb-8 max-w-md text-lg text-neutral-600 dark:text-neutral-400">
            The fire went out here. This page doesn&apos;t exist or has been moved.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href={PAGE_ROUTES.HOME} className="glass-button px-8 py-3">
              Back to Home
            </Link>
            <Link href={PAGE_ROUTES.LIBRARY} className="glass-button-secondary px-8 py-3">
              Browse Library
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
