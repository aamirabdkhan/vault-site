import { QuartzComponent, QuartzComponentConstructor } from "./types"
import mcqScript from "./scripts/mcq.inline"
import style from "./styles/mcq.scss"

// Renders nothing; just carries the MCQ quiz styles + click behavior.
export default (() => {
  const Mcq: QuartzComponent = () => null
  Mcq.css = style
  Mcq.afterDOMLoaded = mcqScript
  return Mcq
}) satisfies QuartzComponentConstructor
