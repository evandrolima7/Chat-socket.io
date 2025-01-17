const express = require("express");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(process.env.PORT, () => {
  console.log("Servidor rodando");
});

app.use(express.static(path.join(__dirname, "public")));

let connectedUsers = [];

io.on('connection', (socket) => {
  socket.on("join-request", (userName) => {
    socket.userName = userName;
    connectedUsers.push(userName);

    socket.emit('user-ok', connectedUsers);

    socket.broadcast.emit("list-update", {
      joined: userName,
      list: connectedUsers
    });
  });

  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter(u => u !== socket.userName);
    
    socket.broadcast.emit("list-update", {
      left: socket.userName,
      list: connectedUsers
    });
  });

  socket.on("send-msg", (txt) => {
    let obj = {
      userName: socket.userName,
      message: txt
    };

    socket.broadcast.emit("show-msg", obj);
  });
});
