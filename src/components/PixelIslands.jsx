// Same component, same props (none), same className="scene" — visuals only.
// Animations live in an inline <style> so no global CSS changes are needed.

const SCENE_CSS = `
.pi-tw { animation: pi-twinkle 2.4s steps(1) infinite; }
.pi-cloud { animation: pi-drift 9s steps(9) infinite alternate; }
.pi-wave { animation: pi-wave 3.2s steps(4) infinite alternate; }
.pi-glow { animation: pi-flicker 1.6s steps(1) infinite; }
.pi-flag { animation: pi-flag 1s steps(1) infinite; }
.pi-dot { animation: pi-dot 1.2s steps(1) infinite; }
.pi-heart { animation: pi-float 1.6s steps(2) infinite; }
.pi-bob { animation: pi-bob 1.4s steps(1) infinite; }
@keyframes pi-twinkle { 50% { opacity: 0.15; } }
@keyframes pi-drift { to { transform: translateX(10px); } }
@keyframes pi-wave { to { transform: translateX(4px); } }
@keyframes pi-flicker { 50% { opacity: 0.45; } }
@keyframes pi-flag { 50% { transform: translateY(1px); } }
@keyframes pi-dot { 0%,100% { opacity: 0.25; } 33% { opacity: 1; } }
@keyframes pi-float { 50% { transform: translateY(-2px); } }
@keyframes pi-bob { 50% { transform: translateY(-1px); } }
@media (prefers-reduced-motion: reduce) {
  .pi-tw,.pi-cloud,.pi-wave,.pi-glow,.pi-flag,.pi-dot,.pi-heart,.pi-bob { animation: none; }
}
`

const PLANKS = Array.from({ length: 13 }, (_, i) => i)
const HANGERS = [58, 66, 74, 82, 90, 98]

