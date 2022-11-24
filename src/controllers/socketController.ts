import {Socket} from "socket.io";
import {io} from "../index";
import {User} from "../types/User";

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


  socket.on('invite-user', (user: User) => {
    console.log('User invited', user)
    socket.to(user.userId).emit('me-invited', {username, userId: socketId});
  })

  socket.on('invite-accept', (fromUser: User) => {
    console.log(`fromUser.username`, fromUser.username)
    socket.join(fromUser.userId);

    console.log(`${user.username} join to room ${fromUser.username} with id ${fromUser.userId}`)
    socket.emit('joined-to-room', fromUser.userId)
    socket.to(fromUser.userId).emit('invite-accepted');
  })

  socket.on('join-room', (userId: string) => {
    socket.join(userId);

    console.log(`User ${user.username} also join to rom ${userId}`)
    socket.emit('user-joined-to-room')
  })
}