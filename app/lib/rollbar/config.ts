const baseConfig = {
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.NODE_ENV ?? "development",
};

export const clientConfig = {
  ...baseConfig,
  accessToken: process.env.NEXT_PUBLIC_BNF_ROLLBAR_CLIENT_TOKEN ?? "",
};
