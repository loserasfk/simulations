import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';
import { OIL_DATA, COLORS, SCENE_SCALE } from '../constants';

// --- Components ---

interface TankProps {
  position: [number, number, number];
  color: string;
  volume: number;
  label: string;
  remainder: number;
}

const Tank: React.FC<TankProps> = ({ position, color, volume, label, remainder }) => {
  // Height proportional to volume (visual scale)
  const height = Math.max(volume * 0.08, 0.5); 
  const radius = 1.5;

  return (
    <group position={position}>
      {/* Tank Label */}
      <Text position={[0, height + 1.2, 0]} fontSize={0.5} color="white" anchorY="bottom">
        {label}
      </Text>
      <Text position={[0, height + 0.6, 0]} fontSize={0.4} color="#fbbf24" anchorY="bottom">
        {volume} Litre
      </Text>

      {/* Liquid */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius - 0.1, radius - 0.1, height, 32]} />
        <meshPhysicalMaterial 
          color={color} 
          metalness={0.1} 
          roughness={0.2} 
          transmission={0.1} 
          transparent 
          opacity={0.9} 
        />
      </mesh>

      {/* Glass Container */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius, height + 0.2, 32, 1, true]} />
        <meshPhysicalMaterial 
          color="white" 
          metalness={0.1} 
          roughness={0.1} 
          transmission={0.9} 
          transparent 
          opacity={0.3} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Spout/Tap */}
      <mesh position={[radius, 1, 0]} rotation={[0, 0, -Math.PI / 2]}>
         <cylinderGeometry args={[0.2, 0.2, 1, 16]} />
         <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* Leftover Alert (Puddle logic) */}
      {remainder > 0 && (
        <group position={[0, 0, 0]}>
             <Text position={[0, -0.2, radius + 0.5]} fontSize={0.5} color={COLORS.ERROR} font="bold" anchorY="top">
                ARTAN: {remainder} L
             </Text>
             {/* Puddle on floor */}
             <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <circleGeometry args={[radius + 0.5, 32]} />
                <meshStandardMaterial color={COLORS.ERROR} opacity={0.8} transparent roughness={0.1} metalness={0.5} />
             </mesh>
             {/* Drip line */}
             <mesh position={[radius + 0.5, 0.5, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
                <meshStandardMaterial color={COLORS.ERROR} opacity={0.8} transparent />
             </mesh>
        </group>
      )}
    </group>
  );
};

interface BottleProps {
  position: [number, number, number];
  color: string;
  scale: number;
}

