import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

import type { AppDispatch, RootState } from "@/lib/redux/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { useAuthStatus, type AuthQueryScope } from "./hooks/useAuthStatus";
export { useAuthBootstrap } from "./hooks/useAuthBootstrap";
export { useVideoEngagementRedux } from "./hooks/useVideoEngagementRedux";
