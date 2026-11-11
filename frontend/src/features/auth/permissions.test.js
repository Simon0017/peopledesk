import { adminUser, employeeUser, hrUser } from "@/test/fixtures";
import { hasPermission } from "./permissions";

describe("hasPermission", () => {
  it("allows admins to delete employees but not HR", () => {
    expect(hasPermission(adminUser, "employees.delete")).toBe(true);
    expect(hasPermission(hrUser, "employees.delete")).toBe(false);
  });

  it("lets HR review leave but not employees", () => {
    expect(hasPermission(hrUser, "leaves.review")).toBe(true);
    expect(hasPermission(employeeUser, "leaves.review")).toBe(false);
  });

  it("denies everything when logged out or for unknown permissions", () => {
    expect(hasPermission(null, "leaves.request")).toBe(false);
    expect(hasPermission(adminUser, "made.up")).toBe(false);
  });
});
