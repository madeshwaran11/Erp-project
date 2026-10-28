import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  FORGOT_PASSWORD_PATH,
  RESET_PASSWORD_PATH,
  buildResetPath,
  readResetToken,
} from "../recovery.js";

const appSource = readFileSync(new URL("../App.jsx", import.meta.url), "utf8");

test("recovery routes use the paths the backend links to", () => {
  assert.equal(FORGOT_PASSWORD_PATH, "/forgot-password");
  assert.equal(RESET_PASSWORD_PATH, "/reset-password");
});

test("App registers both recovery routes", () => {
  assert.match(appSource, /path=\{FORGOT_PASSWORD_PATH\}/);
  assert.match(appSource, /path=\{RESET_PASSWORD_PATH\}/);
});

test("recovery routes stay reachable during session recovery", () => {
  assert.match(appSource, /FORGOT_PASSWORD_PATH,\s*RESET_PASSWORD_PATH/);
});

test("readResetToken accepts URLSearchParams and query strings", () => {
  assert.equal(
    readResetToken(new URLSearchParams("token=abc123")),
    "abc123"
  );
  assert.equal(readResetToken("?token=abc123"), "abc123");
  assert.equal(readResetToken("token=abc123"), "abc123");
});

test("readResetToken returns an empty string for a missing token", () => {
  assert.equal(readResetToken(""), "");
  assert.equal(readResetToken("?email=user@example.com"), "");
  assert.equal(readResetToken(null), "");
});

test("buildResetPath encodes the token and round-trips", () => {
  const token = "a+b/c=d";
  const path = buildResetPath(token);

  assert.equal(path, "/reset-password?token=a%2Bb%2Fc%3Dd");
  assert.equal(readResetToken(path.split("?")[1]), token);
});

test("buildResetPath without a token points at the bare route", () => {
  assert.equal(buildResetPath(""), "/reset-password");
  assert.equal(buildResetPath(null), "/reset-password");
});
