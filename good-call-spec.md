# Good Call — design spec for building

Find the hours your day overlaps with someone far away. Call now, book a call, or leave a message.

## Screens
1. **Add someone** — name, city search (city → time zone), awake hours (default 8 AM–11 PM).
2. **Overlap (home)** — person chips at top, overlap dial, both local times, buttons.
3. **Book a call** — day picker, list of overlap time slots (both time zones), "Send request".
4. **Leave a message** — shown when there's no overlap now; message is delivered when they wake up.

## Button rules
| Situation | Buttons |
|---|---|
| Both awake now | **Call now** (primary) + **Book a call** (secondary) |
| Overlap later today | **Book a call** |
| No overlap now | **Leave a message** (primary) + **Book a call for tomorrow** |

## The overlap dial (see good-call-dial.svg)
One 24-hour dial, midnight at the top, clockwise.
- **Outer ring** (light gray `#F2F2F2`, radius 172 of 360) = MY hours. Numbers 0–23, pink `#D12A8C`, IBM Plex Mono 15/600.
- **Inner disc** (white, radius 132) = THEIR hours, same positions shifted by the time difference. Numbers 10.5/600, `#3A3A3A`.
- Each number sits in the middle of its hour block (angle of h + 0.5).
- **Overlap fan**: wedge from center to radius 166 covering the hours both people are awake, fill `#FFD9F0`, thin dividers every hour `#FFB0DE`. Numbers inside the fan turn dark (`#3A3A3A` outer, `#C81E83` inner).
- **Hands**: pink `#FF5FBF`, 9px, round caps. Hour hand to radius 132 with a 15px round tip; minute hand to radius 92. Center: pink circle r14 with white dot r5.
- If the hour hand is inside the fan → overlap now.

### Math
- angle(h) = h / 24 × 360°, measured clockwise from 12 o'clock.
- point(r, h) = (cx + r·sin(angle), cy − r·cos(angle)).
- Their hour at my position h = (h + offset) mod 24, offset = their UTC offset − my UTC offset (use a time zone library so daylight saving is handled).
- Overlap = intersection of my awake window and their awake window, both converted to my time. It can wrap past midnight and can be two separate ranges.

## Visual style
- Background white `#FFFFFF`, surfaces `#F2F2F0`, text `#1A1A1A`, muted `#6B6B6B`.
- One accent: pink. Primary buttons black with white text, 56px tall, fully rounded. Secondary: 1.5px black outline.
- Font: IBM Plex Mono everywhere.
- Each person has a small concentric-circle avatar (outer color + inner color + small center dot).
- Phone layout 390×844, 20px side padding.
