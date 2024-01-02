// Import required modules
const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');

// Create an instance of Express
const app = express();

// Middleware to parse incoming JSON data
app.use(bodyParser.json());

let value = 0;

// Serve static files (HTML, CSS, JS) from a directory named 'public'
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/score', express.static(path.join(__dirname, 'score-view')));


// Endpoint to handle GET requests
app.get('/', (req, res) => {
  res.send('Welcome to the interactive musical performance server!');
});

app.get('/reset', (req, res) => {
  value = 0;
  res.sendStatus(200); // Sends a response with HTTP status code 200 (OK)
});

app.get('/messages', (req, res) => {
    res.send('Successful Endeavors!');
});

// Endpoint to handle POST requests (for audience button presses)
app.post('/buttonPress', (req, res) => {
  const { buttonId } = req.body;
  value += buttonId;
  // Process the button press data here, update variables, etc.
  console.log(`Button ${buttonId} pressed`);
  console.log(`value: ${value}`);
  res.status(200).send('Button press received successfully!');
});

// Set the port for the server to listen on
const PORT =  process.env.PORT || 3000; // use environment port, or default to 3000

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
