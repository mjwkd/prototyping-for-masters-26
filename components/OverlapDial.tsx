'use client';

import React from 'react';

export interface OverlapRange {
  start: number; // in hours (0-24)
  end: number;   // in hours (0-24)
}

interface OverlapDialProps {
  myHour: number;        // 0 - 23.99
  myMinute: number;      // 0 - 59
  offset: number;        // their UTC offset - my UTC offset
  overlapRanges: OverlapRange[];
  isDefaultStatic?: boolean;
  className?: string;
  size?: number;
}

export function OverlapDial({
  myHour,
  myMinute,
  offset,
  overlapRanges,
  isDefaultStatic = false,
  className = '',
  size,
}: OverlapDialProps) {
  const cx = 180;
  const cy = 180;
  const outerRadius = 172;
  const innerRadius = 132;
  const fanRadius = 166;
  const outerNumRadius = 146;
  const innerNumRadius = 118;

  // Polar coordinates: angle measured clockwise from 12 o'clock
  const polarToCartesian = (r: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.sin(rad),
      y: cy - r * Math.cos(rad),
    };
  };

  const hourToAngle = (h: number) => (h / 24) * 360;

  const isHourInFan = (h: number) => {
    const normH = ((h % 24) + 24) % 24;
    return overlapRanges.some((range) => {
      if (range.start <= range.end) {
        return normH >= range.start && normH <= range.end;
      } else {
        return normH >= range.start || normH <= range.end;
      }
    });
  };

  // If using default mockup reference (Mom at 21:10):
  if (isDefaultStatic) {
    return (
      <svg
        viewBox="0 0 360 360"
        role="img"
        aria-label="Overlap dial. The gray outer ring holds your hours in New York; the white inner disc holds Mom's hours in Seoul. The pink fan marks when you are both awake: 5 PM to midnight and 8 to 9 AM your time. The pink hand points at 21 for you and 11 for Mom, inside the fan."
        style={{
          display: 'block',
          width: size ? `${size}px` : undefined,
          height: size ? `${size}px` : undefined,
          maxWidth: size ? '100%' : '350px',
        }}
        className={`aspect-square ${className}`}
      >
        <circle cx="180" cy="180" r="172" fill="#F2F2F2" stroke="#F2F2F2" strokeWidth="2" />
        <circle cx="180" cy="180" r="132" fill="#FFFFFF" stroke="#F2F2F2" strokeWidth="2" />
        {/* Overlap Fan: 17-24 and 8-9 */}
        <path
          d="M180 180 L19.7 223.0 A166 166 0 0 1 180.0 14.0 Z M180 180 L323.8 263.0 A166 166 0 0 1 297.4 297.4 Z"
          fill="#FFD9F0"
        />
        {/* Slats / Dividers */}
        <path
          d="M180 180 L19.7 223.0 M180 180 L14.0 180.0 M180 180 L19.7 137.0 M180 180 L36.2 97.0 M180 180 L62.6 62.6 M180 180 L97.0 36.2 M180 180 L137.0 19.7 M180 180 L180.0 14.0 M180 180 L323.8 263.0 M180 180 L297.4 297.4"
          stroke="#FFB0DE"
          strokeWidth="1"
        />
        {/* Outer Hours (0 - 23) */}
        <g
          fontFamily="IBM Plex Mono, monospace"
          fontSize="15"
          fontWeight="600"
          textAnchor="middle"
          dominantBaseline="central"
        >
          <text x="199" y="35" fill="#D12A8C">0</text>
          <text x="236" y="45" fill="#D12A8C">1</text>
          <text x="269" y="64" fill="#D12A8C">2</text>
          <text x="296" y="91" fill="#D12A8C">3</text>
          <text x="315" y="124" fill="#D12A8C">4</text>
          <text x="325" y="161" fill="#D12A8C">5</text>
          <text x="325" y="199" fill="#D12A8C">6</text>
          <text x="315" y="236" fill="#D12A8C">7</text>
          <text x="296" y="269" fill="#3A3A3A">8</text>
          <text x="269" y="296" fill="#D12A8C">9</text>
          <text x="236" y="315" fill="#D12A8C">10</text>
          <text x="199" y="325" fill="#D12A8C">11</text>
          <text x="161" y="325" fill="#D12A8C">12</text>
          <text x="124" y="315" fill="#D12A8C">13</text>
          <text x="91" y="296" fill="#D12A8C">14</text>
          <text x="64" y="269" fill="#D12A8C">15</text>
          <text x="45" y="236" fill="#D12A8C">16</text>
          <text x="35" y="199" fill="#3A3A3A">17</text>
          <text x="35" y="161" fill="#3A3A3A">18</text>
          <text x="45" y="124" fill="#3A3A3A">19</text>
          <text x="64" y="91" fill="#3A3A3A">20</text>
          <text x="91" y="64" fill="#3A3A3A">21</text>
          <text x="124" y="45" fill="#3A3A3A">22</text>
          <text x="161" y="35" fill="#3A3A3A">23</text>
        </g>
        {/* Inner Hours (Mom) */}
        <g
          fontFamily="IBM Plex Mono, monospace"
          fontSize="10.5"
          fontWeight="600"
          textAnchor="middle"
          dominantBaseline="central"
        >
          <text x="195" y="63" fill="#3A3A3A">14</text>
          <text x="225" y="71" fill="#3A3A3A">15</text>
          <text x="252" y="86" fill="#3A3A3A">16</text>
          <text x="274" y="108" fill="#3A3A3A">17</text>
          <text x="289" y="135" fill="#3A3A3A">18</text>
          <text x="297" y="165" fill="#3A3A3A">19</text>
          <text x="297" y="195" fill="#3A3A3A">20</text>
          <text x="289" y="225" fill="#3A3A3A">21</text>
          <text x="274" y="252" fill="#C81E83">22</text>
          <text x="252" y="274" fill="#3A3A3A">23</text>
          <text x="225" y="289" fill="#3A3A3A">0</text>
          <text x="195" y="297" fill="#3A3A3A">1</text>
          <text x="165" y="297" fill="#3A3A3A">2</text>
          <text x="135" y="289" fill="#3A3A3A">3</text>
          <text x="108" y="274" fill="#3A3A3A">4</text>
          <text x="86" y="252" fill="#3A3A3A">5</text>
          <text x="71" y="225" fill="#3A3A3A">6</text>
          <text x="63" y="195" fill="#C81E83">7</text>
          <text x="63" y="165" fill="#C81E83">8</text>
          <text x="71" y="135" fill="#C81E83">9</text>
          <text x="86" y="108" fill="#C81E83">10</text>
          <text x="108" y="86" fill="#C81E83">11</text>
          <text x="135" y="71" fill="#C81E83">12</text>
          <text x="165" y="63" fill="#C81E83">13</text>
        </g>
        {/* Hands & Pivots */}
        <path d="M180.0 180.0 L259.7 134.0" stroke="#FF5FBF" strokeWidth="9" strokeLinecap="round" />
        <path d="M192.2 193.3 L90.8 82.7" stroke="#FF5FBF" strokeWidth="9" strokeLinecap="round" />
        <circle cx="90.8" cy="82.7" r="15" fill="#FF5FBF" />
        <circle cx="180" cy="180" r="14" fill="#FF5FBF" />
        <circle cx="180" cy="180" r="5" fill="#FFFFFF" />
      </svg>
    );
  }

  // Dynamic Dial Rendering:
  const fanPaths = overlapRanges.map((range) => {
    const startAngle = hourToAngle(range.start);
    const endAngle = hourToAngle(range.end);
    let sweepAngle = endAngle - startAngle;
    if (sweepAngle < 0) sweepAngle += 360;

    const startPt = polarToCartesian(fanRadius, startAngle);
    const endPt = polarToCartesian(fanRadius, endAngle);
    const largeArcFlag = sweepAngle > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${startPt.x.toFixed(1)} ${startPt.y.toFixed(1)} A ${fanRadius} ${fanRadius} 0 ${largeArcFlag} 1 ${endPt.x.toFixed(1)} ${endPt.y.toFixed(1)} Z`;
  });

  const dividerLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  overlapRanges.forEach((range) => {
    const hours: number[] = [];
    if (range.start <= range.end) {
      for (let h = Math.floor(range.start); h <= Math.ceil(range.end); h++) {
        hours.push(h);
      }
    } else {
      for (let h = Math.floor(range.start); h <= 24; h++) hours.push(h);
      for (let h = 0; h <= Math.ceil(range.end); h++) hours.push(h);
    }

    const uniqueAngles = Array.from(new Set([
      hourToAngle(range.start),
      ...hours.map((h) => hourToAngle(h % 24)),
      hourToAngle(range.end),
    ]));

    uniqueAngles.forEach((angle) => {
      const pt = polarToCartesian(fanRadius, angle);
      dividerLines.push({
        x1: cx,
        y1: cy,
        x2: parseFloat(pt.x.toFixed(1)),
        y2: parseFloat(pt.y.toFixed(1)),
      });
    });
  });

  const totalHour = myHour + myMinute / 60;
  const hourAngle = hourToAngle(totalHour);
  const hourTip = polarToCartesian(innerRadius, hourAngle);
  const hourTail = polarToCartesian(18, hourAngle + 180);

  const minAngle = (myMinute / 60) * 360;
  const minTip = polarToCartesian(92, minAngle);

  return (
    <svg
      viewBox="0 0 360 360"
      role="img"
      aria-label="Overlap dial"
      style={{
        display: 'block',
        width: size ? `${size}px` : undefined,
        height: size ? `${size}px` : undefined,
        maxWidth: size ? '100%' : '350px',
      }}
      className={`aspect-square ${className}`}
    >
      <circle cx={cx} cy={cy} r={outerRadius} fill="#F2F2F2" stroke="#F2F2F2" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={innerRadius} fill="#FFFFFF" stroke="#F2F2F2" strokeWidth="2" />

      {fanPaths.map((d, i) => (
        <path key={`fan-${i}`} d={d} fill="#FFD9F0" />
      ))}

      {dividerLines.map((line, i) => (
        <line
          key={`div-${i}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#FFB0DE"
          strokeWidth="1"
        />
      ))}

      <g
        fontFamily="IBM Plex Mono, monospace"
        fontSize="15"
        fontWeight="600"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {Array.from({ length: 24 }).map((_, h) => {
          const angle = hourToAngle(h + 0.5);
          const pt = polarToCartesian(outerNumRadius, angle);
          const inFan = isHourInFan(h + 0.5);
          const color = inFan ? '#3A3A3A' : '#D12A8C';

          return (
            <text key={`outer-${h}`} x={pt.x.toFixed(1)} y={pt.y.toFixed(1)} fill={color}>
              {h}
            </text>
          );
        })}
      </g>

      <g
        fontFamily="IBM Plex Mono, monospace"
        fontSize="10.5"
        fontWeight="600"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {Array.from({ length: 24 }).map((_, h) => {
          const angle = hourToAngle(h + 0.5);
          const pt = polarToCartesian(innerNumRadius, angle);
          const theirH = ((h + offset) % 24 + 24) % 24;
          const inFan = isHourInFan(h + 0.5);
          const color = inFan ? '#C81E83' : '#3A3A3A';

          return (
            <text key={`inner-${h}`} x={pt.x.toFixed(1)} y={pt.y.toFixed(1)} fill={color}>
              {theirH}
            </text>
          );
        })}
      </g>

      {/* Minute hand */}
      <line
        x1={cx}
        y1={cy}
        x2={minTip.x.toFixed(1)}
        y2={minTip.y.toFixed(1)}
        stroke="#FF5FBF"
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* Hour hand */}
      <line
        x1={hourTail.x.toFixed(1)}
        y1={hourTail.y.toFixed(1)}
        x2={hourTip.x.toFixed(1)}
        y2={hourTip.y.toFixed(1)}
        stroke="#FF5FBF"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <circle cx={hourTip.x.toFixed(1)} cy={hourTip.y.toFixed(1)} r="15" fill="#FF5FBF" />

      {/* Center hub */}
      <circle cx={cx} cy={cy} r="14" fill="#FF5FBF" />
      <circle cx={cx} cy={cy} r="5" fill="#FFFFFF" />
    </svg>
  );
}
