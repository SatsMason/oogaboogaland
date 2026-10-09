// Focused smoke test for the SatsMason character definition.
// Run: node test/satsmason-smoke.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../src/characters/SatsMason.js", import.meta.url), "utf8");
let character;
const geometry = () => ({ verts: [0, 0, 0], faces: [] });
const vox = () => ({
  fill() {}, set() {}, del() {}
});
const BL = {
  models: {
    box: geometry, lathe: geometry, ring: geometry,
    merge: (...parts) => ({ parts }), forward: (part) => part,
    cached: (factory) => factory, makeVox: vox
  },
  scene: {
    createNode: (options) => ({ ...options, children: [] }),
    addChild: (parent, child) => { parent.children.push(child); }
  },
  characters: { add: (entry) => { character = entry; } }
};
runInNewContext(source, { window: { BL } });
assert.equal(character.handle, "SatsMason");
assert.equal(character.github || character.handle, "SatsMason");
assert.ok(Number.isFinite(character.joined));
assert.ok(Number.isFinite(character.lastCommit));
assert.ok(character.dress);
const k = {
  h: 1.3, u: 0.01, root: { children: [] },
  parts: {
    head: { children: [] }, armR: {}, armL: {}, legR: {}, legL: {}
  },
  color: (color) => color, jit: (a) => a, vg: geometry,
  eyeCells: []
};
const v = vox();
character.dress.torso(k, v);
character.dress.gear(k);
assert.ok(k.parts.armR.geometry);
assert.ok(k.parts.legR.geometry);
assert.equal(character.dress.skull(k, v), true);
assert.equal(character.dress.eyes(k, v), true);
assert.equal(k.eyeCells.length, 2);
character.dress.headgear(k);
assert.equal(k.parts.head.children.length, 1);
assert.ok(character.dress.club(k).default);
character.dress.extras(k);
assert.equal(k.root.children.length, 1);
console.log("SatsMason smoke test passed: registration, body, eyes, hat, hurley and sliotar.");
