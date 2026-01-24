import crypto from "crypto";

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { UserAvatar } from "@/components/user/UserAvatar";
import { getAuthUserById } from "@/lib/data/auth";
import { decompressUuid } from "@/lib/utils/uuid-compress";

import { BoostedVideos } from "./BoostedVideos";
import { BoostedVideosSkeleton } from "./BoostedVideosSkeleton";

const hashEmail = (email: string): string =>
  crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
  const userId = decompressUuid(id);

  if (!userId) {
    return { title: t("userProfileNotFound") };
  }

  const user = await getAuthUserById(userId);
  const brandName = tCommon("brandName");

  if (!user || !user.public_profile) {
    const title = t("privateProfileTitle", { brandName });
    const description = t("privateProfileDescription", { brandName });
    return {
      description,
      openGraph: { description, title, type: "profile" },
      robots: { follow: false, index: false },
      title,
      twitter: { card: "summary", description, title },
    };
  }

  const memberSince = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(user.created_at));

  const name = user.name || t("communityMember");
  const values = { brandName, memberSince, name };

  const title = t("userProfileTitle", values);
  const description = t("userProfileDescription", values);

  return {
    description,
    openGraph: {
      description,
      title,
      type: "profile",
      username: user.name || undefined,
    },
    title,
    twitter: {
      card: "summary",
      description,
      title,
    },
  };
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("account.userProfile");
  const userId = decompressUuid(id);

  if (!userId) {
    notFound();
  }

  const user = await getAuthUserById(userId);
  if (!user) {
    notFound();
  }

  if (!user.public_profile) {
    return (
      <>
        <Header />
        <main className="gradient-bg min-h-screen px-4 pt-32 pb-20">
          <div className="mx-auto max-w-2xl">
            <div className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white/90 p-10 text-center shadow-2xl shadow-black/5 backdrop-blur-md sm:p-12 dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-black/25">
              {/* Subtle pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(139,92,246,0.02)_50%,transparent_100%)] dark:bg-[linear-gradient(to_right,transparent_0%,rgba(139,92,246,0.03)_50%,transparent_100%)]" />

              <div className="relative">
                {/* Icon with gradient background */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 shadow-lg dark:from-neutral-800 dark:to-neutral-700">
                  <svg
                    className="h-10 w-10 text-neutral-500 dark:text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>

                <h1 className="mb-3 text-2xl font-black text-neutral-900 sm:text-3xl dark:text-white">
                  {t("private.title")}
                </h1>
                <p className="text-base text-neutral-600 dark:text-neutral-400">
                  {t("private.message")}
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const emailHash = hashEmail(user.email);
  const memberSince = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(user.created_at));

  return (
    <>
      <Header />
      <main className="gradient-bg min-h-screen">
        <div className="relative overflow-hidden">
          {/* Subtle gradient overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.06),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(217,70,239,0.04),transparent_40%)] dark:bg-[radial-gradient(ellipse_at_bottom_right,rgba(217,70,239,0.06),transparent_40%)]" />

          <div className="relative px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
            <div className="mx-auto max-w-5xl">
              {/* Profile card - centered and prominent */}
              <div className="mb-8 sm:mb-12">
                <div className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white/90 shadow-2xl shadow-black/5 backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-black/25">
                  {/* Decorative top border */}
                  <div className="from-brand-500 to-brand-500 absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r via-rose-500" />

                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(139,92,246,0.02)_50%,transparent_100%)] dark:bg-[linear-gradient(to_right,transparent_0%,rgba(139,92,246,0.03)_50%,transparent_100%)]" />

                  <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-12 lg:py-16">
                    <div className="flex flex-col items-center text-center">
                      {/* Avatar with subtle ring */}
                      <div className="relative mb-8">
                        <div className="from-brand-400/20 to-brand-400/20 absolute inset-0 rounded-full bg-gradient-to-br via-rose-400/20 blur-2xl" />
                        <UserAvatar
                          emailHash={emailHash}
                          size={140}
                          name={user.name}
                          className="relative shadow-2xl ring-4 ring-white/50 dark:ring-neutral-800/50"
                        />
                      </div>

                      {/* Name with better spacing */}
                      <div className="mb-6 w-full space-y-4">
                        {user.name && (
                          <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
                            {user.name}
                          </h1>
                        )}

                        {/* Member since badge - cleaner design */}
                        <div className="inline-flex items-center gap-2.5 rounded-full border border-neutral-200/70 bg-neutral-50/90 px-5 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                          <svg
                            className="text-brand-600 dark:text-brand-400 h-4.5 w-4.5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="whitespace-nowrap">
                            {t("memberSince")} {memberSince}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boosted videos section */}
              <Suspense fallback={<BoostedVideosSkeleton />}>
                <BoostedVideos userId={userId} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
