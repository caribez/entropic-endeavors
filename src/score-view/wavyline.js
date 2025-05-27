class WavyLine {
  constructor(offset, col, weight, waveSpeed) {
    this.offset = offset;
    this.col = col;
    this.weight = weight;
    this.waveSpeed = waveSpeed;
    this.yBase = random(height * 0.1, height * 0.9);
    this.noiseOffset = 0;
    this.birthTime = millis(); // Track when the wave was created
    this.lifetime = 10000;     // 10 seconds
  }

  update() {
    this.noiseOffset += this.waveSpeed * (noiseScale * 75);
  }

  isAlive() {
    return millis() - this.birthTime < this.lifetime;
  }

  // g is the Graphics object
  display(g) {
    g.beginShape();
    for (let i = 0; i < resolution; i++) {
      let x = map(i, 0, resolution - 1, 0, width);
      let t = frameCount * this.waveSpeed;
      let noiseInput = i * noiseScale + this.offset;
      let y = this.yBase + noise(noiseInput, t) * waveAmplitude - waveAmplitude / 2;
      g.curveVertex(x, y);
    }
    g.endShape();
  }
}

function alphaFromColor(c) {
  return c._getAlpha ? c._getAlpha() : alpha(c);
}

function adjustAlpha(c, newAlpha) {
  return color(red(c), green(c), blue(c), newAlpha);
}

