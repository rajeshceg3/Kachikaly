class AudioEngine {
  constructor() {
    this.context = null;
    this.windNode = null;
    this.waterNode = null;
    this.masterGain = null;
    this.windGain = null;
    this.waterGain = null;
    this.isInitialized = false;
    this.isPlaying = false;
    this.birdTimer = null;
    this.leafTimer = null;
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();

      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.setValueAtTime(0, this.context.currentTime);

      this.setupWind();
      this.setupWater();
      this.setupBirds();
      this.setupLeaves();

      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext not supported or failed to initialize', e);
    }
  }

  setupWind() {
    // Brown noise for wind
    const bufferSize = 2 * this.context.sampleRate;
    const noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate for gain
    }

    this.windNode = this.context.createBufferSource();
    this.windNode.buffer = noiseBuffer;
    this.windNode.loop = true;

    // Lowpass filter to make it duller/distant
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    this.windGain = this.context.createGain();
    this.windGain.gain.value = 0.5;

    this.windNode.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    this.windNode.start(0);
  }

  setupWater() {
    // Pink noise approximation for water/leaves
    const bufferSize = 2 * this.context.sampleRate;
    const noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // (roughly) compensate for gain
      b6 = white * 0.115926;
    }

    this.waterNode = this.context.createBufferSource();
    this.waterNode.buffer = noiseBuffer;
    this.waterNode.loop = true;

    // Highpass filter for "leaves/water splashes"
    const filter = this.context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;

    this.waterGain = this.context.createGain();
    this.waterGain.gain.value = 0; // Start silent

    this.waterNode.connect(filter);
    filter.connect(this.waterGain);
    this.waterGain.connect(this.masterGain);

    this.waterNode.start(0);
  }

  setupBirds() {
    // Birds use transient oscillators, no persistent setup needed
  }

  setupLeaves() {
    // Leaves use transient noise bursts
  }

  triggerLeafRustle() {
    if (!this.context || !this.waterNode) return;

    // Reuse water noise buffer for leaves (pink noise is good for rustle)
    const source = this.context.createBufferSource();
    source.buffer = this.waterNode.buffer;

    // Filter for leaf crunch sound (bandpass/highpass)
    const filter = this.context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2500;
    filter.Q.value = 1;

    const gain = this.context.createGain();

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    // Envelope
    const now = this.context.currentTime;
    const duration = 0.3 + Math.random() * 0.2; // Short duration

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05); // Sharp attack
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Random start position in buffer
    const offset = Math.random() * (source.buffer.duration - duration);
    source.start(now, offset, duration);

    // Schedule next
    if (this.isPlaying) {
      const delay = Math.random() * 8000 + 4000; // 4-12s
      this.leafTimer = setTimeout(() => this.triggerLeafRustle(), delay);
    }
  }

  triggerBirdCall() {
    if (!this.context) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    // Randomize bird call
    // A simple chirp: high pitch dropping fast
    const startFreq = 2000 + Math.random() * 1000;
    osc.frequency.setValueAtTime(startFreq, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.5, this.context.currentTime + 0.1);

    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, this.context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);

    osc.start(this.context.currentTime);
    osc.stop(this.context.currentTime + 0.1);

    // Schedule next call
    if (this.isPlaying) {
      const delay = Math.random() * 10000 + 5000; // 5-15s
      this.birdTimer = setTimeout(() => this.triggerBirdCall(), delay);
    }
  }

  play() {
    if (!this.isInitialized) this.init();
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }

    // Fade in
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.context.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.context.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(1, this.context.currentTime + 2);
    }

    // Restart loops with initial delay so they don't fire immediately
    if (!this.isPlaying) {
      this.isPlaying = true;

      if (this.birdTimer) clearTimeout(this.birdTimer);
      this.birdTimer = setTimeout(() => this.triggerBirdCall(), Math.random() * 5000 + 2000);

      if (this.leafTimer) clearTimeout(this.leafTimer);
      this.leafTimer = setTimeout(() => this.triggerLeafRustle(), Math.random() * 5000 + 1000);
    }
  }

  pause() {
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.context.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.context.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0, this.context.currentTime + 2);
    }
    this.isPlaying = false;
    if (this.birdTimer) clearTimeout(this.birdTimer);
    if (this.leafTimer) clearTimeout(this.leafTimer);
  }

  setDepth(depth) {
    if (!this.isInitialized) return;

    // Depth is 0 to 100
    // At depth 0 (far): Wind is prominent, water is silent.
    // At depth 100 (close): Wind fades slightly, water becomes audible.

    const normalizedDepth = depth / 100;

    if (this.windGain) {
      // Wind slightly decreases as we get closer (more sheltered?)
      // or stays constant. Let's make it more immersive:
      // Wind shifts pitch or filter frequency?
      // Let's just adjust volume slightly.
      this.windGain.gain.setTargetAtTime(0.5 - (normalizedDepth * 0.2), this.context.currentTime, 0.1);
    }

    if (this.waterGain) {
      // Water increases with depth
      this.waterGain.gain.setTargetAtTime(normalizedDepth * 0.6, this.context.currentTime, 0.1);
    }
  }
}

export default new AudioEngine();
