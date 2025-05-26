  
  let wavePoints = [];
 let initialPoints = 1;
 
let numPoints = 40;
let waveAmplitude = 100;
let waveSpeed = 1.5;
  
  let bandHeight = 10;

let overlay;

const palette = [
  [200, 100, 255],
  [100, 200, 255],
  [255, 150, 100],
  [150, 255, 150],
  [255, 255, 100],
];

    let startButton;
    let performanceRunning = false;
    let messages = [];
    let currentMessage = '';
    let fadeDuration = 2000; // Duration of fade effect in milliseconds
    let displayDuration = 1000; // Duration to display the message in milliseconds : SET SHORT FOR TESTING PURPOSES
    let backgroundOpacity = 2;
    let textOpacity = 5;
    let fadeInStart = 0;
    let fadeOutStart = 0;
    let displayStart = 0;
    let fadeIn = false;
    let fadeOut = false;
    let displaying = false;
    let xPos, yPos;
    
    const socket = io(); // Establish Socket.io connection
    

    function setup() {
      createCanvas(windowWidth, windowHeight);
  overlay = createGraphics(windowWidth, windowHeight);
  overlay.clear(); // Start transparent

  for (let i = 0; i < initialPoints; i++) {
    addRandomParticle();
  }

      xPos = random(width);
      yPos = random(height);

      startButton = createButton('Start');
      startButton.position(height / 20, width / 20);
      startButton.size(100, 50);
      
      startButton.mousePressed(() => {
        if (performanceRunning == false) {
          socket.emit('start-performance');
          performanceRunning = true;
          startButton.html("Stop");
          getMessage(); // Start requesting words when performance starts
        }
        else if (performanceRunning == true) {
          socket.emit('stop-performance');
          performanceRunning = false;
          startButton.html("Start");
        }
    });
      
      socket.on('newMessage', (data) => {
        if (!performanceRunning) return; // ignore messages if not performing        
        if (data.text.length > 0) {
          currentMessage = data.text;
          fadeIn = true;
          fadeInStart = millis(); // Record the start time for the fade in effect
          xPos = random(width);
          yPos = random(height);

          addRandomParticle();
          bandHeight += 10;
          //let p = random(wavePoints);
          //p.targetColor = color(random(palette));
          //p.lerpAmount = 0; // reset blend progression
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

noFill();


// Update point positions
for (let p of wavePoints) {
  // Update horizontal motion
  p.x -= p.speed;

  if (p.x < 0) {
    p.x = width;
    p.yBase = height / 2 + random(-bandHeight / 2, bandHeight / 2);
  }

  // Smooth vertical drift using Perlin noise
  let t = frameCount * 0.001 + p.noiseSeed; // includes time and unique offset
  let floatOffset = map(noise(t), 0, 1, -waveAmplitude, waveAmplitude);

  let jitter = sin(frameCount * 0.02 + p.jitterPhase) * 3; // small wiggle

  p.y = p.yBase + floatOffset + jitter;

  if (p.lerpAmount < 1) {
    p.currentColor = lerpColor(p.currentColor, p.targetColor, 0.02);
    p.lerpAmount += 0.02;
  }

  stroke(p.currentColor);
strokeWeight(p.size);
  point(p.x, p.y);
}



  // Draw and update overlay
  updateOverlay();
  blendMode(OVERLAY);

  // Draw the overlay on top of main canvas
  //image(overlay, 0, 0);      
blendMode(BLEND);



    } // end draw

    function updateOverlay() {
      overlay.background(255, backgroundOpacity);
      //fill(0);
      overlay.textSize(48);
  if (fadeIn) {
    let fadeInElapsedTime = millis() - fadeInStart;
    let fadeInAlpha = map(fadeInElapsedTime, 0, fadeDuration, 0, 255);
    overlay.fill (0, textOpacity);
    overlay.text(currentMessage, xPos, yPos);
    
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
      socket.emit('getMessage'); // Emit a 'getMessage' event to request a new message from the server
    }

    function addRandomParticle() {
  //let x = random(width);
  let x = random(width, width + (width / 2) ); // Start offscreen to the right
  let centerY = height / 2;
  let yBase = centerY + random(-bandHeight / 2, bandHeight / 2);
  let y = yBase;
  let noiseSeed = random(1000);
  let col = color(random(palette));
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

