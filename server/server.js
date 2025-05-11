require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const {Server} = require('socket.io')
const connectToDB = require('./database/db');
const {createMessage} = require('./controllers/message-controller');

const authRoutes = require('./routes/auth-routes');
const chatRoutes = require('./routes/chat-routes');

const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {cors: {origin: '*'}});

connectToDB();

app.use(cors());
app.use(express.json());
app.use('/user', authRoutes);
app.use('/chat', chatRoutes);

io.on('connection', (socket) => {
    // console.log(`New user is connected: ${socket.id}`);

    socket.on('joinRoom', (chatId) => {
        socket.join(chatId); // join socket room for chat
    });

    socket.on('chatMessage', async ({ chatId, userId, message }) => {
        try {
            const newMessage = await createMessage({ chatId, userId, message });
            io.to(chatId).emit('receiveMessage', newMessage);
        } catch (error) {
            console.error('Socket sendMessage error:', error);
            socket.emit('errorMessage', 'Message failed to send.');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
