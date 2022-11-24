import {Socket} from "socket.io";
import {io} from "../index";

export const socketController = async (socket: Socket) => {
  const socketId = socket.id;
  const username = socket.data.username;

  const user = {username, userId: socketId}

  console.log(username);
  console.log(`user with id ${socketId} connected`)

  const usersList = [];
  const usersNameList = [];
  for (let [id, socket] of io.of('/').sockets) {
    usersList.push({
      userId: id,
      username: socket.data.username,
    })
    usersNameList.push(socket.data.username)
  }

  if (usersNameList.filter(userName => userName === username).length > 1) {
     socket.emit(
       'username-error',
      {message: `${username} is already online, please find another name`}
     )

    return socket.disconnect();
  }

  socket.emit('user-installed', user)
  socket.emit("users", usersList);
  socket.broadcast.emit('new-user-connected', user)

  socket.on('disconnect', () => {
    console.log(`user ${user}, disconnected`)
    socket.broadcast.emit('user-disconnected', user)
  })
}