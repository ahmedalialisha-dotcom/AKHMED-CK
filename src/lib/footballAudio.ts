type GameSounds = {
  startCrowd: () => void;
  playKick: () => void;
  playGoal: () => void;
  playTackle: () => void;
  dispose: () => void;
};

export const createGameSounds = (): GameSounds => {
  let context: AudioContext | undefined;
  let crowd: AudioBufferSourceNode | undefined;
  let crowdGain: GainNode | undefined;
  let chantTimer: number | undefined;
  const getContext = () => {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
    return context;
  };
  const tone = (frequency: number, duration: number, volume: number) => {
    const audio = getContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
  };
  return {
    startCrowd: () => {
      if (chantTimer) return;
      const chant = () => { tone(115, .12, .055); window.setTimeout(() => tone(115, .12, .045), 190); };
      chant();
      chantTimer = window.setInterval(chant, 820);
    },
    playKick: () => undefined,
    playGoal: () => {
      tone(523, 0.16, 0.16);
      window.setTimeout(() => tone(784, 0.32, 0.18), 130);
    },
    playTackle: () => undefined,
    dispose: () => {
      crowd?.stop();
      crowdGain?.disconnect();
      if (chantTimer) window.clearInterval(chantTimer);
      context?.close();
    },
  };
};
