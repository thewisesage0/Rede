import { useEffect, useRef, useState } from "react";

// Drop your own file in here as exactly one of these names and it will
// play automatically the moment the AE's dashboard loads:
//   public/audio/ae-welcome.mp3
//   public/audio/ae-welcome.ogg
//   public/audio/ae-welcome.wav
// No file there yet? The browser just fails to find it and nothing plays —
// safe to ship either way.
const SOURCES = [
  { src: "/audio/ae-welcome.mp3", type: "audio/mpeg" },
  { src: "/audio/ae-welcome.ogg", type: "audio/ogg" },
  { src: "/audio/ae-welcome.wav", type: "audio/wav" },
];

const SESSION_KEY = "kyef-ae-welcome-played";

/**
 * Plays the AE's welcome sound once per browser tab session, the moment
 * `enabled` turns true (i.e. the signed-in admin's dashboard mounts).
 *
 * Browsers block audio-with-sound autoplay unless it follows a real user
 * gesture; logging in is one, so this usually just works. When it's
 * blocked anyway, `blocked` flips true so the UI can offer a one-tap
 * "play welcome sound" button instead of silently failing.
 */
export function useAeWelcomeSound(enabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    // Once per tab session, not on every dashboard sub-page navigation.
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;

    const audio = new Audio();
    SOURCES.forEach(({ src, type }) => {
      const source = document.createElement("source");
      source.src = src;
      source.type = type;
      audio.appendChild(source);
    });
    audio.preload = "auto";
    audio.volume = 0.6;
    audioRef.current = audio;

    audio
      .play()
      .then(() => {
        sessionStorage.setItem(SESSION_KEY, "1");
      })
      .catch(() => {
        // Autoplay blocked, or no audio file has been added yet — either
        // way, don't mark it as played so a manual tap can still trigger it.
        setBlocked(true);
      });

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [enabled]);

  const playNow = () => {
    audioRef.current
      ?.play()
      .then(() => {
        sessionStorage.setItem(SESSION_KEY, "1");
        setBlocked(false);
      })
      .catch(() => {});
  };

  return { blocked, playNow };
}
