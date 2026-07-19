function updateScore(quiz: HTMLElement) {
  const scoreEl = quiz.querySelector<HTMLElement>(".mcq-score")
  if (!scoreEl) return
  const total = quiz.querySelectorAll('.mcq[data-interactive="true"]').length
  const answered = quiz.querySelectorAll(".mcq.answered").length
  const correct = quiz.querySelectorAll(".mcq.answered .mcq-opt.chosen.correct").length
  scoreEl.textContent = `Score — ${correct} correct · ${answered}/${total} answered`
}

function onPick(this: HTMLElement) {
  const btn = this
  const mcq = btn.closest(".mcq") as HTMLElement | null
  if (!mcq || mcq.classList.contains("answered")) return
  mcq.classList.add("answered")

  const correct = btn.dataset.correct === "true"
  btn.classList.add("chosen", correct ? "correct" : "wrong")
  if (!correct) {
    mcq.querySelector('.mcq-opt[data-correct="true"]')?.classList.add("correct")
  }

  const concept = mcq.dataset.concept
  if (concept) {
    const p = document.createElement("p")
    p.className = "mcq-explain"
    p.textContent = concept
    mcq.appendChild(p)
  }

  const quiz = mcq.closest(".mcq-quiz") as HTMLElement | null
  if (quiz) updateScore(quiz)
}

document.addEventListener("nav", () => {
  for (const quiz of document.querySelectorAll<HTMLElement>(".mcq-quiz")) {
    if (!quiz.querySelector('.mcq[data-interactive="true"]')) continue
    if (!quiz.querySelector(".mcq-score")) {
      const s = document.createElement("div")
      s.className = "mcq-score"
      quiz.prepend(s)
    }
    updateScore(quiz)
  }

  const opts = document.querySelectorAll<HTMLElement>('.mcq[data-interactive="true"] .mcq-opt')
  for (const opt of opts) {
    opt.addEventListener("click", onPick)
    window.addCleanup?.(() => opt.removeEventListener("click", onPick))
  }
})
