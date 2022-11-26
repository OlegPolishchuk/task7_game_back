import {Socket} from "socket.io";
import {io} from "../index";
import {User} from "../types/User";

export const socketController = async (socket: Socket) => {
  const socketId = socket.id;
  const username = socket.data.username;

  const user: User = {username, userId: socketId, isInGame: false};

  const usersList: User[] = [];
  const usersNameList: string[] = [];
  for (let [id, socket] of io.of('/').sockets) {
    usersList.push({
      userId: id,
      username: socket.data.username,
      isInGame: false,
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
    socket.broadcast.emit('user-disconnected', user)
  })

  socket.on('message', ({message, user}: {message: string, user: User}) => {
    socket.broadcast.emit('refresh-messages', {message, user})
    socket.emit('refresh-messages', {message, user})
  })

  socket.on('invite-user', (user: User) => {
    socket.to(user.userId).emit('me-invited', {username, userId: socketId});
  })

  socket.on('pick-up-invite', ({user, competitor}: {user: User, competitor: User}) => {
    socket.to(competitor.userId).emit('picked-up-invite', user)
  })

  socket.on('invite-accept', (fromUser: User) => {
    socket.to(fromUser.userId).emit('invite-accepted');
  })

  socket.on('invite-cancel', (invitedUser: User) => {
    socket.to(invitedUser.userId).emit('invite-canceled')
  })

  socket.on('join-to-game', async ({user, roomId}: {user: User, roomId: string} ) => {
    await socket.join(roomId);

    socket.broadcast.emit('user-joined-to-game', user)

    socket.to(roomId).emit('i-connected-to-room', user);

    socket.on('make-move', (newBoardState: string[]) => {
      socket.to(roomId).emit('your-turn', newBoardState)
    })

    socket.on('leave-game', (user: User) => {
      socket.leave(roomId);
      socket.broadcast.emit('user-in-free', user);
      socket.to(roomId).emit('user-left-game', user);
    })

    socket.on('restart-game', (user: User) => {
      socket.to(roomId).emit('invited-to-restart-game')
    })

    socket.on('accept-to-restart', () => {
      socket.to(roomId).emit('invite-to-restart-accepted')
    })
  })

}