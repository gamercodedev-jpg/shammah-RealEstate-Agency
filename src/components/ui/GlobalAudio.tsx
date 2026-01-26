import { useEffect } from "react";

export default function GlobalAudio() {
  useEffect(() => {
    // create audio element if missing
    let el = document.getElementById("global-audio") as HTMLAudioElement | null;
    if (!el) {
      el = document.createElement("audio");
      el.id = "global-audio";
      el.style.display = "none";
      el.loop = true;
      el.preload = "auto";
      document.body.appendChild(el);
    }

    // Keep this unmuted since we removed the UI control.
    // Playback still respects browser autoplay rules.
    el.muted = false;
  }, []);

  return null;
}
