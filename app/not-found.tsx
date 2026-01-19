import Link from "next/link";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

function FireIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
      />
    </svg>
  );
}

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
            <Link href="/" className="glass-button px-8 py-3">
              Back to Home
            </Link>
            <Link href="/library" className="glass-button-secondary px-8 py-3">
              Browse Library
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
