import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";

// import middleware from server.js
import { verifyUser } from "../../server.js";

const SECRET = "jwt-secret-key";

describe("verifyUser middleware", () => {
  test("should allow valid token", () => {
    const token = jwt.sign({ id: 1, name: "Alice" }, SECRET);

    const req = { cookies: { token } };
    const res = {};
    const next = jest.fn();

    verifyUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.name).toBe("Alice");
  });

  test("should block without token", () => {
    const req = { cookies: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    verifyUser(req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
