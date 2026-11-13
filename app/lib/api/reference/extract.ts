// oxlint-disable capitalized-comments, no-inline-comments -- the turbopackIgnore hints must stay inline and lowercase
import "server-only";

import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import { parse } from "@babel/parser";
import type * as t from "@babel/types";

import {
  API_METHODS,
  type ApiAccess,
  type ApiEndpoint,
  type ApiMethod,
  type ApiReference,
  type ApiResponse,
  type ApiTypeInfo,
} from "./types";
import { describeZod, type ShapeModule } from "./zod-shape";

const ROOT = process.cwd();
const ROUTE_ROOTS = ["app/api", "app/.well-known"];
const FOLLOWABLE_DIRS = ["app/api/", "app/lib/api/", "app/lib/forms/", "app/lib/recordings/"];
const SKIPPED_KEYS = new Set([
  "type",
  "start",
  "end",
  "loc",
  "range",
  "extra",
  "leadingComments",
  "trailingComments",
  "innerComments",
  "typeAnnotation",
  "returnType",
  "typeParameters",
]);
const RESPONSE_ALIASES = new Set(["respond"]);
const BODY_HINTS = new Set(["body", "payload", "rawBody", "json"]);
const SYSTEM_GROUP = "system";

interface ParsedModule extends ShapeModule {
  file: string;
  program: t.Program;
  declarations: Map<string, t.Node>;
  imports: Map<string, { from: string; name: string }>;
}

interface Binding {
  node: t.Node;
  module: ParsedModule;
}

interface ScanState {
  responses: ApiResponse[];
  queryParams: Set<string>;
  body: ApiTypeInfo | null;
  visited: Set<string>;
}

interface AccessHints {
  role: string | null;
  wrappers: Set<string>;
  usesCronSecret: boolean;
  usesSignature: boolean;
}

const moduleCache = new Map<string, Promise<ParsedModule | null>>();

const isNode = (value: unknown): value is t.Node =>
  typeof value === "object" && value !== null && typeof (value as t.Node).type === "string";

function walk(node: t.Node, visit: (node: t.Node) => void) {
  visit(node);

  const keys = Object.keys(node).filter((key) => !SKIPPED_KEYS.has(key));

  for (const key of keys) {
    const value = (node as unknown as Record<string, unknown>)[key];
    const children = Array.isArray(value) ? value : [value];

    for (const child of children) {
      if (isNode(child)) {
        walk(child, visit);
      }
    }
  }
}

function resolveSpecifier(fromFile: string, specifier: string): string | null {
  let base: string;

  if (specifier.startsWith("@/i18n/")) {
    base = path.join(/*turbopackIgnore: true*/ ROOT, specifier.slice(2));
  } else if (specifier.startsWith("@/")) {
    base = path.join(/*turbopackIgnore: true*/ ROOT, "app", specifier.slice(2));
  } else if (specifier.startsWith(".")) {
    base = path.resolve(/*turbopackIgnore: true*/ path.dirname(fromFile), specifier);
  } else {
    return null;
  }

  const candidates = [
    `${base}.ts`,
    `${base}.tsx`,
    path.join(/*turbopackIgnore: true*/ base, "index.ts"),
  ];
  const resolved = candidates.find((candidate) => existsSync(candidate));

  if (!resolved) {
    return null;
  }

  const relative = path.relative(ROOT, resolved);

  return FOLLOWABLE_DIRS.some((dir) => relative.startsWith(dir)) ? resolved : null;
}

function collectDeclarations(program: t.Program) {
  const declarations = new Map<string, t.Node>();
  const imports = new Map<string, { from: string; name: string }>();

  for (const statement of program.body) {
    const declaration =
      statement.type === "ExportNamedDeclaration" && statement.declaration
        ? statement.declaration
        : statement;

    if (declaration.type === "VariableDeclaration") {
      for (const declarator of declaration.declarations) {
        if (declarator.id.type === "Identifier" && declarator.init) {
          declarations.set(declarator.id.name, declarator.init);
        }
      }
    } else if (declaration.type === "FunctionDeclaration" && declaration.id) {
      declarations.set(declaration.id.name, declaration);
    } else if (declaration.type === "ImportDeclaration") {
      for (const specifier of declaration.specifiers) {
        if (specifier.type === "ImportSpecifier") {
          const imported =
            specifier.imported.type === "Identifier"
              ? specifier.imported.name
              : specifier.imported.value;
          imports.set(specifier.local.name, { from: declaration.source.value, name: imported });
        }
      }
    }
  }

  return { declarations, imports };
}

