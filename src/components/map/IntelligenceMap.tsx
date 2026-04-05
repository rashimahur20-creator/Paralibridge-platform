import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Points, PointMaterial, Tube, Sphere, Torus, Cylinder, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';

// === CONFIG DATA ===
const FIRE_ZONES = [
  { id: 1, name: "Sangrur", pos: [2, 0, 1] as [number,number,number], intensity: "high", acres: 340, aqi: 485 },
  { id: 2, name: "Moga", pos: [-5, 0, -2] as [number,number,number], intensity: "medium", acres: 180, aqi: 320 },
  { id: 3, name: "Bathinda", pos: [-4, 0, 3] as [number,number,number], intensity: "high", acres: 260, aqi: 410 },
  { id: 4, name: "Ludhiana", pos: [1, 0, -3] as [number,number,number], intensity: "low", acres: 120, aqi: 180 },
  { id: 5, name: "Amritsar", pos: [-8, 0, -5] as [number,number,number], intensity: "medium", acres: 200, aqi: 340 },
  { id: 6, name: "Ferozepur", pos: [-6, 0, 4] as [number,number,number], intensity: "low", acres: 90, aqi: 190 }
];

const FARMERS = [
  [-2,0,-1], [3,0,2], [5,0,-2], [-1,0,4],
  [7,0,1], [-3,0,-4], [4,0,-4], [6,0,3]
] as [number,number,number][];

const BUYERS = [
  { name: "Haryana Biomass", pos: [8, 0, 2] as [number,number,number] },
  { name: "Punjab Bricks", pos: [-9, 0, -3] as [number,number,number] },
  { name: "GreenFuel Ind.", pos: [9, 0, -4] as [number,number,number] },
  { name: "Sangrur Power", pos: [3, 0, 5] as [number,number,number] },
  { name: "Bathinda Bio", pos: [-3, 0, 6] as [number,number,number] }
];

const INTENSITY_COLORS = {
  high: '#FF2200', medium: '#FF6600', low: '#FFAA00'
};
const SCORCH_COLORS = {
  high: '#8B0000', medium: '#CC4400', low: '#886600'
};

// === CINEMATIC CAMERA SYSTEM ===
function CameraRig() {
  const { camera } = useThree();
  const [introDone, setIntroDone] = useState(false);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!introDone) {
      timeRef.current += delta;
      const progress = Math.min(timeRef.current / 4.0, 1.0);
      const ease = 1 - Math.pow(1 - progress, 3);
      
      const start = new THREE.Vector3(0, 45, 0);
      const end = new THREE.Vector3(0, 18, 28);
      
      camera.position.lerpVectors(start, end, ease);
      camera.lookAt(0, 0, 0);

      if (progress >= 1.0) setIntroDone(true);
    }
  });

  return (
    <OrbitControls 
      enabled={introDone}
      minPolarAngle={Math.PI / 6} 
      maxPolarAngle={Math.PI / 2.2}
      minDistance={12} 
      maxDistance={45}
      autoRotate={true}
      autoRotateSpeed={0.4}
      target={[0, 0, 0]}
    />
  );
}

// === STARS ===
function Stars() {
  const particlesCount = 800;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for(let i=0; i<particlesCount; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 120;
      pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.cos(phi);
      pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, []);

  return (
    <Points positions={positions}>
      <PointMaterial color="#ffffff" size={0.08} sizeAttenuation={true} depthWrite={false} transparent opacity={0.6} />
    </Points>
  );
}

// === TERRAIN ===
function Terrain() {
  const riverCurve = useMemo(() => {
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-12, 0.05, 2),
      new THREE.Vector3(-4, 0.05, 1),
      new THREE.Vector3(8, 0.05, 3)
    );
  }, []);

  return (
    <group>
      {/* Base Plane */}
      <Plane args={[30, 22, 80, 60]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a3d1a" roughness={0.9} metalness={0.05} />
      </Plane>
      {/* Grid Overlay */}
      <gridHelper args={[30, 60, '#003300', '#001800']} position={[0, 0.01, 0]} />
      
      {/* AQI Ground Plane overlay (simulated with large glowing plane) */}
      <Plane args={[28, 20]} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.5, 0]}>
         <meshBasicMaterial color="#b40000" transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </Plane>

      {/* River */}
      <Tube args={[riverCurve, 64, 0.3, 8, false]}>
        <meshStandardMaterial color="#1a4a6e" metalness={0.3} roughness={0.2} />
      </Tube>
      
      <Html position={[-4, 1.5, 1]} center>
         <div className="text-[#3b82f6] text-[9px] font-bold tracking-widest uppercase opacity-60">Sutlej River</div>
      </Html>
    </group>
  );
}

