import request from "supertest";
import app from "../../server.js"; // должен экспортироваться как app

describe("Auth routes", () => {
  test("should return unauthorized without token", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(401);
  });

  test("should register user", async () => {
    const email = "user" + Date.now() + "@test.com";

    const res = await request(app)
      .post("/register")
      .send({ name: "TestUser", email, password: "12345" });

    expect(res.statusCode).toBe(201);
  });
});
