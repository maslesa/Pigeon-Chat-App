require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const {Server} = require('socket.io')
const connectToDB = require('./database/db');
const {createMessage} = require('./controllers/message-controller');
const Chat = require('./models/Chat');

const authRoutes = require('./routes/auth-routes');
const chatRoutes = require('./routes/chat-routes');
const imageRoutes = require('./routes/image-routes');
const noteRoutes = require('./routes/note-routes');

const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {cors: {origin: '*'}});
app.set('io', io);

connectToDB();

app.use(cors());
app.use(express.json());
app.use('/user', authRoutes);
app.use('/chat', chatRoutes);
app.use('/image', imageRoutes);
app.use('/note', noteRoutes);


io.on('connection', (socket) => {

    socket.on('joinRoom', async(chatId) => {
        socket.join(chatId);
        const chat = await Chat.findById(chatId);
        const membersCount = chat.members.length;

        io.to(chatId).emit('updateMembers', membersCount);
    });

    socket.on('chatMessage', async ({ chatId, userId, message, base64Image }) => {
        try {
            const newMessage = await createMessage({ chatId, userId, message, base64Image });
            io.to(chatId).emit('receiveMessage', newMessage);
        } catch (error) {
            console.error('Socket sendMessage error:', error);
            socket.emit('errorMessage', 'Message failed to send.');
        }
    });

    socket.on('leaveRoom', async(chatId) => {
        socket.leave(chatId);
        const chat = await Chat.findById(chatId);
        if (chat) {
            const membersCount = chat.members.length;
            io.to(chatId).emit('updateMembers', membersCount);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
