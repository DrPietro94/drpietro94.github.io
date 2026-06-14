(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // === CUSTOM CURSOR ===
  (function () {
    const cur = document.getElementById('cursor');
    if (!cur) return;
    if (!window.matchMedia('(pointer: fine)').matches) { cur.style.display = 'none'; return; }
    const dot  = cur.querySelector('.cur-dot');
    const ring = cur.querySelector('.cur-ring');
    let dx = -100, dy = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', e => { dx = e.clientX; dy = e.clientY; });
    document.addEventListener('mouseleave', () => cur.classList.add('hidden'));
    document.addEventListener('mouseenter', () => cur.classList.remove('hidden'));
    document.addEventListener('mousedown',  () => cur.classList.add('pressing'));
    document.addEventListener('mouseup',    () => cur.classList.remove('pressing'));
    document.querySelectorAll('a, button, .btn, .top-btn').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cur.classList.remove('hovering'));
    });
    (function tick() {
      rx += (dx - rx) * 0.13;
      ry += (dy - ry) * 0.13;
      dot.style.left  = dx + 'px';
      dot.style.top   = dy + 'px';
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(tick);
    })();
  })();

  // === INK CANVAS (green flow field) ===
  (function () {
    const canvas = document.getElementById('inkCanvas');
    if (!canvas || reduced) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const N = 300;
    const pts = [];
    const PALETTE = [
      [0, 255, 120], [0, 220, 100], [50, 255, 160],
      [0, 200,  90], [80, 255, 140], [0, 240, 170],
    ];
    function resize() {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
      pts.length = 0;
      for (let i = 0; i < N; i++) {
        const col = PALETTE[i % PALETTE.length];
        pts.push({ x: Math.random() * w, y: Math.random() * h, color: col.join(','), life: Math.random() * 600 });
      }
    }
    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'screen';
      ctx.lineWidth = 1.6;
      for (const p of pts) {
        const a = Math.sin(p.x * 0.0035 + frame * 0.00013) * Math.PI + Math.cos(p.y * 0.0025 + frame * 0.0001) * Math.PI * 0.7;
        const spd = 0.55 + Math.sin(p.life * 0.018) * 0.25;
        const nx = p.x + Math.cos(a) * spd;
        const ny = p.y + Math.sin(a) * spd;
        const fx = ((nx % w) + w) % w;
        const fy = ((ny % h) + h) % h;
        const alpha = (0.22 + Math.sin(p.life * 0.028 + 1) * 0.10).toFixed(3);
        ctx.strokeStyle = `rgba(${p.color},${alpha})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(fx, fy); ctx.stroke();
        p.x = fx; p.y = fy; p.life++;
      }
      frame++;
      requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
    setTimeout(() => canvas.classList.add('ready'), 200);
  })();

  // === CODE CANVAS (VS Code syntax typing) ===
  (function () {
    const canvas = document.getElementById('codeCanvas');
    if (!canvas || reduced) return;
    const ctx = canvas.getContext('2d');
    let W, H, frameN = 0;
    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    const KW = '#569cd6', TY = '#4ec9b0', VA = '#9cdcfe', ST = '#ce9178',
          FN = '#dcdcaa', NU = '#b5cea8', DF = '#d4d4d4', KW2 = '#c586c0';
    const BLOCKS = [
      [
        [{t:'class ',c:KW},{t:'Dashboard',c:TY},{t:' extends ',c:KW},{t:'StatefulWidget',c:TY},{t:' {',c:DF}],
        [{t:'  final ',c:KW},{t:'_api',c:VA},{t:' = ',c:DF},{t:'ApiService',c:TY},{t:'.instance;',c:DF}],
        [{t:'  Stream',c:TY},{t:'<List<',c:DF},{t:'Report',c:TY},{t:'>> get ',c:DF},{t:'reports',c:FN},{t:' => _api.stream;',c:DF}],
        [{t:'  Widget ',c:TY},{t:'build',c:FN},{t:'(BuildContext ctx) {',c:DF}],
        [{t:'    return ',c:KW},{t:'Scaffold',c:TY},{t:'(body: ',c:DF},{t:'LiveChart',c:TY},{t:'(data: data));',c:DF}],
      ],
      [
        [{t:'Route',c:TY},{t:'::get(',c:DF},{t:"'/api/reports'",c:ST},{t:', [',c:DF},{t:'ReportController',c:TY},{t:"::class, 'index'",c:DF},{t:']);',c:DF}],
        [{t:'Route',c:TY},{t:'::post(',c:DF},{t:"'/api/reports'",c:ST},{t:', [',c:DF},{t:'ReportController',c:TY},{t:"::class, 'store'",c:DF},{t:']);',c:DF}],
        [{t:'$report',c:VA},{t:' = ',c:DF},{t:'Report',c:TY},{t:'::where(',c:DF},{t:"'status'",c:ST},{t:', ',c:DF},{t:"'active'",c:ST},{t:')->with(',c:DF},{t:"'items'",c:ST},{t:')->get();',c:DF}],
        [{t:'return ',c:KW},{t:'response',c:FN},{t:'()->json([',c:DF},{t:"'data'",c:ST},{t:' => $report]);',c:DF}],
      ],
      [
        [{t:'import ',c:KW2},{t:'{ defineComponent, ref } ',c:DF},{t:'from ',c:KW2},{t:"'vue'",c:ST},{t:';',c:DF}],
        [{t:'export default ',c:KW2},{t:'defineComponent',c:FN},{t:'({',c:DF}],
        [{t:"  name: ",c:DF},{t:"'Dashboard'",c:ST},{t:', ',c:DF}],
        [{t:'  setup() { ',c:DF},{t:'const ',c:KW},{t:'data',c:VA},{t:' = ',c:DF},{t:'useQuery',c:FN},{t:'(',c:DF},{t:'GET_REPORTS',c:VA},{t:'); }',c:DF}],
        [{t:'});',c:DF}],
      ],
      [
        [{t:'SELECT ',c:KW},{t:'r.id, r.status, ',c:VA},{t:'COUNT',c:FN},{t:'(i.id) ',c:DF},{t:'AS ',c:KW},{t:'total',c:VA}],
        [{t:'FROM ',c:KW},{t:'reports r ',c:DF},{t:'LEFT JOIN ',c:KW},{t:'items i ',c:DF},{t:'ON ',c:KW},{t:'i.report_id = r.id',c:VA}],
        [{t:'WHERE ',c:KW},{t:'r.active = ',c:DF},{t:'1',c:NU},{t:' AND r.created_at > ',c:DF},{t:'NOW',c:FN},{t:'() - ',c:DF},{t:'INTERVAL ',c:KW},{t:'30',c:NU},{t:' DAY',c:KW}],
        [{t:'GROUP BY ',c:KW},{t:'r.id ',c:DF},{t:'ORDER BY ',c:KW},{t:'r.created_at ',c:DF},{t:'DESC',c:KW},{t:';',c:DF}],
      ],
      [
        [{t:'const ',c:KW},{t:'loadReports',c:FN},{t:' = async () => {',c:DF}],
        [{t:'  const ',c:KW},{t:'res',c:VA},{t:' = await ',c:DF},{t:'fetch',c:FN},{t:'(',c:DF},{t:"'/api/v1/reports'",c:ST},{t:');',c:DF}],
        [{t:'  const ',c:KW},{t:'data',c:VA},{t:' = await res.json();',c:DF}],
        [{t:'  ',c:DF},{t:'setReports',c:FN},{t:'(data.items);',c:DF}],
        [{t:'};',c:DF}],
      ],
    ];
    const LH = 20, MAX = 3;
    const insts = [];
    let spawnCD = 60;
    function blockTotal(b) { return b.reduce((s, l) => s + l.reduce((ls, t) => ls + t.t.length, 0), 0); }
    function hexRgba(hex, a) {
      return `rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${a.toFixed(3)})`;
    }
    function spawn() {
      const block = BLOCKS[Math.floor(Math.random() * BLOCKS.length)];
      insts.push({
        block, total: blockTotal(block), rows: block.length, shown: 0,
        x: 36 + Math.random() * Math.max(40, W - 580),
        y: 55 + Math.random() * Math.max(40, H - block.length * LH - 80),
        alpha: 0, phase: 'in', holdCD: 0,
      });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.font = '12.5px "JetBrains Mono", monospace';
      if (--spawnCD <= 0 && insts.length < MAX) { spawn(); spawnCD = 220 + (Math.random() * 200 | 0); }
      for (let i = insts.length - 1; i >= 0; i--) {
        const inst = insts[i];
        if (inst.phase === 'in') {
          inst.alpha = Math.min(0.58, inst.alpha + 0.018);
          inst.shown = Math.min(inst.total, inst.shown + 0.32);
          if (inst.alpha >= 0.55 && inst.shown >= inst.total) { inst.phase = 'hold'; inst.holdCD = 160 + (Math.random() * 140 | 0); }
        } else if (inst.phase === 'hold') {
          if (--inst.holdCD <= 0) inst.phase = 'out';
        } else {
          inst.alpha -= 0.006;
          if (inst.alpha <= 0) { insts.splice(i, 1); continue; }
        }
        let chLeft = inst.shown;
        let cursorX = inst.x, cursorY = inst.y, cursorDrawn = false;
        for (let li = 0; li < inst.block.length; li++) {
          if (chLeft <= 0) break;
          const line = inst.block[li];
          const lineTotal = line.reduce((s, t) => s + t.t.length, 0);
          let lx = inst.x;
          let lineLeft = Math.min(lineTotal, chLeft);
          for (const tok of line) {
            if (lineLeft <= 0) break;
            const vis = tok.t.slice(0, Math.min(tok.t.length, Math.ceil(lineLeft)));
            ctx.fillStyle = hexRgba(tok.c, inst.alpha);
            ctx.fillText(vis, lx, inst.y + li * LH);
            lx += ctx.measureText(vis).width;
            lineLeft -= tok.t.length;
          }
          if (chLeft < lineTotal && !cursorDrawn) { cursorX = lx; cursorY = inst.y + li * LH; cursorDrawn = true; }
          chLeft -= lineTotal;
        }
        if (inst.phase === 'in' && inst.shown < inst.total && cursorDrawn && Math.floor(frameN / 22) % 2) {
          ctx.fillStyle = hexRgba('#c8c8c8', inst.alpha * 0.8);
          ctx.fillRect(cursorX, cursorY - 11, 1.5, 14);
        }
      }
      frameN++;
      requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener('resize', resize);
    document.fonts.ready.then(() => requestAnimationFrame(draw));
  })();
})();
