import { roundRect } from './utils.js';

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

function updateCanvasSize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
updateCanvasSize();
window.addEventListener('resize', updateCanvasSize);

export function getW() { return canvas.width; }
export function getH() { return canvas.height; }

let shakeAmt = 0;
export function triggerShake(amt = 6) { shakeAmt = Math.max(shakeAmt, amt); }

// ── Snow ───────────────────────────────────────────────────────────────────
const snowParticles = [];
function initSnow(W, H) {
    if (snowParticles.length > 0) return;
    for (let i = 0; i < 90; i++) {
        snowParticles.push({ x: Math.random()*W, y: Math.random()*H*0.7,
            r: 0.5+Math.random()*1.8, vx: (Math.random()-0.5)*10, vy: 12+Math.random()*20,
            alpha: 0.15+Math.random()*0.45, wobble: Math.random()*Math.PI*2, ws: 0.6+Math.random()*1.2 });
    }
}
function updateDrawSnow(dt, W, H) {
    initSnow(W, H);
    ctx.save();
    snowParticles.forEach(p => {
        p.y += p.vy*dt; p.wobble += p.ws*dt; p.x += p.vx*dt + Math.sin(p.wobble)*6*dt;
        if (p.y > H*0.72) { p.y = -4; p.x = Math.random()*W; }
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#e8f0ff';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1; ctx.restore();
}

// ── Aurora ─────────────────────────────────────────────────────────────────
function drawAurora(W, H, t) {
    const bands = [
        {hue:160,speed:0.00022,y:0.10,amp:22},{hue:195,speed:0.00016,y:0.17,amp:18},
        {hue:130,speed:0.00029,y:0.23,amp:28},{hue:210,speed:0.00012,y:0.30,amp:14},
    ];
    bands.forEach(b => {
        const phase = t*b.speed;
        const baseY = H*b.y + Math.sin(phase*1.4)*b.amp;
        const alpha = 0.06+0.03*Math.sin(phase*2.1);
        const bandH = H*0.07 + Math.sin(phase*0.8)*H*0.02;
        const g = ctx.createLinearGradient(0, baseY-bandH, 0, baseY+bandH);
        g.addColorStop(0, `hsla(${b.hue},80%,60%,0)`);
        g.addColorStop(0.4, `hsla(${b.hue},80%,60%,${alpha})`);
        g.addColorStop(0.6, `hsla(${b.hue+20},70%,55%,${alpha*0.7})`);
        g.addColorStop(1, `hsla(${b.hue},80%,60%,0)`);
        ctx.save(); ctx.beginPath();
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
            const px = (i/steps)*W, py = baseY+Math.sin(phase*3.1+i*0.7)*b.amp*0.6;
            i===0 ? ctx.moveTo(px, py+bandH) : ctx.lineTo(px, py+bandH);
        }
        for (let i = steps; i >= 0; i--) {
            const px = (i/steps)*W, py = baseY+Math.sin(phase*2.7+i*0.9+1.2)*b.amp*0.5;
            ctx.lineTo(px, py-bandH);
        }
        ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ctx.restore();
    });
}

// ── Stars ──────────────────────────────────────────────────────────────────
const STARS = [
    {x:.08,y:.04,s:2.2},{x:.17,y:.09,s:1.4},{x:.28,y:.03,s:1.8},{x:.38,y:.07,s:1.2},
    {x:.51,y:.02,s:2.5},{x:.63,y:.06,s:1.6},{x:.74,y:.04,s:1.3},{x:.85,y:.08,s:2.0},
    {x:.93,y:.02,s:1.5},{x:.12,y:.14,s:1.1},{x:.22,y:.17,s:1.8},{x:.35,y:.13,s:1.4},
    {x:.47,y:.16,s:1.2},{x:.58,y:.11,s:2.0},{x:.69,y:.15,s:1.6},{x:.79,y:.13,s:1.3},
    {x:.90,y:.17,s:1.9},{x:.04,y:.22,s:1.5},{x:.44,y:.25,s:2.2},{x:.55,y:.28,s:1.1},{x:.82,y:.24,s:1.7},
];
function drawStars(W, H, t) {
    STARS.forEach((s, i) => {
        const twinkle = 0.5+0.5*Math.sin(t*0.001*(0.7+(i%5)*0.3)+i);
        const bright = s.s > 1.8;
        ctx.save(); ctx.globalAlpha = twinkle*(bright ? 0.9 : 0.55);
        const sx = s.x*W, sy = s.y*H;
        if (bright) {
            ctx.strokeStyle='#fff8e0'; ctx.lineWidth=0.8;
            const len = s.s*3*twinkle;
            ctx.beginPath(); ctx.moveTo(sx-len,sy); ctx.lineTo(sx+len,sy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(sx,sy-len); ctx.lineTo(sx,sy+len); ctx.stroke();
        }
        ctx.fillStyle = bright ? '#fff8e0' : '#ccd8ff';
        ctx.beginPath(); ctx.arc(sx, sy, s.s*0.7, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    });
}

// ── Mountains ──────────────────────────────────────────────────────────────
function drawMountains(W, H) {
    ctx.fillStyle='#0a0e18';
    ctx.beginPath(); ctx.moveTo(0,H*0.62);
    const fp=[0,.32,.07,.19,.14,.28,.21,.14,.29,.22,.36,.10,.43,.18,.50,.08,.57,.17,.64,.12,.71,.21,.78,.09,.85,.16,.92,.23,1,.30];
    for(let i=0;i<fp.length;i+=2) ctx.lineTo(W*fp[i],H*(0.62-fp[i+1]*0.28));
    ctx.lineTo(W,H*0.62); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(220,230,255,0.07)';
    ctx.beginPath(); ctx.moveTo(0,H*0.62);
    for(let i=0;i<fp.length;i+=2) ctx.lineTo(W*fp[i],H*(0.62-fp[i+1]*0.28));
    ctx.lineTo(W,H*0.62);
    for(let i=fp.length-2;i>=0;i-=2) ctx.lineTo(W*fp[i],H*(0.62-fp[i+1]*0.28)+H*0.04);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle='#0f1320';
    ctx.beginPath(); ctx.moveTo(0,H*0.70);
    const np=[0,.30,.10,.20,.20,.36,.32,.24,.45,.40,.55,.18,.65,.32,.76,.27,.87,.38,1,.22,1,1,0,1];
    for(let i=0;i<np.length;i+=2) ctx.lineTo(W*np[i],H*(0.70-np[i+1]*0.24));
    ctx.closePath(); ctx.fill();
    ctx.fillStyle='#0b0f1c';
    const tc=Math.floor(W/28);
    for(let i=0;i<tc;i++){
        const tx=(i/tc)*W+14,th=14+(i*7%12),by=H*0.66+Math.sin(i*1.7)*H*0.03;
        ctx.beginPath(); ctx.moveTo(tx,by-th); ctx.lineTo(tx-6,by); ctx.lineTo(tx+6,by); ctx.closePath(); ctx.fill();
        ctx.fillRect(tx-1.5,by,3,th*0.3);
    }
}

// ── Grid scan bg ───────────────────────────────────────────────────────────
function drawGrid(W, H, t) {
    ctx.strokeStyle='rgba(40,60,120,0.10)'; ctx.lineWidth=1;
    const gs=80;
    for(let x=0;x<W;x+=gs){ctx.beginPath();ctx.moveTo(x,H*0.70);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=H*0.70;y<H;y+=gs/2){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    const scanY=H*0.70+(t*50)%(H*0.30);
    const sg=ctx.createLinearGradient(0,scanY-20,0,scanY+20);
    sg.addColorStop(0,'rgba(60,120,255,0)'); sg.addColorStop(0.5,'rgba(60,120,255,0.025)'); sg.addColorStop(1,'rgba(60,120,255,0)');
    ctx.fillStyle=sg; ctx.fillRect(0,scanY-20,W,40);
}

// ── Ground ─────────────────────────────────────────────────────────────────
function drawGround(W, H) {
    const gy=H*0.68;
    const g=ctx.createLinearGradient(0,gy,0,H);
    g.addColorStop(0,'#141008'); g.addColorStop(1,'#080604');
    ctx.fillStyle=g; ctx.fillRect(0,gy,W,H-gy);
    ctx.strokeStyle='rgba(60,40,15,0.8)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(0,gy+1); ctx.lineTo(W,gy+1); ctx.stroke();
}

function drawBackground(W, H, t) {
    const sky=ctx.createLinearGradient(0,0,0,H*0.72);
    sky.addColorStop(0,'#02050d'); sky.addColorStop(0.3,'#060c1a');
    sky.addColorStop(0.7,'#0e1428'); sky.addColorStop(1,'#141c30');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    drawAurora(W,H,t); drawStars(W,H,t); drawMountains(W,H);
    drawGround(W,H); drawGrid(W,H,t); updateDrawSnow(_dt,W,H);
}

// ── Torch particles ────────────────────────────────────────────────────────
const torchParticles=[];
export function spawnTorchParticle(x,y){
    torchParticles.push({x,y,vx:(Math.random()-0.5)*22,vy:-(25+Math.random()*40),life:1,size:2.5+Math.random()*3.5,hue:15+Math.random()*35});
}
function updateDrawTorches(dt){
    for(let i=torchParticles.length-1;i>=0;i--){
        const p=torchParticles[i];
        p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=15*dt; p.vx*=0.97; p.life-=dt*2; p.size*=0.96;
        if(p.life<=0){torchParticles.splice(i,1);continue;}
        ctx.save(); ctx.globalAlpha=p.life*0.85;
        const hue=p.hue+(1-p.life)*20;
        ctx.fillStyle=`hsl(${hue},100%,${50+(1-p.life)*30}%)`;
        ctx.shadowColor=`hsl(${hue},100%,65%)`; ctx.shadowBlur=10;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size*(0.5+p.life*0.5),0,Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

// ── Hit particles ──────────────────────────────────────────────────────────
const hitParticles=[];
export function spawnHitParticles(x,y,color='#ff6600'){
    for(let i=0;i<12;i++){
        const a=Math.random()*Math.PI*2, s=80+Math.random()*150;
        hitParticles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-60,life:0.6+Math.random()*0.5,size:3+Math.random()*5,color});
    }
}
function updateDrawHitParticles(dt){
    for(let i=hitParticles.length-1;i>=0;i--){
        const p=hitParticles[i];
        p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=200*dt; p.vx*=0.90; p.life-=dt*2;
        if(p.life<=0){hitParticles.splice(i,1);continue;}
        ctx.save(); ctx.globalAlpha=p.life;
        ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=8;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

// ── clearScreen / afterDraw ────────────────────────────────────────────────
let _lastT=0, _dt=0;
export function clearScreen(t){
    _dt=(t-_lastT)/1000; if(_dt>0.1)_dt=0.1; _lastT=t;
    ctx.save();
    if(shakeAmt>0.5){
        ctx.translate((Math.random()-0.5)*shakeAmt,(Math.random()-0.5)*shakeAmt);
        shakeAmt*=0.78;
    } else shakeAmt=0;
    const W=canvas.width,H=canvas.height;
    drawBackground(W,H,t);
}
export function afterDraw(){
    updateDrawTorches(_dt); updateDrawHitParticles(_dt); ctx.restore();
}

// ── Health bar ─────────────────────────────────────────────────────────────
export function drawHealthBar(ctx,x,y,w,h,pct,color,glow=false){
    pct=Math.max(0,Math.min(1,pct));
    ctx.fillStyle='#0e0806'; ctx.strokeStyle='rgba(0,0,0,0.8)'; ctx.lineWidth=1;
    roundRect(ctx,x,y,w,h,h/2); ctx.fill(); ctx.stroke();
    if(pct>0){
        if(glow){ctx.shadowColor=color;ctx.shadowBlur=10;}
        const g=ctx.createLinearGradient(x,y,x,y+h);
        g.addColorStop(0,lighten(color,50)); g.addColorStop(1,color);
        ctx.fillStyle=g; roundRect(ctx,x,y,w*pct,h,h/2); ctx.fill(); ctx.shadowBlur=0;
    }
    ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=0.5;
    roundRect(ctx,x,y,w,h,h/2); ctx.stroke();
}

function lighten(color,amt){
    const r=Math.min(255,parseInt(color.slice(1,3),16)+amt);
    const g=Math.min(255,parseInt(color.slice(3,5),16)+amt);
    const b=Math.min(255,parseInt(color.slice(5,7),16)+amt);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ── MONSTER DRAWING ────────────────────────────────────────────────────────
// All monsters: geometric / glowing style. No sprites, just shapes with intent.
const MONSTER_FNS = {grunt:drawGrunt,archer:drawArcher,berserker:drawBerserker,shaman:drawShaman,boss:drawBoss};

export function drawMonster(ctx,monster){
    if(monster.dead)return;
    const t=Date.now();
    const isChilled=monster.statusEffects?.some(e=>e.type==='chilled');
    const isFrozen=monster.statusEffects?.some(e=>e.type==='frozen');
    const fn=MONSTER_FNS[monster.defId]||drawGrunt;

    // Drop shadow ellipse
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(monster.x,monster.y+monster.h*0.5+2,monster.w*0.38,6,0,0,Math.PI*2); ctx.fill();
    ctx.restore();

    ctx.save(); ctx.translate(monster.x,monster.y);
    if(isFrozen)ctx.globalAlpha=0.85;
    fn(ctx,monster.w,monster.h,isChilled,isFrozen,t);
    ctx.restore();

    // HP bar
    const bw=monster.w+10,bh=7;
    const bx=monster.x-bw/2,by=monster.y-monster.h*0.5-16;
    const hp=monster.hp/monster.maxHp;
    drawHealthBar(ctx,bx,by,bw,bh,hp,hp>0.5?'#3dd668':hp>0.25?'#ff9800':'#f44336',true);

    if(isChilled||isFrozen){
        ctx.save(); ctx.font='14px serif'; ctx.textAlign='center';
        ctx.fillStyle=isFrozen?'#7ec8e3':'#aadff5';
        ctx.shadowColor='#7ec8e3'; ctx.shadowBlur=6;
        ctx.fillText(isFrozen?'❄':'∿',monster.x,monster.y-monster.h*0.5-22);
        ctx.restore();
    }
}

// Shared helper — colored glowing outline + fill
function glowPoly(ctx, pts, fillColor, strokeColor, blur=12){
    ctx.beginPath(); ctx.moveTo(pts[0],pts[1]);
    for(let i=2;i<pts.length;i+=2) ctx.lineTo(pts[i],pts[i+1]);
    ctx.closePath();
    ctx.fillStyle=fillColor; ctx.strokeStyle=strokeColor;
    ctx.shadowColor=strokeColor; ctx.shadowBlur=blur;
    ctx.lineWidth=1.5; ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
}

// ── GRUNT — orange hexagon warrior ────────────────────────────────────────
function drawGrunt(ctx,w,h,chilled,frozen,t){
    const col=frozen?'#4fc3f7':chilled?'#81d4fa':'#ff5522';
    const dim=frozen?'#1a4060':chilled?'#1a3a50':'#3a0a00';
    const pulse=0.7+0.3*Math.sin(t*0.003);

    // Ground aura
    const ag=ctx.createRadialGradient(0,h*0.4,2,0,h*0.4,w*0.7);
    ag.addColorStop(0,frozen?'rgba(79,195,247,0.15)':'rgba(255,85,34,0.15)');
    ag.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=ag; ctx.beginPath(); ctx.ellipse(0,h*0.4,w*0.7,h*0.18,0,0,Math.PI*2); ctx.fill();

    // Rotating hex body
    ctx.save(); ctx.rotate(t*0.0004);
    for(let i=0;i<6;i++){
        const a=(i/6)*Math.PI*2-Math.PI/6, r=w*0.34;
        i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r-h*0.05):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r-h*0.05);
        if(i===0)ctx.beginPath(),ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r-h*0.05);
        else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r-h*0.05);
    }
    ctx.closePath();
    const bg=ctx.createRadialGradient(-w*0.08,-h*0.12,2,0,-h*0.05,w*0.36);
    bg.addColorStop(0,lighten(col,40)); bg.addColorStop(1,dim);
    ctx.fillStyle=bg; ctx.shadowColor=col; ctx.shadowBlur=18*pulse; ctx.fill();
    ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.stroke(); ctx.shadowBlur=0;
    ctx.restore();

    // Inner spinning diamond
    ctx.save(); ctx.rotate(-t*0.0006);
    const pts=[-w*0.13,-h*0.18, 0,-h*0.36, w*0.13,-h*0.18, 0,0];
    glowPoly(ctx,pts,`rgba(255,180,80,${0.5+0.3*Math.sin(t*0.005)})`,col,20);
    ctx.restore();

    // Horn spikes
    ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=10; ctx.fillStyle=dim;
    [[-w*0.24,-h*0.25],[w*0.24,-h*0.25]].forEach(([hx,hy])=>{
        ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(hx+(hx<0?-w*0.18:w*0.18),-h*0.52); ctx.lineTo(hx+(hx<0?-w*0.06:w*0.06),hy+h*0.06); ctx.closePath(); ctx.fill();
    });
    ctx.shadowBlur=0; ctx.restore();

    // Eyes
    [-w*0.10,w*0.10].forEach(ex=>{
        ctx.beginPath(); ctx.arc(ex,-h*0.07,5,0,Math.PI*2);
        const eg=ctx.createRadialGradient(ex,-h*0.07,0,ex,-h*0.07,6);
        eg.addColorStop(0,'#fff'); eg.addColorStop(0.4,col); eg.addColorStop(1,'rgba(0,0,0,0.8)');
        ctx.fillStyle=eg; ctx.shadowColor=col; ctx.shadowBlur=12*pulse; ctx.fill(); ctx.shadowBlur=0;
    });
}

// ── ARCHER — teal diamond ranger ──────────────────────────────────────────
function drawArcher(ctx,w,h,chilled,frozen,t){
    const col=frozen?'#4fc3f7':chilled?'#81d4fa':'#00e5ff';
    const dim=frozen?'#1a4060':chilled?'#1a3a50':'#002a33';
    const pulse=0.7+0.3*Math.sin(t*0.0025+1);

    // Aura
    const ag=ctx.createRadialGradient(0,0,5,0,0,w*0.65);
    ag.addColorStop(0,`rgba(0,229,255,${0.10*pulse})`); ag.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=ag; ctx.beginPath(); ctx.arc(0,-h*0.05,w*0.65,0,Math.PI*2); ctx.fill();

    // Diamond body
    const dp=[-w*0.28,-h*0.05, 0,-h*0.38, w*0.28,-h*0.05, 0,h*0.28];
    const bg=ctx.createLinearGradient(0,-h*0.38,0,h*0.28);
    bg.addColorStop(0,lighten(col,30)); bg.addColorStop(1,dim);
    ctx.beginPath(); ctx.moveTo(dp[0],dp[1]);
    for(let i=2;i<dp.length;i+=2)ctx.lineTo(dp[i],dp[i+1]);
    ctx.closePath(); ctx.fillStyle=bg;
    ctx.shadowColor=col; ctx.shadowBlur=16*pulse; ctx.fill();
    ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.stroke(); ctx.shadowBlur=0;

    // Inner glow lines
    ctx.strokeStyle=`rgba(0,229,255,${0.4+0.3*Math.sin(t*0.004)})`; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(-w*0.14,-h*0.05); ctx.lineTo(0,-h*0.24); ctx.lineTo(w*0.14,-h*0.05); ctx.lineTo(0,h*0.14); ctx.closePath(); ctx.stroke();

    // Bow arcs (orbiting)
    ctx.save(); ctx.rotate(t*0.0005);
    ctx.strokeStyle=`rgba(0,229,255,${0.6+0.2*Math.sin(t*0.006)})`; ctx.lineWidth=2;
    ctx.shadowColor=col; ctx.shadowBlur=10;
    ctx.beginPath(); ctx.arc(0,-h*0.05,w*0.42,-Math.PI*0.6,Math.PI*0.6); ctx.stroke();
    ctx.beginPath(); ctx.arc(0,-h*0.05,w*0.42,Math.PI*0.4,Math.PI*1.6); ctx.stroke();
    ctx.shadowBlur=0; ctx.restore();

    // Eyes
    [[-w*0.08,-h*0.08],[w*0.08,-h*0.08]].forEach(([ex,ey])=>{
        ctx.beginPath(); ctx.arc(ex,ey,4,0,Math.PI*2);
        ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=10; ctx.fill(); ctx.shadowBlur=0;
    });
}

// ── BERSERKER — red pentagon brute ────────────────────────────────────────
function drawBerserker(ctx,w,h,chilled,frozen,t){
    const col=frozen?'#4fc3f7':chilled?'#81d4fa':'#ff1744';
    const dim=frozen?'#1a4060':chilled?'#1a3a50':'#220005';
    const pulse=0.6+0.4*Math.sin(t*0.003+0.5);

    // Ground pulse
    const ag=ctx.createRadialGradient(0,h*0.4,2,0,h*0.4,w*0.85);
    ag.addColorStop(0,`rgba(255,23,68,${0.18*pulse})`); ag.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=ag; ctx.beginPath(); ctx.ellipse(0,h*0.4,w*0.85,h*0.2,0,0,Math.PI*2); ctx.fill();

    // Pentagon body
    ctx.save(); ctx.rotate(t*0.0003);
    ctx.beginPath();
    for(let i=0;i<5;i++){
        const a=(i/5)*Math.PI*2-Math.PI/2, r=w*0.40;
        i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r-h*0.04):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r-h*0.04);
        if(i===0)ctx.beginPath(),ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r-h*0.04);
        else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r-h*0.04);
    }
    ctx.closePath();
    const bg=ctx.createRadialGradient(-w*0.1,-h*0.12,3,0,-h*0.04,w*0.42);
    bg.addColorStop(0,lighten(col,25)); bg.addColorStop(1,dim);
    ctx.fillStyle=bg; ctx.shadowColor=col; ctx.shadowBlur=22*pulse; ctx.fill();
    ctx.strokeStyle=col; ctx.lineWidth=2; ctx.stroke(); ctx.shadowBlur=0;
    ctx.restore();

    // Armor cross lines
    ctx.strokeStyle=`rgba(255,23,68,${0.35+0.2*Math.sin(t*0.004)})`; ctx.lineWidth=1.2;
    for(let i=0;i<5;i++){
        const a=(i/5)*Math.PI*2-Math.PI/2;
        ctx.beginPath(); ctx.moveTo(0,-h*0.04); ctx.lineTo(Math.cos(a)*w*0.36,Math.sin(a)*w*0.36-h*0.04); ctx.stroke();
    }

    // Spike tips on each vertex
    ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=8;
    for(let i=0;i<5;i++){
        const a=(i/5)*Math.PI*2-Math.PI/2, r=w*0.40;
        ctx.beginPath(); ctx.arc(Math.cos(a)*r,Math.sin(a)*r-h*0.04,4.5,0,Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur=0;

    // Eyes (angry slash)
    ctx.strokeStyle=col; ctx.lineWidth=3; ctx.lineCap='round';
    ctx.shadowColor=col; ctx.shadowBlur=12;
    [[-w*0.11,-h*0.06],[w*0.05,-h*0.06]].forEach(([ex,ey])=>{
        ctx.beginPath(); ctx.moveTo(ex,ey); ctx.lineTo(ex+w*0.10,ey-h*0.06); ctx.stroke();
    });
    ctx.shadowBlur=0;
}

// ── SHAMAN — purple orb mage ───────────────────────────────────────────────
function drawShaman(ctx,w,h,chilled,frozen,t){
    const col=frozen?'#4fc3f7':chilled?'#81d4fa':'#d040ff';
    const dim=frozen?'#1a4060':chilled?'#1a3a50':'#1a0030';
    const pulse=0.5+0.5*Math.sin(t*0.0025);

    // Ambient aura
    const ag=ctx.createRadialGradient(0,-h*0.06,5,0,-h*0.06,w*0.75);
    ag.addColorStop(0,`rgba(208,64,255,${0.14*pulse})`); ag.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=ag; ctx.beginPath(); ctx.arc(0,-h*0.06,w*0.75,0,Math.PI*2); ctx.fill();

    // 5 orbiting particles
    for(let i=0;i<5;i++){
        const a=(i/5)*Math.PI*2+t*0.0012, r=w*0.48;
        const px=Math.cos(a)*r, py=Math.sin(a)*r-h*0.06;
        // Trail
        ctx.strokeStyle=`rgba(208,64,255,0.12)`; ctx.lineWidth=1;
        ctx.beginPath();
        for(let j=0;j<10;j++){
            const ba=a-j*0.07, bx=Math.cos(ba)*r, by=Math.sin(ba)*r-h*0.06;
            j===0?ctx.moveTo(bx,by):ctx.lineTo(bx,by);
        }
        ctx.stroke();
        ctx.beginPath(); ctx.arc(px,py,4.5,0,Math.PI*2);
        ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=12*(0.6+0.4*Math.sin(t*0.003+i));
        ctx.fill(); ctx.shadowBlur=0;
    }

    // Core body — rounded triangle/robe
    ctx.beginPath();
    ctx.moveTo(0,-h*0.38);
    ctx.bezierCurveTo(w*0.30,-h*0.14,w*0.32,h*0.18,w*0.24,h*0.40);
    ctx.lineTo(-w*0.24,h*0.40);
    ctx.bezierCurveTo(-w*0.32,h*0.18,-w*0.30,-h*0.14,0,-h*0.38);
    ctx.closePath();
    const bg=ctx.createLinearGradient(0,-h*0.38,0,h*0.40);
    bg.addColorStop(0,lighten(col,20)); bg.addColorStop(1,dim);
    ctx.fillStyle=bg; ctx.shadowColor=col; ctx.shadowBlur=14*pulse; ctx.fill();
    ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.stroke(); ctx.shadowBlur=0;

    // Rune glyph
    ctx.strokeStyle=`rgba(208,64,255,${0.4+0.3*Math.sin(t*0.004)})`; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(0,-h*0.20); ctx.lineTo(-w*0.08,h*0.04); ctx.lineTo(w*0.08,h*0.04); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-w*0.08,h*0.04); ctx.lineTo(w*0.08,-h*0.08); ctx.moveTo(w*0.08,h*0.04); ctx.lineTo(-w*0.08,-h*0.08); ctx.stroke();

    // Staff orb
    const sp=0.65+0.35*pulse;
    ctx.beginPath(); ctx.arc(w*0.30,-h*0.32,w*0.13*sp,0,Math.PI*2);
    const og=ctx.createRadialGradient(w*0.30,-h*0.32,1,w*0.30,-h*0.32,w*0.14);
    og.addColorStop(0,'#fff'); og.addColorStop(0.3,col); og.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=og; ctx.shadowColor=col; ctx.shadowBlur=25*pulse; ctx.fill(); ctx.shadowBlur=0;
    ctx.strokeStyle=dim; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(w*0.14,h*0.36); ctx.lineTo(w*0.24,-h*0.20); ctx.stroke();
}