function loadModule(file: string): Promise<ParsedModule | null> {
  const cached = moduleCache.get(file);

  if (cached) {
    return cached;
  }

  const pending = (async () => {
    try {
      const source = await readFile(file, "utf8");
      const { program } = parse(source, { plugins: ["typescript", "jsx"], sourceType: "module" });
      const { declarations, imports } = collectDeclarations(program);

      return { declarations, file, imports, program, resolve: () => null, source };
    } catch {
      return null;
    }
  })();

  moduleCache.set(file, pending);

  return pending;
}

async function resolveBinding(module: ParsedModule, name: string): Promise<Binding | null> {
  const local = module.declarations.get(name);

  if (local) {
    return { module, node: local };
  }

  const imported = module.imports.get(name);

  if (!imported) {
    return null;
  }

  const file = resolveSpecifier(module.file, imported.from);
  const target = file ? await loadModule(file) : null;
  const node = target?.declarations.get(imported.name);

  return target && node ? { module: target, node } : null;
}

async function collectBindings(
  module: ParsedModule,
  node: t.Node,
  resolved: Map<string, Binding>,
  seen: Set<string>,
) {
  const names = new Set<string>();

  walk(node, (child) => {
    if (child.type === "Identifier" && child.name !== "z") {
      names.add(child.name);
    }
  });

  const fresh = [...names].filter((name) => !seen.has(`${module.file}#${name}`));
  fresh.forEach((name) => seen.add(`${module.file}#${name}`));

  await Promise.all(
    fresh.map(async (name) => {
      const binding = await resolveBinding(module, name);

      if (binding) {
        resolved.set(`${module.file}#${name}`, binding);
        await collectBindings(binding.module, binding.node, resolved, seen);
      }
    }),
  );
}

async function describeSchema(module: ParsedModule, schema: t.Node) {
  const resolved = new Map<string, Binding>();
  await collectBindings(module, schema, resolved, new Set());

  const withResolver = (target: ParsedModule): ShapeModule => ({
    resolve: (name) => {
      const binding = resolved.get(`${target.file}#${name}`);

      return binding ? { module: withResolver(binding.module), node: binding.node } : null;
    },
    source: target.source,
  });

  return describeZod(schema, withResolver(module));
}

const findProperty = (node: t.ObjectExpression, key: string) =>
  node.properties.find(
    (property): property is t.ObjectProperty =>
      property.type === "ObjectProperty" &&
      property.key.type === "Identifier" &&
      property.key.name === key,
  );

const numericProperty = (node: t.Node | undefined, key: string): number | null | undefined => {
  if (!node) {
    return undefined;
  }

  if (node.type !== "ObjectExpression") {
    return null;
  }

  const property = findProperty(node, key);

  if (!property) {
    return undefined;
  }

  return property.value.type === "NumericLiteral" ? property.value.value : null;
};

const objectKeys = (node: t.ObjectExpression) =>
  node.properties.flatMap((property) => {
    if (property.type === "SpreadElement") {
      return ["…"];
    }

    if (property.key.type === "Identifier") {
      return [property.key.name];
    }

    return property.key.type === "StringLiteral" ? [property.key.value] : [];
  });

function findLocalSchemaParse(scope: t.Node, name: string): t.Node | null {
  let schema: t.Node | null = null;

  walk(scope, (node) => {
    if (
      !schema &&
      node.type === "VariableDeclarator" &&
      node.id.type === "Identifier" &&
      node.id.name === name &&
      node.init?.type === "CallExpression" &&
      node.init.callee.type === "MemberExpression" &&
      node.init.callee.property.type === "Identifier" &&
      node.init.callee.property.name === "parse"
    ) {
      schema = node.init.callee.object;
    }
  });

  return schema;
}

