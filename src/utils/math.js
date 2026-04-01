export const TAU = Math.PI * 2;

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalize(x, y) {
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

export function angleTo(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function fromAngle(angle, magnitude = 1) {
  return { x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude };
}

export function circlesOverlap(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const radius = a.radius + b.radius;
  return dx * dx + dy * dy <= radius * radius;
}

export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function pickRandom(array, count) {
  const copy = [...array];
  const results = [];
  while (copy.length && results.length < count) {
    const index = Math.floor(Math.random() * copy.length);
    results.push(copy.splice(index, 1)[0]);
  }
  return results;
}
