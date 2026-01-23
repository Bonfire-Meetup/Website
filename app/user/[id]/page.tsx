import crypto from "crypto";

import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { UserAvatar } from "@/components/user/UserAvatar";
import { getAuthUserById } from "@/lib/data/auth";
import { decompressUuid } from "@/lib/utils/uuid-compress";

const hashEmail = (email: string): string =>
  crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("account.userProfile");
  const userId = decompressUuid(id);

  return { title: userId ? t("title") : t("notFound.title") };
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
      <main className="gradient-bg min-h-screen px-4 pt-32 pb-20">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-neutral-200/70 bg-white/70 p-8 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col items-center gap-6 text-center">
              <UserAvatar emailHash={emailHash} size={120} name={user.name} />
              <div>
                {user.name && (
                  <h1 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">
                    {user.name}
                  </h1>
                )}
                <div className="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    {t("memberSince")} {memberSince}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