async function describeResponse(
  call: t.CallExpression | t.NewExpression,
  module: ParsedModule,
  scope: t.Node,
): Promise<ApiResponse | null> {
  const [body, init] = call.arguments;
  const declaredStatus = numericProperty(init, "status");

  if (declaredStatus === null) {
    return null;
  }

  const status = declaredStatus ?? 200;

  if (call.type === "NewExpression") {
    return { status, stream: true };
  }

  if (body?.type === "ObjectExpression") {
    const error = findProperty(body, "error")?.value;

    if (!error) {
      return { fields: objectKeys(body), status };
    }

    return error.type === "StringLiteral" ? { error: error.value, status } : null;
  }

  const schema = body?.type === "Identifier" ? findLocalSchemaParse(scope, body.name) : null;

  return schema ? { shape: await describeSchema(module, schema), status } : { status };
}

const isResponseCall = (node: t.CallExpression) => {
  const { callee } = node;

  if (callee.type === "Identifier") {
    return RESPONSE_ALIASES.has(callee.name);
  }

  return (
    callee.type === "MemberExpression" &&
    callee.object.type === "Identifier" &&
    (callee.object.name === "NextResponse" || callee.object.name === "Response") &&
    callee.property.type === "Identifier" &&
    callee.property.name === "json"
  );
};

const isResponseConstructor = (node: t.NewExpression) =>
  node.callee.type === "Identifier" &&
  (node.callee.name === "Response" || node.callee.name === "NextResponse");

const mentionsRequestBody = (node: t.Node) => {
  let found = false;

  walk(node, (child) => {
    if (
      (child.type === "Identifier" && BODY_HINTS.has(child.name)) ||
      (child.type === "MemberExpression" &&
        child.property.type === "Identifier" &&
        child.property.name === "json")
    ) {
      found = true;
    }
  });

  return found;
};

const memberName = (callee: t.Node) =>
  callee.type === "MemberExpression" && callee.property.type === "Identifier"
    ? callee.property.name
    : null;

const isSearchParamsGet = (call: t.CallExpression) => {
  const { callee } = call;

  if (memberName(callee) !== "get" || call.arguments[0]?.type !== "StringLiteral") {
    return false;
  }

  const target = (callee as t.MemberExpression).object;

  return (
    (target.type === "Identifier" && target.name === "searchParams") ||
    memberName(target) === "searchParams"
  );
};

const bodySchemaOf = (call: t.CallExpression) => {
  const method = memberName(call.callee);
  const target = call.callee.type === "MemberExpression" ? call.callee.object : null;

  return (method === "safeParse" || method === "parse") &&
    target?.type === "Identifier" &&
    call.arguments[0] &&
    mentionsRequestBody(call.arguments[0])
    ? target
    : null;
};

function recordAccess(call: t.CallExpression, access: AccessHints) {
  if (call.callee.type !== "Identifier") {
    return;
  }

  access.wrappers.add(call.callee.name);

  if (call.callee.name !== "withRole") {
    return;
  }

  const role = call.arguments[1];

  if (role?.type === "MemberExpression" && role.property.type === "Identifier") {
    access.role = role.property.name.toLowerCase();
  } else if (role?.type === "StringLiteral") {
    access.role = role.value;
  }
}

async function scan(
  node: t.Node,
  module: ParsedModule,
  state: ScanState,
  access: AccessHints | null,
) {
  const calls: t.CallExpression[] = [];
  const created: t.NewExpression[] = [];
  const objects: t.ObjectExpression[] = [];

  walk(node, (child) => {
    if (child.type === "CallExpression") {
      calls.push(child);
    } else if (child.type === "NewExpression" && isResponseConstructor(child)) {
      created.push(child);
    } else if (child.type === "ObjectExpression") {
      objects.push(child);
    } else if (access && child.type === "Identifier" && child.name === "CRON_SECRET") {
      access.usesCronSecret = true;
    } else if (access && child.type === "StringLiteral" && child.value === "stripe-signature") {
      access.usesSignature = true;
    }
  });

  const responseCalls = calls.filter(isResponseCall);
  const otherCalls = calls.filter((call) => !isResponseCall(call));

  for (const call of otherCalls) {
    if (isSearchParamsGet(call)) {
      state.queryParams.add((call.arguments[0] as t.StringLiteral).value);
    }
    if (access) {
      recordAccess(call, access);
    }
  }

  for (const object of objects) {
    const error = findProperty(object, "error")?.value;
    const status = numericProperty(object, "status");

    if (error?.type === "StringLiteral" && typeof status === "number") {
      state.responses.push({ error: error.value, status });
    }
  }

  const bodySchema = state.body ? null : otherCalls.map(bodySchemaOf).find(Boolean);
  const followups = otherCalls.flatMap((call) =>
    call.callee.type === "Identifier" ? [call.callee.name] : [],
  );
  const fresh = [...new Set(followups)].filter(
    (name) => !state.visited.has(`${module.file}#${name}`),
  );
  fresh.forEach((name) => state.visited.add(`${module.file}#${name}`));

  const [responses, body] = await Promise.all([
    Promise.all([...responseCalls, ...created].map((call) => describeResponse(call, module, node))),
    bodySchema ? describeSchema(module, bodySchema) : Promise.resolve(null),
  ]);

  state.responses.push(
    ...responses.filter((response): response is ApiResponse => Boolean(response)),
  );
  state.body ??= body;

  await Promise.all(
    fresh.map(async (name) => {
      const binding = await resolveBinding(module, name);
      const sameFile = binding?.module === module;

      if (binding) {
        await scan(binding.node, binding.module, state, sameFile ? access : null);
      }
    }),
  );
}