// === FIRE ZONE WITH PARTICLES ===
function FireZone({ zone, visible }: { zone: any, visible: boolean }) {
  const radius = zone.acres / 80;
  const pCount = zone.intensity === 'high' ? 120 : zone.intensity === 'medium' ? 80 : 60;
  
  const pointsRef = useRef<THREE.Points>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { positions, phases, baseYs } = useMemo(() => {
    const pos = new Float32Array(pCount * 3);
    const ph = new Float32Array(pCount);
    const yBase = new Float32Array(pCount);
    for(let i=0; i<pCount; i++) {
      const r = Math.sqrt(Math.random()) * radius;
      const t = Math.random() * 2 * Math.PI;
      pos[i*3] = r * Math.cos(t);
      yBase[i] = Math.random() * 2.5;
      pos[i*3+1] = yBase[i];
      pos[i*3+2] = r * Math.sin(t);
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, phases: ph, baseYs: yBase };
  }, [pCount, radius]);

  useFrame((state) => {
    if (!visible) return;
    const time = state.clock.elapsedTime;
    
    // Animate points
    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position;
      for(let i=0; i<pCount; i++) {
        posAttr.setY(i, baseYs[i] + Math.sin(time * 3 + phases[i]) * 0.3);
      }
      posAttr.needsUpdate = true;
      ((pointsRef.current.material as THREE.PointsMaterial).opacity) = 0.6 + 0.4 * Math.sin(time * 2);
    }
    
    // Animate halo
    if (haloRef.current) {
      const scale = 0.95 + 0.05 * Math.sin(time * 2);
      haloRef.current.scale.set(scale, scale, scale);
    }
  });

  if (!visible) return null;

  return (
    <group position={zone.pos}>
      {/* Scorch mark */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshStandardMaterial color={SCORCH_COLORS[zone.intensity as keyof typeof SCORCH_COLORS]} emissive={SCORCH_COLORS[zone.intensity as keyof typeof SCORCH_COLORS]} emissiveIntensity={0.3} />
      </mesh>
      
      {/* Fire Particles */}
      <Points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={pCount} array={positions} itemSize={3} />
        </bufferGeometry>
        <PointMaterial color={INTENSITY_COLORS[zone.intensity as keyof typeof INTENSITY_COLORS]} size={zone.intensity === 'high' ? 0.12 : 0.08} transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
      </Points>

      {/* Smoke Halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[radius * 1.4, 16, 16]} />
        <meshStandardMaterial color={INTENSITY_COLORS[zone.intensity as keyof typeof INTENSITY_COLORS]} transparent opacity={zone.intensity === 'high' ? 0.08 : 0.04} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* Hover interaction target */}
      <mesh position={[0, 1.5, 0]} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} visible={false}>
        <sphereGeometry args={[radius * 1.5, 16, 16]} />
        <meshBasicMaterial />
      </mesh>

      {/* Mini Label */}
      <Html position={[0, 1.5, 0]} center zIndexRange={[100, 0]}>
        <div className="flex items-center gap-1 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ff0000]"/>
          <span className="text-white/70 text-[9px] font-bold uppercase tracking-wider">{zone.name}</span>
        </div>
      </Html>

      {/* Hover Detail Label */}
      {hovered && (
        <Html position={[0, 3, 0]} center zIndexRange={[200, 0]}>
          <div className="bg-[#0a140c]/90 border border-green-500/30 rounded-lg p-2.5 text-xs w-36 shadow-xl backdrop-blur-sm pointer-events-none">
            <p className="font-bold text-white mb-1">{zone.name} District</p>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400">Status</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-${zone.intensity === 'high' ? 'red' : 'amber'}-500/20 text-${zone.intensity === 'high' ? 'red' : 'amber'}-400`}>
                {zone.intensity}
              </span>
            </div>
            <div className="flex justify-between mb-1"><span className="text-gray-400">Area</span><span className="text-white font-medium">{zone.acres} ac</span></div>
            <div className="flex justify-between border-t border-white/10 pt-1 mt-1"><span className="text-gray-400">AQI</span><span className="text-purple-400 font-bold">{zone.aqi}</span></div>
          </div>
        </Html>
      )}
    </group>
  );
}

