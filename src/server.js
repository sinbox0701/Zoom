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
//Adapter --> 같은 화면을 보고있는 것 같지만 각각 다른 서버 ==> Adapter를 이용해 서버 공유
// rooms와 socketids를 볼수 있음

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

wsServer.on("connection",(socket) => {
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on("enter_room",(roomName,nickname,done) => {
    socket["nickname"] = nickname;
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome",socket.nickname);
    wsServer.sockets.emit("room_change", publicRooms());
    //to every socket connencted
    socket.on("disconnecting", () => {
      socket.rooms.forEach((room) => socket.to(room).emit("bye",socket.nickname));
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