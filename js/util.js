// ===== 共用工具 =====

export function hexToNum(h) {
  return parseInt(h.slice(1), 16);
}

export function lerpColor(c1, c2, t) {
  const r = ((c1 >> 16) + (((c2 >> 16) & 255) - (c1 >> 16)) * t) | 0;
  const g = (((c1 >> 8) & 255) + (((c2 >> 8) & 255) - ((c1 >> 8) & 255)) * t) | 0;
  const b = ((c1 & 255) + ((c2 & 255) - (c1 & 255)) * t) | 0;
  return (r << 16) | (g << 8) | b;
}

// 確定性 2D 雜湊 → [0,1)
export function hash2D(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

export function smoothNoise(x, y, scale) {
  const sx = x / scale, sy = y / scale;
  const ix = Math.floor(sx), iy = Math.floor(sy);
  const fx = sx - ix, fy = sy - iy;
  const sx2 = fx * fx * (3 - 2 * fx);
  const sy2 = fy * fy * (3 - 2 * fy);
  const v00 = hash2D(ix, iy);
  const v10 = hash2D(ix + 1, iy);
  const v01 = hash2D(ix, iy + 1);
  const v11 = hash2D(ix + 1, iy + 1);
  const a = v00 + (v10 - v00) * sx2;
  const b = v01 + (v11 - v01) * sx2;
  return a + (b - a) * sy2;
}

export const isTouch = ('ontouchstart' in window) ||
  (navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches);
