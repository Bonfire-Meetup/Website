import "server-only";

import { cacheLife } from "next/cache";

import { extractApiReference, getSourceVersion } from "./extract";

async function getCachedApiReference(_sourceVersion: string) {
  "use cache";
  cacheLife("max");

  const reference = await extractApiReference();

  return reference;
}

export async function getApiReference() {
  const sourceVersion = process.env.NODE_ENV === "development" ? await getSourceVersion() : "build";

  return getCachedApiReference(sourceVersion);
}
