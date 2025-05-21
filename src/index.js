const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const { Mutex } = require('async-mutex');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/score', express.static(path.join(__dirname, 'score-view')));

const messages = [
  { 'text': "Entropic" },
  { 'text': "Endeavors" },
  /* ... */
];

function resetPerformance() {
  messages.length = 0;
  messages.push({ 'text': "Entropic" });
  messages.push({ 'text': "Endeavors" });
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

  socket.on('buttonPress', async (button) => {
    const release = await mutex.acquire(); // Acquire the lock
    messages.push({ 'text': button.text });
    io.emit('messageReceived');
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

  io.emit('newMessage', { text: randomMessage.text }); // Emit 'newMessage' event to the client with the message
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
const PORT =  process.env.PORT || 3000; // use environment port, or default to 3000

server.listen(PORT, () => {
  console.log('Server is running on port 3000');
});
