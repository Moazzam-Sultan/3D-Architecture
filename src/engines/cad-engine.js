import { getIs3DMode, resize3D } from './three-engine.js';

/* ---------- Icons ---------- */
const ICONS = {
  line: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round"><line x1="4" y1="20" x2="20" y2="4"/></svg>',
  polyline: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,19 8,9 14,15 21,4"/></svg>',
  circle: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><circle cx="12" cy="12" r="8"/></svg>',
  rect: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><rect x="4" y="6" width="16" height="12" rx="0.5"/></svg>',
  arc: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round"><path d="M4 18 A 11 11 0 0 1 20 9"/></svg>',
  select: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linejoin="round"><path d="M5 3l6 15 2-6 6-2z"/></svg>',
  move: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/></svg>',
  erase: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linejoin="round"><path d="M18 13l-7 7H7l-4-4L14 5z"/><path d="M9 20H4"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><rect x="8" y="8" width="12" height="12" rx="1"/><rect x="4" y="4" width="12" height="12" rx="1"/></svg>',
  rotate: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round"><path d="M4 12a8 8 0 1 1 2.6 5.9"/><path d="M4 12V6M4 12h6"/></svg>',
  trim: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round"><circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><path d="M8 7.5L20 19M20 5L11.5 13.5"/></svg>',
  pan: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v9M9 5l3-3 3 3M6 20l-2-6 4-1M18 20l2-6-4-1M6 20c1 1.5 3.5 2 6 2s5-.5 6-2M8 11c-1 1-1 3 0 4"/></svg>',
  zoomext: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round"><circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20M5 10h10M10 5v10"/></svg>',
  new: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>',
  open: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M3 7h6l2 2h10v10H3z"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M4 4h13l3 3v13H4z"/><path d="M7 4v6h9V4M7 20v-6h10v6"/></svg>',
  undo: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round"><path d="M4 10h9a5 5 0 0 1 0 10h-2"/><path d="M8 5L4 10l4 5"/></svg>',
  redo: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round"><path d="M20 10h-9a5 5 0 0 0 0 10h2"/><path d="M16 5l4 5-4 5"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeoff: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round"><path d="M3 3l18 18"/><path d="M10.6 5.2A11 11 0 0 1 12 5c7 0 11 7 11 7a13.5 13.5 0 0 1-3.2 3.8M6.5 6.7C3.4 8.6 1 12 1 12s4 7 11 7a10.6 10.6 0 0 0 4-.8"/><path d="M9.5 9.5a3 3 0 0 0 4.2 4.2"/></svg>',
};

/* ---------- State ---------- */
const canvas = document.getElementById('cad-canvas');
const ctx = canvas.getContext('2d');
const canvasWrap = document.getElementById('canvas-wrap');

let view = { offsetX: 0, offsetY: 0, scale: 40 };
let grid = { visible: true, snap: true };
let orthoMode = false;
let tool = 'select';
let nextId = 1;

export let shapes = []; 

let layers = [
  { name: '0',          color: '#d8d8d8', visible: true },
  { name: 'Walls',      color: '#4fc3f7', visible: true },
  { name: 'Dimensions', color: '#81c784', visible: true },
  { name: 'Text',       color: '#ffd54f', visible: true },
];
let currentLayer = '0';
let selected = new Set();

let drawState = { active: false, type: null, pts: [] };
let mouseWorld = { x: 0, y: 0 };
let mouseInCanvas = false;
let isSpaceDown = false;
let panState = { active: false, lastX: 0, lastY: 0 };
let dragState = { active: false, lastWorld: null, moved: false };
let rubberBand = null;

let undoStack = [];
let redoStack = [];

let typedBuffer = '';
let inputActive = false;
let lastScreenPt = { sx: 0, sy: 0 };

let copyState = { base:null, sourceIds:[] };
let rotateState = { base:null, originals:null };
let trimState = { active:false, cuttingIds:new Set(), confirmed:false };

shapes = [
  { id: nextId++, type: 'rect',     pts: [{x:0,y:0},{x:12,y:8}], layer: 'Walls' },
  { id: nextId++, type: 'line',     pts: [{x:6,y:0},{x:6,y:8}], layer: 'Walls' },
  { id: nextId++, type: 'circle',   pts: [{x:3,y:4},{x:3,y:6}], layer: '0' },
  { id: nextId++, type: 'polyline', pts: [{x:8,y:2},{x:10,y:2},{x:10,y:5},{x:9,y:6}], layer: 'Dimensions' },
];

/* ---------- Coordinate transforms ---------- */
function worldToScreen(x, y){
  return { sx: canvas.width/2 + view.offsetX + x*view.scale, sy: canvas.height/2 + view.offsetY - y*view.scale };
}
function screenToWorld(sx, sy){
  return { x: (sx - canvas.width/2 - view.offsetX)/view.scale, y: -(sy - canvas.height/2 - view.offsetY)/view.scale };
}
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function fmt(pt){ return '(' + pt.x.toFixed(2) + ', ' + pt.y.toFixed(2) + ')'; }
function snapPoint(pt){
  if (!grid.snap) return { x: pt.x, y: pt.y };
  return { x: Math.round(pt.x), y: Math.round(pt.y) };
}
function applyOrtho(from, to){
  return Math.abs(to.x-from.x) > Math.abs(to.y-from.y) ? { x: to.x, y: from.y } : { x: from.x, y: to.y };
}

/* ---------- OSNAP Logic ---------- */
function objectSnapPoint(worldPt) {
  const osnapBtn = document.getElementById('st-osnap');
  if (!osnapBtn || !osnapBtn.classList.contains('on')) return worldPt;

  const SNAP_DIST = 10 / view.scale; 
  let closestPt = null;
  let minDist = SNAP_DIST;

  shapes.forEach(s => {
    s.pts.forEach(p => {
      let d = Math.hypot(p.x - worldPt.x, p.y - worldPt.y);
      if (d < minDist) {
        minDist = d;
        closestPt = { x: p.x, y: p.y };
      }
    });
  });

  return closestPt || worldPt;
}

