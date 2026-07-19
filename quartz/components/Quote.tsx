import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/quote.scss"

interface Options {
  text: string
  author: string
}

const defaults: Options = {
  text: "The quieter you become, the more you are able to hear.",
  author: "Mr. Robot",
}

export default ((opts?: Partial<Options>) => {
  const o = { ...defaults, ...opts }
  const Quote: QuartzComponent = ({ displayClass }: QuartzComponentProps) => (
    <blockquote class={`sidebar-quote ${displayClass ?? ""}`}>
      <p class="sidebar-quote-text">{o.text}</p>
      <span class="sidebar-quote-author">— {o.author}</span>
    </blockquote>
  )
  Quote.css = style
  return Quote
}) satisfies QuartzComponentConstructor
