#!/usr/bin/env node

import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

import { ESLint } from "eslint";

const IGNORE_PATTERNS = ["node_modules", ".next", "dist", "build", "coverage", ".git"];

const FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

function shouldIgnore(path) {
  return IGNORE_PATTERNS.some((pattern) => path.includes(pattern));
}

function isCodeFile(path) {
  return FILE_EXTENSIONS.some((ext) => path.endsWith(ext));
}

async function findFiles(dir) {
  const files = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = relative(process.cwd(), fullPath);

      if (shouldIgnore(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        const subFiles = await findFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && isCodeFile(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  return files;
}

async function main() {
  const startDir = process.cwd();
  const appDir = join(startDir, "app");
  const libDir = join(startDir, "lib");

  const dirs = [];

  for (const dir of [appDir, libDir]) {
    try {
      const stats = await stat(dir);

      if (stats.isDirectory()) {
        dirs.push(dir);
      }
    } catch {}
  }

  const searchDirs = dirs.length > 0 ? dirs : [startDir];

  console.log("Finding TypeScript/JavaScript files...");
  const allFiles = [];

  for (const dir of searchDirs) {
    const dirFiles = await findFiles(dir);
    allFiles.push(...dirFiles);
  }

  const uniqueFiles = [...new Set(allFiles)];
  console.log(`Found ${uniqueFiles.length} files to process\n`);

  const stylisticPlugin = (await import("@stylistic/eslint-plugin")).default;
  const typescriptParser = (await import("@typescript-eslint/parser")).default;

  const rules = {
    "@stylistic/padding-line-between-statements": [
      "error",
      { blankLine: "always", next: "function", prev: "*" },
      { blankLine: "always", next: "export", prev: "*" },
      { blankLine: "always", next: "function", prev: ["const", "let", "var"] },
      { blankLine: "always", next: "if", prev: ["const", "let", "var"] },
      { blankLine: "always", next: "return", prev: "*" },
      { blankLine: "always", next: "*", prev: "block-like" },
      { blankLine: "always", next: "*", prev: "block" },
      { blankLine: "always", next: "block", prev: "*" },
      { blankLine: "always", next: "block-like", prev: "*" },
      { blankLine: "always", next: "*", prev: "if" },
      { blankLine: "always", next: "if", prev: "*" },
      { blankLine: "always", next: "for", prev: "*" },
      { blankLine: "always", next: "while", prev: "*" },
      { blankLine: "always", next: "switch", prev: "*" },
      { blankLine: "always", next: "*", prev: "case" },
      { blankLine: "always", next: "case", prev: "*" },
    ],
  };

  const eslint = new ESLint({
    fix: true,
    overrideConfig: [
      {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
          parser: typescriptParser,
          parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
          },
        },
        plugins: {
          "@stylistic": stylisticPlugin,
        },
        rules,
      },
      {
        files: ["**/*.js", "**/*.jsx"],
        languageOptions: {
          parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
          },
        },
        plugins: {
          "@stylistic": stylisticPlugin,
        },
        rules,
      },
    ],
    overrideConfigFile: true,
  });

  let fixed = 0;

  for (const file of uniqueFiles) {
    try {
      const results = await eslint.lintFiles([file]);
      await ESLint.outputFixes(results);

      const result = results[0];

      if (result && result.output !== undefined) {
        fixed++;
        const relativePath = relative(startDir, file);
        console.log(`Fixed: ${relativePath}`);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  console.log(`\nDone! Fixed ${fixed} out of ${uniqueFiles.length} files.`);
}

main().catch(console.error);
