require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const {Server} = require('socket.io')
const connectToDB = require('./database/db');

const authRoutes = require('./routes/auth-routes');

const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {cors: {origin: '*'}});

connectToDB();

app.use(cors());
app.use(express.json());
app.use('/user', authRoutes);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
