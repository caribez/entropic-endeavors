document.addEventListener("DOMContentLoaded", () => {

  const directions = [ 
    {'buttonId': 'up', 'x': 0, 'y': 1, 'text': 'Stormy'},
    {'buttonId': 'right', 'x': 1, 'y': 0, 'text': 'Swiftly'},
    {'buttonId': 'down', 'x': 0, 'y': -1, 'text': 'Whispers'},
    {'buttonId': 'left', 'x': -1, 'y': 0, 'text': 'Warmth'},
  ]
    

  const buttons = [
    document.querySelector('#up-btn'),
    document.querySelector('#right-btn'),
    document.querySelector('#down-btn'),
    document.querySelector('#left-btn'),
  ];
  
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', () => {
      sendButtonPress(directions[i]);
    });
  }

function sendButtonPress(buttonId) {
  fetch('/buttonPress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(buttonId)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    // Handle the response here if needed
    console.log('Button press sent successfully!');
    return response.text();
  })
   .then(data => {
     document.getElementById('status').innerHTML = data;
     console.log('Received data from the server:', data);
   })
  .catch(error => {
    // Handle errors here
    console.error('There was a problem with the fetch operation:', error);
  });
}

}); // end of document loaded listener
