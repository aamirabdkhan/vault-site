const WIKILINK_RE = /(!?)\[\[([^\][|#]+)(#[^\][|]*)?(\|([^\][]*))?\]\]/g
const MDLINK_RE = /(!?)\[([^\]]*)\]\(([^)\s]+)\)/g

export function neutralizeLinks(markdown, isTargetPublished) {
  let count = 0
  let text = markdown.replace(WIKILINK_RE, (full, bang, target, _anchor, _pipe, alias) => {
    if (isTargetPublished(target, bang === "!")) return full
    count++
    if (bang === "!") return ""
    return alias !== undefined ? alias : target.trim()
  })
  text = text.replace(MDLINK_RE, (full, bang, label, dest) => {
    if (bang === "!") return full // image embeds resolved via attachment copying
    const clean = decodeURIComponent(dest).replace(/#.*$/, "")
    if (/^https?:\/\//.test(clean) || !clean.endsWith(".md")) return full
    if (isTargetPublished(clean, false)) return full
    count++
    return label
  })
  return { text, count }
}
