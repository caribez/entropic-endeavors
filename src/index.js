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
  [230, 126, 126],
  [230, 157, 126],
  [230, 188, 126],
  [230, 219, 126],
  [209, 230, 126],
  [178, 230, 126],
  [147, 230, 126],
  [126, 230, 136],
  [126, 230, 167],
  [126, 230, 198],
  [126, 209, 230],
  [126, 178, 230],
  [126, 147, 230],
  [136, 126, 230],
  [167, 126, 230],
  [198, 126, 230],
  [230, 126, 219],
  [230, 126, 188],
  [230, 126, 157],
  [230, 126, 126],
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
  resetMessages();
}

function resetMessages() {
  messages.length = 0;
  messages.push({ 'text': "Entropic", 'color': '#dbdbdb' });
  messages.push({ 'text': "Endeavors", 'color': '#dbdbdb' });
  
  clientMessages.length = 0;
  clientMessages.push( { 'text': "Warmth"});
  clientMessages.push( { 'text': "Swift Wind" });
  clientMessages.push( { 'text': "Whispers" });
  clientMessages.push( { 'text': "Loud Storm" });
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
  
    socket.on('stop-performance', async () => {
    console.log('stop-performance');
    // Reset
    resetPerformance();
  });

  socket.on('textInput', async (message) => {
    const release = await mutex.acquire(); // Acquire the lock

    clientMessages.push({ 'text': message.text }); //Push to list for updating client buttons

    // Also send it out to the screen
    messages.push({ 'text': message.text, 'color': message.color }); 
    //sendMessageToClient();

    release(); // Release the lock

  });

  socket.on('buttonPress', async (button) => {
    const release = await mutex.acquire(); // Acquire the lock

    let buttonColor = parseRGBString(button.color);

    messages.push({ 'text': button.label, 'color': buttonColor });


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
