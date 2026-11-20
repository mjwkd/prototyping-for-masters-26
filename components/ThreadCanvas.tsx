'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Thread, ThreadWord, LooseEnd } from '../types/thread';
import { ThemeConfig } from '../lib/themeConfig';
import { calculateWanderingSentenceLayout, ProjectedWordNode } from '../lib/wanderingComposition';
import { generateOrganicThreadGap, ThreadGapGeometry } from '../lib/threadGeometry';
import { generateWordMonoline, WordGlyphPath } from '../lib/monolineFont';
import { hashString } from '../lib/noise';
import { Scissors } from 'lucide-react';

interface ThreadCanvasProps {
  thread: Thread | null;
  words: ThreadWord[];
  looseEnds: LooseEnd[];
  currentUserId: string;
  theme: ThemeConfig;
  isSnapping?: boolean;
  onScrollMetricsChange?: (metrics: { scrollFraction: number; visibleFraction: number }) => void;
  seekFraction?: number | null;
  newestWordIndex?: number | null;
}

export const ThreadCanvas: React.FC<ThreadCanvasProps> = ({
  thread,
  words,
  looseEnds,
  currentUserId,
  theme,
  isSnapping = false,
  onScrollMetricsChange,
  seekFraction,
  newestWordIndex = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredWord, setHoveredWord] = useState<{
    word: ThreadWord;
    x: number;
    y: number;
  } | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Cached layout & geometry per word count & dimensions
  const layoutCacheRef = useRef<{
    width: number;
    height: number;
    nodes: ProjectedWordNode[];
    gaps: ThreadGapGeometry[];
    wordGeometries: WordGlyphPath[];
  } | null>(null);

  const someoneElseHoldsPen = Boolean(
    thread?.penHolderId &&
    thread.penHolderId !== currentUserId &&
    thread.penExpiresAt &&
    thread.penExpiresAt > Date.now()
  );

  // Main Canvas Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, width, height);

    const time = (Date.now() - startTimeRef.current) / 1000;
    const threadSeed = thread?.id ? hashString(thread.id) : 101;

    // 1. Calculate Wandering 3D Layout
    const nodes = calculateWanderingSentenceLayout(
      words.length,
      width,
      height,
      time,
      threadSeed
    );

    // 2. Pre-generate word glyph paths
    const wordGeometries: WordGlyphPath[] = words.map((w, idx) => {
      const node = nodes[idx] || { scale: 1 };
      const intensity = w.intensity || 0.5;
      const baseFontSize = (28 + intensity * 18) * node.scale;
      const wordSeed = threadSeed + idx * 73;
      return generateWordMonoline(w.text, baseFontSize, 1.4, wordSeed);
    });

    // 3. Generate Thread Gaps
    const gaps: ThreadGapGeometry[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      const nodeA = nodes[i];
      const nodeB = nodes[i + 1];
      const geomA = wordGeometries[i];
      const geomB = wordGeometries[i + 1];

      // Thread exits last point of word A
      const exitA = {
        x: nodeA.screenPos.x + geomA.width * 0.5 * nodeA.scale,
        y: nodeA.screenPos.y + 8 * nodeA.scale,
      };

      // Thread enters first point of word B
      const enterB = {
        x: nodeB.screenPos.x - geomB.width * 0.5 * nodeB.scale,
        y: nodeB.screenPos.y - 4 * nodeB.scale,
      };

      const w = words[i];
      const gapSeed = threadSeed + i * 199;
      gaps.push(
        generateOrganicThreadGap(
          exitA,
          enterB,
          w.mood,
          w.intensity || 0.5,
          gapSeed
        )
      );
    }

    // 4. Generate Loose Swaying Tail at end of thread
    let endingTail: ThreadGapGeometry | null = null;
    if (words.length > 0) {
      const lastIdx = words.length - 1;
      const lastNode = nodes[lastIdx];
      const lastGeom = wordGeometries[lastIdx];
      const tailStart = {
        x: lastNode.screenPos.x + lastGeom.width * 0.5 * lastNode.scale,
        y: lastNode.screenPos.y + 8 * lastNode.scale,
      };

      const tailEnd = {
        x: tailStart.x + (someoneElseHoldsPen ? 110 : 75),
        y: tailStart.y + (someoneElseHoldsPen ? Math.sin(time * 30) * 8 : 45),
      };

      const tailSeed = threadSeed + 999;
      endingTail = generateOrganicThreadGap(
        tailStart,
        tailEnd,
        someoneElseHoldsPen ? 'anger' : 'calm',
        0.5,
        tailSeed,
        true,
        time * 2.5
      );
    }

    // DRAW PASS 1: Gaps & Multi-Strand Yarn Lines
    if (!isSnapping) {
      const allGaps = endingTail ? [...gaps, endingTail] : gaps;

      allGaps.forEach((gap, gIdx) => {
        const isTail = gIdx === gaps.length;
        const depthAlpha = isTail ? 0.95 : nodes[gIdx]?.depthAlpha || 1.0;

        // Render each offset yarn strand
        gap.strands.forEach((strand, sIdx) => {
          if (strand.points.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(strand.points[0].x, strand.points[0].y);

          for (let p = 1; p < strand.points.length; p++) {
            ctx.lineTo(strand.points[p].x, strand.points[p].y);
          }

          ctx.strokeStyle =
            sIdx === 0
              ? theme.inkPrimary
              : sIdx === 1
              ? theme.inkStrand2
              : theme.inkStrand3;
          ctx.lineWidth = strand.strokeWidth;
          ctx.globalAlpha = strand.opacity * depthAlpha;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        });

        // Machine Stitches
        if (gap.stitches.length > 1) {
          ctx.beginPath();
          ctx.moveTo(gap.stitches[0].x, gap.stitches[0].y);
          for (let s = 1; s < gap.stitches.length; s++) {
            ctx.lineTo(gap.stitches[s].x, gap.stitches[s].y);
          }
          ctx.strokeStyle = theme.inkPrimary;
          ctx.lineWidth = 1.6;
          ctx.globalAlpha = 0.85 * depthAlpha;
          ctx.stroke();

          // Punch Dots
          ctx.fillStyle = theme.inkPrimary;
          gap.punchDots.forEach((dot) => {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
            ctx.globalAlpha = 0.45 * depthAlpha;
            ctx.fill();
          });
        }

        // Tangles & Loops
        gap.tangles.forEach((loop) => {
          if (loop.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(loop[0].x, loop[0].y);
          for (let lp = 1; lp < loop.length; lp++) {
            ctx.lineTo(loop[lp].x, loop[lp].y);
          }
          ctx.strokeStyle = theme.inkPrimary;
          ctx.lineWidth = 1.4;
          ctx.globalAlpha = 0.85 * depthAlpha;
          ctx.stroke();
        });

        // Frayed fibers
        gap.frayedEnds.forEach((fray) => {
          ctx.beginPath();
          ctx.moveTo(fray.points[0].x, fray.points[0].y);
          ctx.lineTo(fray.points[1].x, fray.points[1].y);
          ctx.strokeStyle = theme.inkPrimary;
          ctx.lineWidth = fray.strokeWidth;
          ctx.globalAlpha = fray.opacity * depthAlpha;
          ctx.stroke();
        });

        // Dotted Extrusion Accent (Reference 3)
        // Show on newest word entrance
        const isNewestEntrance = gIdx === words.length - 2 || (newestWordIndex != null && gIdx === newestWordIndex - 1);
        if (isNewestEntrance && gap.extrusionDots.length > 0) {
          gap.extrusionDots.forEach((dot) => {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
            ctx.fillStyle = theme.inkPrimary;
            ctx.globalAlpha = dot.layer === 0 ? 0.2 : dot.layer === 1 ? 0.5 : 0.9;
            ctx.fill();
          });
        }
      });
    }

    // DRAW PASS 2: Words Rendered as Monoline Stroked Letterforms
    words.forEach((word, idx) => {
      const node = nodes[idx];
      const geom = wordGeometries[idx];
      if (!node || !geom) return;

      const isNewest = idx === words.length - 1 || idx === newestWordIndex;

      ctx.save();
      ctx.translate(node.screenPos.x, node.screenPos.y);
      ctx.rotate(node.angle);

      // Center the word glyph cluster
      const offsetX = -geom.width * 0.5 * node.scale;
      const offsetY = -20 * node.scale;

      // Draw Monoline strokes
      geom.strokes.forEach((stroke) => {
        if (stroke.length < 2) return;

        // If newest word: draw dotted extrusion depth accent first (Reference 3)
        if (isNewest) {
          ctx.fillStyle = theme.inkPrimary;
          for (let p = 0; p < stroke.length; p += 2) {
            const pt = stroke[p];
            // Layer 0 shadow dot
            ctx.beginPath();
            ctx.arc(offsetX + pt.x * node.scale + 3, offsetY + pt.y * node.scale + 4, 3, 0, Math.PI * 2);
            ctx.globalAlpha = 0.2;
            ctx.fill();
            // Layer 1 mid dot
            ctx.beginPath();
            ctx.arc(offsetX + pt.x * node.scale + 1.5, offsetY + pt.y * node.scale + 2, 2.2, 0, Math.PI * 2);
            ctx.globalAlpha = 0.45;
            ctx.fill();
          }
        }

        // Main Letterform monoline stroke
        ctx.beginPath();
        ctx.moveTo(offsetX + stroke[0].x * node.scale, offsetY + stroke[0].y * node.scale);
        for (let p = 1; p < stroke.length; p++) {
          ctx.lineTo(offsetX + stroke[p].x * node.scale, offsetY + stroke[p].y * node.scale);
        }

        ctx.strokeStyle = theme.inkPrimary;
        ctx.lineWidth = 2.4 * node.scale;
        ctx.globalAlpha = node.depthAlpha;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Secondary yarn fiber inside letter stroke
        ctx.beginPath();
        ctx.moveTo(offsetX + stroke[0].x * node.scale + 0.6, offsetY + stroke[0].y * node.scale + 0.6);
        for (let p = 1; p < stroke.length; p++) {
          ctx.lineTo(offsetX + stroke[p].x * node.scale + 0.6, offsetY + stroke[p].y * node.scale + 0.6);
        }
        ctx.strokeStyle = theme.inkStrand2;
        ctx.lineWidth = 1.0 * node.scale;
        ctx.globalAlpha = 0.6 * node.depthAlpha;
        ctx.stroke();
      });

      // Entry & Exit Frayed Fiber hairs on letter terminals
      ctx.beginPath();
      ctx.moveTo(offsetX + geom.entryPoint.x * node.scale, offsetY + geom.entryPoint.y * node.scale);
      ctx.lineTo(offsetX + geom.entryPoint.x * node.scale - 8, offsetY + geom.entryPoint.y * node.scale + 6);
      ctx.moveTo(offsetX + geom.exitPoint.x * node.scale, offsetY + geom.exitPoint.y * node.scale);
      ctx.lineTo(offsetX + geom.exitPoint.x * node.scale + 8, offsetY + geom.exitPoint.y * node.scale - 6);
      ctx.strokeStyle = theme.inkPrimary;
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 0.5 * node.depthAlpha;
      ctx.stroke();

      ctx.restore();
    });

    // DRAW PASS 3: Loose Ends (Dangling Abandoned Strands)
    looseEnds.forEach((le) => {
      const node = nodes[Math.min(le.positionIndex, nodes.length - 1)];
      if (!node) return;

      const lx = node.screenPos.x;
      const ly = node.screenPos.y + 18;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      const sway = Math.sin(time * 2 + le.positionIndex) * 8;
      ctx.quadraticCurveTo(lx + sway * 0.5, ly + 25, lx + sway, ly + 46);
      ctx.strokeStyle = theme.inkFaint;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.6;
      ctx.stroke();

      // Faint abandoned text tag
      ctx.font = 'italic 12px "Caveat", cursive';
      ctx.fillStyle = theme.inkFaint;
      ctx.fillText(`~ ${le.text}`, lx + sway - 12, ly + 58);
      ctx.restore();
    });

    // Trembling Needle indicator when someone else holds the pen
    if (someoneElseHoldsPen && endingTail) {
      const tip = endingTail.endPoint;
      ctx.save();
      ctx.translate(tip.x, tip.y);
      ctx.fillStyle = theme.needleColor;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // Needle eye
      ctx.strokeStyle = theme.bgColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Floating live badge
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillStyle = theme.inkPrimary;
      ctx.fillText(`${thread?.penHolderName || 'Someone'} is stitching...`, 12, 4);
      ctx.restore();
    }

    ctx.restore();
    animFrameRef.current = requestAnimationFrame(renderCanvas);
  }, [words, looseEnds, thread, currentUserId, theme, isSnapping, someoneElseHoldsPen, newestWordIndex]);

  // Start & stop animation loop
  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(renderCanvas);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [renderCanvas]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth * (window.devicePixelRatio || 1);
        canvasRef.current.height = containerRef.current.clientHeight * (window.devicePixelRatio || 1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full flex-1 flex flex-col justify-center items-center overflow-hidden select-none"
      style={{ backgroundColor: theme.bgColor }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Active snip animation overlay */}
      {isSnapping && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-snip-cut pointer-events-none z-30">
          <Scissors className="w-12 h-12 text-rose-600 animate-bounce" />
          <span className="text-sm font-serif font-bold text-rose-700 tracking-wider">
            SNIP! THREAD CUT
          </span>
        </div>
      )}
    </div>
  );
};
