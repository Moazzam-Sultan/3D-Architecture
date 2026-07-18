let is3DMode = false;
let scene3D, camera3D, renderer3D, controls3D;
let isInitialized = false;

export function init3D() {
    if (isInitialized) return;
    const wrap3D = document.getElementById('canvas-3d-wrap');
    
    scene3D = new THREE.Scene();
    scene3D.background = new THREE.Color('#f8fafc');
    
    camera3D = new THREE.PerspectiveCamera(45, wrap3D.clientWidth / wrap3D.clientHeight, 1, 1000);
    camera3D.position.set(0, 40, 50);

    renderer3D = new THREE.WebGLRenderer({ antialias: true });
    renderer3D.setSize(wrap3D.clientWidth, wrap3D.clientHeight);
    renderer3D.shadowMap.enabled = true;
    wrap3D.appendChild(renderer3D.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene3D.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene3D.add(dirLight);

    controls3D = new THREE.OrbitControls(camera3D, renderer3D.domElement);
    controls3D.maxPolarAngle = Math.PI / 2.1;

    const gridHelper = new THREE.GridHelper(200, 200, 0x94a3b8, 0xcbd5e1);
    scene3D.add(gridHelper);

    isInitialized = true;
    animate3D();
}

export function animate3D() {
    requestAnimationFrame(animate3D);
    if(is3DMode && renderer3D) {
      controls3D.update();
      renderer3D.render(scene3D, camera3D);
    }
}

export function build3DScene(shapes) {
    const objectsToRemove = [];
    scene3D.children.forEach(child => {
        if (child.name === "wall") objectsToRemove.push(child);
    });
    objectsToRemove.forEach(child => scene3D.remove(child));

    const material = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.6 });

    function createWall3D(p1, p2) {
        const dx = p2.x - p1.x;
        const dz = -(p2.y - p1.y); 
        const length = Math.hypot(dx, dz);
        
        if(length < 0.1) return; 
        
        const angle = -Math.atan2(dz, dx);
        const midX = (p1.x + p2.x) / 2;
        const midZ = -(p1.y + p2.y) / 2; 

        const geometry = new THREE.BoxGeometry(length, 20, 0.5); 
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(midX, 10, midZ); 
        mesh.rotation.y = angle;
        mesh.name = "wall";
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene3D.add(mesh);
    }

    shapes.forEach(s => {
        if (s.layer === 'Text') return;
        
        if (s.type === 'line') {
            createWall3D(s.pts[0], s.pts[1]);
        } else if (s.type === 'rect') {
            const a = s.pts[0], b = s.pts[1];
            createWall3D({x: a.x, y: a.y}, {x: b.x, y: a.y});
            createWall3D({x: b.x, y: a.y}, {x: b.x, y: b.y});
            createWall3D({x: b.x, y: b.y}, {x: a.x, y: b.y});
            createWall3D({x: a.x, y: b.y}, {x: a.x, y: a.y});
        } else if (s.type === 'polyline') {
            for(let i=0; i<s.pts.length-1; i++) {
                createWall3D(s.pts[i], s.pts[i+1]);
            }
        }
    });
}

export function resize3D(width, height) {
    if (camera3D && renderer3D) {
      camera3D.aspect = width / height;
      camera3D.updateProjectionMatrix();
      renderer3D.setSize(width, height);
    }
}

export function set3DMode(state) {
    is3DMode = state;
}

export function getIs3DMode() {
    return is3DMode;
}