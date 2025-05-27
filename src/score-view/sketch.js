
const __DEV__ = true; // manually switch to false for production


// NEW CODE 

let waves = [];
let initialWaves = 1;
let resolution = 200;
let noiseScale = 0.02;
let waveAmplitude = 200;

// END OF NEW CODE

// OLD???
let bandHeight = 10;
let baseBandHeight = 10;
let extraBandHeight = 0;
let maxBandHeight;

let trailsLayer;
let overlay;

let timeElapsed;

const palette = [
  [200, 100, 255],
  [100, 200, 255],
  [255, 150, 100],
  [150, 255, 150],
  [255, 255, 100],
];

const textFonts = [
  'Courier New',
  'Verdana',
  'Georgia',
  'Times New Roman',
];

if (__DEV__) {
  let simulateButton;
}

let performanceStartTime = 0;
let performanceDuration = 60000; // 60 seconds

const maxJitter = 12; // final maximum jitter

let startButton;
let performanceRunning = false;
let messages = [];
let currentMessage = '';
let fadeDuration = 2000; // Duration of fade effect in milliseconds
let displayDuration = 1000; // Duration to display the message in milliseconds : SET SHORT FOR TESTING PURPOSES
let backgroundOpacity = 2.1;
let textOpacity = 5;
let fadeInStart = 0;
let fadeOutStart = 0;
let displayStart = 0;
let fadeIn = false;
let fadeOut = false;
let displaying = false;
let textPosX, textPosY;

const socket = io(); // Establish Socket.io connection

let performanceSound;

function preload() {
  performanceSound = loadSound('assets/entropic-background.mp3'); // or .wav, .ogg
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  trailsLayer = createGraphics(windowWidth, windowHeight);
  trailsLayer.background(255); // initial white background

  overlay = createGraphics(windowWidth, windowHeight);
  overlay.clear(); // Start transparent

  /*
  for (let i = 0; i < initialPoints; i++) {
    addRandomParticle();
  }
    */
  waves = [];

  for (let i = 0; i < initialWaves; i++) {
    addWavyLine(random(palette));
  }

  maxBandHeight = height / 2;

  textPosX = random(width);
  textPosY = random(height);

  if (__DEV__) {
    simulateButton = createButton('Simulate Message');
    simulateButton.position(height / 20, width / 20 + 60); // Position it below the Start/Stop button
    simulateButton.size(150, 50);
    simulateButton.mousePressed(() => {
      const fakeMessage = { text: 'Simulacra' };
      // Directly call the same logic as the socket listener
      if (!performanceRunning) return;
      if (fakeMessage.text.length > 0) {
        currentMessage = fakeMessage.text;

        overlay.textFont(random(textFonts));
        [textPosX, textPosY] = setSafeRandomTextPosition(currentMessage);

        fadeIn = true;
        fadeInStart = millis();

        addWavyLine(random(palette));
        bandHeight += 20;
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

      extraBandHeight += 20; // or another step size
      extraBandHeight = constrain(extraBandHeight, 0, maxBandHeight);

      //addRandomParticle(data.color);
      addWavyLine(data.color);

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

  if (performanceRunning) {
    let timeElapsed = millis() - performanceStartTime;
    entropyFactor = constrain(timeElapsed / performanceDuration, 0, 1);
  }

  baseBandHeight = lerp(10, maxBandHeight, entropyFactor);

  // Final band height used for particles:
  bandHeight = constrain(baseBandHeight + extraBandHeight, 0, maxBandHeight);

  noFill();
  trailsLayer.noFill();
  
  trailsLayer.background(230, 255, 216, 5);

for (let i = waves.length - 1; i >= 0; i--) {
  let wave = waves[i];
  if (!wave.isAlive()) {
    waves.splice(i, 1);
    continue;
  }

  let age = millis() - wave.birthTime;
  let alpha = map(age, 0, wave.lifetime, alphaFromColor(wave.col), 0);
  trailsLayer.stroke(adjustAlpha(wave.col, alpha));
  trailsLayer.strokeWeight(wave.weight);
  trailsLayer.noFill();
  wave.update();
  wave.display(trailsLayer);
}

  // Draw and update overlay
  updateOverlay();

  image(trailsLayer, 0, 0);  // draw the persistent particle trails
  blendMode(MULTIPLY);       // hide white overlay background, preserve black text
  image(overlay, 0, 0);      // draw fading text
  blendMode(BLEND);          // reset

} // end draw

function setSafeRandomTextPosition(message, textSize = 48, margin = 10) {
  overlay.textSize(textSize);
  let w = overlay.textWidth(message);
  let h = overlay.textAscent() + overlay.textDescent();

  let x = random(width);
  let y = random(height);

  if (x + w > width - margin) x = width - w - margin;
  if (x < margin) x = margin;

  if (y + h > height - margin) y = height - h - margin;
  if (y < h + margin) y = h + margin;

  return [x, y];
}


function resetPerformance() {

  extraBandHeight = 0;
  bandHeight = 10;
  baseBandHeight = 10;
  performanceStartTime = 0;

  trailsLayer.clear();       // clear the particle trails
  trailsLayer.background(255); // reset to white background

  overlay.clear();           // clear fading text overlay

  currentMessage = '';
  fadeIn = false;
  fadeOut = false;
  displaying = false;

  for (let i = 0; i < initialWaves; i++) {
    addWavyLine();
  }


}

function updateOverlay() {
  overlay.background(255, backgroundOpacity);
  //fill(0);
  overlay.textSize(48);

  if (fadeIn) {
    let fadeInElapsedTime = millis() - fadeInStart;
    let fadeInAlpha = map(fadeInElapsedTime, 0, fadeDuration, 0, 255);
    overlay.fill(0, textOpacity);
    overlay.text(currentMessage, textPosX, textPosY);

    if (fadeInElapsedTime > fadeDuration) {
      fadeIn = false;
      displaying = true;
      displayStart = millis();
    }
  } else if (displaying) {
    let displayElapsedTime = millis() - displayStart;
    if (displayElapsedTime > displayDuration) {
      displaying = false;

      if (performanceRunning) {
        getMessage(); // Fetch a new message after fade out
      }
    }
  }
}

function getMessage() {
  socket.emit('getMessage'); // Request a new message from the server
}

function addWavyLine(waveColor) {
  let weight = random(4, 10);
  let waveSpeed = map(weight, 2, 15, 0.01, 0.005);
  let offset = waves.length * 1000;

  // Use color from server or fallback
  let col = waveColor ? color(...waveColor) : color(random(palette));
  waves.push(new WavyLine(offset, col, weight, waveSpeed));

  if (waves.length > 100) {
    waves.shift(); // Limit total lines
  }
}


/*
function addRandomParticle(particleColor) {
  //let x = random(width);
  let x = random(width, width + (width / 2)); // Start offscreen to the right
  let centerY = height / 2;
  let yBase = centerY + random(-bandHeight / 2, bandHeight / 2);
  let y = yBase;
  let noiseSeed = random(1000);

  let col = particleColor ? particleColor : color(random(palette));
  let size = random(4, 10);                 // Bigger number = visually larger
  let speed = map(size, 10, 4, 1, 2.5);       // Bigger size → slower speed
  let jitterPhase = random(TWO_PI);


  wavePoints.push({
    x,
    y,
    yBase,
    noiseSeed,
    currentColor: col,
    targetColor: col,
    lerpAmount: 1,
    speed,
    size,
    jitterPhase
  });

  if (wavePoints.length > 200) {
    wavePoints.shift(); // Remove oldest
  }

}

*/

