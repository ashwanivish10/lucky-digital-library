import { useEffect, useRef, useCallback } from 'react';

/* ──────────────────────────── types ──────────────────────────── */
interface PfxEntry { enabled: boolean; intensity: number; }
interface DitherConfig {
  renderMode: string;
  bgMode: string;
  bgBlur: number;
  bgOpacity: number;
  cellSize: number;
  coverage: number;
  invert: boolean;
  brightness: number;
  contrast: number;
  edgeEmphasis: number;
  density: number;
  saturation: number;
  grayscale: number;
  tint: string;
  tintOpacity: number;
  overlayBlend: string;
  blurType: string;
  blurAmount: number;
  pfx: Record<string, PfxEntry>;
  animated: boolean;
  animStyle: string;
  animSpeed: { enabled: boolean; intensity: number };
  animIntensity: { enabled: boolean; intensity: number };
}

const CFG: DitherConfig = {
  renderMode: 'dither',
  bgMode: 'blur',
  bgBlur: 12,
  bgOpacity: 90,
  cellSize: 12,
  coverage: 100,
  invert: false,
  brightness: 0,
  contrast: 146,
  edgeEmphasis: 0,
  density: 30,
  saturation: 100,
  grayscale: 0,
  tint: '#ffd23f',
  tintOpacity: 20,
  overlayBlend: 'soft-light',
  blurType: 'gaussian',
  blurAmount: 25,
  pfx: {
    vignette: { enabled: true, intensity: 38 },
    scanLines: { enabled: false, intensity: 40 },
    chromatic: { enabled: false, intensity: 15 },
    bloom: { enabled: true, intensity: 25 },
    filmGrain: { enabled: false, intensity: 30 },
    glitch: { enabled: false, intensity: 20 },
    pixelate: { enabled: false, intensity: 15 },
    halftone: { enabled: false, intensity: 20 },
    filmDust: { enabled: false, intensity: 20 },
  },
  animated: true,
  animStyle: 'ripple',
  animSpeed: { enabled: true, intensity: 100 },
  animIntensity: { enabled: true, intensity: 60 },
};

/* ──────────────────────────── helpers ──────────────────────────── */
function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function adjustColor(r: number, g: number, b: number, cfg: DitherConfig): [number, number, number] {
  // brightness
  const br = cfg.brightness / 100;
  r = r + br * 255; g = g + br * 255; b = b + br * 255;

  // contrast
  const cf = (cfg.contrast + 100) / 100;
  r = (r - 128) * cf + 128;
  g = (g - 128) * cf + 128;
  b = (b - 128) * cf + 128;

  // saturation
  const sat = cfg.saturation / 100;
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  r = gray + sat * (r - gray);
  g = gray + sat * (g - gray);
  b = gray + sat * (b - gray);

  // grayscale
  if (cfg.grayscale > 0) {
    const gf = cfg.grayscale / 100;
    const gv = 0.299 * r + 0.587 * g + 0.114 * b;
    r = r + gf * (gv - r);
    g = g + gf * (gv - g);
    b = b + gf * (gv - b);
  }

  return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))];
}

/* ──────────────────── ordered dither matrix ──────────────────── */
const BAYER_4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
];

