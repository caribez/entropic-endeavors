function sendButtonPress(buttonId) {
  fetch('https://entropic-endeavors.onrender.com/buttonPress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ buttonId })
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
