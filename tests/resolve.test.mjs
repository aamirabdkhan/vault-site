import { test } from "node:test"
import assert from "node:assert/strict"
import { loadManifest, resolvePublishState, isHardBlocked } from "../scripts/lib/resolve.mjs"

const m = (published = [], excluded = []) => loadManifest({ version: 1, published, excluded })

test("loadManifest rejects bad input", () => {
  assert.throws(() => loadManifest(null), /manifest:/)
  assert.throws(() => loadManifest({ version: 2 }), /manifest:/)
  assert.throws(() => loadManifest({ version: 1, published: "x" }), /manifest:/)
})

test("loadManifest normalizes paths", () => {
  const man = loadManifest({ version: 1, published: ["./a/b/", "c"], excluded: [] })
  assert.deepEqual(man.published, ["a/b", "c"])
})

test("default is OFF", () => {
  assert.equal(resolvePublishState("01 - Notes/CTF/x.md", m()), false)
})

test("exact note ON", () => {
  assert.equal(resolvePublishState("a/n.md", m(["a/n.md"])), true)
})

test("folder ON publishes children recursively", () => {
  const man = m(["01 - Notes/OverTheWire"])
  assert.equal(resolvePublishState("01 - Notes/OverTheWire/level1.md", man), true)
  assert.equal(resolvePublishState("01 - Notes/OverTheWireX/other.md", man), false) // no prefix false-positives
})

test("note override OFF inside ON folder", () => {
  const man = m(["a"], ["a/secret.md"])
  assert.equal(resolvePublishState("a/secret.md", man), false)
  assert.equal(resolvePublishState("a/open.md", man), true)
})

test("note override ON inside OFF (unlisted) folder", () => {
  assert.equal(resolvePublishState("b/gem.md", m(["b/gem.md"])), true)
})

test("deeper entry wins: folder ON > subfolder OFF > note ON", () => {
  const man = m(["a", "a/sub/keep.md"], ["a/sub"])
  assert.equal(resolvePublishState("a/sub/hidden.md", man), false)
  assert.equal(resolvePublishState("a/sub/keep.md", man), true)
  assert.equal(resolvePublishState("a/top.md", man), true)
})

test("same path in both lists -> excluded wins", () => {
  assert.equal(resolvePublishState("a/x.md", m(["a/x.md"], ["a/x.md"])), false)
})

test("hard-blocked segments always OFF, even if published", () => {
  for (const p of [".obsidian/app.json", ".trash/old.md", ".publish/manifest.json", "x/.git/config", ".makemd/y.md", ".space/z.md"]) {
    assert.equal(isHardBlocked(p), true)
    assert.equal(resolvePublishState(p, m([p])), false)
  }
  assert.equal(isHardBlocked("01 - Notes/a.md"), false)
})
