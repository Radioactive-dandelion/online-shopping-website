import jwt from "jsonwebtoken";

const SECRET = "jwt-secret-key";

describe("JWT", () => {
  test("should create and verify token", () => {
    const payload = { id: 5, name: "John" };
    const token = jwt.sign(payload, SECRET, { expiresIn: "1d" });

    const decoded = jwt.verify(token, SECRET);

    expect(decoded.id).toBe(5);
    expect(decoded.name).toBe("John");
  });

  test("should fail with wrong secret", () => {
    const token = jwt.sign({ id: 1 }, SECRET);
    expect(() => jwt.verify(token, "wrong")).toThrow();
  });
});
