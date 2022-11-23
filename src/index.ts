import express from 'express';
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import {Server} from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {cors: {origin: '*'}});
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors());


io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('invalid username'))
  }

  socket.data.username = username;
  next();
})


io.on('connection', () => {})

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