type IconProps = {
  size?: number;
};

export function IconHome({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={(size * 16) / 18} viewBox="0 0 18 16" aria-hidden>
      <polygon points="9,0 18,7 0,7" fill="currentColor" />
      <rect x="3" y="7" width="12" height="9" fill="currentColor" />
    </svg>
  );
}

export function IconHeart({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={(size * 15) / 16} viewBox="0 0 16 15" aria-hidden>
      <path
        d="M8 14.5C4.5 11.5 0 8.5 0 4.6 0 2.1 2 .2 4.3.2 5.8.2 7.2 1 8 2.2 8.8 1 10.2.2 11.7.2 14 .2 16 2.1 16 4.6c0 3.9-4.5 6.9-8 9.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconClock({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="6.7" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <line x1="8" y1="4" x2="8" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconCoin({ size = 16, ringColor = "#FFFFFF" }: IconProps & { ringColor?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <circle cx="8" cy="8" r="4.2" fill="none" stroke={ringColor} strokeWidth="1.5" />
    </svg>
  );
}

export function IconPhoto({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={(size * 14) / 18} viewBox="0 0 18 14" aria-hidden>
      <rect x="1" y="1" width="16" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="5.5" cy="5" r="1.8" fill="currentColor" />
      <path d="M16 13L9.5 5.5 4 13Z" fill="currentColor" />
    </svg>
  );
}

export function IconPaw({ size = 18, color = "currentColor" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={(size * 18) / 20} viewBox="0 0 20 18" aria-hidden>
      <ellipse cx="2.5" cy="3.4" rx="2.5" ry="3.2" fill={color} />
      <ellipse cx="10" cy="2.9" rx="2.5" ry="3.2" fill={color} />
      <ellipse cx="17.5" cy="3.4" rx="2.5" ry="3.2" fill={color} />
      <ellipse cx="10" cy="12.4" rx="7" ry="5.4" fill={color} />
    </svg>
  );
}

export function IconChevronLeft({ size = 10 }: IconProps) {
  return (
    <svg width={size} height={(size * 14) / 10} viewBox="0 0 10 14" aria-hidden>
      <path d="M8.5 1.5 2.5 7l6 5.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconShare({ size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" aria-hidden>
      <path d="M6.5 0.5 10 4.5H7.8V8H5.2V4.5H3L6.5 0.5Z" fill="currentColor" />
      <path d="M1.5 8.5V11.5H11.5V8.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconPencil({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden>
      <path d="M9.6 1.6 12.4 4.4 5.7 11.2 2.8 8.3Z" fill="currentColor" />
      <path d="M1.2 12.8 2.2 9.0 5.0 11.8Z" fill="currentColor" />
    </svg>
  );
}

export function IconPlus({ size = 12 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden>
      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconSliders({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <line x1="3" y1="7" x2="21" y2="7" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="17" x2="21" y2="17" />
      </g>
      <g fill="currentColor">
        <circle cx="8" cy="7" r="2.8" />
        <circle cx="16" cy="12" r="2.8" />
        <circle cx="11" cy="17" r="2.8" />
      </g>
    </svg>
  );
}

export function IconWifiOff({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
        <path d="M1.6 5.4A9 9 0 0 1 5 3.5" />
        <path d="M14.4 5.4a9 9 0 0 0-3.3-1.9" />
        <path d="M4 7.9a5.4 5.4 0 0 1 2-1.2" />
        <path d="M12 7.9a5.4 5.4 0 0 0-2.3-1.3" />
        <path d="M6.4 10.4a2.3 2.3 0 0 1 3.2 0" />
        <line x1="2.5" y1="13.5" x2="13.5" y2="2.5" />
      </g>
      <circle cx="8" cy="13" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function IconBell({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <path
        d="M8 1.5a1 1 0 0 1 1 1v.4a3.8 3.8 0 0 1 2.7 3.6v2.3l1.1 1.7H3.2l1.1-1.7V6.5A3.8 3.8 0 0 1 7 2.9v-.4a1 1 0 0 1 1-1Z"
        fill="currentColor"
      />
      <path d="M6.4 12.4a1.6 1.6 0 0 0 3.2 0Z" fill="currentColor" />
    </svg>
  );
}
