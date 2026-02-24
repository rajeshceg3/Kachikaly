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
    this.isPlaying = true;
  }

  pause() {
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.context.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.context.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0, this.context.currentTime + 2);
    }
    this.isPlaying = false;
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
