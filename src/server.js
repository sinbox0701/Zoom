import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views",__dirname + "/views");

app.use("/public",express.static(__dirname + "/public"));

app.get("/", (req,res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
const server = http.createServer(app);//http server
const wss = new WebSocketServer({server});//websocket server


function onSocketClose() {
    console.log("Disconnected from the Browser ❌");
}
  
const sockets = [];
//여러 브라우저의 socket을 전달 받음

wss.on("connection",(socket)=>{
    sockets.push(socket);
    //sockets에 socket을 전달
    console.log("Connected to Browser ✅");
    socket.on("close",onSocketClose);
    socket.on("message", (message)=>{
        sockets.forEach((aSocket) => aSocket.send(message.toString()));
    });
    //각 브라우저의 메세지를 서로에게 보내줄수 있도록 작동
});

server.listen(3000,handleListen);