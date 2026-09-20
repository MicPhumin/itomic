const sounds = {
  cardMove: new Audio("/public/sounds/whoosh.mp3"),
  buttonCheck: new Audio("/public/sounds/tada.mp3"),
  buttonClick: new Audio("/public/sounds/pop.mp3"),
  buttonReset: new Audio("/public/sounds/reset.mp3"),
};

let audioUnlocked = false;

export const unlockAudio = async () => {
  if (audioUnlocked) return;

  try {
    for (const audio of Object.values(sounds)) {
      audio.muted = true;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    }

    audioUnlocked = true;
    console.log("🔊 Audio unlocked");
  } catch (error) {
    console.log("Audio unlock failed:", error);
  }
};

export const playSound = (
  type: keyof typeof sounds,
  volume = 0.5
) => {
  const audio = sounds[type];

  // สำคัญ: ทำให้เสียงเดิมสามารถเล่นซ้ำได้
  audio.currentTime = 0;
  audio.volume = volume;

  audio.play().catch(() => {
    // Browser อาจ block autoplay
  });
};