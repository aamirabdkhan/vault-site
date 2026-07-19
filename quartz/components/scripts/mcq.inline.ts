function onPick(this: HTMLElement) {
  const btn = this
  const mcq = btn.closest(".mcq") as HTMLElement | null
  if (!mcq || mcq.classList.contains("answered")) return
  mcq.classList.add("answered")

  const correct = btn.dataset.correct === "true"
  btn.classList.add("chosen", correct ? "correct" : "wrong")
  if (!correct) {
    const right = mcq.querySelector('.mcq-opt[data-correct="true"]')
    right?.classList.add("correct")
  }

  const concept = mcq.dataset.concept
  if (concept) {
    const p = document.createElement("p")
    p.className = "mcq-explain"
    p.textContent = concept
    mcq.appendChild(p)
  }
}

document.addEventListener("nav", () => {
  const opts = document.querySelectorAll<HTMLElement>('.mcq[data-interactive="true"] .mcq-opt')
  for (const opt of opts) {
    opt.addEventListener("click", onPick)
    window.addCleanup?.(() => opt.removeEventListener("click", onPick))
  }
})
