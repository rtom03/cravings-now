let audio: HTMLAudioElement | null = null;
let unlocked = false;

export const initSound = () => {
  if (audio) return;
  audio = new Audio("/sounds/new-order.mp3"); // put the file in /public/sounds
  audio.preload = "auto";

  const unlock = () => {
    if (!audio) return;
    audio.muted = true;
    audio
      .play()
      .then(() => {
        audio!.pause();
        audio!.currentTime = 0;
        audio!.muted = false;
        unlocked = true;
      })
      .catch(() => {});
    window.removeEventListener("click", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("click", unlock);
  window.addEventListener("keydown", unlock);
};

export const playNewOrderSound = () => {
  if (!audio || !unlocked) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
};
