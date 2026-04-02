import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Fog, Object3D, InstancedMesh, Matrix4, Color, Vector3 } from 'three';
import * as THREE from 'three';

const BLADE_COUNT = 2000;

function GrassBlades() {
  const meshRef = useRef<InstancedMesh>(null!);
  const offsets = useMemo(() => {
    const o = new Float32Array(BLADE_COUNT);
    for (let i = 0; i < BLADE_COUNT; i++) o[i] = Math.random() * Math.PI * 2;
    return o;
  }, []);

  const dummy = useMemo(() => new Object3D(), []);

  useMemo(() => {
    // Set initial transforms
    for (let i = 0; i < BLADE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 24;
      const z = (Math.random() - 0.5) * 24;
      const h = 0.2 + Math.random() * 0.3;
      dummy.position.set(x, h / 2, z);
      dummy.scale.set(0.03 + Math.random() * 0.02, h, 0.03);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.updateMatrix();
      // Store position for animation
      (dummy as any).__pos = new Vector3(x, h / 2, z);
      (dummy as any).__scale = new THREE.Vector3(0.03 + Math.random() * 0.02, h, 0.03);
    }
  }, [dummy]);

  // Pre-compute positions and scales
  const bladeData = useMemo(() => {
    return Array.from({ length: BLADE_COUNT }, () => ({
      x: (Math.random() - 0.5) * 24,
      z: (Math.random() - 0.5) * 24,
      h: 0.2 + Math.random() * 0.3,
      sw: 0.03 + Math.random() * 0.02,
      ry: Math.random() * Math.PI,
      offset: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    for (let i = 0; i < BLADE_COUNT; i++) {
      const { x, z, h, sw, ry, offset } = bladeData[i];
      const sway = Math.sin(t * 1.2 + offset) * 0.08;
      dummy.position.set(x, h / 2, z);
      dummy.scale.set(sw, h, 0.03);
      dummy.rotation.set(0, ry, sway);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Color variation
  const colorArray = useMemo(() => {
    const arr = new Float32Array(BLADE_COUNT * 3);
    const c1 = new Color('#1a5c2e');
    const c2 = new Color('#2d8a47');
    for (let i = 0; i < BLADE_COUNT; i++) {
      const c = Math.random() < 0.5 ? c1 : c2;
      arr[i * 3] = c.r * (0.85 + Math.random() * 0.3);
      arr[i * 3 + 1] = c.g * (0.85 + Math.random() * 0.3);
      arr[i * 3 + 2] = c.b * (0.85 + Math.random() * 0.3);
    }
    return arr;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BLADE_COUNT]} castShadow>
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </boxGeometry>
      <meshLambertMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshLambertMaterial color="#0f3318" />
    </mesh>
  );
}

export default function GrassField3D() {
  return (
    <Canvas
      camera={{ position: [0, 3, 10], fov: 55 }}
      style={{ background: 'linear-gradient(to bottom, #0a1a0d 60%, #2d1a00 100%)' }}
      shadows
    >
      <fog attach="fog" args={['#0a1a0d', 12, 30]} />
      <ambientLight color="#8fbc8f" intensity={0.4} />
      <directionalLight
        position={[10, 15, 5]}
        intensity={1.2}
        color="#fffbe6"
        castShadow
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#4a7c59" />
      <Ground />
      <GrassBlades />
    </Canvas>
  );
}