/* ── drawImage with object-fit:cover + responsive zoom ── */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dw: number,
  dh: number,
  zoom: number = 1
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const canvasAspect = dw / dh;
  const imageAspect = iw / ih;

  let sx: number, sy: number, sw: number, sh: number;

  if (imageAspect > canvasAspect) {
    // image is wider — crop sides
    sh = ih / zoom;
    sw = sh * canvasAspect;
    sx = (iw - sw) / 2;
    sy = (ih - sh) / 2;
  } else {
    // image is taller — crop top/bottom
    sw = iw / zoom;
    sh = sw / canvasAspect;
    sx = (iw - sw) / 2;
    sy = (ih - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
}

/** Calculate responsive zoom: more zoom on narrow (mobile) viewports */
function getResponsiveZoom(canvasW: number, canvasH: number): number {
  const aspect = canvasW / canvasH;
  // Portrait/narrow → zoom in more; landscape → normal
  if (aspect < 0.6) return 1.6;      // very tall mobile
  if (aspect < 0.8) return 1.35;     // tall mobile
  if (aspect < 1.0) return 1.15;     // square-ish / tablet portrait
  return 1.0;                         // landscape / desktop
}

/* ──────────────────────── component ──────────────────────────── */
interface DitherCanvasProps {
  imageSrc: string;
  className?: string;
}

export const DitherCanvas: React.FC<DitherCanvasProps> = ({ imageSrc, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const render = useCallback((time: number) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cfg = CFG;
    const zoom = getResponsiveZoom(W, H);

    /* ── Step 1: background ── */
    ctx.clearRect(0, 0, W, H);
    if (cfg.bgMode === 'blur') {
      ctx.save();
      ctx.filter = `blur(${cfg.bgBlur}px)`;
      ctx.globalAlpha = cfg.bgOpacity / 100;
      drawImageCover(ctx, img, W, H, zoom);
      ctx.restore();
    } else if (cfg.bgMode === 'photo') {
      ctx.globalAlpha = cfg.bgOpacity / 100;
      drawImageCover(ctx, img, W, H, zoom);
      ctx.globalAlpha = 1;
    } else if (cfg.bgMode === 'color') {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
    }

    /* ── draw source into offscreen for sampling ── */
    const offscreen = document.createElement('canvas');
    offscreen.width = W;
    offscreen.height = H;
    const oCtx = offscreen.getContext('2d', { willReadFrequently: true })!;
    drawImageCover(oCtx, img, W, H, zoom);
    const imageData = oCtx.getImageData(0, 0, W, H);
    const pixels = imageData.data;

    /* ── Step 2 + 3: grid sampling & dither rendering ── */
    const cell = cfg.cellSize;
    const cols = Math.ceil(W / cell);
    const rows = Math.ceil(H / cell);
    const animT = time * 0.001 * (cfg.animSpeed.enabled ? cfg.animSpeed.intensity / 100 : 0.5);
    const animI = cfg.animIntensity.enabled ? cfg.animIntensity.intensity / 100 : 0.3;
    const centerX = W / 2;
    const centerY = H / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // coverage check
        if (cfg.coverage < 100) {
          const hash = ((col * 7919 + row * 6271) % 100);
          if (hash >= cfg.coverage) continue;
        }

        const x0 = col * cell;
        const y0 = row * cell;
        const cw = Math.min(cell, W - x0);
        const ch = Math.min(cell, H - y0);

        // sample average color of cell
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        const step = Math.max(1, Math.floor(cell / 4)); // sample every Nth pixel for perf
        for (let sy = y0; sy < y0 + ch; sy += step) {
          for (let sx = x0; sx < x0 + cw; sx += step) {
            const idx = (sy * W + sx) * 4;
            rSum += pixels[idx];
            gSum += pixels[idx + 1];
            bSum += pixels[idx + 2];
            count++;
          }
        }
        if (count === 0) continue;

        let rr = rSum / count;
        let gg = gSum / count;
        let bb = bSum / count;

        // Step 4: color adjustments
        [rr, gg, bb] = adjustColor(rr, gg, bb, cfg);

        const lum = luminance(rr, gg, bb) / 255;
        const lumFinal = cfg.invert ? 1 - lum : lum;

        // animation offset
        let animOffset = 0;
        if (cfg.animated) {
          if (cfg.animStyle === 'ripple') {
            const dx = (x0 + cw / 2 - centerX) / W;
            const dy = (y0 + ch / 2 - centerY) / H;
            const dist = Math.sqrt(dx * dx + dy * dy);
            animOffset = Math.sin(dist * 12 - animT * 3) * animI * 0.3;
          } else if (cfg.animStyle === 'wave') {
            animOffset = Math.sin(col * 0.3 + animT * 2) * animI * 0.3;
          } else if (cfg.animStyle === 'pulse') {
            animOffset = Math.sin(animT * 2) * animI * 0.2;
          } else if (cfg.animStyle === 'shimmer') {
            animOffset = Math.sin((col + row) * 0.5 + animT * 3) * animI * 0.25;
          } else if (cfg.animStyle === 'flicker') {
            animOffset = (Math.random() - 0.5) * animI * 0.2;
          }
        }

        const finalLum = Math.max(0, Math.min(1, lumFinal + animOffset));

        // Dither render mode
        if (cfg.renderMode === 'dither') {
          const threshold = BAYER_4[row % 4][col % 4] / 16;
          const densityThreshold = cfg.density / 100;
          const shouldDraw = finalLum > threshold * (1 - densityThreshold);

          if (shouldDraw) {
            const alpha = Math.min(1, finalLum * 1.5 + 0.2);
            ctx.fillStyle = `rgba(${Math.round(rr)}, ${Math.round(gg)}, ${Math.round(bb)}, ${alpha})`;
            // draw a circle for the dither dot
            const dotSize = cell * (0.3 + finalLum * 0.65);
            ctx.beginPath();
            ctx.arc(x0 + cw / 2, y0 + ch / 2, dotSize / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    /* ── Step 4 (cont): tint overlay ── */
    if (cfg.tintOpacity > 0) {
      const [tr, tg, tb] = hexToRgb(cfg.tint);
      ctx.save();
      ctx.globalCompositeOperation = cfg.overlayBlend as GlobalCompositeOperation;
      ctx.fillStyle = `rgba(${tr}, ${tg}, ${tb}, ${cfg.tintOpacity / 100})`;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    /* ── Step 4 (cont): blur post ── */
    if (cfg.blurAmount > 0 && cfg.blurType === 'gaussian') {
      // We apply a subtle gaussian via CSS on the canvas element itself for performance,
      // but we can add a light software bloom-like effect here
    }

    /* ── Step 5: post effects ── */
    // Bloom
    if (cfg.pfx.bloom?.enabled) {
      const intensity = cfg.pfx.bloom.intensity / 100;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.filter = `blur(${8 + intensity * 20}px)`;
      ctx.globalAlpha = intensity * 0.4;
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();
    }

    // Vignette
    if (cfg.pfx.vignette?.enabled) {
      const intensity = cfg.pfx.vignette.intensity / 100;
      const gradient = ctx.createRadialGradient(
        W / 2, H / 2, W * 0.2,
        W / 2, H / 2, W * 0.75
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${0.3 + intensity * 0.5})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
    }

    // Scan lines
    if (cfg.pfx.scanLines?.enabled) {
      const intensity = cfg.pfx.scanLines.intensity / 100;
      ctx.save();
      ctx.globalAlpha = intensity * 0.3;
      for (let y = 0; y < H; y += 3) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, y, W, 1);
      }
      ctx.restore();
    }

    // Film grain
    if (cfg.pfx.filmGrain?.enabled) {
      const intensity = cfg.pfx.filmGrain.intensity / 100;
      const grainData = ctx.createImageData(W, H);
      const gd = grainData.data;
      for (let i = 0; i < gd.length; i += 4) {
        const v = Math.random() * 255;
        gd[i] = v; gd[i + 1] = v; gd[i + 2] = v;
        gd[i + 3] = intensity * 25;
      }
      ctx.putImageData(grainData, 0, 0);
    }

    // Chromatic aberration
    if (cfg.pfx.chromatic?.enabled) {
      const intensity = cfg.pfx.chromatic.intensity / 100;
      const shift = Math.round(intensity * 4);
      if (shift > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.15;
        ctx.drawImage(canvas, -shift, 0);
        ctx.drawImage(canvas, shift, 0);
        ctx.restore();
      }
    }

    // Glitch
    if (cfg.pfx.glitch?.enabled) {
      const intensity = cfg.pfx.glitch.intensity / 100;
      if (Math.random() < intensity * 0.1) {
        const sliceH = Math.random() * H * 0.1;
        const sliceY = Math.random() * H;
        const offset = (Math.random() - 0.5) * W * intensity * 0.15;
        const slice = ctx.getImageData(0, sliceY, W, sliceH);
        ctx.putImageData(slice, offset, sliceY);
      }
    }

    // Halftone
    if (cfg.pfx.halftone?.enabled) {
      const intensity = cfg.pfx.halftone.intensity / 100;
      ctx.save();
      ctx.globalAlpha = intensity * 0.15;
      ctx.globalCompositeOperation = 'multiply';
      const hSize = 4;
      for (let y = 0; y < H; y += hSize * 2) {
        for (let x = 0; x < W; x += hSize * 2) {
          ctx.beginPath();
          ctx.arc(x, y, hSize * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#000';
          ctx.fill();
        }
      }
      ctx.restore();
    }

    animFrameRef.current = requestAnimationFrame(render);
  }, []);

  /* ── load image & start loop ── */
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      const resize = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const rect = container.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      };
      resize();
      window.addEventListener('resize', resize);
      animFrameRef.current = requestAnimationFrame(render);
      return () => {
        window.removeEventListener('resize', resize);
      };
    };
    img.src = imageSrc;

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [imageSrc, render]);

  // handle resize
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const img = imgRef.current;
      if (!canvas || !container || !img) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: `blur(${CFG.blurAmount * 0.04}px)` }}
      />
    </div>
  );
};

export default DitherCanvas;
