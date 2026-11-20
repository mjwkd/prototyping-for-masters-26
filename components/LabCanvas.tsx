'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadFonts, createWord3D, Word3DInstance } from '../lib/wordStyles';

const LAB_WORDS = [
  'sunshine',
  'is',
  'rain',
  'love',
  'the',
  'heavy',
  'whisper',
  'fire',
];

export const LabCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [rotateMode, setRotateMode] = useState<'oscillate' | 'turntable' | 'still'>('oscillate');
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const initialCamZRef = useRef<number>(260);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let isMounted = true;
    let animationFrameId: number;
    const clock = new THREE.Clock();

    // 1. Scene with pure white background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // 2. Camera facing words directly, readable left to right
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 4000);
    camera.position.set(0, 2, 280);
    cameraRef.current = camera;

    // 3. WebGL Renderer with antialiasing and shadow support
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    // 4. OrbitControls with smooth damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI * 0.75;
    controls.minDistance = 30;
    controls.maxDistance = 1200;
    controlsRef.current = controls;

    // 5. Studio Lighting for pure white background
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight1.position.set(60, 100, 100);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf5f7fb, 0.5);
    dirLight2.position.set(-60, -40, 60);
    scene.add(dirLight2);

    const sentenceGroup = new THREE.Group();
    scene.add(sentenceGroup);

    const instances: Word3DInstance[] = [];

    // 6. Load Fonts and Build the 8 3D Words Side by Side
    loadFonts().then((fonts) => {
      if (!isMounted) return;

      const gap = 18; // clean spacing between words
      let currentX = 0;
      const wordObjects: { instance: Word3DInstance; x: number }[] = [];

      // Create each word instance
      LAB_WORDS.forEach((wordText, idx) => {
        const instance = createWord3D(wordText, wordText, fonts, idx);
        wordObjects.push({ instance, x: currentX });
        currentX += instance.width + gap;
        instances.push(instance);
      });

      const totalSpan = currentX - gap;
      const startX = -totalSpan / 2;

      // Position words side by side along X
      wordObjects.forEach(({ instance, x }) => {
        const posX = startX + x + instance.width / 2;
        instance.rootGroup.position.set(posX, 0, 0);
        sentenceGroup.add(instance.rootGroup);
      });

      // Fit camera to frame all words readable left to right
      const aspect = width / height;
      const requiredDist =
        (totalSpan / 2) / Math.tan((camera.fov * Math.PI) / 360) / Math.min(1, aspect);
      const targetZ = Math.max(220, requiredDist * 1.12);
      camera.position.set(0, 0, targetZ);
      initialCamZRef.current = targetZ;
      controls.target.set(0, 0, 0);
      controls.update();

      setLoading(false);
    });

    // 7. Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Update each 3D word and its special effects (rays, drops, pulse, flicker, rotation)
      for (const inst of instances) {
        inst.update(elapsedTime, delta, rotateMode);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 8. Responsive Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);

      instances.forEach((inst) => inst.dispose());

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [rotateMode]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, initialCamZRef.current);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white overflow-hidden select-none font-sans">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full flex-1 relative cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-xs text-gray-500 font-medium tracking-wide">
            Loading 3D Typographies...
          </div>
        </div>
      )}

      {/* Bottom Minimal Controls Bar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/90 backdrop-blur-md border border-gray-200 px-3 py-1.5 rounded-full shadow-sm text-xs text-gray-600">
        <span className="text-[11px] text-gray-400 font-medium px-1">Rotation:</span>
        <button
          onClick={() => setRotateMode('oscillate')}
          className={`px-3 py-1 rounded-full transition text-xs ${
            rotateMode === 'oscillate'
              ? 'bg-black text-white font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          Gentle Wobble
        </button>
        <button
          onClick={() => setRotateMode('turntable')}
          className={`px-3 py-1 rounded-full transition text-xs ${
            rotateMode === 'turntable'
              ? 'bg-black text-white font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          360° Turntable
        </button>
        <button
          onClick={() => setRotateMode('still')}
          className={`px-3 py-1 rounded-full transition text-xs ${
            rotateMode === 'still'
              ? 'bg-black text-white font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          Still
        </button>

        <div className="w-[1px] h-3 bg-gray-200 mx-1" />

        <button
          onClick={handleResetCamera}
          className="px-2.5 py-1 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition text-xs"
        >
          Reset View
        </button>
      </div>
    </div>
  );
};
