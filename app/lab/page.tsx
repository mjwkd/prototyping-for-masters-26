'use client';

import React from 'react';
import Link from 'next/link';
import { LabCanvas } from '../../components/LabCanvas';

export default function LabPage() {
  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-white select-none text-black font-sans">
      {/* Minimal Header */}
      <header className="w-full bg-white px-6 py-4 z-40 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-black tracking-tight">
            Thread the Word
          </h1>
          <span className="text-xs text-gray-400 font-normal">/</span>
          <span className="text-xs text-gray-500 font-medium">Typography Lab</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-normal">
          <span className="text-gray-400 hidden sm:inline">
            Solid 3D Extruded Words
          </span>
          <Link
            href="/"
            className="text-gray-900 hover:text-black font-medium hover:underline transition"
          >
            ← Back to Thread
          </Link>
        </div>
      </header>

      {/* 3D Lab Canvas Viewport */}
      <main className="flex-1 w-full h-full relative overflow-hidden bg-white">
        <LabCanvas />
      </main>
    </div>
  );
}
