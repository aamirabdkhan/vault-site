import { test } from "node:test"
import assert from "node:assert/strict"
import { neutralizeLinks } from "../scripts/lib/links.mjs"

const pub = new Set(["vigenere", "diagram.png"])
const pred = (target, isEmbed) => {
  const t = target.trim().toLowerCase().replace(/\.md$/, "").split("/").pop()
  return isEmbed ? pub.has(target.trim().toLowerCase()) || pub.has(t) : pub.has(t)
}

test("published wikilink kept verbatim", () => {
  const { text, count } = neutralizeLinks("See [[Vigenere]] ok", pred)
  assert.equal(text, "See [[Vigenere]] ok")
  assert.equal(count, 0)
})

test("unpublished wikilink becomes plain text", () => {
  const { text, count } = neutralizeLinks("See [[Private Diary]].", pred)
  assert.equal(text, "See Private Diary.")
  assert.equal(count, 1)
})

test("alias wins for unpublished link", () => {
  const { text } = neutralizeLinks("See [[Private Diary|my diary]].", pred)
  assert.equal(text, "See my diary.")
})

test("anchors: published keeps anchor form, unpublished drops all", () => {
  assert.equal(neutralizeLinks("[[Vigenere#intro]]", pred).text, "[[Vigenere#intro]]")
  assert.equal(neutralizeLinks("[[Private Diary#x|d]]", pred).text, "d")
})

test("unpublished embed removed entirely; published embed kept", () => {
  const { text, count } = neutralizeLinks("A ![[Private Diary]] B ![[diagram.png]]", pred)
  assert.equal(text, "A  B ![[diagram.png]]")
  assert.equal(count, 1)
})

test("relative md link neutralized, external kept", () => {
  const { text, count } = neutralizeLinks("[seven](../Private/Seven.md) [s](https://e.com/a.md)", pred)
  assert.equal(text, "seven [s](https://e.com/a.md)")
  assert.equal(count, 1)
})

test("published relative md link kept", () => {
  assert.equal(neutralizeLinks("[ok](Vigenere.md)", pred).text, "[ok](Vigenere.md)")
})
