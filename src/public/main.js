document.addEventListener("DOMContentLoaded", () => {

  const directions = [ 
    {'buttonId': 'up', 'x': 0, 'y': 1, 'text': 'Stormy'},
    {'buttonId': 'right', 'x': 1, 'y': 0, 'text': 'Swiftly'},
    {'buttonId': 'down', 'x': 0, 'y': -1, 'text': 'Whispers'},
    {'buttonId': 'left', 'x': -1, 'y': 0, 'text': 'Warmth'},
  ];

  const buttons = [
    document.querySelector('#up-btn'),
    document.querySelector('#right-btn'),
    document.querySelector('#down-btn'),
    document.querySelector('#left-btn'),
  ];

  const socket = io();

  // Function to emit 'buttonPress' event to the server
  function emitButtonPress(buttonId) {
    socket.emit('buttonPress', buttonId);
  }

  // Attach button click listeners
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', () => {
      emitButtonPress(directions[i]);
    });
  }

  socket.on('updateDirection', (updatedDirection) => {
    console.log('Received updated direction:', updatedDirection);
    // Update UI or perform actions based on the updated direction
  });
});
