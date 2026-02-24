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

  it('plays audio (resumes context)', () => {
    audioEngine.init();
    // Initial state is suspended in our mock
    expect(audioEngine.context.state).toBe('suspended');

    audioEngine.play();
    expect(audioEngine.context.state).toBe('running');
    expect(audioEngine.isPlaying).toBe(true);
  });

  it('pauses audio', () => {
    audioEngine.init();
    audioEngine.play();
    audioEngine.pause();
    expect(audioEngine.isPlaying).toBe(false);
    // Note: pause() in our implementation just ramps gain down, doesn't suspend context immediately
    // so checking context state might still be 'running', which is fine.
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
