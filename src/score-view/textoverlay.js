let currentMessage = '';
let fadeInStart = 0;
let fadeOutStart = 0;
let displayStart = 0;
let fadeIn = false;
let fadeOut = false;
let displaying = false;
let textPosX, textPosY;
let fadeDuration = 3000; 
let displayDuration = 2000; 
let backgroundOpacity = 2.1;
let textOpacity = 5;

// Makes sure text doesn't render outside the screen
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


// Update text overlay layer
function updateOverlay(overlay, performanceRunning) {
  overlay.background(255, backgroundOpacity);
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
        getMessage(); // Get new message from server after fade out
      }
    }
  }
}