// Turn a FACT-style MCQ note into interactive quiz HTML.
// Correct answers come from the "ANSWER KEY" table, NOT the [x] ticks (those
// are the author's past practice attempts). Returns transformed markdown with
// a raw-HTML quiz block, or null if the note isn't an MCQ note.

const ANSWERKEY_RE = /^#{1,6}\s*.*answer\s*key.*$/im
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const norm = (s) =>
  s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[–—]/g, "-")

function parseAnswerKey(section) {
  const map = new Map()
  for (const line of section.split("\n")) {
    const m = line.match(/^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.*?)\s*\|?\s*$/)
    if (m) map.set(Number(m[1]), { answer: m[2], concept: m[3] })
  }
  return map
}

function parseQuestions(body) {
  const qs = []
  // ponytail: assumes question text has no nested ** bold; true for these notes
  const re = /\*\*(\d+)\.\s*([\s\S]*?)\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*\d+\.|\n#{1,6}\s|$)/g
  let m
  while ((m = re.exec(body))) {
    const options = [...m[3].matchAll(/^\s*-\s*\[[ xX]\]\s*(.+?)\s*$/gm)].map((o) => o[1])
    if (options.length) qs.push({ num: Number(m[1]), text: m[2].trim(), options })
  }
  return qs
}

function correctIndex(options, answer) {
  const na = norm(answer)
  const eq = options.map((o, i) => (norm(o) === na ? i : -1)).filter((i) => i >= 0)
  if (eq.length === 1) return eq[0]
  // fallback: unique substring match (handles trailing punctuation etc.)
  const inc = options
    .map((o, i) => (norm(o).includes(na) || na.includes(norm(o)) ? i : -1))
    .filter((i) => i >= 0)
  return inc.length === 1 ? inc[0] : -1
}

export function transformMcq(md) {
  const ak = md.match(ANSWERKEY_RE)
  if (!ak) return null
  const body = md.slice(0, ak.index)
  if (!/^\s*-\s*\[[ xX]\]/m.test(body)) return null

  const answers = parseAnswerKey(md.slice(ak.index))
  const questions = parseQuestions(body)
  if (questions.length === 0) return null

  const firstQ = body.search(/\*\*\d+\.\s/)
  const header = firstQ > 0 ? body.slice(0, firstQ).trimEnd() : ""

  let html = '<div class="mcq-quiz">\n'
  for (const q of questions) {
    const key = answers.get(q.num)
    const correct = key ? correctIndex(q.options, key.answer) : -1
    const interactive = correct >= 0
    html += `<div class="mcq" data-interactive="${interactive}"`
    if (interactive && key.concept) html += ` data-concept="${esc(key.concept)}"`
    html += `>\n<p class="mcq-q"><strong>${q.num}.</strong> ${esc(q.text)}</p>\n<div class="mcq-opts">\n`
    q.options.forEach((o, i) => {
      html += interactive
        ? `<button class="mcq-opt" type="button" data-correct="${i === correct}">${esc(o)}</button>\n`
        : `<div class="mcq-opt mcq-static">${esc(o)}</div>\n`
    })
    html += "</div>\n</div>\n"
  }
  html += "</div>"

  return `${header}\n\n${html}\n`
}