export default function PixelIslands() {
  return (
    <svg
      className="scene"
      viewBox="0 0 160 90"
      role="img"
      aria-label="Two pixel islands joined by a bridge over water"
      shapeRendering="crispEdges"
    >
      <style>{SCENE_CSS}</style>

      {/* ── dusk sky, banded for a dithered-gradient feel ── */}
      <rect x="0" y="0" width="160" height="12" fill="#070d24" />
      <rect x="0" y="12" width="160" height="10" fill="#0b1432" />
      <rect x="0" y="22" width="160" height="10" fill="#111d47" />
      <rect x="0" y="32" width="160" height="10" fill="#1a2c5c" />
      <rect x="0" y="42" width="160" height="8" fill="#27407a" />
      <rect x="0" y="50" width="160" height="4" fill="#5a5f93" />
      <rect x="0" y="52" width="160" height="2" fill="#e0a35c" opacity="0.55" />
      {/* dither seams between bands */}
      {Array.from({ length: 40 }, (_, i) => (
        <g key={i}>
          <rect x={i * 4 + (i % 2) * 2} y="11" width="2" height="1" fill="#0b1432" />
          <rect x={i * 4 + ((i + 1) % 2) * 2} y="22" width="2" height="1" fill="#111d47" />
          <rect x={i * 4 + (i % 2) * 2} y="42" width="2" height="1" fill="#27407a" />
        </g>
      ))}

      {/* stars */}
      <rect className="pi-tw" x="20" y="10" width="2" height="2" fill="#8fb7ff" />
      <rect className="pi-tw" style={{ animationDelay: '0.6s' }} x="78" y="6" width="2" height="2" fill="#c9d9ff" />
      <rect className="pi-tw" style={{ animationDelay: '1.1s' }} x="104" y="14" width="1" height="1" fill="#c9d9ff" />
      <rect className="pi-tw" style={{ animationDelay: '0.3s' }} x="46" y="18" width="1" height="1" fill="#7fe7ff" />
      <rect className="pi-tw" style={{ animationDelay: '1.7s' }} x="146" y="22" width="2" height="2" fill="#8fb7ff" />
      <rect className="pi-tw" style={{ animationDelay: '0.9s' }} x="6" y="26" width="1" height="1" fill="#c9d9ff" />
      <rect className="pi-tw" style={{ animationDelay: '2s' }} x="62" y="14" width="1" height="1" fill="#ffc285" />
      <rect className="pi-tw" style={{ animationDelay: '1.4s' }} x="96" y="26" width="1" height="1" fill="#8fb7ff" />

      {/* moon + halo */}
      <rect x="120" y="2" width="20" height="18" fill="#c9d9ff" opacity="0.07" />
      <rect x="122" y="4" width="16" height="14" fill="#c9d9ff" opacity="0.08" />
      <rect x="128" y="6" width="4" height="2" fill="#f6efcf" />
      <rect x="126" y="8" width="8" height="4" fill="#f6efcf" />
      <rect x="128" y="12" width="4" height="2" fill="#f6efcf" />
      <rect x="130" y="8" width="2" height="2" fill="#d9cfa0" />
      <rect x="127" y="11" width="2" height="1" fill="#d9cfa0" />

      {/* drifting clouds */}
      <g className="pi-cloud" opacity="0.55">
        <rect x="30" y="30" width="14" height="2" fill="#2c4584" />
        <rect x="34" y="28" width="8" height="2" fill="#2c4584" />
        <rect x="26" y="32" width="20" height="1" fill="#223a74" />
      </g>
      <g className="pi-cloud" style={{ animationDelay: '-4s' }} opacity="0.5">
        <rect x="100" y="36" width="16" height="2" fill="#2c4584" />
        <rect x="104" y="34" width="8" height="2" fill="#2c4584" />
      </g>

      {/* distant silhouettes at the horizon */}
      <rect x="0" y="48" width="30" height="6" fill="#121d46" />
      <rect x="6" y="45" width="18" height="3" fill="#121d46" />
      <rect x="12" y="43" width="6" height="2" fill="#121d46" />
      <rect x="128" y="49" width="32" height="5" fill="#121d46" />
      <rect x="136" y="46" width="16" height="3" fill="#121d46" />
      <rect x="74" y="51" width="16" height="3" fill="#16244f" />
      <rect x="78" y="49" width="8" height="2" fill="#16244f" />

      {/* ── water ── */}
      <rect x="0" y="54" width="160" height="36" fill="#0f3260" />
      <rect x="0" y="54" width="160" height="3" fill="#2a6fb8" />
      <rect x="0" y="57" width="160" height="9" fill="#174a85" />
      <rect x="0" y="66" width="160" height="12" fill="#113a6b" />
      <rect x="0" y="78" width="160" height="12" fill="#0c2c55" />
      {/* moon reflection */}
      <g opacity="0.4" fill="#f6efcf">
        <rect x="128" y="58" width="6" height="1" />
        <rect x="126" y="61" width="10" height="1" />
        <rect x="129" y="64" width="5" height="1" />
        <rect x="127" y="68" width="8" height="1" />
        <rect x="130" y="72" width="4" height="1" />
      </g>
      {/* wave glints */}
      <g fill="#38b6ff">
        <rect className="pi-wave" x="10" y="64" width="12" height="2" />
        <rect className="pi-wave" style={{ animationDelay: '-1s' }} x="70" y="66" width="14" height="2" />
        <rect className="pi-wave" style={{ animationDelay: '-2s' }} x="52" y="82" width="8" height="2" />
        <rect className="pi-wave" style={{ animationDelay: '-0.5s' }} x="132" y="68" width="14" height="2" />
      </g>
      <g fill="#2a97e0">
        <rect className="pi-wave" style={{ animationDelay: '-1.5s' }} x="40" y="74" width="10" height="2" />
        <rect className="pi-wave" style={{ animationDelay: '-2.5s' }} x="100" y="78" width="12" height="2" />
        <rect className="pi-wave" style={{ animationDelay: '-0.8s' }} x="20" y="84" width="10" height="1" />
        <rect className="pi-wave" style={{ animationDelay: '-1.8s' }} x="118" y="85" width="12" height="1" />
      </g>
      {/* island reflections */}
      <rect x="12" y="84" width="38" height="2" fill="#071a38" opacity="0.5" />
      <rect x="110" y="84" width="38" height="2" fill="#071a38" opacity="0.5" />

      {/* ── left island ── */}
      <rect x="8" y="46" width="46" height="6" fill="#3fae6a" />
      <rect x="8" y="46" width="46" height="2" fill="#6fd68f" />
      <rect x="8" y="50" width="46" height="2" fill="#2d7c4b" />
      <rect x="8" y="52" width="46" height="18" fill="#6b4a2f" />
      <rect x="14" y="56" width="4" height="2" fill="#7d5a3b" />
      <rect x="30" y="60" width="6" height="2" fill="#563a24" />
      <rect x="42" y="55" width="4" height="2" fill="#7d5a3b" />
      <rect x="20" y="64" width="4" height="2" fill="#563a24" />
      <rect x="8" y="70" width="46" height="8" fill="#4d3521" />
      <rect x="12" y="78" width="38" height="3" fill="#3a281a" />
      <rect x="18" y="81" width="26" height="2" fill="#2c1e13" />
      {/* flowers */}
      <rect x="28" y="44" width="2" height="2" fill="#ff7ab6" />
      <rect x="38" y="45" width="2" height="1" fill="#ffe27a" />
      <rect x="12" y="45" width="2" height="1" fill="#ff7ab6" />
      {/* tree */}
      <rect x="17" y="34" width="4" height="12" fill="#5a3b24" />
      <rect x="19" y="36" width="2" height="10" fill="#47301d" />
      <rect x="11" y="28" width="16" height="8" fill="#2d8a55" />
      <rect x="13" y="24" width="12" height="6" fill="#3fae6a" />
      <rect x="15" y="21" width="8" height="4" fill="#54c983" />
      <rect x="15" y="26" width="3" height="2" fill="#7ee6a3" />
      {/* cyan flag */}
      <rect x="34" y="34" width="1" height="12" fill="#8fb7ff" />
      <g className="pi-flag">
        <rect x="35" y="34" width="7" height="4" fill="#2a97e0" />
        <rect x="35" y="34" width="7" height="1" fill="#7fe7ff" />
      </g>
      {/* lantern */}
      <rect x="49" y="36" width="2" height="10" fill="#5a3b24" />
      <rect className="pi-glow" x="46" y="31" width="8" height="8" fill="#ffd27a" opacity="0.22" />
      <rect x="48" y="34" width="4" height="3" fill="#ffd27a" />

      {/* ── right island ── */}
      <rect x="106" y="46" width="46" height="6" fill="#3fae6a" />
      <rect x="106" y="46" width="46" height="2" fill="#6fd68f" />
      <rect x="106" y="50" width="46" height="2" fill="#2d7c4b" />
      <rect x="106" y="52" width="46" height="18" fill="#6b4a2f" />
      <rect x="112" y="58" width="6" height="2" fill="#563a24" />
      <rect x="126" y="55" width="4" height="2" fill="#7d5a3b" />
      <rect x="140" y="62" width="4" height="2" fill="#563a24" />
      <rect x="132" y="66" width="6" height="2" fill="#7d5a3b" />
      <rect x="106" y="70" width="46" height="8" fill="#4d3521" />
      <rect x="110" y="78" width="38" height="3" fill="#3a281a" />
      <rect x="116" y="81" width="26" height="2" fill="#2c1e13" />
      {/* flowers */}
      <rect x="130" y="44" width="2" height="2" fill="#ffe27a" />
      <rect x="120" y="45" width="2" height="1" fill="#ff7ab6" />
      <rect x="146" y="45" width="2" height="1" fill="#ffe27a" />
      {/* tree */}
      <rect x="137" y="34" width="4" height="12" fill="#5a3b24" />
      <rect x="139" y="36" width="2" height="10" fill="#47301d" />
      <rect x="133" y="28" width="16" height="8" fill="#2d8a55" />
      <rect x="135" y="24" width="12" height="6" fill="#3fae6a" />
      <rect x="137" y="21" width="8" height="4" fill="#54c983" />
      <rect x="137" y="26" width="3" height="2" fill="#7ee6a3" />
      {/* amber flag */}
      <rect x="125" y="34" width="1" height="12" fill="#ffc285" />
      <g className="pi-flag" style={{ animationDelay: '-0.5s' }}>
        <rect x="118" y="34" width="7" height="4" fill="#e07b3c" />
        <rect x="118" y="34" width="7" height="1" fill="#ffb35c" />
      </g>
      {/* lantern */}
      <rect x="109" y="36" width="2" height="10" fill="#5a3b24" />
      <rect className="pi-glow" style={{ animationDelay: '-0.8s' }} x="106" y="31" width="8" height="8" fill="#ffd27a" opacity="0.22" />
      <rect x="108" y="34" width="4" height="3" fill="#ffd27a" />

      {/* ── bridge ── */}
      {/* end posts */}
      <rect x="53" y="38" width="3" height="14" fill="#8a5a28" />
      <rect x="53" y="38" width="3" height="2" fill="#c48946" />
      <rect x="104" y="38" width="3" height="14" fill="#8a5a28" />
      <rect x="104" y="38" width="3" height="2" fill="#c48946" />
      {/* sagging top rope */}
      <rect x="56" y="40" width="10" height="1" fill="#e0a35c" />
      <rect x="66" y="41" width="28" height="1" fill="#e0a35c" />
      <rect x="94" y="40" width="10" height="1" fill="#e0a35c" />
      {/* hangers */}
      {HANGERS.map((x) => (
        <rect key={x} x={x} y={x > 64 && x < 96 ? 42 : 41} width="1" height={x > 64 && x < 96 ? 6 : 7} fill="#b87c3c" />
      ))}
      {/* deck planks */}
      {PLANKS.map((i) => (
        <g key={i}>
          <rect x={54 + i * 4} y="48" width="4" height="4" fill={i % 2 ? '#c98d48' : '#e0a35c'} />
          <rect x={54 + i * 4} y="48" width="4" height="1" fill="#f6c98a" />
          <rect x={54 + i * 4} y="48" width="1" height="4" fill="#a86a30" />
        </g>
      ))}
      {/* underside beam + supports */}
      <rect x="54" y="52" width="52" height="2" fill="#8a5a28" />
      <rect x="54" y="52" width="2" height="6" fill="#8a5a28" />
      <rect x="104" y="52" width="2" height="6" fill="#8a5a28" />
      <rect x="78" y="52" width="2" height="3" fill="#6e4520" />
      <rect x="80" y="52" width="2" height="3" fill="#6e4520" />

      {/* ── players facing each other mid-bridge ── */}
      <g className="pi-bob">
        {/* cyan player (left) */}
        <rect x="65" y="35" width="6" height="2" fill="#1b284f" />
        <rect x="66" y="37" width="4" height="3" fill="#ffdbac" />
        <rect x="69" y="38" width="1" height="1" fill="#000" />
        <rect x="66" y="40" width="4" height="3" fill="#2a97e0" />
        <rect x="66" y="40" width="4" height="1" fill="#7fe7ff" />
        <rect x="66" y="43" width="4" height="2" fill="#2a97e0" />
        <rect x="66" y="45" width="2" height="3" fill="#0e1733" />
        <rect x="68" y="45" width="2" height="3" fill="#0e1733" />
      </g>
      <g className="pi-bob" style={{ animationDelay: '-0.7s' }}>
        {/* amber player (right) */}
        <rect x="89" y="35" width="6" height="2" fill="#4a2c11" />
        <rect x="90" y="37" width="4" height="3" fill="#ffdbac" />
        <rect x="90" y="38" width="1" height="1" fill="#000" />
        <rect x="90" y="40" width="4" height="3" fill="#e07b3c" />
        <rect x="90" y="40" width="4" height="1" fill="#ffb35c" />
        <rect x="90" y="43" width="4" height="2" fill="#e07b3c" />
        <rect x="90" y="45" width="2" height="3" fill="#2c170b" />
        <rect x="92" y="45" width="2" height="3" fill="#2c170b" />
      </g>

      {/* speech bubbles */}
      <g>
        <rect x="59" y="26" width="12" height="7" fill="#e8f0ff" />
        <rect x="58" y="27" width="14" height="5" fill="#e8f0ff" />
        <rect x="68" y="33" width="2" height="2" fill="#e8f0ff" />
        <rect className="pi-dot" x="61" y="29" width="2" height="2" fill="#2a97e0" />
        <rect className="pi-dot" style={{ animationDelay: '0.4s' }} x="64" y="29" width="2" height="2" fill="#2a97e0" />
        <rect className="pi-dot" style={{ animationDelay: '0.8s' }} x="67" y="29" width="2" height="2" fill="#2a97e0" />
      </g>
      <g>
        <rect x="89" y="26" width="12" height="7" fill="#fff1dc" />
        <rect x="88" y="27" width="14" height="5" fill="#fff1dc" />
        <rect x="90" y="33" width="2" height="2" fill="#fff1dc" />
        <rect className="pi-dot" style={{ animationDelay: '0.6s' }} x="91" y="29" width="2" height="2" fill="#e07b3c" />
        <rect className="pi-dot" style={{ animationDelay: '1s' }} x="94" y="29" width="2" height="2" fill="#e07b3c" />
        <rect className="pi-dot" style={{ animationDelay: '0.2s' }} x="97" y="29" width="2" height="2" fill="#e07b3c" />
      </g>

      {/* common-ground heart */}
      <g className="pi-heart">
        <rect x="77" y="30" width="2" height="2" fill="#ff6b8b" />
        <rect x="81" y="30" width="2" height="2" fill="#ff6b8b" />
        <rect x="76" y="32" width="8" height="3" fill="#ff6b8b" />
        <rect x="77" y="35" width="6" height="1" fill="#ff6b8b" />
        <rect x="78" y="36" width="4" height="1" fill="#ff6b8b" />
        <rect x="79" y="37" width="2" height="1" fill="#ff6b8b" />
        <rect x="77" y="31" width="1" height="1" fill="#ffd0dc" />
      </g>
    </svg>
  )
}