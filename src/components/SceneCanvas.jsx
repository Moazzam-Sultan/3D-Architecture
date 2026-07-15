import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

function SceneCanvas({ length, width }) {
  // 🧱 Deewaron ki setting (Height aur Motai)
  const wallHeight = 10; // Standard 10 feet height
  const wallThickness = 0.5; // Deewar ki motai (thickness)
  const wallColor = '#e2e8f0'; // Light grey/white plaster color

  // 📐 Math Calculations for Positioning
  const halfL = length / 2;
  const halfW = width / 2;
  const hH = wallHeight / 2; // Height ka half taake deewar zameen ke upar khari ho

  // 4 Deewaron ka data (Position aur Scale/Size)
  const wallsData = [
    { name: 'North Wall', position: [0, hH, -halfW], scale: [length, wallHeight, wallThickness] },
    { name: 'South Wall', position: [0, hH, halfW], scale: [length, wallHeight, wallThickness] },
    { name: 'East Wall', position: [halfL, hH, 0], scale: [wallThickness, wallHeight, width] },
    { name: 'West Wall', position: [-halfL, hH, 0], scale: [wallThickness, wallHeight, width] },
  ];

  return (
    <div style={{ flex: 1, background: '#09090b', position: 'relative' }}>
      <Canvas 
        camera={{ position: [0, 20, 25], fov: 50 }}
        gl={{ antialias: true }} 
        shadows // Shadows enable kar diye taake realistic lagy
      >
        {/* ☀️ Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={1} castShadow />

        {/* 🏗️ 3D Walls Generation Loop */}
        {wallsData.map((wall, index) => (
          <mesh key={index} position={wall.position} receiveShadow castShadow>
            <boxGeometry args={wall.scale} />
            <meshStandardMaterial color={wallColor} roughness={0.8} />
          </mesh>
        ))}

        {/* 🔲 Dynamic Grid Floor */}
        <Grid 
          args={[length + 5, width + 5]} // Grid ko deewaron se thoda bara rakha hai
          cellSize={1}           
          cellThickness={0.8}
          cellColor="#3f3f46"    
          sectionSize={5}        
          sectionThickness={1.5}
          sectionColor="#a855f7" 
          fadeDistance={40}      
          infiniteGrid={false}   
        />

        {/* 🎥 Mouse Controls */}
        <OrbitControls 
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={5} 
          maxDistance={50} 
        />
      </Canvas>
    </div>
  );
}

export default SceneCanvas;