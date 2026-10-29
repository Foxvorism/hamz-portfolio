<script setup lang="ts">
const props = defineProps<{
  pointerX: number;
  pointerY: number;
  active: boolean;
  transition: number;
  enabled?: boolean;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const ready = ref(false);

const vertexSource = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const fragmentSource = `
precision mediump float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform float uPaletteMix;
uniform float uPointerActive;
uniform vec2 uTrail[12];
uniform float uTrailAge[12];

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    sum += noise(p) * amplitude;
    p = p * 2.03 + vec2(17.17, 17.17);
    amplitude *= 0.5;
  }
  return sum;
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float time = uTime * 0.07;

  vec2 flow = vec2(
    fbm(p * 0.85 + vec2(2.4, -time)),
    fbm(p * 0.85 + vec2(-3.1, time * 0.8))
  ) - 0.5;
  vec2 wake = vec2(0.0);
  float trailInk = 0.0;
  if (uPointerActive > 0.5) {
    for (int i = 0; i < 12; i++) {
      vec2 trailPoint = (vec2(uTrail[i].x, 1.0 - uTrail[i].y) - 0.5) * vec2(aspect, 1.0);
      vec2 delta = p - trailPoint;
      float distanceToTrail = length(delta);
      float influence = exp(-distanceToTrail * 10.5) * uTrailAge[i];
      wake += vec2(-delta.y, delta.x) * influence * 0.72;
      trailInk = max(trailInk, influence);
    }
  }

  vec2 warped = p + flow * 0.38 + wake;
  float field = fbm(warped * 1.42 + vec2(time * 0.5, -time * 0.32));
  field += trailInk * 0.10;
  float broadForm = smoothstep(0.22, 0.70, field);
  float brightForm = smoothstep(0.50, 0.82, field);
  float contour = 1.0 - smoothstep(0.012, 0.038, abs(fract(field * 4.0) - 0.5));

  vec3 originalColor = mix(vec3(0.012, 0.009, 0.020), vec3(0.12, 0.045, 0.22), broadForm);
  originalColor += vec3(0.22, 0.09, 0.40) * brightForm * 0.64;
  originalColor += vec3(0.11, 0.05, 0.20) * contour * 0.28;
  originalColor += vec3(0.20, 0.095, 0.36) * trailInk * 0.78;

  vec3 scrollColor = mix(vec3(0.020, 0.008, 0.036), vec3(0.14, 0.052, 0.24), broadForm);
  scrollColor += vec3(0.36, 0.17, 0.62) * brightForm * 0.76;
  scrollColor += vec3(0.22, 0.11, 0.38) * contour * 0.36;
  scrollColor += vec3(0.40, 0.23, 0.68) * trailInk * 0.72;
  vec3 color = mix(originalColor, scrollColor, uPaletteMix);

  gl_FragColor = vec4(color, 1.0);
}`;

let gl: WebGLRenderingContext | null = null;
let program: WebGLProgram | null = null;
let frame = 0;
let visible = true;
let reducedMotion = false;
let startedAt = 0;
let trail: { x: number; y: number; time: number }[] = [];
let smoothPointer = { x: 0.5, y: 0.43 };
let pointerWasActive = false;
let lastRenderTime = 0;
let resizeObserver: ResizeObserver | undefined;
let intersectionObserver: IntersectionObserver | undefined;
let motionQuery: MediaQueryList | undefined;
let positionLocation = -1;
let resolutionLocation: WebGLUniformLocation | null = null;
let timeLocation: WebGLUniformLocation | null = null;
let paletteMixLocation: WebGLUniformLocation | null = null;
let pointerActiveLocation: WebGLUniformLocation | null = null;
let trailLocation: WebGLUniformLocation | null = null;
let trailAgeLocation: WebGLUniformLocation | null = null;
const trailPoints = new Float32Array(24);
const trailAges = new Float32Array(12);

function compileShader(context: WebGLRenderingContext, type: number, source: string) {
  const shader = context.createShader(type);
  if (!shader) throw new Error("Could not create WebGL shader");
  context.shaderSource(shader, source);
  context.compileShader(shader);
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    const message = context.getShaderInfoLog(shader) || "WebGL shader compilation failed";
    context.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function setupWebGL(element: HTMLCanvasElement) {
  const context = element.getContext("webgl", {
    alpha: false,
    antialias: false,
    powerPreference: "low-power",
  });
  if (!context) return false;

  const vertex = compileShader(context, context.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(context, context.FRAGMENT_SHADER, fragmentSource);
  const shaderProgram = context.createProgram();
  if (!shaderProgram) throw new Error("Could not create WebGL program");
  context.attachShader(shaderProgram, vertex);
  context.attachShader(shaderProgram, fragment);
  context.linkProgram(shaderProgram);
  context.deleteShader(vertex);
  context.deleteShader(fragment);
  if (!context.getProgramParameter(shaderProgram, context.LINK_STATUS)) {
    throw new Error(context.getProgramInfoLog(shaderProgram) || "WebGL program linking failed");
  }

  const buffer = context.createBuffer();
  if (!buffer) throw new Error("Could not create WebGL buffer");
  context.bindBuffer(context.ARRAY_BUFFER, buffer);
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    context.STATIC_DRAW,
  );
  context.useProgram(shaderProgram);

  positionLocation = context.getAttribLocation(shaderProgram, "aPosition");
  context.enableVertexAttribArray(positionLocation);
  context.vertexAttribPointer(positionLocation, 2, context.FLOAT, false, 0, 0);
  resolutionLocation = context.getUniformLocation(shaderProgram, "uResolution");
  timeLocation = context.getUniformLocation(shaderProgram, "uTime");
  paletteMixLocation = context.getUniformLocation(shaderProgram, "uPaletteMix");
  pointerActiveLocation = context.getUniformLocation(shaderProgram, "uPointerActive");
  trailLocation = context.getUniformLocation(shaderProgram, "uTrail[0]");
  trailAgeLocation = context.getUniformLocation(shaderProgram, "uTrailAge[0]");
  gl = context;
  program = shaderProgram;
  resizeCanvas();
  return true;
}

function resizeCanvas() {
  const element = canvas.value;
  if (!gl || !element || !resolutionLocation) return;
  const bounds = element.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 1, 900 / Math.max(bounds.width, bounds.height));
  const width = Math.max(1, Math.round(bounds.width * scale));
  const height = Math.max(1, Math.round(bounds.height * scale));
  if (element.width !== width || element.height !== height) {
    element.width = width;
    element.height = height;
    gl.viewport(0, 0, width, height);
  }
  gl.uniform2f(resolutionLocation, width, height);
}

function render(now: number) {
  if (!gl || !program) return;
  const element = canvas.value;
  if (!element) return;

  const targetX = props.pointerX / 100;
  const targetY = props.pointerY / 100;
  if (props.active) {
    if (!pointerWasActive) {
      smoothPointer = { x: targetX, y: targetY };
    } else {
      const delta = Math.min(Math.max((now - lastRenderTime) / 1000, 0), 0.05);
      const easing = 1 - Math.exp(-delta * 12);
      smoothPointer.x += (targetX - smoothPointer.x) * easing;
      smoothPointer.y += (targetY - smoothPointer.y) * easing;
    }
    const x = smoothPointer.x;
    const y = smoothPointer.y;
    const last = trail[trail.length - 1];
    if (!last || Math.hypot((x - last.x) * element.width / element.height, y - last.y) > 0.009) {
      trail.push({ x, y, time: now });
    }
    trail = trail.filter((point) => now - point.time < 1200).slice(-12);
    trailPoints.fill(0);
    trailAges.fill(0);
    trail.forEach((point, index) => {
      trailPoints[index * 2] = point.x;
      trailPoints[index * 2 + 1] = point.y;
      trailAges[index] = Math.pow(1 - (now - point.time) / 1200, 1.5);
    });
  } else if (pointerWasActive) {
    trail = [];
  }
  pointerWasActive = props.active;
  lastRenderTime = now;

  gl.useProgram(program);
  if (timeLocation) gl.uniform1f(timeLocation, reducedMotion ? 0 : (now - startedAt) / 1000);
  if (paletteMixLocation) gl.uniform1f(paletteMixLocation, props.transition);
  if (pointerActiveLocation) gl.uniform1f(pointerActiveLocation, props.active ? 1 : 0);
  if (props.active) {
    if (trailLocation) gl.uniform2fv(trailLocation, trailPoints);
    if (trailAgeLocation) gl.uniform1fv(trailAgeLocation, trailAges);
  }
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function stop() {
  cancelAnimationFrame(frame);
  frame = 0;
}

function start() {
  if (frame || reducedMotion || !visible || document.hidden) return;
  const tick = (now: number) => {
    render(now);
    if (!reducedMotion && visible && !document.hidden) frame = requestAnimationFrame(tick);
    else frame = 0;
  };
  frame = requestAnimationFrame(tick);
}

function handleMotionChange() {
  reducedMotion = motionQuery?.matches ?? false;
  if (reducedMotion) {
    stop();
    trail = [];
    render(performance.now());
  } else {
    startedAt = performance.now();
    start();
  }
}

function handleVisibilityChange() {
  if (document.hidden || !visible) stop();
  else start();
}

onMounted(() => {
  if (props.enabled === false) return;
  const element = canvas.value;
  if (!element) return;
  try {
    if (!setupWebGL(element)) return;
    ready.value = true;
  } catch {
    return;
  }

  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  reducedMotion = motionQuery.matches;
  startedAt = performance.now();
  if (reducedMotion) render(startedAt);
  else start();

  resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(element);
  intersectionObserver = new IntersectionObserver(([entry]) => {
    if (!entry) return;
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  });
  intersectionObserver.observe(element);
  motionQuery.addEventListener("change", handleMotionChange);
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onBeforeUnmount(() => {
  stop();
  resizeObserver?.disconnect();
  intersectionObserver?.disconnect();
  motionQuery?.removeEventListener("change", handleMotionChange);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  if (gl && program) gl.deleteProgram(program);
  gl = null;
  program = null;
});
</script>

<template>
  <div class="hero-fluid-background" :style="{ '--fluid-transition': transition }" aria-hidden="true">
    <canvas v-if="props.enabled !== false" ref="canvas" class="hero-fluid-background__canvas" :class="{ 'is-ready': ready }" />
  </div>
</template>

<style scoped>
.hero-fluid-background {
  position: absolute;
  z-index: -1;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 45%, #291442 0%, #110c1c 42%, #0c0b12 100%);
}

.hero-fluid-background::before {
  position: absolute;
  z-index: 0;
  inset: 0;
  background: radial-gradient(ellipse at 50% 42%, #351957 0%, #1b0d2b 48%, #0c0912 100%);
  content: "";
  opacity: var(--fluid-transition, 0);
}

.hero-fluid-background__canvas {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.hero-fluid-background__canvas.is-ready {
  opacity: 1;
}
</style>
