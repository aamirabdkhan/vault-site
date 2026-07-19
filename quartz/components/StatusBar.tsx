import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/statusbar.scss"

interface Options {
  items?: { label: string; value: string; accent?: boolean; href?: string }[]
}

const defaultItems: Required<Options>["items"] = [
  { label: "Source", value: "Obsidian Vault" },
  { label: "Operation", value: "Learn" },
  { label: "Maintainer", value: "aamirabdkhan", href: "https://github.com/aamirabdkhan" },
  { label: "System Status", value: "All systems operational", accent: true },
]

export default ((opts?: Options) => {
  const StatusBar: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const items = opts?.items ?? defaultItems
    return (
      <footer class={`status-bar ${displayClass ?? ""}`}>
        {items.map((item) => (
          <div class="status-item">
            <span class="status-label">{item.label}</span>
            {item.href ? (
              <a class={`status-value ${item.accent ? "accent" : ""}`} href={item.href}>
                {item.value}
              </a>
            ) : (
              <span class={`status-value ${item.accent ? "accent" : ""}`}>{item.value}</span>
            )}
          </div>
        ))}
      </footer>
    )
  }

  StatusBar.css = style
  return StatusBar
}) satisfies QuartzComponentConstructor
