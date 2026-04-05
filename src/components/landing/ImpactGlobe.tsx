import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, PointMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';

// Convert lat/lng to 3D Cartesian coordinates
function getPos(lat: number, lng: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  ] as [number, number, number];
}

function IndiaRegion() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Slight floating oscillation for 3D effect without losing India
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.05;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.02;
    }
  });

  const particlesCount = 3000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount; i++) {
        // cluster particles mostly towards northern hemisphere to simulate density
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 2 + Math.random() * 0.15; 
        pos[i*3] = -(radius * Math.sin(phi) * Math.cos(theta));
        pos[i*3+1] = radius * Math.cos(phi);
        pos[i*3+2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, []);

  // Generate 40 clustered hotspots across Punjab and Haryana
  const fireSpots = useMemo(() => {
    const spots = [];
    // Base center around Punjab/Haryana
    const baseLat = 30.5;
    const baseLng = 75.5;
    for(let i=0; i<35; i++) {
      const rLat = baseLat + (Math.random() - 0.5) * 3.5;
      const rLng = baseLng + (Math.random() - 0.5) * 3.5;
      spots.push(getPos(rLat, rLng, 2.0));
    }
    return spots;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Outer atmosphere */}
      <Sphere args={[2.15, 64, 64]}>
        <meshBasicMaterial color="#1a5c2e" transparent opacity={0.05} side={THREE.BackSide} />
      </Sphere>
      
      {/* Wireframe Tech Sphere */}
      <Sphere args={[2, 48, 48]}>
        <meshStandardMaterial color="#1a5c2e" wireframe={true} transparent opacity={0.4} />
      </Sphere>

      {/* Solid Inner Core */}
      <Sphere args={[1.97, 64, 64]}>
         <meshStandardMaterial color="#0a1a0d" roughness={0.9} />
      </Sphere>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particlesCount} array={positions} itemSize={3} />
        </bufferGeometry>
        <PointMaterial transparent color="#4ade80" size={0.012} sizeAttenuation={true} depthWrite={false} opacity={0.4} />
      </points>
      
      {/* Fire Hotspots */}
      {fireSpots.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[Math.random() * 0.02 + 0.01, 8, 8]} />
          <meshBasicMaterial color={Math.random() > 0.5 ? "#ef4444" : "#f59e0b"} />
        </mesh>
      ))}
      
      {/* Central massive glow for the epicenter */}
      <mesh position={getPos(31.0, 75.5, 2.0)}>
         <sphereGeometry args={[0.06, 16, 16]} />
         <meshBasicMaterial color="#dc2626" transparent opacity={0.8}/>
         <pointLight color="#ff0000" intensity={4} distance={3} />
      </mesh>

      {/* 3D Labels to give geographic context */}
      <Html position={getPos(31.5, 75.0, 2.05)} center>
        <div className="bg-black/60 backdrop-blur-md border border-red-500/30 text-red-400 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase pointer-events-none whitespace-nowrap shadow-[0_0_10px_rgba(220,38,38,0.3)]">
          🔥 Punjab Burn Zone
        </div>
      </Html>
      <Html position={getPos(28.6, 77.2, 2.05)} center>
        <div className="text-white/60 text-[10px] font-bold tracking-widest uppercase pointer-events-none whitespace-nowrap">
          📍 New Delhi
        </div>
      </Html>
    </group>
  );
}

export default function ImpactGlobe() {
  // Camera placed tight to Northern India
  const camPos = getPos(28.0, 76.0, 3.8);

  return (
    <div className="w-full h-[400px] lg:h-[450px] bg-transparent cursor-pointer rounded-3xl overflow-hidden relative group">
      <div className="absolute inset-0 z-10 pointer-events-none rounded-3xl shadow-[inset_0_0_80px_rgba(26,92,46,0.1)] transition-all group-hover:shadow-[inset_0_0_120px_rgba(245,158,11,0.1)]" />
      <Canvas camera={{ position: camPos, fov: 40 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} color="#f59e0b" />
        <directionalLight position={[-10, 5, -10]} intensity={2.5} color="#1a5c2e" />
        <IndiaRegion />
        {/* Restrict Orbit Controls so user can't spin the globe away from India */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minAzimuthAngle={1.0} // Restrict horizontal spin
          maxAzimuthAngle={1.6}
          minPolarAngle={1.0}   // Restrict vertical spin
          maxPolarAngle={1.3}
        />
      </Canvas>
    </div>
  );
}
