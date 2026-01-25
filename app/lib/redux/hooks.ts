import type { AppDispatch, RootState } from "@/lib/redux/store";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { useAuthSync } from "./hooks/useAuthSync";
export { useVideoEngagementRedux } from "./hooks/useVideoEngagementRedux";
