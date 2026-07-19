import fs from "node:fs"
import path from "node:path"

const ATTACHMENT_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".pdf", ".mp4", ".webm", ".mp3"])

export function walkVault(rootAbs) {
  const files = []
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(abs)
      else files.push(path.relative(rootAbs, abs).split(path.sep).join("/"))
    }
  }
  walk(rootAbs)
  return files.sort()
}

export function isEligibleNote(rootAbs, relPath) {
  if (!relPath.endsWith(".md")) return false
  const head = fs.readFileSync(path.join(rootAbs, relPath), "utf8").slice(0, 2000)
  return !head.includes("excalidraw-plugin")
}

export function isAttachment(relPath) {
  return ATTACHMENT_EXTS.has(path.extname(relPath).toLowerCase())
}

export function findEmbeds(markdown) {
  const targets = []
  for (const m of markdown.matchAll(/!\[\[([^\]|#]+)/g)) targets.push(m[1].trim())
  for (const m of markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
    const t = decodeURIComponent(m[1])
    if (!/^https?:\/\//.test(t)) targets.push(t)
  }
  return targets
}
