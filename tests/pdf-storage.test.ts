import { describe, expect, it } from "vitest";

import { withTimeout } from "../lib/pdf-storage-safety";

describe("PDF storage safety helpers", () => {
  it("returns the underlying value when storage completes", async () => {
    await expect(withTimeout(Promise.resolve("ready"), 50)).resolves.toBe("ready");
  });

  it("rejects when a storage operation exceeds its timeout", async () => {
    const pending = new Promise<string>(() => undefined);
    await expect(withTimeout(pending, 5, "storage timed out")).rejects.toThrow("storage timed out");
  });
});
