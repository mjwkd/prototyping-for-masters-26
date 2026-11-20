'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Thread, ThreadWord, LooseEnd } from '../types/thread';
import { ThemeConfig } from '../lib/themeConfig';
import {
  loadFonts,
  createWord3D,
  Word3DInstance,
  resolveWordStyleKey,
  buildGapThread,
  buildTailPoints,
} from '../lib/wordStyles';

interface ThreeThreadCanvasProps {
  thread: Thread | null;
  words: ThreadWord[];
  looseEnds: LooseEnd[];
  currentUserId: string;
  theme?: ThemeConfig;
  isSnapping?: boolean;
  onScrollMetricsChange?: (metrics: { scrollFraction: number; visibleFraction: number }) => void;
  seekFraction?: number | null;
  newestWordIndex?: number | null;
}

export const ThreeThreadCanvas: React.FC<ThreeThreadCanvasProps> = ({
  thread,
  words,
  looseEnds,
  currentUserId,
  isSnapping = false,
  newestWordIndex = null,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedWord, setSelectedWord] = useState<ThreadWord | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sentenceGroupRef = useRef<THREE.Group | null>(null);
  const hitBoxesRef = useRef<THREE.Mesh[]>([]);
  const wordInstancesRef = useRef<Word3DInstance[]>([]);
  const tailMeshRef = useRef<THREE.Line | null>(null);
  const lastExitRef = useRef<THREE.Vector3 | null>(null);
  const targetCamXRef = useRef<number>(0);
  const isAutoGlidingRef = useRef<boolean>(true);

  const someoneElseHoldsPen = Boolean(
    thread?.penHolderId &&
    thread.penHolderId !== currentUserId &&
    thread.penExpiresAt &&
    thread.penExpiresAt > Date.now()
  );

  // 1. Initialize Three.js Scene, Camera, and Studio Lighting
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene with pure white background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    // Camera: facing the words directly, readable left to right
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 4000);
    camera.position.set(0, 0, 220);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls: smooth damping, dragging along thread
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 800;
    controls.minDistance = 60;
    controls.maxPolarAngle = Math.PI * 0.65;
    controls.minPolarAngle = Math.PI * 0.35;
    controlsRef.current = controls;

    // Disable auto-gliding when user starts manual dragging/panning
    controls.addEventListener('start', () => {
      isAutoGlidingRef.current = false;
    });

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.15);
    dirLight1.position.set(80, 120, 120);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf2f4f8, 0.55);
    dirLight2.position.set(-80, -40, 80);
    scene.add(dirLight2);

    // Sentence Group Container
    const sentenceGroup = new THREE.Group();
    scene.add(sentenceGroup);
    sentenceGroupRef.current = sentenceGroup;

    // Tail Line Mesh for loose swaying end
    const tailGeom = new THREE.BufferGeometry();
    const tailMat = new THREE.LineBasicMaterial({
      color: 0x1a1a1a,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.9,
    });
    const tailMesh = new THREE.Line(tailGeom, tailMat);
    scene.add(tailMesh);
    tailMeshRef.current = tailMesh;

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Update 3D word styles & animations (rays, drops, pulse, flicker, oscillation)
      const instances = wordInstancesRef.current;
      for (const inst of instances) {
        inst.update(elapsedTime, delta, 'oscillate');
      }

      // Update loose end tail thread
      if (tailMeshRef.current && lastExitRef.current && !thread?.endedAt) {
        const pts = buildTailPoints(lastExitRef.current, elapsedTime, someoneElseHoldsPen);
        tailMeshRef.current.geometry.setFromPoints(pts);
        tailMeshRef.current.visible = true;
      } else if (tailMeshRef.current) {
        tailMeshRef.current.visible = false;
      }

      // Smooth camera gliding towards target X (only if auto-gliding is active)
      if (isAutoGlidingRef.current && controlsRef.current && cameraRef.current) {
        const targetX = targetCamXRef.current;
        const currentTargetX = controlsRef.current.target.x;
        const diffX = targetX - currentTargetX;

        if (Math.abs(diffX) > 0.2) {
          controlsRef.current.target.x += diffX * 0.05;
          cameraRef.current.position.x += diffX * 0.05;
        } else {
          isAutoGlidingRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!mount || !rendererRef.current || !cameraRef.current) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      wordInstancesRef.current.forEach((inst) => inst.dispose());
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 2. Build 3D Extruded Words with Thin Connecting Threads
  useEffect(() => {
    const sentenceGroup = sentenceGroupRef.current;
    if (!sentenceGroup) return;

    // Clear previous children and instances
    while (sentenceGroup.children.length > 0) {
      const child = sentenceGroup.children[0];
      sentenceGroup.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
    }
    wordInstancesRef.current.forEach((inst) => inst.dispose());
    wordInstancesRef.current = [];
    hitBoxesRef.current = [];
    lastExitRef.current = null;

    if (words.length === 0 || isSnapping) return;

    loadFonts().then((fonts) => {
      const gap = 20; // clean physical distance between words
      let currentX = 0;
      let prevExitPoint: THREE.Vector3 | null = null;

      const instances: Word3DInstance[] = [];

      words.forEach((w, idx) => {
        const styleKey = resolveWordStyleKey(w.text, w.mood);
        const inst = createWord3D(w.text, styleKey, fonts, idx);

        const wordPosX = currentX + inst.width / 2;
        inst.rootGroup.position.set(wordPosX, 0, 0);
        sentenceGroup.add(inst.rootGroup);
        instances.push(inst);

        const entryPoint = new THREE.Vector3(currentX, 0, 0);
        const exitPoint = new THREE.Vector3(currentX + inst.width, 0, 0);

        // Thin thread line (1.5px) connecting previous word exit to this word entry
        if (prevExitPoint) {
          const { mesh, whiskers } = buildGapThread(prevExitPoint, entryPoint, idx);
          sentenceGroup.add(mesh);
          sentenceGroup.add(whiskers);
        }

        // Invisible click hitbox for author inspection
        const hitGeom = new THREE.BoxGeometry(inst.width + 4, inst.height + 6, Math.max(12, inst.depth + 4));
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitBox = new THREE.Mesh(hitGeom, hitMat);
        hitBox.position.set(wordPosX, 0, 0);
        hitBox.userData = { word: w };
        sentenceGroup.add(hitBox);
        hitBoxesRef.current.push(hitBox);

        prevExitPoint = exitPoint;
        currentX += inst.width + gap;
      });

      lastExitRef.current = prevExitPoint;
      wordInstancesRef.current = instances;

      // Camera framing: target the last words so user can read what to append next
      if (prevExitPoint) {
        const focusX = Math.max(0, prevExitPoint.x - 40);
        targetCamXRef.current = focusX;
        isAutoGlidingRef.current = true;
      }
    });
  }, [words, isSnapping, thread?.id, newestWordIndex]);

  // Raycaster for clicking a word
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const mount = mountRef.current;
    if (!mount || !cameraRef.current || !rendererRef.current) return;

    const rect = mount.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(hitBoxesRef.current, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const word = hit.userData.word as ThreadWord;
      if (word) {
        setSelectedWord(word);
        setTooltipPos({ x: e.clientX, y: e.clientY });
      }
    } else {
      setSelectedWord(null);
      setTooltipPos(null);
    }
  };

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      className="relative w-full flex-1 flex flex-col justify-center items-center overflow-hidden select-none bg-white cursor-grab active:cursor-grabbing font-sans"
    >
      {/* Floating Card for Clicked Word (Clean, Black & Gray) */}
      {selectedWord && tooltipPos && (
        <div
          className="fixed z-50 p-4 rounded-xl shadow-lg border border-gray-200 bg-white text-xs font-sans text-gray-900 pointer-events-auto"
          style={{
            top: Math.min(window.innerHeight - 150, tooltipPos.y - 100),
            left: Math.max(16, Math.min(window.innerWidth - 220, tooltipPos.x - 100)),
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-semibold text-sm text-black">"{selectedWord.text}"</span>
            <span className="text-[10px] text-gray-400 uppercase font-mono">
              #{selectedWord.index + 1}
            </span>
          </div>
          <p className="text-gray-500 text-xs">by {selectedWord.authorName}</p>
          <button
            onClick={() => setSelectedWord(null)}
            className="mt-2 text-[11px] text-gray-400 hover:text-black underline block"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
