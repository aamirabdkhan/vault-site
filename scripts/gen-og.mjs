// One-off generator for the site-wide social preview image (Concept B).
// Renders an SVG -> quartz/static/og-image.png via sharp. Re-run to tweak.
// Needs JetBrains Mono installed for fontconfig (see README / fc-list).
import sharp from "sharp"

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#141b28" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#0a0e16"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <g stroke="#33405a" stroke-width="2" fill="none">
    <path d="M40 66V40H66"/>
    <path d="M1134 40H1160V66"/>
    <path d="M40 564V590H66"/>
    <path d="M1134 590H1160V564"/>
  </g>

  <text x="84" y="212" fill="#7c8798" font-family="JetBrains Mono" font-size="18" letter-spacing="6">04  //  VAULT</text>
  <text x="80" y="300" font-family="JetBrains Mono" font-size="82" font-weight="700" letter-spacing="6" fill="#eef1f6">AAMIR'S</text>
  <text x="80" y="384" font-family="JetBrains Mono" font-size="82" font-weight="700" letter-spacing="6" fill="#82aee8">VAULT</text>
  <text x="84" y="440" fill="#8a94a6" font-family="JetBrains Mono" font-size="19" letter-spacing="3">Cybersecurity notes · living archive</text>
  <text x="84" y="486" font-family="JetBrains Mono" font-size="19"><tspan fill="#6fbf8f">&gt; </tspan><tspan fill="#c8cfda">stay curious. stay dangerous.</tspan></text>
  <rect x="446" y="470" width="11" height="20" fill="#82aee8"/>

  <rect x="726" y="150" width="392" height="252" fill="#0d1220" stroke="#1a2130" stroke-width="1" rx="4"/>
  <g stroke="#3a4761" stroke-width="1.5" fill="none">
    <path d="M726 176V150H752"/>
    <path d="M1092 402H1118V376"/>
  </g>
  <text x="758" y="212" fill="#c8cfda" font-family="JetBrains Mono" font-size="23">The quieter you</text>
  <text x="758" y="246" fill="#c8cfda" font-family="JetBrains Mono" font-size="23">become, the more</text>
  <text x="758" y="280" fill="#c8cfda" font-family="JetBrains Mono" font-size="23">you are able to hear.</text>
  <text x="758" y="356" fill="#7c8798" font-family="JetBrains Mono" font-size="16" letter-spacing="3">— MR. ROBOT</text>

  <line x1="40" y1="524" x2="1160" y2="524" stroke="#1a2130" stroke-width="1"/>
  <circle cx="52" cy="562" r="5" fill="#6fbf8f"/>
  <text x="70" y="568" fill="#7c8798" font-family="JetBrains Mono" font-size="16" letter-spacing="2">ALL SYSTEMS OPERATIONAL</text>
  <text x="1160" y="568" text-anchor="end" fill="#7c8798" font-family="JetBrains Mono" font-size="16" letter-spacing="2">aamirabdkhan.github.io/vault-site</text>
</svg>`

await sharp(Buffer.from(svg)).png().toFile("quartz/static/og-image.png")
console.log("wrote quartz/static/og-image.png")
