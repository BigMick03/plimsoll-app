import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The README's code blocks are the files in examples/, which `npm run
// typecheck` compiles against the SDK source. These tests keep the two in step,
// so an example that no longer compiles cannot survive in the README.
const pkg = new URL("../", import.meta.url);
const readme = readFileSync(new URL("README.md", pkg), "utf8");
const blocks = [...readme.matchAll(/^```ts\n([\s\S]*?)^```$/gm)].map((m) => m[1]);
const examples = readdirSync(new URL("examples/", pkg))
  .filter((name) => name.endsWith(".ts"))
  .map((name) => ({ name, source: readFileSync(new URL(`examples/${name}`, pkg), "utf8") }));

describe("README", () => {
  it("has examples to check", () => {
    expect(examples.map((e) => e.name).sort()).toEqual(["indexer.ts", "read.ts", "verify.ts"]);
  });

  it.each(examples)("shows examples/$name verbatim", ({ source }) => {
    expect(blocks).toContain(source);
  });

  it("has no TypeScript block that is not a compiled example", () => {
    for (const block of blocks) {
      expect(examples.map((e) => e.source)).toContain(block);
    }
  });

  it("states the Node version the workspace supports", () => {
    const root = JSON.parse(readFileSync(new URL("../../package.json", pkg), "utf8")) as {
      engines: { node: string };
    };
    const [, major, minor] = /^>=(\d+)\.(\d+)\./.exec(root.engines.node) ?? [];
    expect(readme).toContain(`Node ${major}.${minor} or later`);
  });
});
