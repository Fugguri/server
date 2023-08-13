const express = require('express')
const http = require('http')
const gameLogic = require('./game-logic')
const TelegramBot = require("node-telegram-bot-api");
const port = process.env.PORT || 80

const app = express()



/**
 * Backend flow:
 * - check to see if the game ID encoded in the URL belongs to a valid game session in progress. 
 * - if yes, join the client to that game. 
 * - else, create a new game instance. 
 * - '/' path should lead to a new game instance. 
 * - '/game/:gameid' path should first search for a game instance, then join it. Otherwise, throw 404 error.  
 */

// var privateKey = fs.readFileSync('YOUR SSL KEY').toString();
// var certificate = fs.readFileSync('YOUR SSL CRT').toString();
// var ca = fs.readFileSync('YOUR SSL CA').toString();

// var io = require('socket.io').listen(3456,{key:privateKey,cert:certificate,ca:ca});


const TELEGRAM_API_TOKEN = "6424817107:AAHJOZDjjMEnnRzbmI6Y5gfFTqIOmF7iU0E"
const GAME_URL = "https://99605bb2fc3e.vps.myjino.ru/"
const GAME_NAME = "chess"


let queries = {}

let opt = { polling: true };

const bot = new TelegramBot(TELEGRAM_API_TOKEN, opt);

bot.on("polling_error", (msg) => console.log(msg));

bot.on("message", (msg) => {
  const { id } = msg.chat;

  bot.sendGame(id, GAME_NAME, {
    "reply_markup": {
      "inline_keyboard": [
        [
          {
            text: "Играть",
            callback_game: "",
          },
          {
            text: "Отправить друзьям",
            switch_inline_query: "",
          },
        ],
      ],
    },
  })
});

bot.on("inline_query", (query) => {
  let inline_message = bot.answerInlineQuery(query.id, [{
    type: "game",
    id: "GAME_NAME",
    game_short_name: GAME_NAME,
  }])

  console.log(inline_message)

});

bot.on("callback_query", (query) => {
  console.log(query)
  let gameId = ""

  try {
    console.log("get")

    gameId = queries[query.chat_instance]
    console.log("receive")

  } catch {
    console.log("new")

    gameId = queries[query.chat_instance] = uuid_v4()
    console.log("create")

  }
  bot.answerCallbackQuery(query.id, { url: `${GAME_URL}new/${gameId}/${query.from.username}/` });
});


const server = app.listen(port)
const io = require('socket.io').listen(server)

// get the gameID encoded in the URL. 
// check to see if that gameID matches with all the games currently in session. 
// join the existing game session. 
// create a new session.  
// run when client connects

io.on('connection', client => {
  gameLogic.initializeGame(io, client)
})

// console.log('Port is: ${port}')
// usually this is where we try to connect to our DB.
// server.listen(port)