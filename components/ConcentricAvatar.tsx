import React from 'react';

interface ConcentricAvatarProps {
  outer: string;
  middle: string;
  core?: string;
  size?: number;
  className?: string;
}

export function ConcentricAvatar({
  outer,
  middle,
  core = '#8B6450',
  size = 28,
  className = '',
}: ConcentricAvatarProps) {
  const center = size / 2;
  const rOuter = size / 2;
  const rMiddle = (size / 28) * 9;
  const rCore = (size / 28) * 3;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <circle cx={center} cy={center} r={rOuter} fill={outer} />
      <circle cx={center} cy={center} r={rMiddle} fill={middle} />
      <circle cx={center} cy={center} r={rCore} fill={core} />
    </svg>
  );
}
