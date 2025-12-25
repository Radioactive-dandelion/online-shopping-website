import bcrypt from "bcrypt";

describe("Password hashing", () => {
  test("should hash and compare password correctly", async () => {
    const password = "Secret123";
    const hash = await bcrypt.hash(password, 10);

    expect(await bcrypt.compare(password, hash)).toBe(true);
    expect(await bcrypt.compare("wrongPass", hash)).toBe(false);
  });
});
