import express from "express";
import http from "http";
import {Server} from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views",__dirname + "/views");

app.use("/public",express.static(__dirname + "/public"));

app.get("/", (req,res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer,{
  cors:{
    origin:["https://admin.socket.io"],
    credentials:true
  }
});
instrument(wsServer,{
  auth:false
})
//admin 추가하기

const publicRooms = () => {
  const {
    sockets:{
      adapter: {sids, rooms}
    }
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_,key) => {
    if(sids.get(key) === undefined){
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

const countRoom = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}
// wsServer에서 돌아가고 있는 모든 소켓 수 return

wsServer.on("connection",(socket) => {
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on("enter_room",(roomName,nickname,done) => {
    socket["nickname"] = nickname;
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome",socket.nickname,countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
    //to every socket connencted
    socket.on("disconnecting", () => {
      socket.rooms.forEach((room) => socket.to(room).emit("bye",socket.nickname,countRoom(roomName)-1));
    });
    socket.on("disconnect", () => {
      wsServer.sockets.emit("room_change", publicRooms());
      //to every socket connencted
    });
    socket.on("new_message", (msg, room, done) => {
      socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
      done();
    });
    socket.on("nickname",(nickname) => (socket["nickname"] = nickname));
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000,handleListen);