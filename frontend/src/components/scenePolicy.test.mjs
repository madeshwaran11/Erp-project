import test from "node:test";
import assert from "node:assert/strict";
import { chooseAnimation, permittedModules } from "./scenePolicy.js";
test("uses only an actual idle clip by default", () => {
 assert.equal(chooseAnimation(["Walk", "Idle_Standing"]), "Idle_Standing");
 assert.equal(chooseAnimation(["Run", "Walk"]), null);
 assert.equal(chooseAnimation([]), null);
});
test("only selects a requested gesture when supplied by the asset", () => {
 assert.equal(chooseAnimation(["Idle", "Wave"], "Wave"), "Wave");
 assert.equal(chooseAnimation(["Idle"], "Point"), "Idle");
});
test("module links cannot expose destinations outside role navigation", () => {
 const cards = [{id:"people"}, {id:"projects"}, {id:"finance"}, {id:"reports"}];
 assert.deepEqual(permittedModules(cards,[{id:"projects"}]), [{id:"projects"}]);
 assert.deepEqual(permittedModules(cards,[]), []);
});
