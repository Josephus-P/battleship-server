const app = require('express')();
const helmet = require('helmet');

app.use(helmet());

const http = require('http').Server(app);
const io = require('socket.io')(http);

const users = {};
const chatHistory = [];

app.get('/', (req, res) => {
  res.send('Server running...');
});

io.on('connection', socket => {
  console.log('a user connected');

  socket.on('join public', username => {
    socket.join('public', () => {
      users[username] = { socketID: socket.id };

      console.log(users);
      socket.to('public').emit('new user connected', username);
    });
  });

  socket.on('public chat', entry => {
    chatHistory.push(entry);
    socket.to('public').emit('public chat entry', entry);
  });

  socket.on('disconnect', () => {
    for (let name in users) {
      if (users[name].socketID === socket.id) {
        socket.to('public').emit('user disconnected', name);
        delete users[name];
        console.log(users);
        break;
      }
    }

    console.log('user disconnected');
  });
});

http.listen(8000, () => {
  console.log('listening on *:8000');
});
