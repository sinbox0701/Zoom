import express from "express";
import http from "http";
import SocketIO from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views",__dirname + "/views");

app.use("/public",express.static(__dirname + "/public"));

app.get("/", (req,res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection",(socket) => {
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on("enter_room",(roomName,done) => {
    socket.join(roomName);
    done();//front의 showRoom func call
    socket.to(roomName).emit("welcome");
    //server의 emit("Name")과 front의 on("Name")이 같은것이 매칭 
    socket.on("disconnecting", () => {
      socket.rooms.forEach((room) => socket.to(room).emit("bye"));
      //각각의 방에 bye event 보내기
    });
    socket.on("new_message", (msg, room, done) => {
      socket.to(room).emit("new_message", msg);
      done();//백엔드 실행X
    });
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000,handleListen);