import { describe, expect, it } from "vitest";
import { checkPassword, hashPassword, studioUsers, verifyPassword } from "@/lib/server/users";

describe("seeded studio users", () => {
  it("hashes and verifies passwords (salted, never stored in plain text)", () => {
    const h = hashPassword("Correct-Horse-9");
    expect(h).toMatch(/^scrypt\$/);
    expect(h).not.toContain("Correct-Horse-9");
    expect(hashPassword("Correct-Horse-9")).not.toBe(h);
    expect(verifyPassword("Correct-Horse-9", h)).toBe(true);
    expect(verifyPassword("wrong", h)).toBe(false);
  });

  it("parses STUDIO_USERS and locks out after 5 failures", () => {
    process.env.STUDIO_USERS = `Ada@DawbLearn.org|Ada Obi|admin|${hashPassword("ada-password-1")}\n bad line \ntunde@example.com||member|${hashPassword("tunde-pass-22")}`;
    const users = studioUsers();
    expect(users.map((u) => [u.email, u.role])).toEqual([["ada@dawblearn.org", "admin"], ["tunde@example.com", "member"]]);
    expect(users[1].name).toBe("tunde");
    expect(checkPassword("ADA@dawblearn.org", "ada-password-1")?.name).toBe("Ada Obi");
    expect(checkPassword("nobody@x.com", "whatever")).toBeNull();
    for (let i = 0; i < 5; i++) expect(checkPassword("tunde@example.com", "nope")).toBeNull();
    // Locked even with the right password.
    expect(checkPassword("tunde@example.com", "tunde-pass-22")).toBeNull();
  });
});
