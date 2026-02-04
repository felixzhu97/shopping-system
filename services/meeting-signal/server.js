const http = require('http');
const { Server } = require('socket.io');

const port = process.env.MEETING_SIGNAL_PORT ? Number(process.env.MEETING_SIGNAL_PORT) : 4100;

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const rooms = {};

io.on('connection', socket => {
  let currentRoomId = null;
  let currentName = '';

  socket.on('join-room', payload => {
    if (!payload || typeof payload.roomId !== 'string') {
      return;
    }
    const roomId = String(payload.roomId).trim();
    if (!roomId) {
      return;
    }
    const name = typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : 'Guest';
    currentRoomId = roomId;
    currentName = name;

    if (!rooms[roomId]) {
      rooms[roomId] = {};
    }

    const existingUsers = Object.keys(rooms[roomId]).map(id => ({
      userId: id,
      name: rooms[roomId][id].name
    }));

    rooms[roomId][socket.id] = { name };
    socket.join(roomId);

    socket.emit('room-users', existingUsers);

    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      name
    });
  });

  socket.on('signal-offer', payload => {
    if (!payload || typeof payload.targetUserId !== 'string' || !payload.sdp) {
      return;
    }
    io.to(payload.targetUserId).emit('signal-offer', {
      fromUserId: socket.id,
      sdp: payload.sdp
    });
  });

  socket.on('signal-answer', payload => {
    if (!payload || typeof payload.targetUserId !== 'string' || !payload.sdp) {
      return;
    }
    io.to(payload.targetUserId).emit('signal-answer', {
      fromUserId: socket.id,
      sdp: payload.sdp
    });
  });

  socket.on('signal-ice-candidate', payload => {
    if (!payload || typeof payload.targetUserId !== 'string' || !payload.candidate) {
      return;
    }
    io.to(payload.targetUserId).emit('signal-ice-candidate', {
      fromUserId: socket.id,
      candidate: payload.candidate
    });
  });

  socket.on('chat-message', payload => {
    if (!payload || typeof payload.roomId !== 'string' || typeof payload.message !== 'string') {
      return;
    }
    const roomId = String(payload.roomId).trim();
    if (!roomId) {
      return;
    }
    const name = typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : currentName || 'Guest';
    const message = payload.message.trim();
    if (!message) {
      return;
    }
    const data = {
      userId: socket.id,
      name,
      message,
      timestamp: Date.now()
    };
    io.to(roomId).emit('chat-message', data);
  });

  socket.on('disconnect', () => {
    if (!currentRoomId || !rooms[currentRoomId]) {
      return;
    }
    delete rooms[currentRoomId][socket.id];
    socket.to(currentRoomId).emit('user-left', {
      userId: socket.id
    });
    if (Object.keys(rooms[currentRoomId]).length === 0) {
      delete rooms[currentRoomId];
    }
  });
});

server.listen(port, () => {
  process.stdout.write(`Meeting signal server listening on ${String(port)}\n`);
});

