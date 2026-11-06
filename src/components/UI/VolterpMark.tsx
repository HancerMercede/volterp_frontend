const BRAND_DARK = "#0B1A33";
const BRAND_YELLOW = "#FBBF24";

export function VolterpMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="256" height="256" rx="56" fill={BRAND_DARK} />
      <path
        fill={BRAND_YELLOW}
        d="M160 20 L76 140 L120 140 L94 237 L184 108 L136 108 Z"
      />
    </svg>
  );
}
