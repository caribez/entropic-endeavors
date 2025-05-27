const waves = [];
let initialWaves = 1;
let noiseScale = 0.02;
let waveAmplitude = 200;

let trailsLayer;
let overlay;

let timeElapsed;

if (__DEV__) {
  let simulateButton;
}

let performanceStartTime = 0;
let performanceDuration = 120000; // 2 minutes

const maxJitter = 12; // final maximum jitter

let titleAlpha = 255;

let startButton;
let performanceRunning = false;
let messages = [];

const socket = io(); // Establish Socket.io connection

let performanceSound;

function preload() {
  performanceSound = loadSound('assets/entropic-background.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  trailsLayer = createGraphics(windowWidth, windowHeight);
  trailsLayer.background(255); 

  overlay = createGraphics(windowWidth, windowHeight);
  overlay.clear(); 


  for (let i = 0; i < initialWaves; i++) {
    addWave(random(palette));
  }

  textPosX = random(width);
  textPosY = random(height);

  if (__DEV__) {
    simulateButton = createButton('Simulate Message');
    simulateButton.position(height / 20, width / 20 + 60);
    simulateButton.size(150, 50);
    simulateButton.mousePressed(() => {
      const fakeMessage = { text: 'Simulacra' };
      if (!performanceRunning) return;
      if (fakeMessage.text.length > 0) {
        currentMessage = fakeMessage.text;

        overlay.textFont(random(textFonts));
        [textPosX, textPosY] = setSafeRandomTextPosition(currentMessage);

        fadeIn = true;
        fadeInStart = millis();

        addWave(random(palette));
      }
    });
  }


  startButton = createButton('Start');
  startButton.position(height / 20, width / 20);
  startButton.size(100, 50);

  startButton.mousePressed(() => {
    userStartAudio();

    if (performanceRunning == false) {
      socket.emit('start-performance');
      performanceRunning = true;
      startButton.html("Stop");
      getMessage(); // Start requesting words when performance starts

      if (performanceSound && !performanceSound.isPlaying()) {
        performanceSound.amp(0.7);
        performanceSound.play();
      }

      performanceStartTime = millis();
    }
    else if (performanceRunning == true) {
      socket.emit('stop-performance');
      performanceRunning = false;
      resetPerformance();
      startButton.html("Start");

      if (performanceSound && performanceSound.isPlaying()) {
        performanceSound.amp(0);
        performanceSound.stop();
      }
    }
  });

  socket.on('newMessage', (data) => {
    if (!performanceRunning) return; // ignore messages if not performing        
    if (data.text.length > 0) {
      currentMessage = data.text;

      overlay.textFont(random(textFonts));
      [textPosX, textPosY] = setSafeRandomTextPosition(currentMessage);

      fadeIn = true;
      fadeInStart = millis(); // Record the start time for the fade in effect

      addWave(data.color);
    }
  });

  socket.on('messageReceived', () => {
    if (fadeOut || fadeIn || displaying) {
      return;
    }
    getMessage(); // No fade going on, so just fetch the new message.
  });

  background(255);
}

function draw() {
  let entropyFactor = 0;
  let entropyFactorCubic = 0;
  let timeElapsed = 0;
  if (performanceRunning) {
    timeElapsed = millis() - performanceStartTime;
    entropyFactor = constrain(timeElapsed / performanceDuration, 0, 1);
    entropyFactorCubic = entropyFactor * entropyFactor;
  }

  waveAmplitude = lerp(50, 1000, entropyFactor);
  noiseScale = lerp(0.01, 0.05, entropyFactorCubic); // or more extreme if you want chaos

  trailsLayer.noFill();

  let performanceSineRate = TWO_PI / performanceDuration;

  // Phase offsets in radians to spread out their low points
  let phaseR = 0;               // Red starts at phase 0
  let phaseG = TWO_PI / 3;      // Green starts 1/3 of a cycle ahead
  let phaseB = TWO_PI * 2 / 3;  // Blue starts 2/3 of a cycle ahead

  let r = map(sin(millis() * performanceSineRate * 5 + phaseR), -1, 1, 190, 255);
  let g = map(sin(millis() * performanceSineRate * 4 + phaseG), -1, 1, 210, 255);
  let b = map(sin(millis() * performanceSineRate * 2 + phaseB), -1, 1, 190, 255);

  trailsLayer.background(r, g, b, 5);

  for (let i = waves.length - 1; i >= 0; i--) {
    let wave = waves[i];
    if (!wave.isAlive()) {
      waves.splice(i, 1);
      continue;
    }

    let age = millis() - wave.birthTime;

    let alpha = calculateAlpha(wave, age);

    trailsLayer.stroke(adjustAlpha(wave.col, alpha));
    trailsLayer.strokeWeight(wave.weight);
    trailsLayer.noFill();
    wave.update();
    wave.display(trailsLayer);
  }

  // Update overlay
  updateOverlay(overlay, performanceRunning);

  image(trailsLayer, 0, 0); // draw the persistent particle trails
  blendMode(MULTIPLY); // hide white overlay background, preserve black text
  image(overlay, 0, 0); // draw text layer

  blendMode(BLEND); // reset blend mode

  if (__DEV__) {
    noStroke();
    fill(0, 150);
    textSize(16);
    textAlign(LEFT, BOTTOM);
    text(`Duration: ${nf(timeElapsed / 1000, 1, 3)} seconds`, 10, height - 26);
    text(`Entropy: ${nf(entropyFactor, 1, 3)}`, 10, height - 10);
  }

  drawTitleText();

} // end draw

// Request a new message from the server
function getMessage() {
  socket.emit('getMessage');
}

// Calculate alpha depending on an object's age
function calculateAlpha(wave, age) {
  let fadeInTime = wave.lifetime * 0.2; // first 20% of lifetime is fade-in
  let fullAlpha = alphaFromColor(wave.col);
  let alpha;

  if (age < fadeInTime) {
    alpha = map(age, 0, fadeInTime, 0, fullAlpha);
  } else {
    alpha = map(age, fadeInTime, wave.lifetime, fullAlpha, 0);
  }
  return alpha;
}

function resetPerformance() {

  performanceStartTime = 0;

  // reset to white background
  trailsLayer.background(255);
  overlay.background(255);

  currentMessage = '';
  fadeIn = false;
  fadeOut = false;
  displaying = false;

  waves.length = 0;

  for (let i = 0; i < initialWaves; i++) {
    addWave();
  }
}

// Fades in and out depending on if performance is running
function drawTitleText() {
  let fadeSpeed = 5;

  if (performanceRunning) {
    titleAlpha -= fadeSpeed;
  } else {
    titleAlpha += fadeSpeed;
  }

  titleAlpha = constrain(titleAlpha, 0, 255);

  // Skip rendering if fully transparent
  if (titleAlpha <= 0) return;

  push();

  blendMode(MULTIPLY);

  textFont('Times New Roman');
  textSize(96);
  textAlign(CENTER, CENTER);

  // Oscillating color
  let t = millis() * 0.0001;
  let r = map(sin(t), -1, 1, 10, 90);
  let g = map(sin(t + 2), -1, 1, 15, 90);
  let b = map(sin(t + 3.5), -1, 1, 10, 90);

  fill(r, g, b, titleAlpha);
  noStroke();

  text('ENTROPIC ENDEAVOURS', width / 2, height / 3);

  pop();
}

// Add a visual wave
function addWave(waveColor) {
  let weight = random(4, 15);
  let waveSpeed = map(weight, 4, 15, 0.01, 0.005);
  let offset = waves.length * 1000;

  // Use color from server or fallback
  let col = waveColor ? color(...waveColor) : color(random(palette));
  waves.push(new WavyLine(offset, col, weight, waveSpeed));

  // Limit total lines to MAX_WAVES
  if (waves.length > MAX_WAVES) {
    waves.shift();
  }
}
