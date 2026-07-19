const HARD_BLOCK = new Set([".obsidian", ".git", ".trash", ".makemd", ".space", ".publish"])

export function loadManifest(json) {
  if (typeof json !== "object" || json === null) throw new Error("manifest: not an object")
  if (json.version !== 1) throw new Error(`manifest: unsupported version ${json?.version}`)
  const published = json.published ?? []
  const excluded = json.excluded ?? []
  for (const list of [published, excluded]) {
    if (!Array.isArray(list) || !list.every((p) => typeof p === "string")) {
      throw new Error("manifest: published/excluded must be arrays of strings")
    }
  }
  const norm = (p) => p.replace(/^\.\//, "").replace(/\/+$/, "")
  return { published: published.map(norm), excluded: excluded.map(norm) }
}

export function isHardBlocked(relPath) {
  return relPath.split("/").some((seg) => HARD_BLOCK.has(seg))
}

// Longest matching manifest entry decides; exact file match outranks a
// folder entry of identical length; on a dead tie, excluded wins.
function matchLen(entry, relPath) {
  if (entry === relPath) return entry.length + 1
  if (relPath.startsWith(entry + "/")) return entry.length
  return -1
}

export function resolvePublishState(relPath, manifest) {
  if (isHardBlocked(relPath)) return false
  let best = { len: -1, on: false }
  for (const e of manifest.published) {
    const len = matchLen(e, relPath)
    if (len > best.len) best = { len, on: true }
  }
  for (const e of manifest.excluded) {
    const len = matchLen(e, relPath)
    if (len !== -1 && len >= best.len) best = { len, on: false }
  }
  return best.len !== -1 ? best.on : false
}
