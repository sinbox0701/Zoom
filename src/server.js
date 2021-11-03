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
  //모든 그룹의 Socket과 연결
  socket.on("enter_room",(roomName,done) => {
    socket.join(roomName);
    //socket을 공유할 그룹(Room)을 생성
    done();
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000,handleListen)