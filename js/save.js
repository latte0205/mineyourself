// ===== 存檔 / 讀取（localStorage + RLE 壓縮）=====

import { SAVE_KEY } from './config.js';
import { world } from './world.js';
import { showToast } from './ui.js';

export function saveWorld() {
  try {
    const d = world.data;
    const rle = [];
    let i = 0;
    while (i < d.length) {
      const v = d[i];
      let run = 1;
      while (run < 255 && i + run < d.length && d[i + run] === v) run++;
      rle.push(run, v);
      i += run;
    }
    let s = '';
    for (let j = 0; j < rle.length; j += 8192) {
      s += String.fromCharCode.apply(null, rle.slice(j, j + 8192));
    }
    localStorage.setItem(SAVE_KEY, 'v1:' + btoa(s));
    showToast('已自動存檔 ✓');
  } catch (e) {
    console.warn('save failed', e);
  }
}

export function loadWorld() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw || !raw.startsWith('v1:')) return false;
    const s = atob(raw.slice(3));
    const d = world.data;
    let di = 0;
    for (let i = 0; i + 1 < s.length; i += 2) {
      const run = s.charCodeAt(i), v = s.charCodeAt(i + 1);
      d.fill(v, di, di + run);
      di += run;
    }
    if (di !== d.length) return false;
    world.dirty = true;
    return true;
  } catch (e) {
    return false;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
