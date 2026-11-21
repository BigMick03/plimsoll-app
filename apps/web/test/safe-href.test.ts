import { describe, expect, it } from "vitest";
import { safeHref } from "../lib/safe-href";

describe("safeHref", () => {
  it("allows http and https", () => {
    expect(safeHref("https://example.com/a.pdf")).toBe("https://example.com/a.pdf");
    expect(safeHref("  http://example.com/x ")).toBe("http://example.com/x");
  });

  it("rejects other schemes and junk", () => {
    for (const v of [
      "javascript:alert(1)",
      "JaVaScript:alert(1)",
      "data:text/html,<script>1</script>",
      "ipfs://bafy123",
      "file:///etc/passwd",
      "not a url",
      "//example.com",
      "",
      undefined,
      null,
    ]) {
      expect(safeHref(v)).toBeUndefined();
    }
  });
});
