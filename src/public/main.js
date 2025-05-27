
let socket;
let buttons = [];
let textInput;
let container;
let sendTextButton;

const BUTTON_WIDTH = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  socket = io();

  createUI();

  socket.on('newLabel', (data) => {
    let buttonID = data.id;
    let label = data.label;
    const index = directions.findIndex(dir => dir.id === buttonID);

    let rgb = data.color;
    let cssColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

    buttons[index].html(label);  // Update visible text on button
    buttons[index].style('background-color', cssColor);
    directions[index].color = cssColor;
    directions[index].label = label;
  });
}

function createUI() {

  buttons.forEach(btn => btn.remove());
  buttons = [];

  if (textInput) textInput.remove();
  if (sendTextButton) sendTextButton.remove();

  container = createDiv().id('text-container');

  textInput = createInput();
  textInput.parent(container);
  textInput.id('text-input');
  //textInput.position(width / 2 - 100, height - height / 3);

  sendTextButton = createButton('Send Text');
  sendTextButton.parent(container);
  sendTextButton.id('send-text-btn');

  //sendTextButton.size(100, 40);
  //sendTextButton.style('font-size', '1rem');
  //sendTextButton.position(textInput.x + textInput.width + 10, textInput.y);
  sendTextButton.mousePressed(sendText);

  directions = [
    { id: 'up', angle: 270, label: 'Loud Storm', color: '#db8943' },
    { id: 'right', angle: 0, label: 'Swift Winds', color: '#3498db' },
    { id: 'down', angle: 90, label: 'Whispers', color: '#bd8349' },
    { id: 'left', angle: 180, label: 'Warmth', color: '#3498db' },
  ];

  const radius = min(width, height) * 0.2;

  const baseSize = radius * 0.9; // Or adjust the factor (0.6) to your taste
  const clampedSize = constrain(baseSize, 60, 120); // min 60px, max 120px


  directions.forEach(direction => {
    const angle = direction.angle;
    const xPos = width / 2 + radius * cos(angle);
    const yPos = height / 3 + radius * sin(angle);

    const btn = createButton(direction.label);
    btn.position(xPos - clampedSize / 2, yPos - clampedSize / 2);
    btn.size(clampedSize, clampedSize);
    btn.style('border-radius', '50%');
    btn.style('background-color', direction.color);
    btn.style('color', 'white');
    //btn.style('font-size', '1rem');
    btn.style('font-size', `${clampedSize * 0.2}px`); // Scale text (adjust multiplier as needed)
    btn.mousePressed(() => {
      socket.emit('buttonPress', direction);
    });
    buttons.push(btn);
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createUI(); // Recreate layout only
}

function sendText() {
  const textValue = textInput.value();
  socket.emit('textInput', { text: textValue });
  textInput.value('');
}
