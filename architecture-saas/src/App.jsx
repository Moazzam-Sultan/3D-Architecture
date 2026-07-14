import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

function App() {
  const [walls, setWalls] = useState([]);
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState("AutoCAD Mode Active. Type 'L' to draw lines or click 'Draw Line'.");
  
  // 🖱️ Drawing State
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [startPoint, setStartPoint] = useState(null); // Line kahan se shuru hui
  const [tempPoint, setTempPoint] = useState(null);   // Mouse kahan ghoom raha hai

  // 📐 Math Logic: Point A se Point B tak deewar banana
  const calculateWall = (p1, p2) => {
    const dx = p2[0] - p1[0];
    const dz = p2[2] - p1[2];
    
    // Distance Formula
    const length = Math.sqrt(dx * dx + dz * dz);
    // Angle Formula
    const rotation = -Math.atan2(dz, dx); 
    // Midpoint (Kyunki Three.js me box center se khara hota hai)
    const midX = (p1[0] + p2[0]) / 2;
    const midZ = (p1[2] + p2[2]) / 2;

    return { x: midX, z: midZ, length, width: 0.5, rotation, color: '#ffffff' };
  };

  // 🎯 Raycasting: Canvas par click handle karna
  const handlePointerDown = (e) => {
    if (!isDrawingMode) return;
    e.stopPropagation();
    
    // Mouse jis coordinate par click hua hai
    const { x, z } = e.point; 

    if (!startPoint) {
      // Pehla Click: Line shuru karein
      setStartPoint([x, 0, z]);
      setCommandHistory(`First point selected: [${x.toFixed(1)}, ${z.toFixed(1)}]. Click next point.`);
    } else {
      // Doosra Click: Line khatam karein aur Wall save karein
      const endPoint = [x, 0, z];
      const newWall = { id: Date.now(), ...calculateWall(startPoint, endPoint) };
      setWalls([...walls, newWall]);
      
      // Continuous drawing (AutoCAD style): Nayi line ka start point, purani ka end point hoga
      setStartPoint(endPoint);
      setTempPoint(null);
      setCommandHistory(`Line drawn. Continue clicking to join lines, or press ESC to stop.`);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawingMode || !startPoint) return;
    e.stopPropagation();
    setTempPoint([e.point.x, 0, e.point.z]);
  };

  const stopDrawing = () => {
    setIsDrawingMode(false);
    setStartPoint(null);
    setTempPoint(null);
    setCommandHistory("Drawing stopped.");
  };

  // ⌨️ AutoCAD Command Processor
  const handleCommandSubmit = (e) => {
    if (e.key === 'Enter') {
      const cmd = command.trim().toUpperCase();
      if (cmd === 'L' || cmd === 'LINE') {
        setIsDrawingMode(true);
        setCommandHistory(`Command: ${cmd} - Draw Mode Activated. Click on grid to start.`);
      } else if (cmd === 'ESC') {
        stopDrawing();
      } else {
        setCommandHistory(`Unknown Command: ${cmd}`);
      }
      setCommand("");
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'monospace', background: '#121212', color: '#fff' }}>
      
      {/* 🛠️ TOP AUTOCAD RIBBON */}
      <div style={{ height: '50px', background: '#2d2d30', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '15px', borderBottom: '1px solid #3e3e42' }}>
        <h2 style={{ margin: 0, color: '#ff4757', fontSize: '18px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>Code&Bugs CAD</h2>
        <button 
          onClick={() => setIsDrawingMode(!isDrawingMode)} 
          style={{ ...btnStyle, background: isDrawingMode ? '#ff4757' : '#4b4b4b' }}
        >
          {isDrawingMode ? '🛑 Stop Drawing (ESC)' : '✏️ Draw Line (L)'}
        </button>
        <button onClick={() => setWalls([])} style={{ ...btnStyle, background: '#4b4b4b' }}>🗑️ Clear All</button>
      </div>

      {/* 🌐 3D MODEL SPACE (BLACK AUTOCAD BG) */}
      <div 
        style={{ flex: 1, position: 'relative', cursor: isDrawingMode ? 'crosshair' : 'default' }}
        onContextMenu={(e) => { e.preventDefault(); stopDrawing(); }} // Right click to stop drawing
      >
        <Canvas camera={{ position: [0, 50, 0], fov: 45 }} style={{ background: '#000000' }}>
          <ambientLight intensity={1} />

          {/* 🎯 Invisible Plane for Raycasting (Mouse Clicks pakarne ke liye) */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.1, 0]} 
            onPointerDown={handlePointerDown} 
            onPointerMove={handlePointerMove}
          >
            <planeGeometry args={[1000, 1000]} />
            <meshBasicMaterial visible={false} />
          </mesh>

          {/* 🧱 Render Permanent Walls */}
          {walls.map((wall) => (
            <mesh key={wall.id} position={[wall.x, 4, wall.z]} rotation={[0, wall.rotation, 0]}>
              <boxGeometry args={[wall.length, 8, wall.width]} />
              <meshStandardMaterial color={wall.color} />
              {/* AutoCAD Line Edges */}
              <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(wall.length, 8, wall.width)]} />
                <lineBasicMaterial color="#ffffff" />
              </lineSegments>
            </mesh>
          ))}

          {/* 👻 Render Temporary Ghost Wall (Jab mouse move ho raha ho) */}
          {isDrawingMode && startPoint && tempPoint && (() => {
            const tempWall = calculateWall(startPoint, tempPoint);
            return (
              <mesh position={[tempWall.x, 4, tempWall.z]} rotation={[0, tempWall.rotation, 0]}>
                <boxGeometry args={[tempWall.length, 8, tempWall.width]} />
                <meshStandardMaterial color="#00ff00" transparent opacity={0.5} />
              </mesh>
            );
          })()}

          {/* AutoCAD Grid */}
          <Grid args={[100, 100]} cellSize={1} cellThickness={0.5} cellColor="#333333" sectionSize={5} sectionThickness={1} sectionColor="#555555" infiniteGrid={true} />

          {/* Mouse movement control (Disabled during drawing so screen doesn't spin) */}
          <OrbitControls enableRotate={!isDrawingMode} enablePan={true} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>

      {/* ⌨️ COMMAND LINE */}
      <div style={{ height: '40px', background: '#1e1e1e', display: 'flex', alignItems: 'center', padding: '0 20px', borderTop: '1px solid #3e3e42' }}>
        <span style={{ fontWeight: 'bold', marginRight: '15px', color: '#cccccc' }}>Command:</span>
        <input 
          type="text" 
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleCommandSubmit}
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', fontFamily: 'monospace', fontSize: '14px' }}
        />
        <span style={{ color: '#00ff00' }}>{commandHistory}</span>
      </div>

    </div>
  );
}

const btnStyle = { padding: '8px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '13px' };

export default App;