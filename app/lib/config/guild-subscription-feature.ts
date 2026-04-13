import "server-only";

import { serverEnv } from "@/lib/config/env";

export const isGuildSubscriptionEnabled = (): boolean => serverEnv.BNF_ENABLE_GUILD_SUBSCRIPTION;
