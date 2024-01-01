document.addEventListener("DOMContentLoaded", () => {

  let btn1 = document.querySelector('#button1');
  let btn2 = document.querySelector('#button2'); 

btn1.addEventListener('click', () => {
  sendButtonPress(1);
});
btn2.addEventListener('click', () => {
  sendButtonPress(2);
});

  
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

}); // end of document loaded listener
