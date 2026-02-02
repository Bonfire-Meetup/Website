import { PHASE_PRODUCTION_BUILD } from "next/constants";

export const isBuildPhase = () => process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