function resolveAccess(hints: AccessHints): ApiAccess {
  if (hints.usesCronSecret) {
    return { kind: "secret" };
  }
  if (hints.usesSignature) {
    return { kind: "signature" };
  }
  if (hints.role) {
    return { kind: "role", role: hints.role };
  }
  if (hints.wrappers.has("withResolvedUserId")) {
    return { kind: "self" };
  }
  if (hints.wrappers.has("withAuth") || hints.wrappers.has("requireAuth")) {
    return { kind: "user" };
  }
  if (hints.wrappers.has("withOptionalResolvedUserId") || hints.wrappers.has("getAuthUserId")) {
    return { kind: "optional-user" };
  }

  return { kind: "public" };
}

function parseDocComment(comments: readonly t.Comment[] | null) {
  const block = comments
    ?.filter((comment) => comment.type === "CommentBlock" && comment.value.startsWith("*"))
    .at(-1);

  if (!block) {
    return { description: null, summary: null };
  }

  const text = block.value
    .split("\n")
    .map((line) => line.replace(/^\s*\*+ ?/u, "").trimEnd())
    .join("\n")
    .trim();
  const [summary, ...rest] = text.split(/\n\s*\n/u);
  const collapse = (value: string | undefined) => value?.replace(/\s*\n\s*/gu, " ").trim() || null;

  return { description: collapse(rest.join("\n\n")), summary: collapse(summary) };
}

function dedupeResponses(responses: ApiResponse[]) {
  const seen = new Map<string, ApiResponse>();

  for (const response of responses) {
    const key = [
      response.status,
      response.error ?? "",
      response.fields?.join(",") ?? "",
      response.shape ? "shape" : "",
      response.stream ? "stream" : "",
    ].join("|");

    if (!seen.has(key)) {
      seen.set(key, response);
    }
  }

  const unique = [...seen.values()];
  const detailed = new Set(
    unique.filter((item) => item.fields || item.shape).map((item) => item.status),
  );

  return unique
    .filter(
      (item) =>
        item.error || item.fields || item.shape || item.stream || !detailed.has(item.status),
    )
    .sort((a, b) => a.status - b.status || (a.error ?? "").localeCompare(b.error ?? ""));
}

function routePath(file: string) {
  const relative = path.relative(
    path.join(/*turbopackIgnore: true*/ ROOT, "app"),
    path.dirname(file),
  );
  const segments = relative
    .split(path.sep)
    .filter((segment) => !segment.startsWith("("))
    .map((segment) => segment.replace(/^\[(?:\.\.\.)?(?<param>.+)\]$/u, "{$<param>}"));

  return `/${segments.join("/")}`;
}

function routeGroup(routeUrl: string) {
  return /^\/api\/v\d+\/(?<group>[^/]+)/u.exec(routeUrl)?.groups?.group ?? SYSTEM_GROUP;
}

async function findRouteFiles(dir: string): Promise<string[]> {
  if (!existsSync(dir)) {
    return [];
  }

  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(/*turbopackIgnore: true*/ dir, entry.name);

      if (entry.isDirectory()) {
        return findRouteFiles(full);
      }

      return Promise.resolve(entry.name === "route.ts" ? [full] : []);
    }),
  );

  return nested.flat();
}

