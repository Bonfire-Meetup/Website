import type { ApiShape, ApiTypeInfo } from "@/lib/api/reference/types";

type TokenKind = "key" | "type" | "punct" | "comment" | "literal";

interface Token {
  text: string;
  kind: TokenKind;
}

type Line = Token[];

const TOKEN_CLASS: Record<TokenKind, string> = {
  comment: "text-neutral-400 dark:text-neutral-500",
  key: "text-neutral-900 dark:text-neutral-100",
  literal: "text-emerald-700 dark:text-emerald-300",
  punct: "text-neutral-400 dark:text-neutral-500",
  type: "text-sky-700 dark:text-sky-300",
};

const INDENT = "  ";

function inlineShape(shape: ApiShape): Token[] | null {
  switch (shape.kind) {
    case "primitive":
      return [{ kind: "type", text: shape.type }];
    case "literal":
      return [{ kind: "literal", text: shape.value }];
    case "enum":
      return shape.values.flatMap((value, index) => [
        ...(index > 0 ? [{ kind: "punct" as const, text: " | " }] : []),
        { kind: "literal" as const, text: JSON.stringify(value) },
      ]);
    case "unknown":
      return [{ kind: "type", text: "unknown" }];
    case "array": {
      const item = inlineShape(shape.item);
      if (!item) {
        return null;
      }
      const needsParens = shape.item.kind === "enum" && shape.item.values.length > 1;
      return needsParens
        ? [{ kind: "punct", text: "(" }, ...item, { kind: "punct", text: ")[]" }]
        : [...item, { kind: "punct", text: "[]" }];
    }
    case "union": {
      const variants = shape.variants.map(inlineShape);
      if (variants.some((variant) => !variant)) {
        return null;
      }
      return variants.flatMap((variant, index) => [
        ...(index > 0 ? [{ kind: "punct" as const, text: " | " }] : []),
        ...(variant ?? []),
      ]);
    }
    default:
      return null;
  }
}

function blockLines(shape: ApiShape, indent: number, prefix: Token[], suffix: Token[]): Line[] {
  const pad: Token = { kind: "punct", text: INDENT.repeat(indent) };

  if (shape.kind === "object") {
    return [
      [pad, ...prefix, { kind: "punct", text: "{" }],
      ...shape.fields.flatMap((field) => fieldLines(field.name, field, indent + 1)),
      [pad, { kind: "punct", text: "}" }, ...suffix],
    ];
  }

  if (shape.kind === "array") {
    return blockLines(shape.item, indent, prefix, [{ kind: "punct", text: "[]" }, ...suffix]);
  }

  if (shape.kind === "union") {
    return shape.variants.flatMap((variant, index) =>
      blockLines(
        variant,
        indent,
        index === 0 ? prefix : [{ kind: "punct", text: "| " }],
        index === shape.variants.length - 1 ? suffix : [],
      ),
    );
  }

  return [[pad, ...prefix, ...(inlineShape(shape) ?? []), ...suffix]];
}

function fieldLines(name: string, info: ApiTypeInfo, indent: number): Line[] {
  const key: Token[] = [
    { kind: "key", text: name },
    { kind: "punct", text: info.optional ? "?: " : ": " },
  ];
  const nullable: Token[] = info.nullable ? [{ kind: "type", text: " | null" }] : [];
  const comment: Token[] =
    info.notes.length > 0 ? [{ kind: "comment", text: `  // ${info.notes.join(", ")}` }] : [];
  const inline = inlineShape(info.shape);

  if (inline) {
    return [
      [{ kind: "punct", text: INDENT.repeat(indent) }, ...key, ...inline, ...nullable, ...comment],
    ];
  }

  return blockLines(info.shape, indent, key, [...nullable, ...comment]);
}

export function ApiTypeBlock({ info }: { info: ApiTypeInfo }) {
  const lines = blockLines(
    info.shape,
    0,
    [],
    info.notes.length > 0 ? [{ kind: "comment", text: `  // ${info.notes.join(", ")}` }] : [],
  );

  return (
    <pre className="surface-inset overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed">
      <code>
        {lines.map((line, lineIndex) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={lineIndex} className="block">
            {line.map((token, tokenIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={tokenIndex} className={TOKEN_CLASS[token.kind]}>
                {token.text}
              </span>
            ))}
          </span>
        ))}
      </code>
    </pre>
  );
}
