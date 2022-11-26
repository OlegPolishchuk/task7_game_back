import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import {Server} from 'socket.io';
import {socketController} from "./controllers/socketController";

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {cors: {origin: '*'}});
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors());

app.get('/', (req, res) => {
  res.json({message: "Hello"})
})

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('invalid username'))
  }

  socket.data.username = username;
  next();
})


io.on('connection', socketController)

const start = async () => {
  try{
    server.listen(PORT,() => {
      console.log(`Server started on post ${PORT}`)
    })
  } catch (e) {
    console.log(e)
  }
}

start();