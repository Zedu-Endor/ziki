import { test } from "node:test";
import assert from "node:assert/strict";
import { getDefaultTimeZone, formatDate, formatCompactDate } from "../lib/format.ts";

test("Vercel's POSIX :UTC timezone renders activity dates", () => {
  const previous = process.env.TZ;
  try {
    process.env.TZ = ":UTC";
    assert.equal(getDefaultTimeZone(), "UTC");
    assert.ok(formatDate("2026-10-27T14:00:00Z").includes("2026"));
    assert.ok(formatCompactDate("2026-10-27T14:00:00Z").includes("Oct"));
    process.env.TZ = "Africa/Lagos";
    assert.equal(getDefaultTimeZone(), "Africa/Lagos");
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});