const Bottle: React.FC<BottleProps> = ({ position, color, scale }) => {
    // Scale bottle visually based on "Bottle Size" slightly
    // scale 1 -> 1x height
    // scale 50 -> ~2.5x height max limit to prevent huge bottles
    const visualScaleFactor = 1 + (Math.min(scale, 50) * 0.03); 
    const radius = 0.3;
    const bodyHeight = 0.8 * visualScaleFactor;
    
    return (
        <group position={position}>
            {/* Body */}
            <mesh position={[0, bodyHeight / 2, 0]} castShadow>
                <cylinderGeometry args={[radius, radius, bodyHeight, 12]} />
                <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
            </mesh>
            {/* Neck */}
            <mesh position={[0, bodyHeight + 0.2, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Cap */}
            <mesh position={[0, bodyHeight + 0.45, 0]}>
                 <cylinderGeometry args={[0.12, 0.12, 0.1, 8]} />
                 <meshStandardMaterial color="white" />
            </mesh>
            {/* Label */}
            <mesh position={[0, bodyHeight/2, radius + 0.01]}>
                <planeGeometry args={[0.4, bodyHeight * 0.6]} />
                <meshBasicMaterial color="white" />
            </mesh>
        </group>
    )
}

interface ShelfProps {
    countA: number;
    countB: number;
    bottleSize: number;
}

const Shelf: React.FC<ShelfProps> = ({ countA, countB, bottleSize }) => {
    // Calculate dimensions
    const rowSize = 8; // Bottles per row
    const spacingX = 0.8;
    const spacingZ = 0.8;
    
    // Height calculation to prevent clipping
    const bottleVisualScale = 1 + (Math.min(bottleSize, 50) * 0.03);
    const bottleTotalHeight = (0.8 * bottleVisualScale) + 0.6; // Body + Neck + Cap
    const shelfVerticalGap = Math.max(2, bottleTotalHeight + 0.5);

    // Shelf Depth calculation
    const rowsA = Math.ceil(countA / rowSize);
    const rowsB = Math.ceil(countB / rowSize);
    const maxRows = Math.max(rowsA, rowsB, 1);
    const shelfDepth = Math.max(2, maxRows * spacingZ + 0.5);
    const shelfWidth = rowSize * spacingX + 0.5;

    // Generate bottles data
    const bottlesA = useMemo(() => Array.from({ length: countA }), [countA]);
    const bottlesB = useMemo(() => Array.from({ length: countB }), [countB]);

    return (
        <group position={[3, 0, 0]}>
            {/* Main Rack Structure */}
            {/* Backboard */}
            <mesh position={[0, shelfVerticalGap * 1.5, -0.5]} receiveShadow>
                <boxGeometry args={[shelfWidth + 0.5, shelfVerticalGap * 3, 0.2]} />
                <meshStandardMaterial color={COLORS.SHELF} />
            </mesh>

            {/* Shelf Levels */}
            {[0, shelfVerticalGap, shelfVerticalGap * 2].map((y, i) => (
                 <mesh key={i} position={[0, y, shelfDepth/2 - 0.5]} receiveShadow>
                    <boxGeometry args={[shelfWidth + 0.5, 0.1, shelfDepth]} />
                    <meshStandardMaterial color="#b45309" />
                 </mesh>
            ))}

            {/* Labels */}
            <Text position={[-shelfWidth/2 - 0.5, shelfVerticalGap * 2 + 0.5, 0]} fontSize={0.4} color="white" anchorX="right">
                A Marka
            </Text>
             <Text position={[-shelfWidth/2 - 0.5, shelfVerticalGap + 0.5, 0]} fontSize={0.4} color="white" anchorX="right">
                B Marka
            </Text>

            {/* Bottles A (Orange) - Top Shelf */}
            <group position={[-(rowSize-1)*spacingX/2, shelfVerticalGap * 2 + 0.05, 0]}>
                {bottlesA.map((_, i) => {
                    const row = Math.floor(i / rowSize);
                    const col = i % rowSize;
                    return (
                        <Bottle 
                            key={`a-${i}`} 
                            position={[col * spacingX, 0, row * spacingZ]} 
                            color={OIL_DATA.A.COLOR} 
                            scale={bottleSize}
                        />
                    )
                })}
            </group>

            {/* Bottles B (Blue) - Middle Shelf */}
            <group position={[-(rowSize-1)*spacingX/2, shelfVerticalGap + 0.05, 0]}>
                {bottlesB.map((_, i) => {
                    const row = Math.floor(i / rowSize);
                    const col = i % rowSize;
                    return (
                        <Bottle 
                            key={`b-${i}`} 
                            position={[col * spacingX, 0, row * spacingZ]} 
                            color={OIL_DATA.B.COLOR} 
                            scale={bottleSize}
                        />
                    )
                })}
            </group>
        </group>
    )
}


// --- Main Scene ---
interface SceneProps {
  volA: number;
  volB: number;
  bottleSize: number;
}

export const Scene: React.FC<SceneProps> = ({ volA, volB, bottleSize }) => {
  const countA = Math.floor(volA / bottleSize);
  const remA = volA % bottleSize;
  
  const countB = Math.floor(volB / bottleSize);
  const remB = volB % bottleSize;

  return (
    <Canvas shadows camera={{ position: [0, 10, 20], fov: 45 }} gl={{ antialias: true }}>
      <color attach="background" args={['#27272a']} />
      <fog attach="fog" args={['#27272a', 30, 90]} />
      
      <Suspense fallback={null}>
        <Environment preset="warehouse" />
        <ambientLight intensity={0.6} />
        <directionalLight 
            position={[-10, 20, 10]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
        />
        
        <OrbitControls makeDefault target={[2, 4, 0]} minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />

        <group position={[-2, -2, 0]}>
            {/* Tanks */}
            <Tank 
                position={[-4, 0, 2]} 
                color={OIL_DATA.A.COLOR} 
                volume={volA} 
                label={OIL_DATA.A.LABEL}
                remainder={remA}
            />
            <Tank 
                position={[-0.5, 0, 2]} 
                color={OIL_DATA.B.COLOR} 
                volume={volB} 
                label={OIL_DATA.B.LABEL}
                remainder={remB}
            />

            {/* Shelf & Bottles */}
            <Shelf 
                countA={countA} 
                countB={countB} 
                bottleSize={bottleSize}
            />

            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color={COLORS.GROUND} roughness={0.8} />
            </mesh>
            <gridHelper args={[100, 100, '#525252', '#404040']} />
        </group>
      </Suspense>
    </Canvas>
  );
};
