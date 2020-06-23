import { rem } from "./unit";

describe("test rem", () => {
  it("number", () => {
    expect(rem(20)).toBe("1rem");
    expect(rem(0)).toBe("0");
  });
  it("multi numbers", () => {
    expect(rem(20, 16)).toBe("1rem 0.8rem");
    expect(rem(0, 15)).toBe("0 0.75rem");
  });
  it("format string", () => {
    expect(rem(20, "auto")).toBe("1rem auto");
    expect(rem(30, "!important")).toBe("1.5rem !important");
  });
});