function parseDistance(str){
  str = str.trim();
  if (!str) return null;
  let m = str.match(/^(-?\d+(?:\.\d+)?)'\s*(\d+(?:\.\d+)?)"$/);
  if (m) return parseFloat(m[1]) + parseFloat(m[2])/12;
  m = str.match(/^(-?\d+(?:\.\d+)?)'$/);
  if (m) return parseFloat(m[1]);
  m = str.match(/^(-?\d+(?:\.\d+)?)"$/);
  if (m) return parseFloat(m[1])/12;
  m = str.match(/^-?\d+(?:\.\d+)?$/);
  if (m) return parseFloat(str);
  return null;
}

function directionPoint(from, length){
  let dx = mouseWorld.x-from.x, dy = mouseWorld.y-from.y;
  if (orthoMode && tool==='line'){
    if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0;
  }
  let dist = Math.hypot(dx,dy);
  if (dist < 1e-6){ dx = 1; dy = 0; dist = 1; }
  return { x: from.x + dx/dist*length, y: from.y + dy/dist*length };
}

function parseDimensions(str){
  const s = str.trim();
  const m = s.match(/^(.+?)\s*[,xX]\s*(.+)$/);
  if (!m) return null;
  const w = parseDistance(m[1].trim());
  const h = parseDistance(m[2].trim());
  if (w===null || h===null || isNaN(w) || isNaN(h)) return null;
  return { w, h };
}

function commitTypedLength(){
  if (tool==='rect'){
    const dims = parseDimensions(typedBuffer);
    if (!dims){
      logCmd('Invalid input "' + typedBuffer + '" — try 12x8, 12,8, 12\'x8\', or 12 x 8');
      typedBuffer = ''; inputActive = false; render();
      return;
    }
    const from = drawState.pts[0];
    const signX = (mouseWorld.x >= from.x) ? 1 : -1;
    const signY = (mouseWorld.y >= from.y) ? 1 : -1;
    const pt = { x: from.x + dims.w*signX, y: from.y + dims.h*signY };
    typedBuffer = ''; inputActive = false;
    handleDrawClick(pt);
    return;
  }
  const length = parseDistance(typedBuffer);
  if (length===null || isNaN(length)){
    logCmd('Invalid input "' + typedBuffer + '" — try 10, 10\', 6", or 5\'6"');
    typedBuffer = ''; inputActive = false; render();
    return;
  }
  const from = drawState.pts[drawState.pts.length-1];
  const pt = directionPoint(from, length);
  typedBuffer = ''; inputActive = false;
  if (tool==='polyline'){
    drawState.pts.push(pt);
    logCmd('Specify next point: ' + fmt(pt) + '  (length ' + length.toFixed(2) + "')");
    render();
  } else {
    handleDrawClick(pt);
  }
}

/* ---------- Geometry helpers ---------- */
function distToSegment(p, a, b){
  const dx=b.x-a.x, dy=b.y-a.y;
  const lenSq = dx*dx+dy*dy;
  let t = lenSq===0 ? 0 : ((p.x-a.x)*dx+(p.y-a.y)*dy)/lenSq;
  t = clamp(t,0,1);
  const cx=a.x+t*dx, cy=a.y+t*dy;
  return Math.hypot(p.x-cx, p.y-cy);
}
function shapeDistance(s, pt){
  if (s.type==='line') return distToSegment(pt, s.pts[0], s.pts[1]);
  if (s.type==='rect'){
    const [a,b]=s.pts;
    const x1=Math.min(a.x,b.x), x2=Math.max(a.x,b.x), y1=Math.min(a.y,b.y), y2=Math.max(a.y,b.y);
    const c=[{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2},{x:x1,y:y2}];
    let min=Infinity;
    for(let i=0;i<4;i++) min=Math.min(min, distToSegment(pt, c[i], c[(i+1)%4]));
    return min;
  }
  if (s.type==='circle'){
    const c=s.pts[0], r=Math.hypot(s.pts[1].x-c.x, s.pts[1].y-c.y);
    return Math.abs(Math.hypot(pt.x-c.x, pt.y-c.y)-r);
  }
  if (s.type==='polyline'){
    let min=Infinity;
    for(let i=0;i<s.pts.length-1;i++) min=Math.min(min, distToSegment(pt, s.pts[i], s.pts[i+1]));
    return min;
  }
  return Infinity;
}
function hitTestShapes(pt){
  const threshold = 6/view.scale;
  for (let i=shapes.length-1;i>=0;i--){
    const s = shapes[i];
    const layer = layers.find(l=>l.name===s.layer);
    if (layer && !layer.visible) continue;
    if (shapeDistance(s, pt) <= threshold) return s;
  }
  return null;
}
function shapeBBox(s){
  const xs=s.pts.map(p=>p.x), ys=s.pts.map(p=>p.y);
  let x1=Math.min(...xs), x2=Math.max(...xs), y1=Math.min(...ys), y2=Math.max(...ys);
  if (s.type==='circle'){
    const c=s.pts[0], r=Math.hypot(s.pts[1].x-c.x, s.pts[1].y-c.y);
    x1=c.x-r; x2=c.x+r; y1=c.y-r; y2=c.y+r;
  }
  return { x1,y1,x2,y2 };
}

/* ---------- Undo / redo ---------- */
function pushUndo(){
  undoStack.push(JSON.stringify(shapes));
  if (undoStack.length>50) undoStack.shift();
  redoStack = [];
}
function undo(){
  if (!undoStack.length){ logCmd('Nothing to undo.'); return; }
  redoStack.push(JSON.stringify(shapes));
  shapes = JSON.parse(undoStack.pop());
  selected.clear(); updatePropertiesPanel(); render();
  logCmd('* Undo *');
}
function redo(){
  if (!redoStack.length){ logCmd('Nothing to redo.'); return; }
  undoStack.push(JSON.stringify(shapes));
  shapes = JSON.parse(redoStack.pop());
  selected.clear(); updatePropertiesPanel(); render();
  logCmd('* Redo *');
}

/* ---------- Modify tools: COPY ---------- */
function startCopy(){
  if (!selected.size){ logCmd('Select objects first, then use COPY.'); return; }
  tool = 'copy';
  copyState = { base:null, sourceIds:[...selected] };
  document.querySelectorAll('.ribbon-btn[data-tool]').forEach(b=>b.classList.toggle('active', b.dataset.tool===tool));
  canvas.style.cursor = 'crosshair';
  toolHint.textContent = HINTS.copy;
  logCmd('Specify base point:');
  render();
}
function performCopyTo(pt){
  const delta = { x: pt.x-copyState.base.x, y: pt.y-copyState.base.y };
  pushUndo();
  const newIds = [];
  copyState.sourceIds.forEach(id=>{
    const src = shapes.find(s=>s.id===id);
    if (!src) return;
    const clone = { id:nextId++, type:src.type, layer:src.layer, pts: src.pts.map(p=>({x:p.x+delta.x, y:p.y+delta.y})) };
    shapes.push(clone);
    newIds.push(clone.id);
  });
  selected = new Set(newIds);
  logCmd(newIds.length + ' copied.');
  updatePropertiesPanel(); renderLayers();
  render();
}
function commitCopyLength(){
  const length = parseDistance(typedBuffer);
  typedBuffer = ''; inputActive = false;
  if (length===null || isNaN(length)){ logCmd('Invalid input.'); render(); return; }
  const pt = directionPoint(copyState.base, length);
  performCopyTo(pt);
  logCmd('Specify second point for another copy, or Esc to finish:');
}

/* ---------- Modify tools: ROTATE ---------- */
function rotatePoint(p, base, angle){
  const dx=p.x-base.x, dy=p.y-base.y;
  const cos=Math.cos(angle), sin=Math.sin(angle);
  return { x: base.x + dx*cos - dy*sin, y: base.y + dx*sin + dy*cos };
}
function startRotate(){
  if (!selected.size){ logCmd('Select objects first, then use ROTATE.'); return; }
  tool = 'rotate';
  rotateState = { base:null, originals:null };
  document.querySelectorAll('.ribbon-btn[data-tool]').forEach(b=>b.classList.toggle('active', b.dataset.tool===tool));
  canvas.style.cursor = 'crosshair';
  toolHint.textContent = HINTS.rotate;
  logCmd('Specify base point:');
  render();
}
function finalizeRotate(angle){
  rotateState.originals.forEach((pts,id)=>{
    const s = shapes.find(sh=>sh.id===id);
    if (s) s.pts = pts.map(p=>rotatePoint(p, rotateState.base, angle));
  });
  logCmd('Rotated ' + rotateState.originals.size + ' object(s) by ' + (angle*180/Math.PI).toFixed(1) + '°.');
  rotateState = { base:null, originals:null };
  setTool('select');
  render();
}
function commitRotateAngle(){
  const deg = parseFloat(typedBuffer);
  typedBuffer = ''; inputActive = false;
  if (isNaN(deg)){ logCmd('Invalid angle.'); render(); return; }
  finalizeRotate(deg*Math.PI/180);
}

/* ---------- Modify tools: TRIM ---------- */
function lineLineIntersectionT(A,B,C,D){
  const r = {x:B.x-A.x, y:B.y-A.y};
  const s = {x:D.x-C.x, y:D.y-C.y};
  const rxs = r.x*s.y - r.y*s.x;
  if (Math.abs(rxs) < 1e-9) return null;
  const qp = {x:C.x-A.x, y:C.y-A.y};
  const t = (qp.x*s.y - qp.y*s.x)/rxs;
  const u = (qp.x*r.y - qp.y*r.x)/rxs;
  if (t>1e-6 && t<1-1e-6 && u>-1e-6 && u<1+1e-6) return t;
  return null;
}
function lineCircleIntersectionTs(A,B,c,r){
  const d = {x:B.x-A.x, y:B.y-A.y};
  const f = {x:A.x-c.x, y:A.y-c.y};
  const a = d.x*d.x+d.y*d.y;
  const b = 2*(f.x*d.x+f.y*d.y);
  const cc = f.x*f.x+f.y*f.y - r*r;
  const disc = b*b-4*a*cc;
  if (disc<0 || a<1e-9) return [];
  const sq = Math.sqrt(disc);
  const t1=(-b-sq)/(2*a), t2=(-b+sq)/(2*a);
  return [t1,t2].filter(t=>t>1e-6 && t<1-1e-6);
}
function collectTrimTs(target, cuttingShapes){
  const A=target.pts[0], B=target.pts[1];
  const ts=[];
  cuttingShapes.forEach(cs=>{
    if (cs.id===target.id) return;
    if (cs.type==='line'){
      const t=lineLineIntersectionT(A,B,cs.pts[0],cs.pts[1]);
      if (t!==null) ts.push(t);
    } else if (cs.type==='rect'){
      const [a,b]=cs.pts;
      const x1=Math.min(a.x,b.x), x2=Math.max(a.x,b.x), y1=Math.min(a.y,b.y), y2=Math.max(a.y,b.y);
      const corners=[{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2},{x:x1,y:y2}];
      for(let i=0;i<4;i++){ const t=lineLineIntersectionT(A,B,corners[i],corners[(i+1)%4]); if(t!==null) ts.push(t); }
    } else if (cs.type==='polyline'){
      for(let i=0;i<cs.pts.length-1;i++){ const t=lineLineIntersectionT(A,B,cs.pts[i],cs.pts[i+1]); if(t!==null) ts.push(t); }
    } else if (cs.type==='circle'){
      const c=cs.pts[0], r=Math.hypot(cs.pts[1].x-c.x, cs.pts[1].y-c.y);
      lineCircleIntersectionTs(A,B,c,r).forEach(t=>ts.push(t));
    }
  });
  return ts;
}
function performTrim(target, clickPt, cuttingShapes){
  if (target.type!=='line'){
    logCmd('TRIM only supports straight lines in this demo.');
    return;
  }
  const A=target.pts[0], B=target.pts[1];
  const dx=B.x-A.x, dy=B.y-A.y;
  const lenSq = dx*dx+dy*dy || 1;
  let tClick = ((clickPt.x-A.x)*dx + (clickPt.y-A.y)*dy)/lenSq;
  tClick = clamp(tClick,0,1);
  const interior = collectTrimTs(target, cuttingShapes).sort((a,b)=>a-b);
  if (!interior.length){ logCmd('No intersection found — nothing trimmed.'); return; }
  let tLow=0, tHigh=1;
  interior.forEach(t=>{
    if (t<=tClick && t>tLow) tLow=t;
    if (t>=tClick && t<tHigh) tHigh=t;
  });
  pushUndo();
  const newShapes=[];
  if (tLow>1e-6) newShapes.push({ id:nextId++, type:'line', layer:target.layer, pts:[ {x:A.x,y:A.y}, {x:A.x+dx*tLow,y:A.y+dy*tLow} ] });
  if (tHigh<1-1e-6) newShapes.push({ id:nextId++, type:'line', layer:target.layer, pts:[ {x:A.x+dx*tHigh,y:A.y+dy*tHigh}, {x:B.x,y:B.y} ] });
  shapes = shapes.filter(s=>s.id!==target.id).concat(newShapes);
  selected = new Set(newShapes.map(s=>s.id));
  logCmd('1 object trimmed.');
  updatePropertiesPanel(); renderLayers();
  render();
}
function startTrim(){
  tool = 'trim';
  trimState = { active:true, cuttingIds:new Set(), confirmed:false };
  selected.clear();
  document.querySelectorAll('.ribbon-btn[data-tool]').forEach(b=>b.classList.toggle('active', b.dataset.tool===tool));
  canvas.style.cursor = 'crosshair';
  toolHint.textContent = HINTS.trim;
  logCmd('Select cutting edges, then press Enter. Press Enter immediately to use all objects as cutting edges.');
  updatePropertiesPanel(); renderLayers();
  render();
}

/* ---------- Command line ---------- */
const historyEl = document.getElementById('command-history');
const cmdInput = document.getElementById('cmd-input');
let cmdLog = ['AutoCAD Web starting sequence complete.'];

export function logCmd(msg){
  cmdLog.push(msg);
  if (cmdLog.length>200) cmdLog.shift();
  historyEl.innerHTML = cmdLog.map(l=>'<div>'+escapeHtml(l)+'</div>').join('');
  historyEl.scrollTop = historyEl.scrollHeight;
}
function escapeHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function runCommand(raw){
  const text = raw.trim();
  if (!text) return;
  logCmd('<span class="cmd-echo">Command: ' + escapeHtml(text) + '</span>');
  const t = text.toLowerCase();
  const startMap = { co:startCopy, copy:startCopy, ro:startRotate, rotate:startRotate, tr:startTrim, trim:startTrim };
  if (startMap[t]){ startMap[t](); return; }
  const map = {
    l:'line', line:'line',
    rec:'rect', rectangle:'rect', rect:'rect',
    c:'circle', circle:'circle',
    pl:'polyline', polyline:'polyline',
    e:'erase', erase:'erase',
    m:'select', move:'select',
    v:'select', select:'select',
    pan:'pan',
  };
  if (map[t]){
    setTool(map[t]);
    if (t==='m'||t==='move') logCmd('Select objects to move, then drag them into place.');
    return;
  }
  if (t==='z' || t==='zoom' || t==='zoom extents' || t==='ze'){ zoomExtents(); logCmd('Regenerating drawing.'); return; }
  if (t==='u' || t==='undo'){ undo(); return; }
  if (t==='redo'){ redo(); return; }
  logCmd('Unknown command "' + text + '". Press F1 for help.');
}
cmdInput.addEventListener('keydown', e=>{
  if (e.key==='Enter'){
    const raw = cmdInput.value;
    const drawingInProgress = drawState.active && (tool==='line' || tool==='polyline' || tool==='circle' || tool==='rect');
    if (drawingInProgress && raw.trim()){
      typedBuffer = raw.trim();
      inputActive = false;
      commitTypedLength();
      cmdInput.value = '';
      return;
    }
    runCommand(raw);
    cmdInput.value='';
  }
});

/* ---------- Tool switching ---------- */
const toolHint = document.getElementById('tool-hint');
const HINTS = {
  select: 'Select objects — drag to move, drag empty space to box-select',
  line: 'LINE — click first point, then click, or type a length (10, 10\', 6", 5\'6") + Enter',
  rect: 'RECTANGLE — specify first corner, then click opposite corner, or type dimensions (12x8 or 12,8) in the Command line + Enter',
  circle: 'CIRCLE — click center, then click, or type a radius (10, 10\', 6") + Enter',
  polyline: 'POLYLINE — click points, or type lengths + Enter; double-click/Enter to finish',
  erase: 'ERASE — click an object to delete it',
  pan: 'PAN — click and drag to pan the view',
  copy: 'COPY — specify base point, then destination point (or type a distance) + Enter',
  rotate: 'ROTATE — specify base point, then drag to rotate or type degrees + Enter',
  trim: 'TRIM — click cutting edge(s), press Enter, then click the segment(s) to trim',
};
function setTool(name){
  tool = name;
  drawState = { active:false, type:null, pts:[] };
  toolHint.textContent = HINTS[name] || name;
  canvas.style.cursor = (name==='select') ? 'default' : (name==='pan' ? 'grab' : 'crosshair');
  document.querySelectorAll('.ribbon-btn[data-tool]').forEach(b=>{
    b.classList.toggle('active', b.dataset.tool===name);
  });
  logCmd(name.toUpperCase());
  render();
}

/* ---------- Drawing click handling ---------- */
function handleDrawClick(pt){
  if (!drawState.active){
    drawState = { active:true, type:tool, pts:[pt] };
    logCmd('Specify first point: ' + fmt(pt));
    render();
    return;
  }
  let p = pt;
  if (tool==='line' && orthoMode) p = applyOrtho(drawState.pts[drawState.pts.length-1], pt);
  if (tool==='rect' || tool==='circle'){
    pushUndo();
    shapes.push({ id:nextId++, type:tool, pts:[drawState.pts[0], p], layer:currentLayer });
    logCmd(tool==='rect' ? 'Specify opposite corner: '+fmt(p) : 'Specify radius point: '+fmt(p));
    drawState = { active:false, type:null, pts:[] };
  } else if (tool==='line'){
    pushUndo();
    shapes.push({ id:nextId++, type:'line', pts:[drawState.pts[0], p], layer:currentLayer });
    logCmd('Specify next point or [Enter to end]: ');
    drawState = { active:true, type:'line', pts:[p] };
  }
  render();
}

/* ---------- Mouse interaction ---------- */
function canvasPoint(e){
  const rect = canvas.getBoundingClientRect();
  return { sx: e.clientX-rect.left, sy: e.clientY-rect.top };
}

canvas.addEventListener('mousedown', e=>{
  const { sx, sy } = canvasPoint(e);
  const world = screenToWorld(sx, sy);
  const snapped = snapPoint(world);

  if (isSpaceDown || e.button===1 || tool==='pan'){
    panState = { active:true, lastX:e.clientX, lastY:e.clientY };
    canvas.style.cursor = 'grabbing';
    return;
  }
  if (e.button!==0) return;

  if (tool==='line' || tool==='rect' || tool==='circle'){
    handleDrawClick(snapped);
    return;
  }
  if (tool==='polyline'){
    drawState.active = true; drawState.type = 'polyline';
    drawState.pts.push(snapped);
    logCmd(drawState.pts.length===1 ? 'Specify first point: '+fmt(snapped) : 'Specify next point: '+fmt(snapped));
    render();
    return;
  }
  if (tool==='erase'){
    const hit = hitTestShapes(world);
    if (hit){
      pushUndo();
      shapes = shapes.filter(s=>s.id!==hit.id);
      logCmd('1 found, 1 deleted.');
      render();
    } else {
      logCmd('Nothing found.');
    }
    return;
  }
  if (tool==='copy'){
    if (!copyState.base){
      copyState.base = snapped;
      logCmd('Specify second point of displacement, or type a distance:');
      render();
    } else {
      performCopyTo(snapped);
      logCmd('Specify second point for another copy, or Esc to finish:');
    }
    return;
  }
  if (tool==='rotate'){
    if (!rotateState.base){
      pushUndo();
      rotateState.base = snapped;
      rotateState.originals = new Map();
      selected.forEach(id=>{
        const s = shapes.find(sh=>sh.id===id);
        if (s) rotateState.originals.set(id, s.pts.map(p=>({x:p.x,y:p.y})));
      });
      logCmd('Specify rotation angle, or type degrees and press Enter:');
      render();
    } else {
      const angle = Math.atan2(mouseWorld.y-rotateState.base.y, mouseWorld.x-rotateState.base.x);
      finalizeRotate(angle);
    }
    return;
  }
  if (tool==='trim'){
    const hit = hitTestShapes(world);
    if (!trimState.confirmed){
      if (hit){
        if (trimState.cuttingIds.has(hit.id)) trimState.cuttingIds.delete(hit.id);
        else trimState.cuttingIds.add(hit.id);
        selected = new Set(trimState.cuttingIds);
        updatePropertiesPanel(); renderLayers();
        render();
      }
    } else {
      if (hit){
        const cuttingShapes = trimState.cuttingIds.size ? shapes.filter(s=>trimState.cuttingIds.has(s.id)) : shapes;
        performTrim(hit, world, cuttingShapes);
      } else {
        logCmd('Nothing found.');
      }
    }
    return;
  }
  if (tool==='select'){
    const hit = hitTestShapes(world);
    if (hit){
      if (!e.shiftKey && !selected.has(hit.id)) selected.clear();
      selected.add(hit.id);
      dragState = { active:true, lastWorld:world, moved:false };
    } else {
      if (!e.shiftKey) selected.clear();
      rubberBand = { x1:sx, y1:sy, x2:sx, y2:sy };
    }
    updatePropertiesPanel();
    renderLayers();
    render();
  }
});

canvas.addEventListener('mousemove', e=>{
  const { sx, sy } = canvasPoint(e);
  lastScreenPt = { sx, sy };
  
  // OSNAP Added Here 🔥
  let rawWorld = screenToWorld(sx, sy);
  mouseWorld = objectSnapPoint(rawWorld);
  
  updateCoordsReadout(mouseWorld);

  if (tool==='rotate' && rotateState.base){
    const angle = Math.atan2(mouseWorld.y-rotateState.base.y, mouseWorld.x-rotateState.base.x);
    rotateState.originals.forEach((pts,id)=>{
      const s = shapes.find(sh=>sh.id===id);
      if (s) s.pts = pts.map(p=>rotatePoint(p, rotateState.base, angle));
    });
    render();
    return;
  }

  if (panState.active){
    const dx = e.clientX-panState.lastX, dy = e.clientY-panState.lastY;
    view.offsetX += dx; view.offsetY += dy;
    panState.lastX = e.clientX; panState.lastY = e.clientY;
    render(); return;
  }
  if (dragState.active){
    if (!dragState.moved){ pushUndo(); dragState.moved = true; }
    const dx = mouseWorld.x - dragState.lastWorld.x, dy = mouseWorld.y - dragState.lastWorld.y;
    selected.forEach(id=>{
      const s = shapes.find(sh=>sh.id===id);
      if (s) s.pts.forEach(p=>{ p.x+=dx; p.y+=dy; });
    });
    dragState.lastWorld = mouseWorld;
    render(); return;
  }
  if (rubberBand){
    rubberBand.x2 = sx; rubberBand.y2 = sy;
    render(); return;
  }
  render();
});

canvas.addEventListener('mouseenter', ()=>{ mouseInCanvas = true; });
canvas.addEventListener('mouseleave', ()=>{ mouseInCanvas = false; render(); });

window.addEventListener('mouseup', ()=>{
  if (panState.active){ panState.active=false; canvas.style.cursor = tool==='pan'?'grab':(tool==='select'?'default':'crosshair'); }
  if (dragState.active){ dragState.active=false; updatePropertiesPanel(); }
  if (rubberBand){
    const x1=Math.min(rubberBand.x1,rubberBand.x2), x2=Math.max(rubberBand.x1,rubberBand.x2);
    const y1=Math.min(rubberBand.y1,rubberBand.y2), y2=Math.max(rubberBand.y1,rubberBand.y2);
    if (Math.abs(x2-x1)>3 || Math.abs(y2-y1)>3){
      const wA = screenToWorld(x1,y1), wB = screenToWorld(x2,y2);
      const bx1=Math.min(wA.x,wB.x), bx2=Math.max(wA.x,wB.x);
      const by1=Math.min(wA.y,wB.y), by2=Math.max(wA.y,wB.y);
      shapes.forEach(s=>{
        const bb = shapeBBox(s);
        if (bb.x2>=bx1 && bb.x1<=bx2 && bb.y2>=by1 && bb.y1<=by2) selected.add(s.id);
      });
      updatePropertiesPanel();
    }
    rubberBand = null;
    render();
  }
});

canvas.addEventListener('dblclick', ()=>{
  if (drawState.active && drawState.type==='polyline' && drawState.pts.length>=2){
    pushUndo();
    shapes.push({ id:nextId++, type:'polyline', pts:drawState.pts.slice(), layer:currentLayer });
    drawState = { active:false, type:null, pts:[] };
    logCmd('Polyline complete.');
    render();
  }
});

canvas.addEventListener('wheel', e=>{
  e.preventDefault();
  const { sx, sy } = canvasPoint(e);
  const before = screenToWorld(sx, sy);
  const factor = e.deltaY<0 ? 1.1 : 0.9;
  view.scale = clamp(view.scale*factor, 4, 500);
  view.offsetX = sx - canvas.width/2 - before.x*view.scale;
  view.offsetY = sy - canvas.height/2 + before.y*view.scale;
  updateZoomPct();
  render();
}, { passive:false });

canvas.addEventListener('contextmenu', e=>e.preventDefault());

/* ---------- Keyboard ---------- */
window.addEventListener('keydown', e=>{
  const tag = document.activeElement.tagName;
  if (tag==='INPUT' || tag==='SELECT' || tag==='TEXTAREA') return;

  if (e.code==='Space'){ isSpaceDown=true; canvas.style.cursor='grab'; e.preventDefault(); return; }

  const typing = drawState.active && (tool==='line' || tool==='polyline' || tool==='circle' || tool==='rect');
  let charPattern = null;
  if (drawState.active && (tool==='line' || tool==='polyline' || tool==='circle')) charPattern = /^[0-9.'"]$/;
  else if (drawState.active && tool==='rect') charPattern = /^[0-9.'",xX]$/;
  else if (tool==='rotate' && rotateState.base) charPattern = /^[0-9.-]$/;
  else if (tool==='copy' && copyState.base) charPattern = /^[0-9.'"]$/;

  if (charPattern && charPattern.test(e.key)){
    typedBuffer += e.key;
    inputActive = true;
    e.preventDefault();
    render();
    return;
  }
  if (charPattern && typedBuffer && e.key==='Backspace'){
    typedBuffer = typedBuffer.slice(0,-1);
    inputActive = typedBuffer.length>0;
    e.preventDefault();
    render();
    return;
  }

  if (e.key==='Escape'){
    if (typedBuffer){ typedBuffer=''; inputActive=false; render(); return; }
    if (tool==='rotate' && rotateState.base){
      rotateState.originals.forEach((pts,id)=>{
        const s = shapes.find(sh=>sh.id===id);
        if (s) s.pts = pts.map(p=>({x:p.x,y:p.y}));
      });
      rotateState = { base:null, originals:null };
      setTool('select');
      logCmd('*Cancel*');
      render();
      return;
    }
    if (tool==='copy'){
      copyState = { base:null, sourceIds:[] };
      setTool('select');
      logCmd('*Cancel*');
      render();
      return;
    }
    if (tool==='trim'){
      trimState = { active:false, cuttingIds:new Set(), confirmed:false };
      selected.clear();
      setTool('select');
      updatePropertiesPanel(); renderLayers();
      logCmd('*Cancel*');
      render();
      return;
    }
    drawState = { active:false, type:null, pts:[] };
    selected.clear(); rubberBand=null;
    updatePropertiesPanel(); renderLayers();
    logCmd('*Cancel*');
    render(); return;
  }
  if (e.key==='Enter'){
    if (tool==='rotate' && rotateState.base && typedBuffer){ commitRotateAngle(); return; }
    if (tool==='copy' && copyState.base && typedBuffer){ commitCopyLength(); return; }
    if (typing && typedBuffer){ commitTypedLength(); return; }
    if (tool==='trim' && !trimState.confirmed){
      trimState.confirmed = true;
      toolHint.textContent = 'TRIM — click the segment to trim';
      logCmd('Select object to trim, or Esc to exit.');
      return;
    }
    if (drawState.active && drawState.type==='polyline' && drawState.pts.length>=2){
      pushUndo();
      shapes.push({ id:nextId++, type:'polyline', pts:drawState.pts.slice(), layer:currentLayer });
      drawState = { active:false, type:null, pts:[] };
      logCmd('Polyline complete.');
      render();
    } else if (drawState.active && drawState.type==='line'){
      drawState = { active:false, type:null, pts:[] };
      logCmd('');
      render();
    }
    return;
  }
  if ((e.key==='Delete' || e.key==='Backspace') && selected.size>0){
    e.preventDefault();
    pushUndo();
    const n = selected.size;
    shapes = shapes.filter(s=>!selected.has(s.id));
    selected.clear();
    updatePropertiesPanel(); renderLayers();
    logCmd(n + ' found, ' + n + ' deleted.');
    render(); return;
  }
  if (e.ctrlKey && e.key.toLowerCase()==='z'){ e.preventDefault(); undo(); return; }
  if (e.ctrlKey && (e.key.toLowerCase()==='y')){ e.preventDefault(); redo(); return; }

  const map = { l:'line', r:'rect', c:'circle', p:'polyline', e:'erase', v:'select', s:'select' };
  const k = e.key.toLowerCase();
  if (!e.ctrlKey && !e.metaKey && map[k]) setTool(map[k]);
});
window.addEventListener('keyup', e=>{
  if (e.code==='Space'){ isSpaceDown=false; canvas.style.cursor = tool==='select'?'default':(tool==='pan'?'grab':'crosshair'); }
});

/* ---------- Zoom extents ---------- */
function zoomExtents(){
  if (!shapes.length){ view.scale=40; view.offsetX=0; view.offsetY=0; updateZoomPct(); render(); return; }
  let x1=Infinity,y1=Infinity,x2=-Infinity,y2=-Infinity;
  shapes.forEach(s=>{ const bb=shapeBBox(s); x1=Math.min(x1,bb.x1); y1=Math.min(y1,bb.y1); x2=Math.max(x2,bb.x2); y2=Math.max(y2,bb.y2); });
  const w=Math.max(x2-x1,1), h=Math.max(y2-y1,1), pad=1.25;
  const scaleX = canvas.width/(w*pad), scaleY = canvas.height/(h*pad);
  view.scale = clamp(Math.min(scaleX,scaleY), 4, 500);
  const cx=(x1+x2)/2, cy=(y1+y2)/2;
  view.offsetX = -cx*view.scale;
  view.offsetY = cy*view.scale;
  updateZoomPct();
  render();
}

/* ---------- Rendering ---------- */
function drawGrid(){
  if (!grid.visible) return;
  const tl = screenToWorld(0,0), br = screenToWorld(canvas.width, canvas.height);
  let step = view.scale<12 ? 10 : (view.scale<25 ? 5 : 1);
  ctx.fillStyle = '#3a3d40';
  const xStart = Math.floor(tl.x/step)*step, xEnd = Math.ceil(br.x/step)*step;
  const yStart = Math.floor(br.y/step)*step, yEnd = Math.ceil(tl.y/step)*step;
  for (let x=xStart; x<=xEnd; x+=step){
    for (let y=yStart; y<=yEnd; y+=step){
      const p = worldToScreen(x,y);
      ctx.fillRect(p.sx-0.75, p.sy-0.75, 1.5, 1.5);
    }
  }
  const origin = worldToScreen(0,0);
  ctx.strokeStyle = '#54585c'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, origin.sy); ctx.lineTo(canvas.width, origin.sy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(origin.sx, 0); ctx.lineTo(origin.sx, canvas.height); ctx.stroke();
}

function drawShape(s, isSelected){
  const layer = layers.find(l=>l.name===s.layer) || layers[0];
  if (!layer.visible) return;
  ctx.strokeStyle = isSelected ? '#4a9eff' : layer.color;
  ctx.lineWidth = isSelected ? 2.2 : 1.4;
  ctx.beginPath();
  if (s.type==='line'){
    const a=worldToScreen(s.pts[0].x,s.pts[0].y), b=worldToScreen(s.pts[1].x,s.pts[1].y);
    ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy);
  } else if (s.type==='rect'){
    const a=worldToScreen(s.pts[0].x,s.pts[0].y), b=worldToScreen(s.pts[1].x,s.pts[1].y);
    ctx.rect(Math.min(a.sx,b.sx), Math.min(a.sy,b.sy), Math.abs(b.sx-a.sx), Math.abs(b.sy-a.sy));
  } else if (s.type==='circle'){
    const c=worldToScreen(s.pts[0].x,s.pts[0].y);
    const r=Math.hypot(s.pts[1].x-s.pts[0].x, s.pts[1].y-s.pts[0].y)*view.scale;
    ctx.arc(c.sx,c.sy,r,0,Math.PI*2);
  } else if (s.type==='polyline'){
    s.pts.forEach((p,i)=>{ const sp=worldToScreen(p.x,p.y); i===0?ctx.moveTo(sp.sx,sp.sy):ctx.lineTo(sp.sx,sp.sy); });
  }
  ctx.stroke();
  if (isSelected){
    ctx.fillStyle = '#4a9eff';
    s.pts.forEach(p=>{ const sp=worldToScreen(p.x,p.y); ctx.fillRect(sp.sx-3,sp.sy-3,6,6); });
  }
}

function drawPreview(){
  if (!drawState.active) return;
  const layer = layers.find(l=>l.name===currentLayer);
  ctx.strokeStyle = layer ? layer.color : '#d8d8d8';
  ctx.setLineDash([5,4]); ctx.lineWidth = 1.2;
  ctx.beginPath();
  if (drawState.type==='line' || drawState.type==='rect'){
    let end = mouseWorld;
    if (drawState.type==='line' && orthoMode) end = applyOrtho(drawState.pts[drawState.pts.length-1], mouseWorld);
    const a = worldToScreen(drawState.pts[drawState.pts.length-1].x, drawState.pts[drawState.pts.length-1].y);
    const b = worldToScreen(end.x, end.y);
    if (drawState.type==='rect') ctx.rect(Math.min(a.sx,b.sx), Math.min(a.sy,b.sy), Math.abs(b.sx-a.sx), Math.abs(b.sy-a.sy));
    else { ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy); }
  } else if (drawState.type==='circle'){
    const c = worldToScreen(drawState.pts[0].x, drawState.pts[0].y);
    const r = Math.hypot(mouseWorld.x-drawState.pts[0].x, mouseWorld.y-drawState.pts[0].y)*view.scale;
    ctx.arc(c.sx,c.sy,r,0,Math.PI*2);
  } else if (drawState.type==='polyline'){
    drawState.pts.forEach((p,i)=>{ const sp=worldToScreen(p.x,p.y); i===0?ctx.moveTo(sp.sx,sp.sy):ctx.lineTo(sp.sx,sp.sy); });
    const last = worldToScreen(mouseWorld.x, mouseWorld.y);
    ctx.lineTo(last.sx,last.sy);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawCrosshair(){
  const p = worldToScreen(mouseWorld.x, mouseWorld.y);
  ctx.strokeStyle = 'rgba(216,216,216,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(p.sx,0); ctx.lineTo(p.sx,canvas.height); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,p.sy); ctx.lineTo(canvas.width,p.sy); ctx.stroke();
}

function updateDynInput(){
  const el = document.getElementById('dyn-input');
  let text = null;
  if (drawState.active && (tool==='line' || tool==='polyline' || tool==='circle' || tool==='rect') && mouseInCanvas){
    const from = drawState.pts[drawState.pts.length-1];
    if (typedBuffer){
      text = typedBuffer + (inputActive ? '_' : '');
    } else if (tool==='circle'){
      const r = Math.hypot(mouseWorld.x-drawState.pts[0].x, mouseWorld.y-drawState.pts[0].y);
      text = 'R ' + r.toFixed(2) + "'";
    } else if (tool==='rect'){
      const dx = Math.abs(mouseWorld.x-from.x), dy = Math.abs(mouseWorld.y-from.y);
      text = dx.toFixed(2) + "' x " + dy.toFixed(2) + "'";
    } else {
      const dist = Math.hypot(mouseWorld.x-from.x, mouseWorld.y-from.y);
      const angle = Math.atan2(mouseWorld.y-from.y, mouseWorld.x-from.x)*180/Math.PI;
      text = dist.toFixed(2) + "' < " + angle.toFixed(0) + "°";
    }
  } else if (tool==='copy' && copyState.base && mouseInCanvas){
    if (typedBuffer){
      text = typedBuffer + (inputActive ? '_' : '');
    } else {
      const dist = Math.hypot(mouseWorld.x-copyState.base.x, mouseWorld.y-copyState.base.y);
      const angle = Math.atan2(mouseWorld.y-copyState.base.y, mouseWorld.x-copyState.base.x)*180/Math.PI;
      text = dist.toFixed(2) + "' < " + angle.toFixed(0) + "°";
    }
  } else if (tool==='rotate' && rotateState.base && mouseInCanvas){
    if (typedBuffer){
      text = typedBuffer + (inputActive ? '_' : '') + '°';
    } else {
      const angle = Math.atan2(mouseWorld.y-rotateState.base.y, mouseWorld.x-rotateState.base.x)*180/Math.PI;
      text = angle.toFixed(1) + "°";
    }
  }
  if (text===null){ el.style.display = 'none'; return; }
  el.textContent = text;
  el.style.display = 'block';
  el.style.left = (lastScreenPt.sx+16) + 'px';
  el.style.top = (lastScreenPt.sy+16) + 'px';
}

function drawModifyPreview(){
  if ((tool==='copy' && copyState.base) || (tool==='rotate' && rotateState.base)){
    const base = tool==='copy' ? copyState.base : rotateState.base;
    const a = worldToScreen(base.x, base.y);
    const b = worldToScreen(mouseWorld.x, mouseWorld.y);
    ctx.strokeStyle = '#4a9eff'; ctx.setLineDash([4,3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#4a9eff';
    ctx.beginPath(); ctx.arc(a.sx,a.sy,4,0,Math.PI*2); ctx.fill();
  }
}

function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#1b1d1f';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  drawGrid();
  shapes.forEach(s=>drawShape(s, selected.has(s.id)));
  drawPreview();
  drawModifyPreview();
  if (rubberBand){
    ctx.strokeStyle='#4a9eff'; ctx.fillStyle='rgba(74,158,255,0.15)'; ctx.lineWidth=1;
    const x=Math.min(rubberBand.x1,rubberBand.x2), y=Math.min(rubberBand.y1,rubberBand.y2);
    const w=Math.abs(rubberBand.x2-rubberBand.x1), h=Math.abs(rubberBand.y2-rubberBand.y1);
    ctx.fillRect(x,y,w,h); ctx.strokeRect(x,y,w,h);
  }
  if (mouseInCanvas) drawCrosshair();
  updateDynInput();
}

function updateCoordsReadout(pt){
  document.getElementById('coords-readout').textContent = 'X: ' + pt.x.toFixed(2) + '   Y: ' + pt.y.toFixed(2);
}
function updateZoomPct(){
  document.getElementById('zoom-pct').textContent = Math.round(view.scale/40*100) + '%';
}

/* ---------- Resize ---------- */
export function resizeCanvas(){
  canvas.width = canvasWrap.clientWidth || 800;
  canvas.height = canvasWrap.clientHeight || 600;
  render();
}

window.addEventListener('resize', () => {
  resizeCanvas();
  if (getIs3DMode()) {
    const wrap3D = document.getElementById('canvas-3d-wrap');
    resize3D(wrap3D.clientWidth, wrap3D.clientHeight);
  }
});

if (typeof ResizeObserver !== 'undefined'){
  try { new ResizeObserver(resizeCanvas).observe(canvasWrap); } catch(err){}
}

/* ================= UI CHROME ================= */

/* Menu bar */
const MENUS = ['File','Edit','View','Insert','Format','Tools','Draw','Dimension','Modify','Parametric','Window','Help'];
document.getElementById('menubar').innerHTML = MENUS.map(m=>{
  if (m==='File'){
    return '<div class="menu-item file-menu" id="menu-file">File'+
      '<div class="file-dropdown" id="file-dropdown">'+
        '<div class="file-dropdown-item" data-action="new">🗎 New</div>'+
        '<div class="file-dropdown-item" data-action="open">📂 Open…</div>'+
        '<div class="file-dropdown-item" data-action="save">💾 Save</div>'+
        '<div class="file-dropdown-item" data-action="saveas">💾 Save As…</div>'+
      '</div>'+
    '</div>';
  }
  return '<div class="menu-item">'+m+'</div>';
}).join('');

/* ---------- File import / export ---------- */
const fileImportInput = document.getElementById('file-import-input');

function exportDrawingJSON(filename){
  const data = { shapes, layers, currentLayer, savedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'drawing.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  logCmd('Saved to "' + a.download + '".');
}

function importDrawingJSON(file){
  const reader = new FileReader();
  reader.onload = (e)=>{
    try{
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data.shapes)) throw new Error('no "shapes" array found in this file');
      pushUndo();
      shapes.length = 0;
      shapes.push(...data.shapes);
      nextId = shapes.reduce((max,s)=>Math.max(max, s.id||0), 0) + 1;
      if (Array.isArray(data.layers) && data.layers.length) layers = data.layers;
      if (data.currentLayer && layers.find(l=>l.name===data.currentLayer)) currentLayer = data.currentLayer;
      selected.clear();
      renderLayers();
      updatePropertiesPanel();
      zoomExtents();
      logCmd('Opened "' + file.name + '" — ' + shapes.length + ' object(s) loaded.');
    } catch(err){
      logCmd('Could not open "' + file.name + '": ' + err.message);
    }
  };
  reader.onerror = ()=> logCmd('Error reading "' + file.name + '".');
  reader.readAsText(file);
}

fileImportInput.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if (file) importDrawingJSON(file);
  fileImportInput.value = ''; 
});

function runFileAction(action){
  if (action==='new'){ document.getElementById('qa-new').click(); }
  else if (action==='open'){ fileImportInput.click(); }
  else if (action==='save'){ exportDrawingJSON('Untitled1.dwg.json'); }
  else if (action==='saveas'){
    const name = prompt('Save as (filename):', 'drawing.json');
    if (name) exportDrawingJSON(name.toLowerCase().endsWith('.json') ? name : name + '.json');
  }
}

document.getElementById('menu-file').addEventListener('click', (e)=>{
  e.stopPropagation();
  if (e.target.closest('.file-dropdown-item')){
    runFileAction(e.target.closest('.file-dropdown-item').dataset.action);
    document.getElementById('file-dropdown').classList.remove('open');
    return;
  }
  document.getElementById('file-dropdown').classList.toggle('open');
});
window.addEventListener('click', ()=> document.getElementById('file-dropdown').classList.remove('open'));

/* Quick access toolbar */
const qat = document.getElementById('qat-row');
function qatBtn(id, icon, title){ return '<button class="qat-btn" id="'+id+'" title="'+title+'">'+icon+'</button>'; }
qat.innerHTML =
  qatBtn('qa-new', ICONS.new, 'New') +
  qatBtn('qa-open', ICONS.open, 'Open') +
  qatBtn('qa-save', ICONS.save, 'Save') +
  '<span class="qat-sep"></span>' +
  qatBtn('qa-undo', ICONS.undo, 'Undo (Ctrl+Z)') +
  qatBtn('qa-redo', ICONS.redo, 'Redo (Ctrl+Y)') +
  '<span class="qat-title">Untitled1.dwg</span>';
document.getElementById('qa-new').onclick = ()=>{ pushUndo(); shapes.length=0; selected.clear(); updatePropertiesPanel(); logCmd('New drawing started.'); render(); };
document.getElementById('qa-open').onclick = ()=> fileImportInput.click();
document.getElementById('qa-save').onclick = ()=> exportDrawingJSON('Untitled1.dwg.json');
document.getElementById('qa-undo').onclick = undo;
document.getElementById('qa-redo').onclick = redo;

/* Ribbon tabs */
const RIBBON_TABS = ['Home','Insert','Annotate','Parametric','View','Manage','Output'];
const tabsEl = document.getElementById('ribbon-tabs');
tabsEl.innerHTML = RIBBON_TABS.map((t,i)=>'<div class="ribbon-tab'+(i===0?' active':'')+'" data-tab="'+t+'">'+t+'</div>').join('');
tabsEl.addEventListener('click', e=>{
  const el = e.target.closest('.ribbon-tab');
  if (!el) return;
  tabsEl.querySelectorAll('.ribbon-tab').forEach(x=>x.classList.remove('active'));
  el.classList.add('active');
  buildRibbon(el.dataset.tab);
});

const ribbonEl = document.getElementById('ribbon');
function ribbonBtn(toolName, icon, label){
  return '<button class="ribbon-btn" data-tool="'+toolName+'" title="'+label+'">'+icon+'<span>'+label+'</span></button>';
}
function buildRibbon(tabName){
  if (tabName!=='Home'){
    ribbonEl.innerHTML = '<div class="ribbon-placeholder">' + tabName + ' tab — not part of this demo</div>';
    return;
  }
  ribbonEl.innerHTML =
    '<div class="ribbon-group">'+
      '<div class="ribbon-group-buttons">'+
        ribbonBtn('line', ICONS.line, 'Line') +
        ribbonBtn('polyline', ICONS.polyline, 'Polyline') +
        ribbonBtn('circle', ICONS.circle, 'Circle') +
        ribbonBtn('rect', ICONS.rect, 'Rectangle') +
        ribbonBtn('arc', ICONS.arc, 'Arc') +
      '</div>'+
      '<div class="ribbon-group-label">Draw</div>'+
    '</div>'+
    '<div class="ribbon-group">'+
      '<div class="ribbon-group-buttons">'+
        ribbonBtn('select', ICONS.move, 'Move') +
        ribbonBtn('copy', ICONS.copy, 'Copy') +
        ribbonBtn('rotate', ICONS.rotate, 'Rotate') +
        ribbonBtn('trim', ICONS.trim, 'Trim') +
        ribbonBtn('erase', ICONS.erase, 'Erase') +
      '</div>'+
      '<div class="ribbon-group-label">Modify</div>'+
    '</div>'+
    '<div class="ribbon-group" style="min-width:150px;">'+
      '<div class="ribbon-stack" style="width:100%;padding-top:6px;">'+
        '<select id="layer-select"></select>'+
        '<div style="display:flex;gap:2px;">'+
          '<button class="ribbon-btn-sm" id="rb-zoomext">'+ICONS.zoomext+'Zoom Extents</button>'+
        '</div>'+
      '</div>'+
      '<div class="ribbon-group-label">Layers &amp; View</div>'+
    '</div>'+
    '<div class="ribbon-group">'+
      '<div class="ribbon-group-buttons">'+
        ribbonBtn('select', ICONS.select, 'Select') +
        ribbonBtn('pan', ICONS.pan, 'Pan') +
      '</div>'+
      '<div class="ribbon-group-label">Navigate</div>'+
    '</div>';

  ribbonEl.querySelectorAll('.ribbon-btn[data-tool]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const t = btn.dataset.tool;
      if (t==='copy'){ startCopy(); return; }
      if (t==='rotate'){ startRotate(); return; }
      if (t==='trim'){ startTrim(); return; }
      if (t.endsWith('-stub')){
        logCmd('*Cancel* — this tool is not available in this demo.');
        return;
      }
      setTool(t);
    });
  });
  document.getElementById('rb-zoomext').addEventListener('click', zoomExtents);
  const layerSelect = document.getElementById('layer-select');
  layerSelect.innerHTML = layers.map(l=>'<option value="'+l.name+'"'+(l.name===currentLayer?' selected':'')+'>'+l.name+'</option>').join('');
  layerSelect.addEventListener('change', ()=>{
    currentLayer = layerSelect.value;
    logCmd('Current layer: ' + currentLayer);
    renderLayers();
  });
  document.querySelectorAll('.ribbon-btn[data-tool="'+tool+'"]').forEach(b=>b.classList.add('active'));
}
buildRibbon('Home');

/* Side panel: Layers / Properties */
const sideTabs = document.querySelectorAll('.side-tab');
const sideContent = document.getElementById('side-content');
sideTabs.forEach(t=>t.addEventListener('click', ()=>{
  sideTabs.forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  if (t.dataset.tab==='layers') renderLayers(); else updatePropertiesPanel();
}));

function renderLayers(){
  if (!document.querySelector('.side-tab.active[data-tab="layers"]')) return;
  sideContent.innerHTML =
    '<div class="side-section-title">Layers</div>' +
    layers.map(l=>
      '<div class="layer-row'+(l.name===currentLayer?' current':'')+'" data-layer="'+l.name+'">'+
        '<input type="color" class="layer-swatch" value="'+l.color+'" data-swatch="'+l.name+'">'+
        '<span class="layer-name">'+l.name+'</span>'+
        '<button class="layer-eye" data-eye="'+l.name+'" title="Toggle visibility">'+(l.visible?ICONS.eye:ICONS.eyeoff)+'</button>'+
      '</div>'
    ).join('');

  sideContent.querySelectorAll('.layer-row').forEach(row=>{
    row.addEventListener('click', e=>{
      if (e.target.closest('[data-swatch]') || e.target.closest('[data-eye]')) return;
      currentLayer = row.dataset.layer;
      renderLayers();
      const sel = document.getElementById('layer-select');
      if (sel) sel.value = currentLayer;
      logCmd('Current layer: ' + currentLayer);
    });
  });
  sideContent.querySelectorAll('[data-swatch]').forEach(sw=>{
    sw.addEventListener('input', ()=>{
      const l = layers.find(x=>x.name===sw.dataset.swatch);
      l.color = sw.value;
      render();
    });
  });
  sideContent.querySelectorAll('[data-eye]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.stopPropagation();
      const l = layers.find(x=>x.name===btn.dataset.eye);
      l.visible = !l.visible;
      renderLayers();
      render();
    });
  });
}

