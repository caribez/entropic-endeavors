
let socket;
let buttons = [];
let textInput;
let sendTextButton;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  socket = io();

  createUI();

  socket.on('newLabel', (data) => {
    let buttonID = data.id;
    let label = data.label;
    const index = directions.findIndex(dir => dir.id === buttonID);
    buttons[index].html(label);  // Update visible text on button
    directions[index].label = label;
  });  
}

function createUI() {

  buttons.forEach(btn => btn.remove());
  buttons = [];

  if (textInput) textInput.remove();
  if (sendTextButton) sendTextButton.remove();

  textInput = createInput();
  textInput.position(width / 2 - 100, height - height / 3);

  sendTextButton = createButton('Send Text');
  sendTextButton.size(100, 40);
  sendTextButton.style('font-size', '1rem');
  sendTextButton.position(textInput.x + textInput.width + 10, textInput.y);
  sendTextButton.mousePressed(sendText);

  directions = [
    { id: 'up', angle: 270, label: 'Loud Storm', color: '#db8943' },
    { id: 'right', angle: 0, label: 'Swift Winds', color: '#3498db' },
    { id: 'down', angle: 90, label: 'Whispers', color: '#bd8349' },
    { id: 'left', angle: 180, label: 'Warmth', color: '#3498db' },
  ];

  const radius = min(width, height) * 0.3;

  directions.forEach(direction => {
    const angle = direction.angle;
    const xPos = width / 2 + radius * cos(angle);
    const yPos = height / 2 + radius * sin(angle);

    const btn = createButton(direction.label);
    btn.position(xPos - 50, yPos - 50);
    btn.size(100, 100);
    btn.style('border-radius', '50%');
    btn.style('background-color', direction.color);
    btn.style('color', 'white');
    btn.style('font-size', '1rem');
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
  socket.emit('textInput', {text: textValue});
  textInput.value('');
}