// ── BOSS — gold crown pentagon king ───────────────────────────────────────
function drawBoss(ctx,w,h,chilled,frozen,t){
    const col=frozen?'#4fc3f7':chilled?'#81d4fa':'#ff2200';
    const gold='#ffd700';
    const dim=frozen?'#1a4060':chilled?'#1a3a50':'#0d0000';
    const pulse=0.5+0.5*Math.sin(t*0.002);
    const eyePulse=0.6+0.4*Math.sin(t*0.004);

    // Shockwave rings
    for(let r=0;r<3;r++){
        const rPhase=(t*0.001+r*0.6)%3;
        const rr=w*(0.5+rPhase*0.3);
        const alpha=Math.max(0,(1-rPhase/3)*0.18);
        ctx.beginPath(); ctx.arc(0,h*0.38,rr,0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,34,0,${alpha})`; ctx.lineWidth=1.5; ctx.stroke();
    }

    // Crown spikes above body
    ctx.fillStyle=gold; ctx.shadowColor=gold; ctx.shadowBlur=16+6*Math.sin(t*0.003);
    const crownPts=[-w*0.42,0,-w*0.28,-h*0.24,-w*0.12,0,0,-h*0.36,w*0.12,0,w*0.28,-h*0.24,w*0.42,0];
    ctx.beginPath(); ctx.moveTo(crownPts[0],crownPts[1]);
    for(let i=2;i<crownPts.length;i+=2)ctx.lineTo(crownPts[i],crownPts[i+1]);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle=lighten(gold,40); ctx.lineWidth=1; ctx.stroke(); ctx.shadowBlur=0;

    // Crown jewels
    [[-w*0.28,-h*0.24],[0,-h*0.36],[w*0.28,-h*0.24]].forEach(([jx,jy])=>{
        ctx.beginPath(); ctx.arc(jx,jy,4,0,Math.PI*2);
        ctx.fillStyle='#ff2020'; ctx.shadowColor='#ff4040'; ctx.shadowBlur=10; ctx.fill();
        ctx.fillStyle='rgba(255,200,200,0.7)'; ctx.shadowBlur=0;
        ctx.beginPath(); ctx.arc(jx-1,jy-1,1.5,0,Math.PI*2); ctx.fill();
    });

    // Massive pentagon body
    ctx.save(); ctx.rotate(t*0.0002);
    ctx.beginPath();
    for(let i=0;i<5;i++){
        const a=(i/5)*Math.PI*2-Math.PI/2, r=w*0.46;
        i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r+h*0.08):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r+h*0.08);
        if(i===0)ctx.beginPath(),ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r+h*0.08);
        else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r+h*0.08);
    }
    ctx.closePath();
    const bg=ctx.createRadialGradient(-w*0.10,-h*0.05,5,0,h*0.08,w*0.50);
    bg.addColorStop(0,lighten(dim,20)); bg.addColorStop(1,dim);
    ctx.fillStyle=bg; ctx.shadowColor=col; ctx.shadowBlur=26*pulse; ctx.fill();
    ctx.strokeStyle=col; ctx.lineWidth=2; ctx.stroke(); ctx.shadowBlur=0;
    ctx.restore();

    // Gold armor lines
    ctx.strokeStyle=`rgba(255,215,0,${0.25+0.15*Math.sin(t*0.003)})`; ctx.lineWidth=1.2;
    for(let i=0;i<5;i++){
        const a=(i/5)*Math.PI*2-Math.PI/2;
        ctx.beginPath(); ctx.moveTo(0,h*0.08); ctx.lineTo(Math.cos(a)*w*0.42,Math.sin(a)*w*0.42+h*0.08); ctx.stroke();
    }

    // Glowing eyes
    [-w*0.12,w*0.12].forEach(ex=>{
        ctx.beginPath(); ctx.ellipse(ex,h*0.04,6,5,0,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,50,0,${eyePulse})`;
        ctx.shadowColor='#ff2200'; ctx.shadowBlur=22*eyePulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle='rgba(0,0,0,0.8)';
        ctx.beginPath(); ctx.ellipse(ex,h*0.04,2,4,0,0,Math.PI*2); ctx.fill();
    });

    // Vertex spikes glowing
    ctx.fillStyle=gold; ctx.shadowColor=gold; ctx.shadowBlur=10;
    for(let i=0;i<5;i++){
        const a=(i/5)*Math.PI*2-Math.PI/2, r=w*0.46;
        ctx.beginPath(); ctx.arc(Math.cos(a)*r,Math.sin(a)*r+h*0.08,5.5,0,Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur=0;
}

// ── HERO DRAWING (replaces the box-with-emoji) ────────────────────────────
export function drawHeroShape(ctx, cx, cy, size, heroId, hp, maxHp, dead, time) {
    const HERO_CFG = {
        astrid: {r:255,g:180,b:50,  col:'#ffb432',dim:'#3a1800',label:'ASTRID'},
        hilda:  {r:80, g:200,b:255, col:'#50c8ff',dim:'#001828',label:'HILDA' },
        bjorn:  {r:255,g:100,b:200, col:'#ff64c8',dim:'#280018',label:'BJORN' },
    };
    const cfg=HERO_CFG[heroId]||HERO_CFG.astrid;
    const col=cfg.col, dim=cfg.dim;
    const pulse=0.5+0.5*Math.sin(time*0.0022+(heroId==='hilda'?1:heroId==='bjorn'?2:0));
    const alpha=dead?0.25:1;

    ctx.save(); ctx.translate(cx,cy); ctx.globalAlpha=alpha;

    // Ground aura glow
    if(!dead){
        const ag=ctx.createRadialGradient(0,0,8,0,0,size*0.85);
        ag.addColorStop(0,`rgba(${cfg.r},${cfg.g},${cfg.b},${0.18*pulse})`);
        ag.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=ag; ctx.beginPath(); ctx.arc(0,0,size*0.85,0,Math.PI*2); ctx.fill();
    }

    // Outer dashed orbit ring
    ctx.save(); ctx.rotate(time*0.0004*(dead?0:1));
    ctx.strokeStyle=`rgba(${cfg.r},${cfg.g},${cfg.b},${dead?0.1:0.45})`;
    ctx.lineWidth=1.5; ctx.setLineDash([8,7]);
    ctx.shadowColor=col; ctx.shadowBlur=dead?0:8;
    ctx.beginPath(); ctx.arc(0,0,size*0.52,0,Math.PI*2); ctx.stroke();
    ctx.setLineDash([]); ctx.shadowBlur=0; ctx.restore();

    // Solid inner ring
    ctx.strokeStyle=col; ctx.lineWidth=2.5;
    ctx.shadowColor=col; ctx.shadowBlur=dead?0:18*pulse;
    ctx.beginPath(); ctx.arc(0,0,size*0.38,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0;

    // Filled inner circle
    const ig=ctx.createRadialGradient(-size*0.08,-size*0.08,2,0,0,size*0.38);
    ig.addColorStop(0,`rgba(${cfg.r},${cfg.g},${cfg.b},0.28)`);
    ig.addColorStop(1,`rgba(${cfg.r},${cfg.g},${cfg.b},0.07)`);
    ctx.fillStyle=ig; ctx.beginPath(); ctx.arc(0,0,size*0.38,0,Math.PI*2); ctx.fill();

    // Tick marks
    for(let i=0;i<12;i++){
        const a=(i/12)*Math.PI*2, r1=size*0.40, r2=i%3===0?size*0.48:size*0.44;
        ctx.strokeStyle=i%3===0?col:`rgba(${cfg.r},${cfg.g},${cfg.b},0.3)`;
        ctx.lineWidth=i%3===0?2:1; ctx.shadowColor=col; ctx.shadowBlur=i%3===0?6:0;
        ctx.beginPath(); ctx.moveTo(Math.cos(a)*r1,Math.sin(a)*r1); ctx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2); ctx.stroke();
    }
    ctx.shadowBlur=0;

    // Center diamond
    if(!dead){
        ctx.save(); ctx.rotate(Math.PI/4+time*0.0006);
        const ds=size*0.16;
        ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=20*pulse;
        ctx.fillRect(-ds,-ds,ds*2,ds*2); ctx.shadowBlur=0;
        ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fillRect(-ds,-ds,ds,ds); // shine
        ctx.restore();
    } else {
        // Dead X
        ctx.strokeStyle='#cc3333'; ctx.lineWidth=3; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(-size*0.18,-size*0.18); ctx.lineTo(size*0.18,size*0.18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(size*0.18,-size*0.18); ctx.lineTo(-size*0.18,size*0.18); ctx.stroke();
    }

    ctx.restore();
}

// ── Projectile drawing ─────────────────────────────────────────────────────
export function drawProjectiles(ctx, state) {
    const t=Date.now();
    state.projectiles.forEach(proj=>{
        if(proj.dead)return;
        ctx.save(); ctx.translate(proj.x,proj.y);

        if(proj.type==='arrow'){
            const angle=Math.atan2(proj.vy,proj.vx)+Math.PI/2;
            ctx.rotate(angle);
            // Trail
            ctx.strokeStyle='rgba(255,200,60,0.2)'; ctx.lineWidth=4;
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,proj.h*2); ctx.stroke();
            // Shaft
            ctx.fillStyle='#c87830'; ctx.fillRect(-1.5,-proj.h/2+3,3,proj.h-2);
            // Tip glow
            ctx.fillStyle='#d8e8f0'; ctx.shadowColor='#80c0ff'; ctx.shadowBlur=8;
            ctx.beginPath(); ctx.moveTo(0,-proj.h/2-6); ctx.lineTo(-3,-proj.h/2+2); ctx.lineTo(3,-proj.h/2+2); ctx.closePath(); ctx.fill();
            ctx.shadowBlur=0;
            // Fletching
            ctx.fillStyle='#cc2020';
            ctx.beginPath(); ctx.moveTo(0,proj.h/2+1); ctx.lineTo(-4,proj.h/2+7); ctx.lineTo(0,proj.h/2+3); ctx.fill();
            ctx.beginPath(); ctx.moveTo(0,proj.h/2+1); ctx.lineTo(4,proj.h/2+7); ctx.lineTo(0,proj.h/2+3); ctx.fill();

        } else if(proj.type==='frostbolt'){
            // Outer aura
            const ag=ctx.createRadialGradient(0,0,0,0,0,proj.w*1.4);
            ag.addColorStop(0,'rgba(150,220,255,0.45)'); ag.addColorStop(1,'rgba(100,180,255,0)');
            ctx.fillStyle=ag; ctx.beginPath(); ctx.arc(0,0,proj.w*1.4,0,Math.PI*2); ctx.fill();
            // Core
            ctx.fillStyle='#c8f0ff'; ctx.shadowColor='#7ec8e3'; ctx.shadowBlur=22;
            ctx.beginPath(); ctx.arc(0,0,proj.w/2,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
            ctx.fillStyle='#fff';
            ctx.beginPath(); ctx.arc(-proj.w*0.15,-proj.w*0.15,proj.w/5,0,Math.PI*2); ctx.fill();
            // Spikes
            ctx.strokeStyle='rgba(180,230,255,0.85)'; ctx.lineWidth=1.5;
            for(let i=0;i<6;i++){
                const a=(i/6)*Math.PI*2+t*0.001;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a)*proj.w*0.38,Math.sin(a)*proj.w*0.38);
                ctx.lineTo(Math.cos(a)*proj.w*0.95,Math.sin(a)*proj.w*0.95);
                ctx.stroke();
            }

        } else if(proj.type==='lightning_axe'){
            const angle=Math.atan2(proj.vy,proj.vx);
            ctx.rotate(angle);
            // Yellow glow orb
            ctx.fillStyle='rgba(255,230,0,0.15)'; ctx.shadowColor='#ffee00'; ctx.shadowBlur=28;
            ctx.beginPath(); ctx.arc(0,0,proj.w*0.7,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
            // Diamond axe body
            ctx.fillStyle='#d0d8e0';
            ctx.beginPath();
            ctx.moveTo(0,-proj.h*0.65); ctx.lineTo(proj.w*0.40,0); ctx.lineTo(0,proj.h*0.50); ctx.lineTo(-proj.w*0.40,0);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle='rgba(255,255,255,0.35)';
            ctx.beginPath(); ctx.moveTo(0,-proj.h*0.65); ctx.lineTo(proj.w*0.10,0); ctx.lineTo(0,-proj.h*0.20); ctx.closePath(); ctx.fill();
            // Arc sparks
            ctx.strokeStyle='rgba(0,240,255,0.9)'; ctx.lineWidth=1.2; ctx.shadowColor='#00eeff'; ctx.shadowBlur=8;
            for(let i=0;i<6;i++){
                const a=(i/6)*Math.PI*2+t*0.008;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a)*proj.w*0.32,Math.sin(a)*proj.w*0.32);
                ctx.lineTo(Math.cos(a+0.5)*proj.w*0.75,Math.sin(a+0.5)*proj.w*0.75);
                ctx.stroke();
            }
            ctx.shadowBlur=0;
        }
        ctx.restore();
    });
}

export function drawDebugOverlay(ctx,W,H,state,fpsValue){
    if(!state.debugMode)return;
    ctx.save(); ctx.font='12px monospace'; ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.fillStyle='#fff'; ctx.fillText(`FPS:${fpsValue}`,W-80,10);
    let y=26;
    state.heroes.forEach(h=>{ctx.fillStyle='#ddd';ctx.fillText(`${h.name}:ATK=${Math.round(h.atk)} SPD=${h.atkSpeed.toFixed(2)}`,10,y);y+=16;});
    ctx.fillStyle='#7ec8e3';
    ctx.fillText(`Mon:${state.monsters.filter(m=>!m.dead).length} Proj:${state.projectiles.filter(p=>!p.dead).length}`,10,y);
    ctx.restore();
}
