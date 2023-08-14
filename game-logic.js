
/**
 * Here is where we should register event listeners and emitters. 
 */

var io
var gameSocket
// gamesInSession stores an array of all active socket connections
var gamesInSession = []
let rooms = []

const addRoom = (room) => {
    const roomId = room.roomId
    const creator = room.creator
    // console.log(room)
    const isExist = rooms.find((r) => r.roomId === roomId && r.creator === creator)

    !isExist && rooms.push(room)
    return { isExist: !!isExist, creator: creator }
}

const removeRoom = (roomId) => {

    // console.log(room)
    const isExist = rooms.find((r) => r.roomId === roomId)

    isExist && delete rooms[room]
    return { isExist: !!isExist, creator: creator }
}


const findRoom = (room) => {
    const roomId = room.roomId
    const creator = room.userName
    let userName = ""
    const isExist = rooms.find((r) => r.roomId === roomId)
    try {
        userName = isExist.creator
    }
    catch {
        userName = undefined

    }
    return { isExist: !!isExist, creator: userName }
}

const initializeGame = (sio, socket) => {
    /**
     * initializeGame sets up all the socket event listeners. 
     */

    // initialize global variables.
    io = sio
    gameSocket = socket

    // pushes this socket to an array which stores all the active sockets.
    gamesInSession.push(gameSocket)

    // Run code when the client disconnects from their socket session. 
    gameSocket.on("disconnect", onDisconnect)

    // Sends new move to the other socket session in the same room. 
    gameSocket.on("new move", newMove)

    // User creates new game room after clicking 'submit' on the frontend
    gameSocket.on("createNewGame", createNewGame)

    // User joins gameRoom after going to a URL with '/game/:gameId' 
    gameSocket.on("playerJoinGame", playerJoinsGame)

    gameSocket.on('request username', requestUserName)

    gameSocket.on('isGameExist', isGameExist)


    // update database aafter game is end
    // gameSocket.on('gameEnd', gameEnd)

    gameSocket.on('recieved userName', recievedUserName)

    // register event listeners for video chat app:
    // videoChatBackend()
}

function videoChatBackend() {
    // main function listeners
    gameSocket.on("callUser", (data) => {
        io.to(data.userToCall).emit('hey', { signal: data.signalData, from: data.from });
    })

    gameSocket.on("acceptCall", (data) => {
        io.to(data.to).emit('callAccepted', data.signal);
    })
}

function playerJoinsGame(idData) {
    /**
     * Joins the given socket to a session with it's gameId
     */

    // A reference to the player's Socket.IO socket object
    var sock = this

    // Look up the room ID in the Socket.IO manager object.
    var room = io.sockets.adapter.rooms[idData.gameId]
    // console.log(room)

    // If the room exists...
    if (room === undefined) {
        this.emit('status', "This game session does not exist.");
        return
    }
    if (room.length < 2) {
        // attach the socket id to the data object.
        idData.mySocketId = sock.id;

        // Join the room
        sock.join(idData.gameId);

        console.log(room.length)

        if (room.length === 2) {
            io.sockets.in(idData.gameId).emit('start game', idData.userName)
        }

        // Emit an event notifying the clients that the player has joined the room.
        io.sockets.in(idData.gameId).emit('playerJoinedRoom', idData);

    } else {
        // Otherwise, send an error message back to the player.
        this.emit('status', "There are already 2 people playing in this room.");
    }
}

function createNewGame(data) {

    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    this.emit('createNewGame', { gameId: data.gameId, userName: data.creator, mySocketId: this.id });
    addRoom({ gameId: data.gameId, creator: data.creator })
    // Join the Room and wait for the other player
    this.join(data.gameId)

}

function isGameExist(data) {

    const isExist = findRoom(data)
    // console.log(isExist)
    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    this.emit('isGameExist', { isExist: isExist.isExist, creator: isExist.creator, gameId: data.gameId, mySocketId: this.id });

    // Join the Room and wait for the other player
}

function newMove(move) {
    /**
     * First, we need to get the room ID in which to send this message. 
     * Next, we actually send this message to everyone except the sender
     * in this room. 
     */

    const gameId = move.gameId

    io.to(gameId).emit('opponent move', move);
}

function onDisconnect() {
    var i = gamesInSession.indexOf(gameSocket);
    gamesInSession.splice(i, 1);

    var room = io.sockets.adapter.rooms[idData.gameId]
    if (room.length === 1) {
        removeRoom(idData.gameId)
    }
}

function requestUserName(gameId) {
    io.to(gameId).emit('give userName', this.id);
}

function recievedUserName(data) {
    data.socketId = this.id
    io.to(data.gameId).emit('get Opponent UserName', data);
}

exports.initializeGame = initializeGame