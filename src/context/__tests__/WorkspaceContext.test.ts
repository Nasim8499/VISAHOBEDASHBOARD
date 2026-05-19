import { describe, it, expect } from "vitest";
import { normalizeWorkspace, EMPTY_WORKSPACE, EMPTY_BUSINESS } from "../WorkspaceContext";

describe("normalizeWorkspace", () => {
  it("returns EMPTY_WORKSPACE shape when input is null/undefined", () => {
    const ws = normalizeWorkspace(null);
    expect(ws.color).toBeTruthy();
    expect(ws.palette.length).toBeGreaterThan(0);
    expect(ws.manager).toBe("VisaHOBe");
    expect(ws.managerAvatar).toMatch(/^[A-Z]{1,2}$/);
  });

  it("fills missing fields with defaults", () => {
    const ws = normalizeWorkspace({ id: "abc", name: "Acme" } as any);
    expect(ws.id).toBe("abc");
    expect(ws.name).toBe("Acme");
    expect(ws.color).toBe(EMPTY_BUSINESS.color);
    expect(ws.palette).toEqual(EMPTY_BUSINESS.palette);
    expect(ws.logo).toBe(EMPTY_BUSINESS.logo);
  });

  it("passes valid rows through and derives manager fields", () => {
    const ws = normalizeWorkspace({
      ...EMPTY_BUSINESS,
      id: "x",
      name: "Spice Bite",
      manager_name: "Jane Doe",
      color: "#ff0000",
      palette: ["#ff0000", "#00ff00"],
    });
    expect(ws.name).toBe("Spice Bite");
    expect(ws.color).toBe("#ff0000");
    expect(ws.palette).toEqual(["#ff0000", "#00ff00"]);
    expect(ws.manager).toBe("Jane Doe");
    expect(ws.managerAvatar).toBe("JD");
  });

  it("EMPTY_WORKSPACE is non-null and frozen-shape valid", () => {
    expect(EMPTY_WORKSPACE).toBeTruthy();
    expect(EMPTY_WORKSPACE.color).toBeTruthy();
    expect(EMPTY_WORKSPACE.palette.length).toBeGreaterThan(0);
  });
});
