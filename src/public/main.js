
let socket;
let buttons = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  socket = io();

  const directions  = [
    { id: 'up', angle: 270, label: 'Loud Storm', color: '#db8943' },
    { id: 'right', angle: 0, label: 'Swift Winds', color: '#3498db' },
    { id: 'down', angle: 90, label: 'Whispers', color: '#bd8349' },
    { id: 'left', angle: 180, label: 'Warmth', color: '#3498db' },
  ];

  const radius = min(width, height) * 0.3;

  directions.forEach(direction => {
    const angle = direction.angle;
    const radius = min(width, height) * 0.3;
    const xPos = width / 2 + radius * cos(angle);
    const yPos = height / 2 + radius * sin(angle);
  
    // Add directional vector to dir object
    direction.x = cos(angle);
    direction.y = sin(angle);
  
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
  buttons.forEach(btn => btn.remove());
  setup(); // Recreate layout on resize
}
