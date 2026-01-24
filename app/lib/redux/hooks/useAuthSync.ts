"use client";

import { useEffect } from "react";

import {
    clearAccessToken,
    decodeAccessToken,
    isAccessTokenValid,
    readAccessToken,
    writeAccessToken,
} from "@/lib/auth/client";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { clearAuth, setToken } from "@/lib/redux/slices/authSlice";

export function useAuthSync() {
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);

    // On mount, sync with localStorage
    useEffect(() => {
        const token = readAccessToken();
        if (token && isAccessTokenValid(token)) {
            const decoded = decodeAccessToken(token);
            dispatch(setToken({ token, decoded: decoded ?? undefined }));
        } else {
            dispatch(clearAuth());
            clearAccessToken();
        }
    }, [dispatch]);

    // When auth token changes in Redux, update localStorage
    useEffect(() => {
        if (!auth.hydrated) {
            return;
        }

        if (auth.token) {
            writeAccessToken(auth.token);
        } else if (!auth.isAuthenticated) {
            clearAccessToken();
        }
    }, [auth.token, auth.isAuthenticated, auth.hydrated]);

    return auth;
}
