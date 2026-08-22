"use client";

import { useEffect, useRef } from "react";

/**
 * Aether Flow — GPU fluid-noise background, zero dependencies (raw WebGL).
 * Domain-warped fbm noise with controllable hue, speed, intensity,
 * complexity and warp. Pauses when off-screen and respects
 * prefers-reduced-motion.
 */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform float u_hue;        // 0–360
uniform float u_intensity;  // 0.1–2
uniform float u_complexity; // 1–8 (fbm octaves)
uniform float u_warp;       // 0–1

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 8; i++) {
    if (float(i) >= u_complexity) break;
    v += a * noise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

vec3 hsl2rgb(vec3 hsl) {
  vec3 rgb = clamp(abs(mod(hsl.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return hsl.z + hsl.y * (rgb - 0.5) * (1.0 - abs(2.0 * hsl.z - 1.0));
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
  float t = u_time;

  // Domain warp: q and r feed back into the field for a fluid look.
  vec2 q = vec2(fbm(uv + t * 0.10), fbm(uv + vec2(5.2, 1.3) - t * 0.07));
  vec2 r = vec2(
    fbm(uv + q * (2.0 + u_warp * 4.0) + vec2(1.7, 9.2) + t * 0.12),
    fbm(uv + q * (2.0 + u_warp * 4.0) + vec2(8.3, 2.8) - t * 0.09)
  );
  float f = fbm(uv + r * (1.0 + u_warp * 2.0));

  float glow = pow(f, 1.6) * u_intensity;

  float h1 = u_hue / 360.0;
  float h2 = fract(h1 + 0.12);
  vec3 c1 = hsl2rgb(vec3(h1, 0.85, 0.45));
  vec3 c2 = hsl2rgb(vec3(h2, 0.90, 0.55));
  vec3 col = mix(c1, c2, clamp(length(q) * 1.2, 0.0, 1.0)) * glow;

  // Deep-space base + vignette
  vec3 base = vec3(0.015, 0.017, 0.028);
  float vig = 1.0 - 0.45 * dot(uv * 0.55, uv * 0.55);
  col = (base + col) * vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface ShaderCanvasProps {
  hue?: number;
  speed?: number;
  intensity?: number;
  complexity?: number;
  warp?: number;
  className?: string;
}

export function ShaderCanvas({
  hue = 260,
  speed = 0.15,
  intensity = 0.7,
  complexity = 6.0,
  warp = 0.4,
  className = "",
}: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useRef({ hue, speed, intensity, complexity, warp });
  params.current = { hue, speed, intensity, complexity, warp };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(program, "u_res"),
      time: gl.getUniformLocation(program, "u_time"),
      hue: gl.getUniformLocation(program, "u_hue"),
      intensity: gl.getUniformLocation(program, "u_intensity"),
      complexity: gl.getUniformLocation(program, "u_complexity"),
      warp: gl.getUniformLocation(program, "u_warp"),
    };

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    let raf = 0;
    let t = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = (now - last) / 1000;
      last = now;
      t += dt * (reducedMotion ? 0 : params.current.speed) * 4.0;

      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, t);
      gl.uniform1f(u.hue, params.current.hue);
      gl.uniform1f(u.intensity, params.current.intensity);
      gl.uniform1f(u.complexity, params.current.complexity);
      gl.uniform1f(u.warp, params.current.warp);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
    };
  }, []);

  return <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${className}`} aria-hidden />;
}

export function ControlSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: string;
  max: string;
  step: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-xs font-medium text-white/80">
        {label}
        <span className="tabular-nums text-white/50">{value}</span>
      </span>
      <input
        type="range"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="w-full accent-[hsl(160,84%,45%)]"
      />
    </label>
  );
}
