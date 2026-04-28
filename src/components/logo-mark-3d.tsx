"use client";

import { Canvas } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";

function normalizeArcDeg(startDeg: number, endDeg: number) {
  const s = startDeg;
  let e = endDeg;
  while (e < s) e += 360;
  return { start: THREE.MathUtils.degToRad(s), end: THREE.MathUtils.degToRad(e) };
}

function createLeafGeometry({
  outerRadius,
  innerRadius,
  startDeg,
  endDeg,
  depth = 0.14,
}: {
  outerRadius: number;
  innerRadius: number;
  startDeg: number;
  endDeg: number;
  depth?: number;
}) {
  const { start, end } = normalizeArcDeg(startDeg, endDeg);
  const midRadius = (outerRadius + innerRadius) / 2;
  const capRadius = (outerRadius - innerRadius) / 2;

  const endCapCenter = new THREE.Vector2(
    Math.cos(end) * midRadius,
    Math.sin(end) * midRadius,
  );
  const startCapCenter = new THREE.Vector2(
    Math.cos(start) * midRadius,
    Math.sin(start) * midRadius,
  );

  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerRadius, start, end, false);
  shape.absarc(endCapCenter.x, endCapCenter.y, capRadius, end, end + Math.PI, false);
  shape.absarc(0, 0, innerRadius, end, start, true);
  shape.absarc(
    startCapCenter.x,
    startCapCenter.y,
    capRadius,
    start + Math.PI,
    start,
    false,
  );
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 6,
    curveSegments: 80,
  });

  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

function Leaf({
  color,
  startDeg,
  endDeg,
  position,
  rotation,
}: {
  color: string;
  startDeg: number;
  endDeg: number;
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const geometry = React.useMemo(() => {
    return createLeafGeometry({
      outerRadius: 1.06,
      innerRadius: 0.64,
      startDeg,
      endDeg,
      depth: 0.16,
    });
  }, [endDeg, startDeg]);

  const material = React.useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      roughness: 0.28,
      metalness: 0.08,
      clearcoat: 0.9,
      clearcoatRoughness: 0.18,
      reflectivity: 0.4,
    });
  }, [color]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    />
  );
}

function LogoMarkScene({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <Leaf
        color="#16A34A"
        startDeg={28}
        endDeg={168}
        position={[0, 0, 0.02]}
        rotation={[
          THREE.MathUtils.degToRad(8),
          THREE.MathUtils.degToRad(-6),
          THREE.MathUtils.degToRad(18),
        ]}
      />
      <Leaf
        color="#A3E635"
        startDeg={208}
        endDeg={348}
        position={[0, 0, -0.02]}
        rotation={[
          THREE.MathUtils.degToRad(-6),
          THREE.MathUtils.degToRad(6),
          THREE.MathUtils.degToRad(18),
        ]}
      />
    </group>
  );
}

export function LogoMark3D({
  className,
  size = 220,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3.2], fov: 34, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          intensity={1.25}
          position={[2.5, 3.2, 4.5]}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight intensity={0.6} position={[-2.6, -1.1, 2.7]} />
        <LogoMarkScene scale={1.08} />
      </Canvas>
    </div>
  );
}
