"use client";

import { useAuthSync } from "@/lib/redux/hooks";

export function AuthInitializer() {
    useAuthSync();

    return null;
}