// === POLLUTION SMOG ===
function SmogCloud({ basePos, visible }: { basePos: [number,number,number], visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // 3 spheres drifting east
  const blobs = useMemo(() => {
    return [
      { r: 2.5 + Math.random(), offset: [0, 1.5, 0], speed: 0.001, phase: Math.random() },
      { r: 3.5 + Math.random(), offset: [2, 2.5, 1], speed: 0.0012, phase: Math.random() },
      { r: 2.0 + Math.random(), offset: [4, 1.8, -1], speed: 0.0008, phase: Math.random() }
    ];
  }, []);

  useFrame((state) => {
    if (!visible || !groupRef.current) return;
    const time = state.clock.elapsedTime;
    
    groupRef.current.children.forEach((child, i) => {
      const b = blobs[i];
      // Drift east (X axis)
      child.position.x = b.offset[0] + (time * b.speed * 100) % 8; // wrap around
      const scale = 1 + 0.05 * Math.sin(time * 0.3 + b.phase);
      child.scale.set(scale, scale, scale);
    });
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={basePos}>
      {blobs.map((b, i) => (
        <mesh key={i} position={b.offset as [number,number,number]}>
          <sphereGeometry args={[b.r, 12, 12]} />
          <meshStandardMaterial color="#6633AA" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} blending={THREE.NormalBlending} />
        </mesh>
      ))}
    </group>
  );
}

// === REGISTERED FARMER ===
function SafeZone({ pos, index, visible }: { pos: [number,number,number], index: number, visible: boolean }) {
  const topRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!visible) return;
    const time = state.clock.elapsedTime;
    if (topRef.current) topRef.current.scale.setScalar(1 + 0.3 * Math.sin(time * 2 + index));
    if (ringRef.current) {
      ringRef.current.position.y = 0.2 + Math.sin(time + index) * 0.1;
      ringRef.current.rotation.y = time * 2;
    }
  });

  if (!visible) return null;

  return (
    <group position={pos}>
      <Cylinder args={[0.15, 0.15, 0.8, 8]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#00CC44" emissive="#004422" emissiveIntensity={0.4} />
      </Cylinder>
      <mesh ref={topRef} position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#00CC44" emissive="#004422" emissiveIntensity={0.6} />
      </mesh>
      {/* Light Pillar */}
      <Cylinder args={[0.04, 0.04, 3, 6]} position={[0, 1.5, 0]}>
        <meshBasicMaterial color="#00FF66" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
      </Cylinder>
      <mesh ref={ringRef} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.4, 0.02, 6, 24]} />
        <meshBasicMaterial color="#00FF66" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// === BUYER FACILITY ===
