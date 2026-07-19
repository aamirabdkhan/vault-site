import { test } from "node:test"
import assert from "node:assert/strict"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { walkVault, isEligibleNote, isAttachment, findEmbeds } from "../scripts/lib/scan.mjs"

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/vault")

test("walkVault lists all files with /-separated relative paths", () => {
  const files = walkVault(ROOT)
  assert.ok(files.includes("Notes/Crypto/Caesar.md"))
  assert.ok(files.includes(".obsidian/app.json"))
  assert.ok(files.includes("Files/diagram.png"))
  assert.deepEqual(files, [...files].sort())
})

test("isEligibleNote accepts md, rejects non-md and excalidraw", () => {
  assert.equal(isEligibleNote(ROOT, "Notes/Crypto/Caesar.md"), true)
  assert.equal(isEligibleNote(ROOT, "Files/diagram.png"), false)
  assert.equal(isEligibleNote(ROOT, "Notes/Drawing.md"), false)
})

test("isAttachment by extension", () => {
  assert.equal(isAttachment("Files/diagram.png"), true)
  assert.equal(isAttachment("Files/x.PDF"), true)
  assert.equal(isAttachment("Notes/Crypto/Caesar.md"), false)
  assert.equal(isAttachment("x.base"), false)
})

test("findEmbeds extracts wikilink and local markdown embeds, skips external", () => {
  const md = "![[diagram.png]] ![[Private Diary]] ![alt](Files/pic%20one.png) ![x](https://e.com/i.png)"
  assert.deepEqual(findEmbeds(md), ["diagram.png", "Private Diary", "Files/pic one.png"])
})