// 🔥 NAYA UPDATE: Length Aur Area Yahan Aayega
export function updatePropertiesPanel(){
  if (!document.querySelector('.side-tab.active[data-tab="props"]')) return;
  if (selected.size===0){
    sideContent.innerHTML = '<div class="prop-empty">No selection</div>';
    return;
  }
  if (selected.size>1){
    sideContent.innerHTML = '<div class="prop-empty">' + selected.size + ' objects selected</div>';
    return;
  }
  const id = [...selected][0];
  const s = shapes.find(sh=>sh.id===id);
  if (!s){ sideContent.innerHTML = '<div class="prop-empty">No selection</div>'; return; }

  let dimensionsHtml = '';
  if (s.type === 'line') {
      const d = Math.hypot(s.pts[1].x - s.pts[0].x, s.pts[1].y - s.pts[0].y);
      dimensionsHtml = '<div class="prop-row"><label>Length</label><div class="val">' + d.toFixed(2) + '</div></div>';
  } else if (s.type === 'polyline') {
      let len = 0;
      for(let i=0; i<s.pts.length-1; i++) {
          len += Math.hypot(s.pts[i+1].x - s.pts[i].x, s.pts[i+1].y - s.pts[i].y);
      }
      dimensionsHtml = '<div class="prop-row"><label>Total Length</label><div class="val">' + len.toFixed(2) + '</div></div>';
  } else if (s.type === 'rect') {
      const w = Math.abs(s.pts[1].x - s.pts[0].x);
      const h = Math.abs(s.pts[1].y - s.pts[0].y);
      dimensionsHtml = '<div class="prop-row"><label>Size (W x H)</label><div class="val">' + w.toFixed(2) + ' x ' + h.toFixed(2) + '</div></div>';
      dimensionsHtml += '<div class="prop-row"><label>Area</label><div class="val">' + (w * h).toFixed(2) + '</div></div>';
  } else if (s.type === 'circle') {
      const r = Math.hypot(s.pts[1].x - s.pts[0].x, s.pts[1].y - s.pts[0].y);
      dimensionsHtml = '<div class="prop-row"><label>Radius</label><div class="val">' + r.toFixed(2) + '</div></div>';
  }

  const pointsHtml = s.pts.map((p,i)=>
    '<div class="prop-row"><label>Point '+(i+1)+'</label><div class="val">'+fmt(p)+'</div></div>'
  ).join('');

  sideContent.innerHTML =
    '<div class="side-section-title">Properties</div>'+
    '<div class="prop-row"><label>Object Type</label><div class="val">'+s.type.toUpperCase()+'</div></div>'+
    '<div class="prop-row"><label>Layer</label><select id="prop-layer">'+
      layers.map(l=>'<option value="'+l.name+'"'+(l.name===s.layer?' selected':'')+'>'+l.name+'</option>').join('')+
    '</select></div>'+
    dimensionsHtml + 
    pointsHtml;

  document.getElementById('prop-layer').addEventListener('change', e=>{
    pushUndo();
    s.layer = e.target.value;
    render();
  });
}