function BuyerFacility({ data, visible }: { data: any, visible: boolean }) {
  const beaconRef = useRef<THREE.Mesh>(null);
  const ripplesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!visible) return;
    const time = state.clock.elapsedTime;
    if (beaconRef.current) {
      (beaconRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8 + 1.2 * Math.abs(Math.sin(time * 4));
    }
    if (ripplesRef.current) {
      ripplesRef.current.children.forEach((child, i) => {
        const offsetTime = (time + i * 0.6) % 2;
        const scale = 1 + offsetTime * 2;
        child.scale.set(scale, scale, scale);
        (child.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - offsetTime / 2);
      });
    }
  });

  if (!visible) return null;

  return (
    <group position={data.pos}>
      <Box args={[0.5, 0.8, 0.5]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#0044AA" emissive="#001133" emissiveIntensity={0.3} />
      </Box>
      <Cylinder args={[0.06, 0.08, 0.6]} position={[0, 1.1, 0]}>
        <meshStandardMaterial color="#333" />
      </Cylinder>
      <mesh ref={beaconRef} position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.12]} />
        <meshStandardMaterial color="#0088FF" emissive="#0088FF" emissiveIntensity={1.5} />
      </mesh>
      
      <group ref={ripplesRef} rotation={[Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
        {[0,1,2].map(i => (
          <mesh key={i}>
            <torusGeometry args={[0.6, 0.03, 16, 32]} />
            <meshBasicMaterial color="#0088FF" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>
      
      <Html position={[0, 1.8, 0]} center>
         <div className="text-[#60a5fa] text-[9px] font-bold tracking-widest uppercase opacity-80 whitespace-nowrap bg-[#001133]/50 px-1 rounded backdrop-blur-sm border border-[#0088FF]/30">{data.name}</div>
      </Html>
    </group>
  );
}

// === CONNECTING LINES ===
function SupplyLine({ start, end, visible }: { start: number[], end: number[], visible: boolean }) {
  const lineRef = useRef<THREE.Line>(null);
  
  const curve = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = s.clone().lerp(e, 0.5);
    mid.y += 3; // arc height
    return new THREE.QuadraticBezierCurve3(s, mid, e);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(50), [curve]);

  useFrame((state) => {
    if (!visible || !lineRef.current) return;
    const time = state.clock.elapsedTime;
    (lineRef.current.material as THREE.LineDashedMaterial).dashOffset = -time * 2;
  });

  if (!visible) return null;

  return (
    <line ref={lineRef}>
      <bufferGeometry>
         <bufferAttribute attach="attributes-position" count={points.length} array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))} itemSize={3} />
      </bufferGeometry>
      <lineDashedMaterial color="#00FFAA" transparent opacity={0.5} dashSize={0.5} gapSize={0.5} />
    </line>
  );
}

