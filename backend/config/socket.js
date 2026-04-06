const socketIo = require('socket.io');

let io;

exports.init = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // User joins their personal room
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
