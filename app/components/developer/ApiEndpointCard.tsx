"use client";

import { useTranslations } from "next-intl";
import { Fragment, type ReactNode } from "react";

import type { ApiAccess, ApiEndpoint, ApiMethod, ApiResponse } from "@/lib/api/reference/types";

import { ApiTypeBlock } from "./ApiTypeBlock";

const METHOD_CLASS: Record<ApiMethod, string> = {
  DELETE: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  GET: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  PATCH: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  POST: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  PUT: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

const ACCESS_CLASS: Record<ApiAccess["kind"], string> = {
  "optional-user": "border-neutral-200 text-neutral-600 dark:border-white/10 dark:text-neutral-300",
  public: "border-neutral-200 text-neutral-600 dark:border-white/10 dark:text-neutral-300",
  role: "border-orange-300/60 text-orange-700 dark:border-orange-400/30 dark:text-orange-300",
  secret: "border-violet-300/60 text-violet-700 dark:border-violet-400/30 dark:text-violet-300",
  self: "border-sky-300/60 text-sky-700 dark:border-sky-400/30 dark:text-sky-300",
  signature: "border-violet-300/60 text-violet-700 dark:border-violet-400/30 dark:text-violet-300",
  user: "border-sky-300/60 text-sky-700 dark:border-sky-400/30 dark:text-sky-300",
};

export const endpointAnchor = (endpoint: ApiEndpoint) =>
  `${endpoint.method}-${endpoint.path}`.toLowerCase().replace(/[^a-z0-9]+/gu, "-");

const responseKey = (response: ApiResponse) =>
  [
    response.status,
    response.error,
    response.fields?.join(","),
    response.shape ? "shape" : "",
    response.stream ? "stream" : "",
  ].join("|");

const statusClass = (status: number) => {
  if (status >= 500) {
    return "text-rose-600 dark:text-rose-400";
  }
  if (status >= 400) {
    return "text-amber-600 dark:text-amber-400";
  }

  return "text-emerald-600 dark:text-emerald-400";
};

export function MethodBadge({ method }: { method: ApiMethod }) {
  return (
    <span
      className={`inline-flex w-16 shrink-0 justify-center rounded-md px-2 py-0.5 font-mono text-xs font-bold ${METHOD_CLASS[method]}`}
    >
      {method}
    </span>
  );
}

function ApiPath({ path }: { path: string }) {
  return (
    <code className="font-mono text-sm font-semibold break-words text-neutral-900 dark:text-white">
      {path
        .split("/")
        .slice(1)
        .map((segment, index, segments) => ({
          key: segments.slice(0, index + 1).join("/"),
          segment,
        }))
        .map(({ key, segment }) => (
          <Fragment key={key}>
            /
            {segment.startsWith("{") ? (
              <span className="text-orange-600 dark:text-orange-400">{segment}</span>
            ) : (
              segment
            )}
            <wbr />
          </Fragment>
        ))}
    </code>
  );
}

function DocText({ text }: { text: string }) {
  return text.split(/`(?<code>[^`]+)`/u).map((part, index) =>
    index % 2 === 1 ? (
      <code
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className="surface-inset px-1 py-0.5 font-mono text-xs text-neutral-800 dark:text-neutral-100"
      >
        {part}
      </code>
    ) : (
      part
    ),
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h4 className="eyebrow text-2xs text-neutral-500 dark:text-neutral-400">{title}</h4>
      {children}
    </section>
  );
}

function ResponseRow({ response }: { response: ApiResponse }) {
  const t = useTranslations("developerPage.response");

  return (
    <li className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className={`font-mono text-sm font-bold tabular-nums ${statusClass(response.status)}`}
        >
          {response.status}
        </span>
        {response.error ? (
          <code className="font-mono text-xs text-neutral-700 dark:text-neutral-200">
            {response.error}
          </code>
        ) : null}
        {response.fields ? (
          <code className="font-mono text-xs text-neutral-600 dark:text-neutral-300">
            {`{ ${response.fields.join(", ")} }`}
          </code>
        ) : null}
        {response.stream ? (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{t("stream")}</span>
        ) : null}
        {!response.error && !response.fields && !response.stream && !response.shape ? (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{t("empty")}</span>
        ) : null}
      </div>
      {response.shape ? <ApiTypeBlock info={response.shape} /> : null}
    </li>
  );
}

export function ApiEndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const t = useTranslations("developerPage");
  const { access } = endpoint;
  const accessLabel =
    access.kind === "role" ? t("access.role", { role: access.role }) : t(`access.${access.kind}`);
  const hasDetails =
    endpoint.pathParams.length > 0 ||
    endpoint.queryParams.length > 0 ||
    endpoint.body !== null ||
    endpoint.responses.length > 0;

  return (
    <article id={endpointAnchor(endpoint)} className="surface scroll-mt-28 p-4 sm:p-5">
      <header className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <MethodBadge method={endpoint.method} />
          <ApiPath path={endpoint.path} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ACCESS_CLASS[access.kind]}`}
          >
            {accessLabel}
          </span>
          {endpoint.rateLimited ? (
            <span className="inline-flex items-center rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-500 dark:border-white/10 dark:text-neutral-400">
              {t("rateLimited")}
            </span>
          ) : null}
        </div>
        {endpoint.summary ? (
          <p className="text-sm text-neutral-700 dark:text-neutral-200">
            <DocText text={endpoint.summary} />
          </p>
        ) : null}
        {endpoint.description ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            <DocText text={endpoint.description} />
          </p>
        ) : null}
      </header>

      {hasDetails ? (
        <details className="group mt-4">
          <summary className="cursor-pointer text-xs font-semibold text-rose-600 select-none hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300">
            {t("showDetails")}
          </summary>
          <div className="mt-4 flex flex-col gap-5">
            {endpoint.pathParams.length > 0 ? (
              <Section title={t("sections.pathParams")}>
                <ul className="flex flex-wrap gap-2">
                  {endpoint.pathParams.map((param) => (
                    <li key={param}>
                      <code className="surface-inset px-2 py-1 font-mono text-xs">{param}</code>
                    </li>
                  ))}
                </ul>
                {access.kind === "self" || access.kind === "optional-user"
                  ? endpoint.pathParams.includes("userId") && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t("selfHint")}
                      </p>
                    )
                  : null}
              </Section>
            ) : null}

            {endpoint.queryParams.length > 0 ? (
              <Section title={t("sections.query")}>
                <ul className="flex flex-wrap gap-2">
                  {endpoint.queryParams.map((param) => (
                    <li key={param}>
                      <code className="surface-inset px-2 py-1 font-mono text-xs">{param}</code>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            {endpoint.body ? (
              <Section title={t("sections.body")}>
                <ApiTypeBlock info={endpoint.body} />
              </Section>
            ) : null}

            {endpoint.responses.length > 0 ? (
              <Section title={t("sections.responses")}>
                <ul className="flex flex-col gap-3">
                  {endpoint.responses.map((response) => (
                    <ResponseRow key={responseKey(response)} response={response} />
                  ))}
                </ul>
              </Section>
            ) : null}

            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              {t("source")}: <code className="font-mono">{endpoint.sourceFile}</code>
            </p>
          </div>
        </details>
      ) : null}
    </article>
  );
}
