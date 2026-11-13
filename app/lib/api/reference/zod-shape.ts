import type * as t from "@babel/types";

import type { ApiField, ApiTypeInfo } from "./types";

export interface ShapeModule {
  source: string;
  resolve: (name: string) => { node: t.Node; module: ShapeModule } | null;
}

const PRIMITIVES = new Set(["string", "number", "boolean", "date", "bigint", "any", "unknown"]);
const STRING_FORMATS = new Set(["email", "url", "uuid", "datetime", "iso", "cuid", "ulid"]);
const MAX_DEPTH = 8;

interface ChainCall {
  name: string;
  args: t.Node[];
}

const textOf = (node: t.Node, module: ShapeModule) =>
  node.start === null || node.end === null || node.start === undefined || node.end === undefined
    ? ""
    : module.source.slice(node.start, node.end);

const literalText = (node: t.Node | undefined, module: ShapeModule) => {
  if (!node) {
    return "";
  }
  if (node.type === "StringLiteral") {
    return JSON.stringify(node.value);
  }
  if (node.type === "NumericLiteral" || node.type === "BooleanLiteral") {
    return String(node.value);
  }

  return textOf(node, module);
};

const propertyName = (node: t.Node): string | null => {
  if (node.type === "Identifier") {
    return node.name;
  }
  if (node.type === "StringLiteral") {
    return node.value;
  }

  return null;
};

const unknownInfo = (source?: string): ApiTypeInfo => ({
  notes: [],
  nullable: false,
  optional: false,
  shape: { kind: "unknown", source },
});

function splitChain(expr: t.Node): { root: t.Node; base: ChainCall | null; calls: ChainCall[] } {
  const calls: ChainCall[] = [];
  let current: t.Node = expr;

  while (current.type === "CallExpression" && current.callee.type === "MemberExpression") {
    const { object, property } = current.callee;
    const name = property.type === "Identifier" ? property.name : null;

    if (!name) {
      break;
    }

    const isZodRoot =
      (object.type === "Identifier" && object.name === "z") ||
      (object.type === "MemberExpression" &&
        object.object.type === "Identifier" &&
        object.object.name === "z");

    if (isZodRoot) {
      return { base: { args: current.arguments, name }, calls: calls.reverse(), root: object };
    }

    calls.push({ args: current.arguments, name });
    current = object;
  }

  return { base: null, calls: calls.reverse(), root: current };
}

function objectFields(node: t.Node, module: ShapeModule, depth: number): ApiField[] {
  if (node.type !== "ObjectExpression") {
    return [];
  }

  return node.properties.flatMap((property): ApiField[] => {
    if (property.type !== "ObjectProperty") {
      return [];
    }

    const name = propertyName(property.key);

    if (!name) {
      return [];
    }

    return [{ name, ...describeZod(property.value, module, depth + 1) }];
  });
}

function baseShape(base: ChainCall, module: ShapeModule, depth: number): ApiTypeInfo {
  const info: ApiTypeInfo = {
    notes: [],
    nullable: false,
    optional: false,
    shape: { kind: "unknown" },
  };
  const [first, second] = base.args;

  if (PRIMITIVES.has(base.name)) {
    info.shape = { kind: "primitive", type: base.name };
  } else if (STRING_FORMATS.has(base.name)) {
    info.shape = { kind: "primitive", type: "string" };
    info.notes.push(base.name);
  } else if (base.name === "enum" && first?.type === "ArrayExpression") {
    info.shape = {
      kind: "enum",
      values: first.elements.flatMap((element) =>
        element?.type === "StringLiteral" ? [element.value] : [],
      ),
    };
  } else if (base.name === "literal" && first) {
    info.shape = { kind: "literal", value: literalText(first, module) };
  } else if (base.name === "array" && first) {
    info.shape = { item: describeZod(first, module, depth + 1).shape, kind: "array" };
  } else if (base.name === "object" && first) {
    info.shape = { fields: objectFields(first, module, depth), kind: "object" };
  } else if (
    (base.name === "union" || base.name === "discriminatedUnion") &&
    (base.name === "union" ? first : second)?.type === "ArrayExpression"
  ) {
    const options = (base.name === "union" ? first : second) as t.ArrayExpression;
    info.shape = {
      kind: "union",
      variants: options.elements.flatMap((element) =>
        element && element.type !== "SpreadElement"
          ? [describeZod(element, module, depth + 1).shape]
          : [],
      ),
    };
  } else if (base.name === "record") {
    info.shape = { kind: "primitive", type: "record" };
  }

  return info;
}

function applyCall(info: ApiTypeInfo, call: ChainCall, module: ShapeModule, depth: number) {
  const [first] = call.args;

  switch (call.name) {
    case "optional":
      info.optional = true;
      break;
    case "nullable":
      info.nullable = true;
      break;
    case "nullish":
      info.optional = true;
      info.nullable = true;
      break;
    case "default":
      info.optional = true;
      info.notes.push(`default ${literalText(first, module)}`);
      break;
    case "min":
    case "max":
    case "length":
    case "gte":
    case "lte":
      info.notes.push(`${call.name} ${literalText(first, module)}`);
      break;
    case "int":
    case "positive":
    case "nonnegative":
    case "email":
    case "url":
    case "uuid":
    case "datetime":
      info.notes.push(call.name);
      break;
    case "regex":
      info.notes.push("pattern");
      break;
    case "array":
      info.shape = { item: info.shape, kind: "array" };
      break;
    case "extend":
      if (info.shape.kind === "object" && first) {
        info.shape = {
          fields: [...info.shape.fields, ...objectFields(first, module, depth)],
          kind: "object",
        };
      }
      break;
    default:
      break;
  }
}

export function describeZod(expr: t.Node, module: ShapeModule, depth = 0): ApiTypeInfo {
  if (depth > MAX_DEPTH) {
    return unknownInfo();
  }

  const { root, base, calls } = splitChain(expr);
  let info: ApiTypeInfo;

  if (base) {
    info = baseShape(base, module, depth);
  } else if (root.type === "Identifier") {
    const resolved = module.resolve(root.name);

    if (!resolved) {
      return unknownInfo(textOf(expr, module));
    }

    const inner = describeZod(resolved.node, resolved.module, depth + 1);
    info = { ...inner, notes: [...inner.notes] };
  } else {
    return unknownInfo(textOf(expr, module));
  }

  for (const call of calls) {
    applyCall(info, call, module, depth);
  }

  return info;
}
