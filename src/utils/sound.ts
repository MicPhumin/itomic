const sounds = {
  cardMove: new Audio("/public/sounds/whoosh.mp3"),
  buttonCheck: new Audio("/public/sounds/tada.mp3"),
  buttonClick: new Audio("/public/sounds/pop.mp3"),
  buttonReset: new Audio("/public/sounds/reset.mp3"),
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