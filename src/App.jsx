import React, { useState } from 'react';
import Ribbon from './components/Ribbon';
// Agar aapne purani CSS index.css ya App.css me rakhi hai, to usey yahan import rehne dein
import './App.css'; 

export default function App() {
  // Ye state track karegi ke user ne konsa tool select kiya hua hai
  const [activeTool, setActiveTool] = useState('line');

  // Jab Ribbon me koi button click hoga to ye function chalega
  const handleToolSelect = (toolName) => {
    console.log("Selected Tool:", toolName);
    setActiveTool(toolName);
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#33373b', color: '#d8d8d8' }}>
      
      {/* Top Title Bar (Optional) */}
      <div style={{ height: '30px', backgroundColor: '#26292c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', borderBottom: '1px solid #4a4f54' }}>
        Code&Bugs Architect — React Version
      </div>

      {/* Hamara Naya Dynamic Ribbon */}
      <Ribbon activeTool={activeTool} onToolSelect={handleToolSelect} />

      {/* Main Workspace (Jahan 2D aur 3D Canvas aayega) */}
      <div className="main-workspace" style={{ flex: 1, display: 'flex', position: 'relative', backgroundColor: '#1b1d1f' }}>
        
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#5a6066' }}>
          <h2>2D / 3D Canvas Area (Coming Next)</h2>
          <p style={{ position: 'absolute', bottom: 20 }}>Current Tool: <strong style={{ color: '#4a9eff' }}>{activeTool.toUpperCase()}</strong></p>
        </div>

        {/* Side Panel (Layers / Properties) */}
        <div className="side-panel" style={{ width: '250px', backgroundColor: '#2d3033', borderLeft: '1px solid #4a4f54', padding: '10px' }}>
          <h3>Properties</h3>
          <p style={{ fontSize: '12px', color: '#8b9096' }}>Select an object to view details.</p>
        </div>

      </div>

    </div>
  );
}