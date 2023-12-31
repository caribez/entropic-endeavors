// Import required modules
const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');

// Create an instance of Express
const app = express();

// Middleware to parse incoming JSON data
app.use(bodyParser.json());


// Serve static files (HTML, CSS, JS) from a directory named 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to handle GET requests
app.get('/', (req, res) => {
  res.send('Welcome to the interactive musical performance server!');
});

// Endpoint to handle POST requests (for audience button presses)
app.post('/buttonPress', (req, res) => {
  const { buttonId } = req.body;
  // Process the button press data here, update variables, etc.
  console.log(`Button ${buttonId} pressed`);
  res.status(200).send('Button press received successfully!');
});

// Set the port for the server to listen on
const PORT = 3000; // default to 3000

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
