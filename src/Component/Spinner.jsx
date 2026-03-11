// ============================================================
// FILE: src/Component/Common/Spinner.jsx
//
// USAGE:
//   import Spinner from "@/Component/Spinner";
//
//   <Spinner />                          → default: medium, white
//   <Spinner size="sm" />               → small  (16px)
//   <Spinner size="md" />               → medium (20px) ← default
//   <Spinner size="lg" />               → large  (32px)
//   <Spinner color="teal" />            → brand teal (#025E68)
//   <Spinner color="white" />           → white  (default)
//   <Spinner color="gray" />            → gray
//   <Spinner size="lg" color="teal" />  → combine freely
// ============================================================

const SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 32,
};

const COLOR_MAP = {
  white: "#ffffff",
  teal:  "#025E68",
  gray:  "#9ca3af",
};

export default function Spinner({ size = "md", color = "white", className = "" }) {
  const px  = SIZE_MAP[size]  ?? SIZE_MAP.md;
  const hex = COLOR_MAP[color] ?? COLOR_MAP.white;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Loading"
      aria-live="polite"
      role="status"
      className={`animate-spin ${className}`}
      style={{ flexShrink: 0 }}
    >
      {/* Track ring — faint */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={hex}
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.2"
      />
      {/* Spinning arc — solid */}
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={hex}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}