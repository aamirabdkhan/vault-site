import { test } from "node:test"
import assert from "node:assert/strict"
import { transformMcq } from "../scripts/lib/mcq.mjs"

const SAMPLE = `# 🎯 DAY X DRILL

### Some topics

---

**1. Two plus two?**

- [x] 3
- [ ] 4
- [ ] 5
- [ ] 22

---

**2. Capital of France?**

- [ ] London
- [x] Paris
- [ ] Rome
- [ ] Berlin

---

**3. Visible range?**

- [ ] 100 nm
- [x] 380–760 nm
- [ ] 900 nm
- [ ] 1200 nm

---

**4. Unmatchable?**

- [ ] Alpha
- [ ] Beta

# ✅ ANSWER KEY — DAY X

|Q|Answer|Key Concept|
|---|---|---|
|1|4|basic math|
|2|Paris|geography|
|3|380-760 NM|EM spectrum|
|4|Gamma|not an option|

# 📊 SCORING GUIDE

|Score|Status|
|---|---|
|4|great|

> Score batao — \`/start day 2\`
`

test("returns null for a non-MCQ note", () => {
  assert.equal(transformMcq("# Notes\n\nJust prose, no answer key."), null)
})

test("correct answer comes from the key, not the [x] tick", () => {
  const out = transformMcq(SAMPLE)
  // Q1: [x] was on "3" (wrong attempt); key says "4"
  assert.match(out, /data-correct="true">4</)
  assert.doesNotMatch(out, /data-correct="true">3</)
})

test("all four questions present; matched ones interactive", () => {
  const out = transformMcq(SAMPLE)
  assert.equal((out.match(/class="mcq"/g) || []).length, 4)
  assert.match(out, /data-correct="true">Paris</)
})

test("dash/case/space normalization still matches", () => {
  const out = transformMcq(SAMPLE)
  // key "380-760 NM" vs option "380–760 nm" (en-dash, lowercase)
  assert.match(out, /data-correct="true">380–760 nm</)
})

test("unmatchable question falls back to non-interactive", () => {
  const out = transformMcq(SAMPLE)
  // Q4 answer "Gamma" is not an option -> that .mcq is data-interactive="false"
  assert.match(out, /data-interactive="false"[\s\S]*Alpha/)
})

test("concept carried as data attribute", () => {
  const out = transformMcq(SAMPLE)
  assert.match(out, /data-concept="basic math"/)
})

test("answer key, scoring guide, and chat prompts are dropped", () => {
  const out = transformMcq(SAMPLE)
  assert.doesNotMatch(out, /ANSWER KEY/)
  assert.doesNotMatch(out, /SCORING GUIDE/)
  assert.doesNotMatch(out, /Score batao/)
  assert.doesNotMatch(out, /\|Q\|Answer/)
})

test("header before first question is preserved", () => {
  const out = transformMcq(SAMPLE)
  assert.match(out, /DAY X DRILL/)
})
