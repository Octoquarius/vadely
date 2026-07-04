// Vadely marka işareti: çam çek/V + olgun altın sikke (rim + ışıltı detaylı).
// Çek "currentColor" kullanır; kelime markasının rengini çağıran belirler.
// Sikke sabit altın tonlarıyla her zemin üstünde çalışır.

export function VadelyMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M12 32 L26 46 L42 22"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="47" cy="19" r="11.5" fill="#E3A93A" />
      <circle
        cx="47"
        cy="19"
        r="11.5"
        fill="none"
        stroke="#8A6109"
        strokeWidth="1.3"
        opacity="0.4"
      />
      <circle
        cx="47"
        cy="19"
        r="8"
        fill="none"
        stroke="#8A6109"
        strokeWidth="1.1"
        opacity="0.35"
      />
      <ellipse
        cx="42.6"
        cy="14.6"
        rx="2.5"
        ry="1.4"
        fill="#F6DBA0"
        opacity="0.85"
        transform="rotate(-38 42.6 14.6)"
      />
    </svg>
  );
}

export function VadelyLogo({
  markSize = 26,
  className,
}: {
  markSize?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <VadelyMark size={markSize} />
      <span className="font-display text-[22px] font-semibold tracking-tight">
        vadely<span className="text-altin">.</span>
      </span>
    </span>
  );
}
