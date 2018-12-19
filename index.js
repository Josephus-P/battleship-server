const app = require('express')();
const helmet = require('helmet');

app.use(helmet());

const http = require('http').Server(app);
const io = require('socket.io')(http);
const users = {};

app.get('/', (req, res) => {
  res.send('Server running...');
});

io.on('connection', socket => {
  console.log('a user connected');

  socket.on('join public', username => {
    socket.join('public', () => {
      users[socket.id] = { username: username };

      console.log(users[socket.id].username);
      socket.to('public').emit('new user connected', username);
    });
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      socket.to('public').emit('user disconnected', users[socket.id].username);
      delete users[socket.id];
    }

    console.log('user disconnected');
  });
});

http.listen(8000, () => {
  console.log('listening on *:8000');
});
