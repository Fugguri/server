let rooms = []

const addRoom = (room) => {
    console.log(room)
    console.log(rooms)

    const roomId = room.roomId
    const creator = room.creator

    const isExist = rooms.find((r) => r.roomId === roomId)

    !isExist && rooms.push(room)
    console.log(rooms)
    return { isExist: !!isExist, creator: creator }
}

const findRoom = (room) => {
    const roomId = room.roomId
    const isExist = rooms.find((r) => r.roomId === roomId)

    return !!isExist
}
module.export = { addRoom, findRoom }
