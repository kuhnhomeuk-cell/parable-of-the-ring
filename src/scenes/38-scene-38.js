// scenes/38-scene-38.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-38';
  const LIB = FILM.lib, LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { sstep, clamp01, lerp, vgrad, hgrad, makeLayer } = LOOK;
  const TAU = Math.PI * 2;

  const JH = 360;
  const AGE = 19;
  const VIEW = { cx: 560, cy: 610, z: 1.3 };
  const JV = { cx: 450, cy: 560, z: 2.0 };
  const MV = { cx: 720, cy: 620, z: 1.9 };
  const FOCUS = [480, 520];
  const sets = () => FILM.sets.hospital;
  const MH = () => FILM.cast.sam.height({ h: JH, age: AGE }) * 0.95;
  const M_X0 = 690;
  const M_Y = 912;

  function lines(info) {
    const s = info.shot, out = [];
    for (const c of s.captions || []) {
      if (!c.words || !c.words.length || c.words[0][0] < s.start - 0.05) continue;
      out.push(c.words.map(([t, w]) => [t - s.start, String(w).toLowerCase().replace(/[^a-z']/g, '')]));
    }
    return out;
  }
  const word = (L, i, tok, d) => {
    for (const w of L[i] || []) if (w[1] === tok) return w[0];
    return d;
  };

  function beats(info) {
    const b = info.shot.beats || [];
    const L = lines(info);
    return {
      ask: word(L, 0, 'tokij', 0.34), marry: word(L, 0, 'tokcy', 1.07),
      she: b[1] ? b[1].t : 3.59, laugh: word(L, 1, 'tokit', 3.93), walked: word(L, 1, 'tokiu', 5.07),
      name: b[2] ? b[2].t : 6.44, ava: word(L, 2, 'tokiw', 7.74),
    };
  }

  let TAG = null;
  function buildTag(S) {
    if (TAG && TAG.S === S) return TAG;
    const { c, g } = makeLayer(S, 1.06);
    g.save();
    g.fillStyle = vgrad(g, 0, 1080, [[0, 'rgb(244,244,238)'], [0.6, 'rgb(232,234,228)'], [1, 'rgb(214,218,214)']]);
    g.fillRect(0, 0, 1080, 1080);
    g.fillStyle = hgrad(g, 0, 1080, [[0, 'rgba(150,160,170,0.2)'], [0.6, 'rgba(255,255,255,0)'], [1, 'rgba(255,250,236,0.25)']]);
    g.fillRect(0, 0, 1080, 1080);
    for (const [x, w, a] of [[170, 70, 0.1], [520, 110, 0.08], [880, 60, 0.1]]) {
      const gr = g.createLinearGradient(x - w, 0, x + w, 0);
      gr.addColorStop(0, 'rgba(120,130,140,0)');
      gr.addColorStop(0.5, `rgba(120,130,140,${a})`);
      gr.addColorStop(1, 'rgba(120,130,140,0)');
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(x - w, 0);
      g.bezierCurveTo(x - w + 30, 360, x - w - 20, 700, x - w + 10, 1080);
      g.lineTo(x + w + 10, 1080);
      g.bezierCurveTo(x + w - 20, 700, x + w + 30, 360, x + w, 0);
      g.fill();
    }
    g.fillStyle = 'rgba(160,170,176,0.35)';
    g.fillRect(96, 0, 4, 1080);
    g.fillStyle = 'rgba(255,255,255,0.6)';
    g.fillRect(100, 0, 3, 1080);
    for (const y of [150, 470, 790]) {
      g.fillStyle = 'rgba(90,96,100,0.25)';
      g.beginPath();
      g.arc(132, y + 3, 15, 0, TAU);
      g.fill();
      g.fillStyle = 'rgb(236,236,230)';
      g.beginPath();
      g.arc(130, y, 15, 0, TAU);
      g.fill();
      g.fillStyle = 'rgba(120,124,126,0.6)';
      for (const [dx, dy] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) {
        g.beginPath();
        g.arc(130 + dx, y + dy, 2, 0, TAU);
        g.fill();
      }
    }
    g.fillStyle = 'rgba(120,126,132,0.22)';
    g.beginPath();
    g.moveTo(0, 150);
    g.quadraticCurveTo(220, 110, 420, -10);
    g.lineTo(450, -10);
    g.quadraticCurveTo(240, 140, 0, 186);
    g.fill();
    g.fillStyle = 'rgb(248,248,244)';
    g.beginPath();
    g.moveTo(0, -10);
    g.lineTo(420, -10);
    g.quadraticCurveTo(220, 106, 0, 146);
    g.fill();
    g.fillStyle = hgrad(g, 640, 690, [[0, '#2C4374'], [0.45, '#5A7CC4'], [1, '#2C4374']]);
    g.fillRect(644, 590, 40, 260);
    g.fillStyle = 'rgb(220,224,228)';
    g.fillRect(644, 576, 40, 18);
    g.fillStyle = 'rgba(255,255,255,0.5)';
    g.fillRect(650, 590, 5, 70);
    g.fillStyle = vgrad(g, 660, 1080, [[0, 'rgb(238,239,234)'], [1, 'rgb(220,223,218)']]);
    g.fillRect(560, 660, 400, 440);
    g.fillStyle = vgrad(g, 660, 700, [[0, 'rgba(90,100,110,0.3)'], [1, 'rgba(90,100,110,0)']]);
    g.fillRect(560, 660, 400, 40);
    g.fillStyle = 'rgba(255,255,255,0.8)';
    g.fillRect(560, 656, 400, 4);
    g.strokeStyle = 'rgba(110,120,130,0.3)';
    g.lineWidth = 2;
    g.setLineDash([9, 7]);
    g.beginPath();
    g.moveTo(574, 672);
    g.lineTo(574, 1090);
    g.moveTo(946, 672);
    g.lineTo(946, 1090);
    g.moveTo(566, 670);
    g.lineTo(954, 670);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = 'rgba(60,70,90,0.25)';
    g.fillRect(560, 1078, 400, 2);
    g.fillStyle = 'rgba(40,50,70,0.3)';
    g.fillRect(684, 600, 6, 120);
    g.fillStyle = 'rgb(206,210,216)';
    g.fillRect(676, 596, 12, 120);
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.fillRect(679, 596, 3, 120);
    g.fillStyle = 'rgba(30,30,40,0.28)';
    g.beginPath();
    g.roundRect(304, 390, 520, 150, 14);
    g.fill();
    g.fillStyle = vgrad(g, 370, 520, [[0, 'rgb(46,44,42)'], [0.5, 'rgb(30,29,28)'], [1, 'rgb(20,19,18)']]);
    g.beginPath();
    g.roundRect(290, 372, 520, 150, 14);
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.18)';
    g.lineWidth = 3;
    g.beginPath();
    g.roundRect(296, 378, 508, 138, 10);
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.08)';
    g.beginPath();
    g.roundRect(296, 378, 508, 52, 10);
    g.fill();
    g.save();
    g.font = 'bold 92px Helvetica, Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    if ('letterSpacing' in g) g.letterSpacing = '14px';
    g.fillStyle = 'rgba(0,0,0,0.6)';
    g.fillText('AVA', 557, 452);
    g.fillStyle = 'rgb(240,238,232)';
    g.fillText('AVA', 554, 448);
    g.restore();
    const gx = 880, gy = 450;
    g.fillStyle = 'rgba(40,30,20,0.25)';
    g.beginPath();
    g.arc(gx + 4, gy + 5, 30, 0, TAU);
    g.fill();
    g.fillStyle = hgrad(g, gx - 30, gx + 30, [[0, 'rgb(170,124,52)'], [0.5, 'rgb(250,224,150)'], [1, 'rgb(196,150,70)']]);
    g.beginPath();
    g.arc(gx, gy, 30, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(176,128,56)';
    g.beginPath();
    g.arc(gx, gy, 20, 0, TAU);
    g.fill();
    g.strokeStyle = 'rgba(255,240,190,0.8)';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(gx, gy, 12, 0, TAU);
    g.stroke();
    g.restore();
    LOOK.texture(c, S * 1.06, { seed: sd('tagtex'), offset: 31.7, mottle: 0.05, dark: 0.04, light: 0.03, glow: { x: 1000, y: 0, r: 900, amount: 0.18 } });
    return (TAG = { S, c });
  }

  function drawInsert(ctx, t, info, S, B) {
    const T = buildTag(S);
    const k = LIB.ease.inOutSine(clamp01((t - B.name) / (B.ava + 0.5 - B.name)));
    const z = 1 + 0.05 * k + 0.015 * clamp01((t - B.ava - 0.5) / (info.dur - B.ava));
    const sway = 4 * Math.sin((t - B.name) * 2.2);
    ctx.save();
    ctx.translate(540, 470);
    ctx.scale(z, z);
    ctx.translate(-540 + sway, -470 + 2 * Math.sin((t - B.name) * 4.4));
    ctx.drawImage(T.c, -32, -32, 1080 * 1.06, 1080 * 1.06);
    ctx.restore();
    LOOK.bloom(ctx, { x: 1000, y: 40, r: 700, alpha: 0.18, mid: 0.06 });
    const env = LOOK.flashEnv(t, B.ava, { fall: 18 });
    if (env > 0.01) LOOK.glint(ctx, { x: 788 + sway, y: 392, size: 18 * env, alpha: 0.7 * env, rot: 0.2 });
  }

  function ava(t, B) {
    const turnT = B.walked - 0.15;
    const shake = sstep(B.she - 0.15, B.she + 0.1, t) * (1 - sstep(B.laugh - 0.1, B.laugh + 0.15, t));
    const front = 0.25 + 0.3 * shake * Math.sin((t - (B.she - 0.15)) * TAU * 1.6);
    const laughK = sstep(B.laugh - 0.15, B.laugh + 0.15, t);
    if (t < turnT) {
      return {
        x: M_X0, y: M_Y, facing: -1, front, look: 0.12 - 0.08 * laughK + 0.05 * laughK * Math.sin(t * TAU * 2.2),
        pose: 'stand',
        expr: laughK > 0.5 ? 'laugh' : shake > 0.2 ? { smilePolite: 0.6, wonder: 0.4 } : { wonder: 0.7, smilePolite: 0.3 },
      };
    }
    const tw = t - turnT;
    const speed = 150;
    const ramp = 0.35;
    const d = tw < ramp ? (speed * tw * tw) / (2 * ramp) : speed * (tw - ramp / 2);
    const h = MH();
    return {
      x: M_X0 + 10 + d, y: M_Y, facing: 1, front: 1.45, pose: 'walk', walk: d / (2 * FILM.cast.ava.STEP * h), expr: 'laugh',
    };
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const B = beats(info);
      sets().ward(S, { view: VIEW });
      sets().ward(S, { view: JV });
      sets().ward(S, { view: MV });
      buildTag(S);
      if (t >= B.name) {
        drawInsert(ctx, t, info, S, B);
      } else {
        const set = t < B.marry ? [VIEW, 0, B.marry, FOCUS, [0, 0]] : t < B.she ? [JV, B.marry, B.she, [560, 470], [0, 0]] : [MV, B.she, B.name, [540, 470], [-30, 0]];
        const SV = set[0];
        const C = sets().ward(S, { view: SV });
        const V = sets().view(SV);
        const cam = (depth) => LOOK.camera(ctx, { t: t - set[1], dur: set[2] - set[1], focus: set[3], push: 0.045, pan: set[4], depth });
        ctx.save();
        cam(0.55);
        ctx.drawImage(C.wall, 0, 0, 1080, 1080);
        ctx.restore();

        ctx.save();
        cam(1);
        ctx.drawImage(C.room, 0, 0, 1080, 1080);
        const eager = sstep(B.ask - 0.1, B.ask + 0.5, t) * (1 - 0.6 * sstep(B.laugh + 0.3, B.laugh + 1.2, t));
        const after = sstep(B.laugh + 0.6, B.laugh + 1.4, t);
        const jo = {
          x: sets().WARD.hip[0], y: sets().WARD.hip[1], h: JH, age: AGE, outfit: 'gown', pose: 'sitUp', facing: 1, t, shadow: false,
          lean: 0.15 + 0.55 * eager, look: 0.12 + 0.08 * eager,
          expr: after > 0.5 ? 'smileSmall' : eager > 0.3 ? 'happy' : 'neutral', exprAmt: 0.6 + 0.4 * eager, blinkOffset: 2.1,
        };
        FILM.cast.sam(ctx, V.char(jo));
        const mo = Object.assign({ h: MH(), outfit: 'nurse', t }, ava(t, B));
        LOOK.contactShadow(ctx, { x: V.pt([mo.x, mo.y])[0], y: V.pt([mo.x, mo.y])[1], h: mo.h * V.z, alpha: 0.25 });
        FILM.cast.ava(ctx, V.char(mo));
        ctx.restore();

        ctx.save();
        cam(0.7);
        LOOK.drawLight(ctx, C.light, { x: 5 * Math.sin(t * 0.3), alpha: 0.5 + 0.04 * Math.sin(t * 0.9) });
        ctx.restore();
        void lerp;
      }
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
