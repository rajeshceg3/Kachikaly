import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import audioEngine from '../audio/AudioEngine'; // This is the default export instance
import { AudioContextMock } from '../test/mocks/audioMock';

describe('AudioEngine', () => {
  let originalAudioContext;

  beforeEach(() => {
    // Save original AudioContext if it exists (though likely undefined in jsdom/node)
    originalAudioContext = window.AudioContext;

    // Mock AudioContext
    window.AudioContext = AudioContextMock;

    // Reset AudioEngine state
    audioEngine.isInitialized = false;
    audioEngine.context = null;
    audioEngine.masterGain = null;
    audioEngine.windNode = null;
    audioEngine.waterNode = null;
    audioEngine.windGain = null;
    audioEngine.waterGain = null;
    audioEngine.isPlaying = false;
  });

  afterEach(() => {
    // Restore
    window.AudioContext = originalAudioContext;
    vi.useRealTimers();
  });

  it('initializes AudioContext and nodes', () => {
    audioEngine.init();

    expect(audioEngine.isInitialized).toBe(true);
    expect(audioEngine.context).toBeInstanceOf(AudioContextMock);
    expect(audioEngine.masterGain).toBeDefined();
    // Check if master gain is connected (mock doesn't track connections fully but we can check existence)
    expect(audioEngine.windNode).toBeDefined();
    expect(audioEngine.waterNode).toBeDefined();
  });

  it('plays audio (resumes context) and starts loops', () => {
    vi.useFakeTimers();
    audioEngine.init();
    // Initial state is suspended in our mock
    expect(audioEngine.context.state).toBe('suspended');

    audioEngine.play();
    expect(audioEngine.context.state).toBe('running');
    expect(audioEngine.isPlaying).toBe(true);

    // Timers should be set
    expect(audioEngine.birdTimer).toBeDefined();
    expect(audioEngine.leafTimer).toBeDefined();
  });

  it('triggers bird calls', () => {
    vi.useFakeTimers();
    audioEngine.init();
    audioEngine.play();

    const createOscillatorSpy = vi.spyOn(audioEngine.context, 'createOscillator');

    // Fast forward enough to trigger a bird call (delay is 2000-7000ms initially)
    vi.advanceTimersByTime(8000);

    expect(createOscillatorSpy).toHaveBeenCalled();
  });

  it('triggers leaf rustle', () => {
    vi.useFakeTimers();
    audioEngine.init();
    audioEngine.play();

    // Reset spy on createBufferSource (called during init for wind/water)
    const createBufferSourceSpy = vi.spyOn(audioEngine.context, 'createBufferSource');
    createBufferSourceSpy.mockClear();

    // Fast forward (delay 1000-6000ms)
    vi.advanceTimersByTime(7000);

    expect(createBufferSourceSpy).toHaveBeenCalled();
  });

  it('pauses audio and stops loops', () => {
    vi.useFakeTimers();
    audioEngine.init();
    audioEngine.play();

    expect(audioEngine.isPlaying).toBe(true);

    audioEngine.pause();
    expect(audioEngine.isPlaying).toBe(false);

    // We can't easily check if timer is cleared in JS without spying on clearTimeout
    // but we can check if isPlaying prevents new calls
    const createOscillatorSpy = vi.spyOn(audioEngine.context, 'createOscillator');
    vi.advanceTimersByTime(20000);
    expect(createOscillatorSpy).not.toHaveBeenCalled();
  });

  it('adjusts volume based on depth', () => {
    audioEngine.init();
    audioEngine.play();

    // Mock setTargetAtTime
    const windGainSpy = vi.spyOn(audioEngine.windGain.gain, 'setTargetAtTime');
    const waterGainSpy = vi.spyOn(audioEngine.waterGain.gain, 'setTargetAtTime');

    // Depth 0 (far)
    audioEngine.setDepth(0);
    // Wind gain should be close to 0.5
    expect(windGainSpy).toHaveBeenCalledWith(0.5, expect.any(Number), 0.1);
    // Water gain should be 0
    expect(waterGainSpy).toHaveBeenCalledWith(0, expect.any(Number), 0.1);

    // Depth 100 (close)
    audioEngine.setDepth(100);
    // Wind gain: 0.5 - (1 * 0.2) = 0.3
    expect(windGainSpy).toHaveBeenCalledWith(0.3, expect.any(Number), 0.1);
    // Water gain: 1 * 0.6 = 0.6
    expect(waterGainSpy).toHaveBeenCalledWith(0.6, expect.any(Number), 0.1);
  });
});
