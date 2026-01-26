export function playGlobalAudio(src: string | null) {
  let el = document.getElementById("global-audio") as HTMLAudioElement | null;
  if (!el) {
    el = document.createElement("audio");
    el.id = "global-audio";
    el.style.display = "none";
    el.loop = true;
    el.preload = "auto";
    el.muted = false;
    document.body.appendChild(el);
  }
  if (!src) {
    el.pause();
    el.src = "";
    return;
  }
  if (el.src !== src) {
    el.src = src;
  }
  el.play().catch(() => {});
}

export function pauseGlobalAudio() {
  const el = document.getElementById("global-audio") as HTMLAudioElement | null;
  if (!el) return;
  el.pause();
}
