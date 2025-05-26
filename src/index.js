const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const { Mutex } = require('async-mutex');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const palette = [
  [200, 100, 255],
  [100, 200, 255],
  [255, 150, 100],
  [150, 255, 150],
  [255, 255, 100],
];


app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/score', express.static(path.join(__dirname, 'score-view')));

const messages = [
  { 'text': "Entropic", 'color': '#dbdbdb' },
  { 'text': "Endeavors", 'color': '#dbdbdb' },
];

const clientMessages = [
  { 'text': "Warmth" },
  { 'text': "Swift Wind" },
  { 'text': "Whispers" },
  { 'text': "Loud Storm" },
];

function resetPerformance() {
  messages.length = 0;
  messages.push({ 'text': "Entropic", 'color': '#dbdbdb' });
  messages.push({ 'text': "Endeavors", 'color': '#dbdbdb' });
  
  clientMessages = 0;
  clientMessages.push( { 'text': "Warmth", 'color': '#3ab433' });
  clientMessages.push( { 'text': "Swift Wind", 'color': '#39b41a' });
  clientMessages.push( { 'text': "Whispers", 'color': '#9a13d1' });
  clientMessages.push( { 'text': "Loud Storm", 'color': '#8c3a13' });
}

const mutex = new Mutex(); // Create a mutex object

io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for 'getMessage' event from the client
  socket.on('getMessage', async () => {
    const release = await mutex.acquire(); // Acquire the lock
    sendMessageToClient();
    release(); // Release the lock
  });

  socket.on('start-performance', async () => {
    console.log('start-performance');
    // Reset
    resetPerformance();
  });

  socket.on('textInput', async (message) => {
    const release = await mutex.acquire(); // Acquire the lock

    clientMessages.push({ 'text': message.text, 'color': message.color }); //Push to list for updating client buttons

    // Also send it out to the screen
    messages.push({ 'text': message.text, 'color': message.color }); 
    //sendMessageToClient();

    release(); // Release the lock

  });

  socket.on('buttonPress', async (button) => {
    const release = await mutex.acquire(); // Acquire the lock

    let buttonColor = parseRGBString(button.color);

    messages.push({ 'text': button.label, 'color': buttonColor });
    clientMessages.push({ 'text': button.label, 'color': buttonColor });


    io.emit('messageReceived');

    // Sends a new label back to the client
    // Button id  to make sure we know which button to change
    // Label will be new text for that button
    // Get label from a list of all possible words.
    const randomIndex = Math.floor(Math.random() * clientMessages.length);
    const randomMessage = clientMessages[randomIndex].text;
    const col = palette[Math.floor(Math.random() * palette.length)];

    socket.emit('newLabel', { id: button.id, label: randomMessage, color: col });

    release(); // Release the lock
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

});

function sendMessageToClient() {

  if (messages.length < 1) return;
  const randomIndex = Math.floor(Math.random() * messages.length);
  const randomMessage = messages.splice(randomIndex, 1)[0];

  console.log('sending ${randomMessage}')

  io.emit('newMessage', { text: randomMessage.text, color: randomMessage.color }); // Emit 'newMessage' event to the client with the message
}

function parseRGBString(rgbString) {
  // Expects format like "rgb(200, 100, 255)"
  const match = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return null;
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

app.get('/', (req, res) => {
  res.send('Welcome to the interactive musical performance server!');
});

app.get('/reset', (req, res) => {
  resetPerformance();
  res.sendStatus(200);
});

app.get('/messages', (req, res) => {
  const randomIndex = Math.floor(Math.random() * messages.length);
  const randomMessage = messages.splice(randomIndex, 1);
  res.json(randomMessage[0]);
});

// Set the port for the server to listen on
const PORT = process.env.PORT || 3000; // use environment port, or default to 3000

server.listen(PORT, () => {
  console.log('Server is running on port 3000');
});
