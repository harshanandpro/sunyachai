export default function PixelIslands() {
  return (
    <svg
      className="scene"
      viewBox="0 0 160 90"
      role="img"
      aria-label="Two pixel islands joined by a bridge over water"
      shapeRendering="crispEdges"
    >
      {/* sky */}
      <rect x="0" y="0" width="160" height="54" fill="#0e1733" />
      {/* stars */}
      <rect x="20" y="10" width="2" height="2" fill="#8fb7ff" />
      <rect x="78" y="6" width="2" height="2" fill="#8fb7ff" />
      <rect x="132" y="14" width="2" height="2" fill="#8fb7ff" />
      <rect x="104" y="4" width="2" height="2" fill="#c9d9ff" />
      {/* water */}
      <rect x="0" y="54" width="160" height="36" fill="#113a6b" />
      <rect x="0" y="54" width="160" height="3" fill="#1d5da0" />
      {/* wave glints */}
      <rect x="10" y="64" width="12" height="2" fill="#38b6ff" />
      <rect x="40" y="74" width="10" height="2" fill="#2a97e0" />
      <rect x="70" y="66" width="14" height="2" fill="#38b6ff" />
      <rect x="100" y="78" width="12" height="2" fill="#2a97e0" />
      <rect x="132" y="64" width="14" height="2" fill="#38b6ff" />
      <rect x="52" y="82" width="8" height="2" fill="#38b6ff" />

      {/* left island */}
      <rect x="8" y="46" width="46" height="6" fill="#3fae6a" />
      <rect x="8" y="52" width="46" height="18" fill="#6b4a2f" />
      <rect x="8" y="70" width="46" height="8" fill="#4d3521" />
      {/* left island tree */}
      <rect x="17" y="34" width="4" height="12" fill="#5a3b24" />
      <rect x="13" y="26" width="12" height="8" fill="#3fae6a" />
      <rect x="15" y="22" width="8" height="4" fill="#54c983" />

      {/* right island */}
      <rect x="106" y="46" width="46" height="6" fill="#3fae6a" />
      <rect x="106" y="52" width="46" height="18" fill="#6b4a2f" />
      <rect x="106" y="70" width="46" height="8" fill="#4d3521" />
      {/* right island tree */}
      <rect x="137" y="34" width="4" height="12" fill="#5a3b24" />
      <rect x="133" y="26" width="12" height="8" fill="#3fae6a" />
      <rect x="135" y="22" width="8" height="4" fill="#54c983" />

      {/* bridge: ropes */}
      <rect x="54" y="40" width="52" height="2" fill="#e0a35c" />
      <rect x="54" y="40" width="2" height="8" fill="#b87c3c" />
      <rect x="104" y="40" width="2" height="8" fill="#b87c3c" />
      {/* bridge: planks */}
      <rect x="54" y="48" width="52" height="4" fill="#e0a35c" />
      <rect x="58" y="48" width="2" height="4" fill="#a86a30" />
      <rect x="66" y="48" width="2" height="4" fill="#a86a30" />
      <rect x="74" y="48" width="2" height="4" fill="#a86a30" />
      <rect x="82" y="48" width="2" height="4" fill="#a86a30" />
      <rect x="90" y="48" width="2" height="4" fill="#a86a30" />
      <rect x="98" y="48" width="2" height="4" fill="#a86a30" />
      {/* bridge supports */}
      <rect x="54" y="52" width="2" height="6" fill="#8a5a28" />
      <rect x="104" y="52" width="2" height="6" fill="#8a5a28" />
      {/* players facing each other mid-bridge */}
      <rect x="66" y="40" width="4" height="4" fill="#4fe0ff" />
      <rect x="66" y="44" width="4" height="4" fill="#2a97e0" />
      <rect x="90" y="40" width="4" height="4" fill="#ffb35c" />
      <rect x="90" y="44" width="4" height="4" fill="#e07b3c" />
    </svg>
  )
}