import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { serverEnv } from "@/lib/config/env";

export const isBuildPhase = () => process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;

export const shouldDisableDbDuringBuild = () =>
  isBuildPhase() && serverEnv.BNF_DISABLE_DB_DURING_BUILD;
