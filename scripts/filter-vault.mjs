#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { loadManifest, resolvePublishState } from "./lib/resolve.mjs"
import { walkVault, isEligibleNote, isAttachment, findEmbeds } from "./lib/scan.mjs"
import { neutralizeLinks } from "./lib/links.mjs"
import { transformMcq } from "./lib/mcq.mjs"

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

const vault = arg("vault")
const out = arg("out", "content")
if (!vault) {
  console.error("usage: filter-vault --vault <path> [--out content] [--manifest <path>] [--home <file>]")
  process.exit(2)
}
const manifestPath = arg("manifest", path.join(vault, ".publish/manifest.json"))
const homePath = arg("home", "site-home/index.md")

let manifest
try {
  manifest = loadManifest(JSON.parse(fs.readFileSync(manifestPath, "utf8")))
} catch (err) {
  console.error(`error: cannot load manifest at ${manifestPath}: ${err.message}`)
  process.exit(1)
}

const all = walkVault(vault)
const notes = all.filter((p) => resolvePublishState(p, manifest) && isEligibleNote(vault, p))

// index every vault attachment by lowercase basename for embed resolution
const attachIndex = new Map()
for (const p of all.filter(isAttachment)) {
  const base = path.posix.basename(p).toLowerCase()
  if (!attachIndex.has(base)) attachIndex.set(base, [])
  attachIndex.get(base).push(p)
}

// attachments referenced by published notes (first basename match wins)
const attachments = new Set()
for (const note of notes) {
  const md = fs.readFileSync(path.join(vault, note), "utf8")
  for (const t of findEmbeds(md)) {
    const cands = attachIndex.get(path.posix.basename(t).toLowerCase())
    if (cands?.length) attachments.add(cands[0])
  }
}

// lookup keys: full path (sans .md) and bare basename, lowercased
const noteKeys = new Set()
for (const n of notes) {
  noteKeys.add(n.toLowerCase().replace(/\.md$/, ""))
  noteKeys.add(path.posix.basename(n, ".md").toLowerCase())
}
const attachKeys = new Set()
for (const a of attachments) {
  attachKeys.add(a.toLowerCase())
  attachKeys.add(path.posix.basename(a).toLowerCase())
}
const isTargetPublished = (target, isEmbed) => {
  const raw = target.trim().toLowerCase()
  const t = raw.replace(/\.md$/, "").replace(/^(\.\.\/)+|^\.\//, "")
  if (noteKeys.has(t) || noteKeys.has(path.posix.basename(t))) return true
  if (isEmbed && (attachKeys.has(raw) || attachKeys.has(path.posix.basename(raw)))) return true
  return false
}

fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(out, { recursive: true })

let neutralized = 0
for (const note of notes) {
  const raw = fs.readFileSync(path.join(vault, note), "utf8")
  const md = transformMcq(raw) ?? raw
  const { text, count } = neutralizeLinks(md, isTargetPublished)
  neutralized += count
  const dest = path.join(out, note)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, text)
}
for (const a of attachments) {
  const dest = path.join(out, a)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(path.join(vault, a), dest)
}
if (fs.existsSync(homePath)) fs.copyFileSync(homePath, path.join(out, "index.md"))

console.log(`published ${notes.length} notes, ${attachments.size} attachments, neutralized ${neutralized} links`)
