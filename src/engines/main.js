import { shapes, logCmd, resizeCanvas } from './cad-engine.js';
import { init3D, build3DScene, set3DMode, getIs3DMode } from './three-engine.js';

/* ================= 3D TOGGLE BUTTON ================= */
document.getElementById('btn-3d-toggle').onclick = function() {
    let currentState = !getIs3DMode();
    set3DMode(currentState);
    
    const wrap2D = document.getElementById('canvas-wrap');
    const wrap3D = document.getElementById('canvas-3d-wrap');
    
    if(currentState) {
        // Switch to 3D
        wrap2D.style.display = 'none';
        wrap3D.style.display = 'block';
        init3D();
        build3DScene(shapes); 
        logCmd('Switched to 3D View. Drag to rotate, scroll to zoom.');
        this.style.background = '#e63946';
        this.innerHTML = '🔙 Back to 2D Drafting';
    } else {
        // Switch to 2D
        wrap2D.style.display = 'flex';
        wrap3D.style.display = 'none';
        logCmd('Switched to 2D Drafting Mode.');
        this.style.background = '#4a9eff';
        this.innerHTML = '👁️ Switch to 3D View';
        resizeCanvas();
    }
};