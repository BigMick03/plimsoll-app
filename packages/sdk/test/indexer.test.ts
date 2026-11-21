import { describe, expect, it, vi } from "vitest";
import { IndexerAbortError, IndexerClient } from "../src/index";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/** A fetch that never answers but honours the abort signal. */
const hanging: typeof fetch = (_url, init) =>
  new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () =>
      reject(new DOMException("aborted", "AbortError")),
    );
  });

describe("IndexerClient options", () => {
  it("health() calls /healthz", async () => {
    const f = vi.fn(async () => json({ status: "ok" }));
    const c = new IndexerClient("http://x/", f as unknown as typeof fetch);
    await expect(c.health()).resolves.toEqual({ status: "ok" });
    expect((f.mock.calls[0] as unknown[])[0]).toBe("http://x/healthz");
  });

  it("sets no signal by default", async () => {
    const f = vi.fn(async () => json({ reporters: [] }));
    const c = new IndexerClient("http://x", f as unknown as typeof fetch);
    await c.reporters();
    expect((f.mock.calls[0] as unknown as [unknown, RequestInit?])[1]?.signal).toBeUndefined();
  });

  it("rejects with IndexerAbortError when aborted", async () => {
    const c = new IndexerClient("http://x", hanging);
    const ctl = new AbortController();
    const p = c.network({ signal: ctl.signal });
    ctl.abort();
    const err = await p.catch((e: unknown) => e);
    expect(err).toBeInstanceOf(IndexerAbortError);
    expect((err as IndexerAbortError).reason).toBe("aborted");
  });

  it("rejects when already aborted", async () => {
    const c = new IndexerClient("http://x", hanging);
    const err = await c.health({ signal: AbortSignal.abort() }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(IndexerAbortError);
  });

  it("per-request timeout", async () => {
    const c = new IndexerClient("http://x", hanging);
    const err = await c.listAssets(1, { timeoutMs: 10 }).catch((e: unknown) => e);
    expect((err as IndexerAbortError).reason).toBe("timeout");
  });

  it("constructor default timeout, overridable per request", async () => {
    const c = new IndexerClient("http://x", hanging, 10);
    const err = await c.getAsset("C1").catch((e: unknown) => e);
    expect((err as IndexerAbortError).reason).toBe("timeout");
    const f = vi.fn(async () => json({ status: "ok" }));
    const c2 = new IndexerClient("http://x", f as unknown as typeof fetch, 10);
    await expect(c2.health({ timeoutMs: 1000 })).resolves.toEqual({ status: "ok" });
  });

  it("leaves other errors unchanged", async () => {
    const f = async () => json({ error: "nope" }, 404);
    const c = new IndexerClient("http://x", f as unknown as typeof fetch, 1000);
    await expect(c.network()).rejects.toMatchObject({ name: "IndexerError", status: 404 });
  });
});
