// ===== Web Audio 簡易音效 =====

let audioCtx = null;

export function sfx(freq, dur, type) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const gn = audioCtx.createGain();
    o.type = type || 'square';
    o.frequency.value = freq;
    gn.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.connect(gn).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur);
  } catch (e) { /* 無音效環境 */ }
}