/* Status bar */
const statusbar = document.getElementById('statusbar');
statusbar.innerHTML =
  '<span class="status-coord" id="status-coord">X: 0.00  Y: 0.00</span>'+
  '<span class="status-sep"></span>'+
  '<button class="status-toggle on" id="st-grid">GRID</button>'+
  '<button class="status-toggle on" id="st-snap">SNAP</button>'+
  '<button class="status-toggle" id="st-ortho">ORTHO</button>'+
  '<button class="status-toggle" id="st-polar">POLAR</button>'+
  '<button class="status-toggle" id="st-osnap">OSNAP</button>'+
  '<span class="status-spacer"></span>'+
  '<div class="status-tab active">Model</div>'+
  '<div class="status-tab">Layout1</div>'+
  '<span class="status-sep"></span>'+
  '<span class="zoom-pct" id="zoom-pct">100%</span>';
document.getElementById('st-grid').onclick = function(){ grid.visible=!grid.visible; this.classList.toggle('on',grid.visible); render(); };
document.getElementById('st-snap').onclick = function(){ grid.snap=!grid.snap; this.classList.toggle('on',grid.snap); };
document.getElementById('st-ortho').onclick = function(){ orthoMode=!orthoMode; this.classList.toggle('on',orthoMode); };
document.getElementById('st-polar').onclick = function(){ this.classList.toggle('on'); };
document.getElementById('st-osnap').onclick = function(){ this.classList.toggle('on'); };

function updateCoordsReadoutStatus(pt){
  const el = document.getElementById('status-coord');
  if (el) el.textContent = 'X: ' + pt.x.toFixed(2) + '  Y: ' + pt.y.toFixed(2);
}
window.addEventListener('mousemove', ()=>{ updateCoordsReadoutStatus(mouseWorld); });

/* ---------- Init ---------- */
renderLayers();
updatePropertiesPanel();
setTool('select');
resizeCanvas();
zoomExtents();
logCmd('Type a command below, or use the ribbon. Shortcuts: L line · R rectangle · C circle · P polyline · E erase · Esc cancel · Del delete. Modify: CO copy · RO rotate · TR trim.');
setTimeout(resizeCanvas, 50);