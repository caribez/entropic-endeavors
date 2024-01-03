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

const mutex = new Mutex(); // Create a mutex object

io.on('connection', (socket) => {
  console.log('A user connected');
  
    // Listen for 'getMessage' event from the client
  socket.on('getMessage', async () => {
    const release = await mutex.acquire(); // Acquire the lock
    sendMessageToClient();
    release(); // Release the lock
  });

  socket.on('buttonPress', async (button) => {
    const release = await mutex.acquire(); // Acquire the lock
    messages.push({ 'text': button.text });
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
  messages = [
    { 'text': "Entropic" },
    { 'text': "Endeavors" },
    /* ... */
  ];
  res.sendStatus(200);
});

app.get('/messages', (req, res) => {
  const randomIndex = Math.floor(Math.random() * messages.length);
  const randomMessage = messages.splice(randomIndex, 1);
  res.json(randomMessage[0]);
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});