const asMethod = (name: string): ApiMethod | null =>
  (API_METHODS as readonly string[]).includes(name) ? (name as ApiMethod) : null;

function exportedHandlers(program: t.Program) {
  return program.body.flatMap((statement) => {
    if (statement.type !== "ExportNamedDeclaration" || !statement.declaration) {
      return [];
    }

    const { declaration } = statement;
    const comments = statement.leadingComments ?? null;

    if (declaration.type === "FunctionDeclaration") {
      const method = declaration.id ? asMethod(declaration.id.name) : null;

      return method ? [{ comments, method, node: declaration as t.Node }] : [];
    }

    if (declaration.type !== "VariableDeclaration") {
      return [];
    }

    return declaration.declarations.flatMap((declarator) => {
      const method = declarator.id.type === "Identifier" ? asMethod(declarator.id.name) : null;

      return method && declarator.init ? [{ comments, method, node: declarator.init }] : [];
    });
  });
}

async function describeRoute(file: string): Promise<ApiEndpoint[]> {
  const module = await loadModule(file);

  if (!module) {
    return [];
  }

  const url = routePath(file);
  const pathParams = [...url.matchAll(/\{(?<param>[^}]+)\}/gu)].flatMap((match) =>
    match.groups?.param ? [match.groups.param] : [],
  );

  return Promise.all(
    exportedHandlers(module.program).map(async ({ method, node, comments }) => {
      const state: ScanState = {
        body: null,
        queryParams: new Set(),
        responses: [],
        visited: new Set(),
      };
      const access: AccessHints = {
        role: null,
        usesCronSecret: false,
        usesSignature: false,
        wrappers: new Set(),
      };

      await scan(node, module, state, access);
      const { summary, description } = parseDocComment(comments);

      return {
        access: resolveAccess(access),
        body: state.body,
        description,
        group: routeGroup(url),
        id: `${method} ${url}`,
        method,
        path: url,
        pathParams,
        queryParams: [...state.queryParams].sort(),
        rateLimited:
          access.wrappers.has("withRateLimit") ||
          state.responses.some((response) => response.status === 429),
        responses: dedupeResponses(state.responses),
        sourceFile: path.relative(ROOT, file),
        summary,
      } satisfies ApiEndpoint;
    }),
  );
}

async function findSourceFiles(dir: string): Promise<string[]> {
  if (!existsSync(dir)) {
    return [];
  }

  const entries = await readdir(dir, { recursive: true, withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && /\.tsx?$/u.test(entry.name))
    .map((entry) => path.join(/*turbopackIgnore: true*/ entry.parentPath, entry.name));
}

export async function getSourceVersion() {
  const dirs = [...ROUTE_ROOTS, ...FOLLOWABLE_DIRS].map((dir) =>
    path.join(/*turbopackIgnore: true*/ ROOT, dir),
  );
  const files = (await Promise.all(dirs.map(findSourceFiles))).flat();
  const stats = await Promise.all(files.map((file) => stat(file)));

  return `${files.length}:${Math.max(0, ...stats.map((entry) => entry.mtimeMs))}`;
}

export async function extractApiReference(): Promise<ApiReference> {
  moduleCache.clear();
  const files = (
    await Promise.all(
      ROUTE_ROOTS.map((dir) => findRouteFiles(path.join(/*turbopackIgnore: true*/ ROOT, dir))),
    )
  ).flat();
  const endpoints = (await Promise.all(files.map(describeRoute))).flat();
  const methodOrder = (method: ApiMethod) => API_METHODS.indexOf(method);
  const groups = new Map<string, ApiEndpoint[]>();

  for (const endpoint of endpoints) {
    groups.set(endpoint.group, [...(groups.get(endpoint.group) ?? []), endpoint]);
  }

  const groupOrder = ([a]: [string, unknown], [b]: [string, unknown]) => {
    if (a === SYSTEM_GROUP || b === SYSTEM_GROUP) {
      return a === SYSTEM_GROUP ? 1 : -1;
    }

    return a.localeCompare(b);
  };

  return {
    endpointCount: endpoints.length,
    groups: [...groups.entries()].sort(groupOrder).map(([name, items]) => ({
      endpoints: items.sort(
        (a, b) => a.path.localeCompare(b.path) || methodOrder(a.method) - methodOrder(b.method),
      ),
      name,
    })),
  };
}
