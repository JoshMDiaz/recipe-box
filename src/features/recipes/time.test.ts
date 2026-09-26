import { describe, expect, test } from "vitest";
import { formatDuration, parseDuration } from "./time";

describe("parseDuration", () => {
  test.each([
    ["1 hr 45 min", { hours: 1, minutes: 45 }],
    ["1 hr 20 min", { hours: 1, minutes: 20 }],
    ["45 min", { hours: 0, minutes: 45 }],
    ["2 hours", { hours: 2, minutes: 0 }],
    ["1 hour 30 minutes", { hours: 1, minutes: 30 }],
    ["1h30m", { hours: 1, minutes: 30 }],
    ["1.5 hours", { hours: 1, minutes: 30 }],
    ["1,5 hrs", { hours: 1, minutes: 30 }],
    ["90 minutes", { hours: 1, minutes: 30 }],
    ["About 40 mins", { hours: 0, minutes: 40 }],
    ["45", { hours: 0, minutes: 45 }],
  ])("reads %j", (text, expected) => {
    expect(parseDuration(text)).toEqual(expected);
  });

  test.each([undefined, "", "   ", "overnight", "until golden"])("returns null for %j", (text) => {
    expect(parseDuration(text)).toBeNull();
  });
});

describe("formatDuration", () => {
  test.each([
    [{ hours: 1, minutes: 45 }, "1 hr 45 min"],
    [{ hours: 2, minutes: 0 }, "2 hr"],
    [{ hours: 0, minutes: 45 }, "45 min"],
    [{ hours: 0, minutes: 0 }, ""],
    [{ hours: 0, minutes: 90 }, "1 hr 30 min"],
  ])("formats %j as %j", (duration, expected) => {
    expect(formatDuration(duration)).toBe(expected);
  });

  test("round-trips what it formats", () => {
    expect(formatDuration(parseDuration("1 hr 45 min")!)).toBe("1 hr 45 min");
  });
});
