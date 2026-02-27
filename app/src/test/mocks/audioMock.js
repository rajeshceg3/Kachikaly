// Mock implementation of Web Audio API

export class AudioNodeMock {
  constructor() {
    this.context = null;
    this.numberOfInputs = 1;
    this.numberOfOutputs = 1;
    this.channelCount = 2;
    this.channelCountMode = 'max';
    this.channelInterpretation = 'speakers';
  }
  connect() {}
  disconnect() {}
}

export class AudioParamMock {
  constructor(defaultValue = 0) {
    this.value = defaultValue;
    this.defaultValue = defaultValue;
    this.minValue = -3.4028235e38;
    this.maxValue = 3.4028235e38;
  }
  setValueAtTime() {}
  linearRampToValueAtTime() {}
  exponentialRampToValueAtTime() {}
  setTargetAtTime() {}
  setValueCurveAtTime() {}
  cancelScheduledValues() {}
  cancelAndHoldAtTime() {}
}

export class GainNodeMock extends AudioNodeMock {
  constructor() {
    super();
    this.gain = new AudioParamMock(1);
  }
}

export class AudioBufferMock {
  constructor(options) {
    this.length = options.length;
    this.sampleRate = options.sampleRate;
    this.numberOfChannels = options.numberOfChannels;
    this._data = new Float32Array(this.length);
  }
  getChannelData() {
    return this._data;
  }
  copyFromChannel() {}
  copyToChannel() {}
}

export class AudioBufferSourceNodeMock extends AudioNodeMock {
  constructor() {
    super();
    this.buffer = null;
    this.loop = false;
    this.loopStart = 0;
    this.loopEnd = 0;
    this.playbackRate = new AudioParamMock(1);
    this.detune = new AudioParamMock(0);
  }
  start() {}
  stop() {}
}

export class BiquadFilterNodeMock extends AudioNodeMock {
  constructor() {
    super();
    this.frequency = new AudioParamMock(350);
    this.detune = new AudioParamMock(0);
    this.Q = new AudioParamMock(1);
    this.gain = new AudioParamMock(0);
    this.type = 'lowpass';
  }
}

export class OscillatorNodeMock extends AudioNodeMock {
  constructor() {
    super();
    this.type = 'sine';
    this.frequency = new AudioParamMock(440);
    this.detune = new AudioParamMock(0);
  }
  start() {}
  stop() {}
  setPeriodicWave() {}
}

export class AudioContextMock {
  constructor() {
    this.currentTime = 0;
    this.sampleRate = 44100;
    this.state = 'suspended';
    this.destination = new AudioNodeMock();
    this.listener = {
      positionX: new AudioParamMock(0),
      positionY: new AudioParamMock(0),
      positionZ: new AudioParamMock(0),
      forwardX: new AudioParamMock(0),
      forwardY: new AudioParamMock(0),
      forwardZ: new AudioParamMock(-1),
      upX: new AudioParamMock(0),
      upY: new AudioParamMock(1),
      upZ: new AudioParamMock(0),
    };
  }

  createGain() { return new GainNodeMock(); }
  createBuffer(channels, length, rate) {
    return new AudioBufferMock({ numberOfChannels: channels, length, sampleRate: rate });
  }
  createBufferSource() { return new AudioBufferSourceNodeMock(); }
  createBiquadFilter() { return new BiquadFilterNodeMock(); }
  createOscillator() { return new OscillatorNodeMock(); }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }
  close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}
