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

function handleConnection(socket){
    console.log(socket);
    //socket과 실시간 소통
}
wss.on("connection",handleConnection);
//connection event 추가
//connection이 되면 hanldleConnection실행
server.listen(3000,handleListen);