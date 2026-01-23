import crypto from "crypto";

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AccentBar } from "@/components/ui/AccentBar";
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
            <div className="rounded-2xl border border-neutral-200/70 bg-white/70 p-8 text-center dark:border-white/10 dark:bg-white/5">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
                <svg
                  className="h-8 w-8 text-neutral-400 dark:text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
                {t("private.title")}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {t("private.message")}
              </p>
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(217,70,239,0.06),transparent_40%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(217,70,239,0.08),transparent_40%)]" />

          <div className="relative px-4 pt-24 pb-12 sm:px-6 sm:pt-32 sm:pb-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:gap-8">
                <div className="relative overflow-hidden rounded-3xl border border-neutral-200/50 bg-white/80 shadow-xl shadow-black/5 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80 dark:shadow-black/20">
                  <div className="from-brand-400 to-brand-400 absolute top-0 left-0 h-1 w-full bg-gradient-to-r via-rose-400" />

                  <div className="relative px-6 py-8 sm:px-8 sm:py-10 lg:px-6 lg:py-8">
                    <div className="flex flex-col items-center gap-6 text-center">
                      <div className="relative">
                        <UserAvatar
                          emailHash={emailHash}
                          size={120}
                          name={user.name}
                          className="relative shadow-2xl"
                        />
                      </div>

                      <div className="w-full space-y-3">
                        {user.name && (
                          <div className="flex items-center justify-center gap-3">
                            <AccentBar size="lg" />
                            <h1 className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl lg:text-2xl dark:from-white dark:via-neutral-100 dark:to-white">
                              {user.name}
                            </h1>
                          </div>
                        )}
                        <div className="flex items-center gap-2 rounded-full border border-neutral-200/60 bg-neutral-50/80 px-4 py-2 text-sm font-medium whitespace-nowrap text-neutral-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                          <svg
                            className="text-brand-600 dark:text-brand-400 h-4 w-4 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-xs whitespace-nowrap sm:text-sm">
                            {t("memberSince")} {memberSince}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Suspense fallback={<BoostedVideosSkeleton />}>
                  <BoostedVideos userId={userId} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
