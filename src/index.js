// Import required modules
const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');

// Create an instance of Express
const app = express();

// Middleware to parse incoming JSON data
app.use(bodyParser.json());

const direction = { 
  'x': 0, 
  'y': 0,
  'votes': 0,
  'xNorm': 0,
  'yNorm': 0
};

const messages = [
  { text: "Entropic" },
  { text: "Endeavors" },
  /*
  { text: "Swiftly" },
  { text: "Whispers" },    
  { text: "Stormy" },        
  { text: "Warmth" },            
  { text: "Soothing" },                
  */
];


// Serve static files (HTML, CSS, JS) from a directory named 'public'
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/score', express.static(path.join(__dirname, 'score-view')));


// Endpoint to handle GET requests
app.get('/', (req, res) => {
  res.send('Welcome to the interactive musical performance server!');
});

app.get('/reset', (req, res) => {
  //value = 0;
  res.sendStatus(200); // Sends a response with HTTP status code 200 (OK)
});

// Handle GET request for messages
app.get('/messages', (req, res) => {

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  res.json(randomMessage);
});

// Endpoint to handle POST requests (for audience button presses)
app.post('/buttonPress', (req, res) => {
  const button = req.body;

  messages.push({ 'text': button.text });
  
  console.log(button.buttonId + " button pressed by a user")
  direction.x += button.x;
  direction.y += button.y;
  direction.votes++;
  
  const averageVector = {
  x: direction.x / direction.votes,
  y: direction.y / direction.votes,
};

  const length = Math.sqrt(averageVector.x ** 2 + averageVector.y ** 2);
  
  direction.xNorm = averageVector.x / length;
  direction.yNorm = averageVector.y / length;

  console.log(`Direction is (${direction.xNorm}, ${direction.yNorm})`);
  //console.log(`value: ${value}`);
  res.status(200).send('Button press received successfully!');
});

// Set the port for the server to listen on
const PORT =  process.env.PORT || 3000; // use environment port, or default to 3000

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
