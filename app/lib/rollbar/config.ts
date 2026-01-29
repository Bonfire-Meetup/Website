const baseConfig = {
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.NODE_ENV ?? "development",
};

export const clientConfig = {
  ...baseConfig,
  accessToken: process.env.NEXT_PUBLIC_BNF_ROLLBAR_CLIENT_TOKEN ?? "",
  payload: {
    client: {
      javascript: {
        source_map_enabled: true,
        code_version: process.env.NEXT_PUBLIC_BNF_VERSION ?? "",
        guess_uncaught_frames: true,
      },
    },
  },
};
