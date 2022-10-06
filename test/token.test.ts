import { expect, test } from "vitest";
import { createToken } from "../src";

test("createToken", () => {
  const token = createToken("token", String);
  expect(token.name).toBe("token");
  expect(token.type).toBe(String);
});
