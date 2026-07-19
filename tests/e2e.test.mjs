import { test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { fileURLToPath } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const VAULT = path.join(HERE, "fixtures/vault")
const SCRIPT = path.join(HERE, "../scripts/filter-vault.mjs")

test("filter-vault end to end", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fv-"))
  const out = path.join(tmp, "content")
  const manifest = path.join(tmp, "manifest.json")
  fs.writeFileSync(manifest, JSON.stringify({
    version: 1,
    published: ["Notes"],
    excluded: [],
  }))
  const stdout = execFileSync("node", [SCRIPT, "--vault", VAULT, "--out", out, "--manifest", manifest], { encoding: "utf8" })

  // published notes present
  assert.ok(fs.existsSync(path.join(out, "Notes/Crypto/Caesar.md")))
  assert.ok(fs.existsSync(path.join(out, "Notes/Crypto/Vigenere.md")))
  // excalidraw note skipped despite folder ON
  assert.ok(!fs.existsSync(path.join(out, "Notes/Drawing.md")))
  // private folder absent entirely
  assert.ok(!fs.existsSync(path.join(out, "Private")))
  // referenced attachment copied
  assert.ok(fs.existsSync(path.join(out, "Files/diagram.png")))
  // homepage installed
  assert.ok(fs.existsSync(path.join(out, "index.md")))

  const caesar = fs.readFileSync(path.join(out, "Notes/Crypto/Caesar.md"), "utf8")
  assert.ok(caesar.includes("[[Vigenere]]"), "published wikilink kept")
  assert.ok(!caesar.includes("[[Private Diary"), "private wikilink neutralized")
  assert.ok(caesar.includes("my diary"), "alias text kept")
  assert.ok(caesar.includes("![[diagram.png]]"), "published embed kept")
  assert.ok(!/\]\((\.\.\/)*Private\//.test(caesar), "private md link neutralized")
  assert.match(stdout, /published 2 notes, 1 attachments/)

  // no content of private notes anywhere in output
  const all = fs.readdirSync(out, { recursive: true }).join("\n")
  assert.ok(!all.includes("Private Diary.md"))
})

test("missing manifest exits 1", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fv-"))
  assert.throws(
    () => execFileSync("node", [SCRIPT, "--vault", VAULT, "--out", path.join(tmp, "c"), "--manifest", path.join(tmp, "nope.json")], { encoding: "utf8" }),
    (err) => err.status === 1,
  )
})