// === HUD COMPONENTS ===
function HUD({ layers, setLayer }: { layers: any, setLayer: any }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 font-sans">
      {/* Top Left Stats */}
      <div className="absolute top-6 left-6 bg-[#050f08]/85 border border-[#00ff64]/20 rounded-xl p-5 min-w-[240px] backdrop-blur-md shadow-2xl pointer-events-auto">
        <h1 className="text-white font-display text-lg font-bold mb-1">Punjab Pollution Intel</h1>
        <p className="text-white/50 text-xs mb-4 tracking-wide uppercase">Parali burning season — Oct 2024</p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center"><span className="text-[#888] text-sm">Active fire zones</span><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/><span className="text-red-400 font-bold">6</span></div></div>
          <div className="flex justify-between"><span className="text-[#888] text-sm">Acres burning</span><span className="text-amber-500 font-bold">1,190</span></div>
          <div className="flex justify-between pb-2 border-b border-white/5"><span className="text-[#888] text-sm">AQI (avg affected)</span><span className="text-purple-400 font-bold">387 <span className="text-[10px] ml-1 bg-purple-500/20 px-1 rounded text-purple-300">HAZARDOUS</span></span></div>
          
          <div className="flex justify-between pt-1"><span className="text-[#888] text-sm">Farmers registered</span><span className="text-green-400 font-bold">8</span></div>
          <div className="flex justify-between"><span className="text-[#888] text-sm">Tonnes diverted</span><span className="text-green-400 font-bold">145T</span></div>
          <div className="flex justify-between"><span className="text-[#888] text-sm">CO₂ saved</span><span className="text-teal-400 font-bold">217T</span></div>
        </div>
      </div>

      {/* Top Right Legend */}
      <div className="absolute top-6 right-6 bg-[#050f08]/85 border border-[#00ff64]/20 rounded-xl p-5 min-w-[200px] backdrop-blur-md shadow-2xl pointer-events-auto">
         <h3 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-4 border-b border-white/10 pb-2">Legend</h3>
         <div className="space-y-3 text-sm">
           <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_8px_#dc2626]"/> <span className="text-[#bbb]">Active fire zone</span></div>
           <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-purple-600/40 border border-purple-500/50"/> <span className="text-[#bbb]">Pollution spread</span></div>
           <div className="flex items-center gap-3"><span className="w-1.5 h-4 bg-green-500 shadow-[0_0_8px_#22c55e]"/> <span className="text-[#bbb]">Registered safe farm</span></div>
           <div className="flex items-center gap-3"><span className="w-3 h-3 bg-blue-600 border border-blue-400"/> <span className="text-[#bbb]">Buyer facility</span></div>
           <div className="flex items-center gap-3"><div className="w-4 h-0.5 border-t border-dashed border-teal-400"/> <span className="text-[#bbb]">Supply chain</span></div>
         </div>
      </div>

      {/* Bottom Center Timeline (Visual Demo) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#050f08]/85 border border-[#00ff64]/20 rounded-xl px-8 py-4 backdrop-blur-md shadow-2xl pointer-events-auto flex flex-col items-center">
         <p className="text-[#888] text-[10px] tracking-widest uppercase mb-2">Season Timeline — Oct 1 to Nov 15</p>
         <input type="range" className="w-[300px] accent-green-500" defaultValue="40" />
      </div>

      {/* Bottom Right Toggles */}
      <div className="absolute bottom-10 right-6 flex gap-2 pointer-events-auto">
        {[
          { key: 'fires', label: 'Fire Zones' },
          { key: 'smog', label: 'Pollution' },
          { key: 'supply', label: 'Supply Chain' },
          { key: 'all', label: 'View All' }
        ].map(btn => {
          const isActive = btn.key === 'all' 
             ? layers.fires && layers.smog && layers.supply 
             : layers[btn.key] && !layers.all; // simple heuristic for demo
             
          return (
            <button 
              key={btn.key}
              onClick={() => {
                if (btn.key === 'all') setLayer({ fires: true, smog: true, supply: true });
                else setLayer({ ...layers, [btn.key]: !layers[btn.key] });
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all ${isActive ? 'bg-[#1a5c2e]/40 border-green-500 text-green-400' : 'bg-[#050a07]/80 border-[#333] text-[#666] hover:border-[#555]'}`}
            >
              {btn.label}
            </button>
          )
        })}
      </div>
    </div>
  );
}

// === MAIN WRAPPER ===
export default function IntelligenceMap() {
  const [layers, setLayer] = useState({ fires: true, smog: true, supply: true });

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-[#050a07] relative overflow-hidden">
      {/* Scanline effect */}
      <div className="absolute inset-0 z-30 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 2px, #fff 2px, #fff 4px)' }} />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <h2 className="font-mono text-[#00cc44] text-[10px] tracking-[0.2em] uppercase">ParaliBridge — System Active</h2>
      </div>

      <HUD layers={layers} setLayer={setLayer} />

      <Suspense fallback={
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050a07] text-[#00cc44] font-mono">
           <div className="w-12 h-12 border-2 border-[#00cc44]/30 border-t-[#00cc44] rounded-full animate-spin mb-4" />
           <p className="animate-pulse tracking-widest text-sm uppercase">Initializing Pollution Intel Map...</p>
        </div>
      }>
        <Canvas shadows>
          <color attach="background" args={['#050a07']} />
          <fogExp2 attach="fog" args={['#050a07', 0.015]} />
          
          <ambientLight intensity={0.4} color="#1a3a20" />
          <directionalLight position={[15, 25, 10]} intensity={1.2} color="#ffffff" castShadow />
          <pointLight position={[0, 8, 0]} intensity={2} color="#ff4400" />
          <pointLight position={[-8, 6, -8]} intensity={0.8} color="#4466ff" />

          <CameraRig />
          <Stars />
          <Terrain />

          {/* Render Elements based on toggles */}
          {FIRE_ZONES.map(z => <FireZone key={z.id} zone={z} visible={layers.fires} />)}
          {FIRE_ZONES.filter(z => z.intensity !== 'low').map(z => <SmogCloud key={z.id} basePos={z.pos} visible={layers.smog} />)}
          
          {FARMERS.map((f, i) => <SafeZone key={i} pos={f} index={i} visible={layers.supply} />)}
          {BUYERS.map((b, i) => <BuyerFacility key={i} data={b} visible={layers.supply} />)}
          
          {/* Render lines from closest safe zones to buyers */}
          <SupplyLine start={FARMERS[4]} end={BUYERS[0].pos} visible={layers.supply} />
          <SupplyLine start={FARMERS[2]} end={BUYERS[2].pos} visible={layers.supply} />
          <SupplyLine start={FARMERS[6]} end={BUYERS[3].pos} visible={layers.supply} />
          <SupplyLine start={FARMERS[7]} end={BUYERS[4].pos} visible={layers.supply} />

        </Canvas>
      </Suspense>
    </div>
  );
}
